#!/usr/bin/env node
/**
 * Outscraper import.
 *
 * Drop one or more Outscraper "Google Maps / Places" exports (.csv or .json)
 * into data/outscraper/ and run `npm run import`. Every row is normalised into
 * data/listings.json, which is what the site renders.
 *
 * When data/outscraper/ is empty the script falls back to
 * data/sample-listings.json and marks the build as sample data so the site
 * still renders end to end.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputDir = join(root, "data", "outscraper");
const outFile = join(root, "data", "listings.json");
const sampleFile = join(root, "data", "sample-listings.json");

/* ---------------------------------------------------------------- CSV ---- */

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ",") { row.push(field); field = ""; continue; }
    if (ch === "\r") continue;
    if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; continue; }
    field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];

  const header = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((c) => c.trim() !== ""))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}


/* --------------------------------------------------------------- XLSX ---- */

/**
 * Minimal reader for the .xlsx that Outscraper exports, with no dependencies:
 * an xlsx is a zip of XML parts, so we walk the zip central directory, inflate
 * the two parts we need, and read the cells out of them.
 */
function unzip(buffer) {
  const files = new Map();
  // Locate the end-of-central-directory record by scanning back for its signature.
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a zip file (no end-of-central-directory record).");

  const entryCount = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);

  for (let i = 0; i < entryCount; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);

    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const data = buffer.subarray(dataStart, dataStart + compressedSize);

    files.set(name, method === 8 ? inflateRawSync(data) : Buffer.from(data));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

const XML_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeXml(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (match, entity) => {
    if (entity[0] === "#") {
      const code = entity[1] === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return XML_ENTITIES[entity] ?? match;
  });
}

function sharedStrings(xml) {
  if (!xml) return [];
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) =>
    // A cell's text can be split across rich-text runs; join every <t> in the item.
    [...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => decodeXml(t[1])).join("")
  );
}

function columnIndex(ref) {
  const letters = ref.match(/^[A-Z]+/)?.[0] ?? "A";
  let index = 0;
  for (const letter of letters) index = index * 26 + (letter.charCodeAt(0) - 64);
  return index - 1;
}

function parseXlsx(buffer) {
  const files = unzip(buffer);
  const sheetName =
    [...files.keys()].find((name) => /^xl\/worksheets\/sheet1\.xml$/.test(name)) ??
    [...files.keys()].find((name) => /^xl\/worksheets\/.+\.xml$/.test(name));
  if (!sheetName) throw new Error("No worksheet found in the workbook.");

  const strings = sharedStrings(files.get("xl/sharedStrings.xml")?.toString("utf8"));
  const sheet = files.get(sheetName).toString("utf8");

  const rows = [];
  for (const rowMatch of sheet.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const ref = attrs.match(/r="([A-Z]+\d+)"/)?.[1];
      const type = attrs.match(/t="([^"]+)"/)?.[1];

      let value = "";
      if (type === "inlineStr") {
        value = [...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => decodeXml(t[1])).join("");
      } else {
        const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "";
        if (type === "s") value = strings[Number(raw)] ?? "";
        else if (type === "b") value = raw === "1" ? "TRUE" : "FALSE";
        else value = decodeXml(raw);
      }
      cells[ref ? columnIndex(ref) : cells.length] = value;
    }
    rows.push(cells);
  }
  if (!rows.length) return [];

  const header = (rows[0] ?? []).map((h) => String(h ?? "").trim());
  return rows
    .slice(1)
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) =>
      Object.fromEntries(header.map((name, i) => [name, String(row[i] ?? "").trim()]))
    );
}


/**
 * Outscraper's `about` column holds a JSON map of attribute groups rather than
 * prose, e.g. {"Service options": {"Online classes": true}}. Keep the features
 * that are actually true, grouped as they arrive.
 */
function parseAttributes(raw) {
  if (!raw || typeof raw !== "string" || !raw.trim().startsWith("{")) return [];
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  const groups = [];
  for (const [group, values] of Object.entries(data)) {
    if (!values || typeof values !== "object") continue;
    const items = Object.entries(values)
      .filter(([, on]) => on === true)
      .map(([label]) => label)
      .sort((a, b) => a.localeCompare(b));
    if (items.length) groups.push({ group, items });
  }
  // Alphabetical so a feature list reads as a scannable index rather than
  // whatever order Google's export happened to emit.
  groups.sort((a, b) => a.group.localeCompare(b.group));
  return groups;
}

/** "Tuesday,4,8PM|Wednesday,4,8PM" -> [{ day, hours }] */
function parseCsvHours(raw) {
  if (!raw) return [];
  const out = [];
  for (const chunk of String(raw).split("|")) {
    const parts = chunk.split(",").map((p) => p.trim());
    if (parts.length < 2) continue;
    const day = DAYS.find((d) => d.toLowerCase() === parts[0].toLowerCase());
    if (!day) continue;
    const [, open, close] = parts;
    out.push({ day, hours: close ? `${open}-${close}` : open });
  }
  return out;
}

/**
 * Every field here comes from the export: category, place, features, hours and
 * review data. Nothing is invented, so a listing without a description still
 * gets an accurate summary line.
 */
function buildSummary({ category, city, state, subtypes, attributes, hours, rating, reviewCount }) {
  const sentences = [];
  const place = [city, state].filter(Boolean).join(", ");
  sentences.push(`${category}${place ? ` in ${place}` : ""}.`);

  const extraTypes = subtypes.filter((t) => t.toLowerCase() !== category.toLowerCase()).slice(0, 3);
  if (extraTypes.length) sentences.push(`Also listed as ${extraTypes.join(", ").toLowerCase()}.`);

  const features = attributes.flatMap((group) => group.items).slice(0, 3);
  if (features.length) sentences.push(`Features include ${features.join(", ").toLowerCase()}.`);

  const openDays = hours.filter((h) => h.hours && !/closed/i.test(h.hours));
  if (openDays.length) {
    sentences.push(`Open ${openDays.length} ${openDays.length === 1 ? "day" : "days"} a week.`);
  }
  if (rating && reviewCount) {
    sentences.push(`Rated ${rating} from ${reviewCount.toLocaleString("en-US")} Google reviews.`);
  }
  return sentences.join(" ");
}

/* --------------------------------------------------------- normalising --- */

const pick = (row, ...keys) => {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
};

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Outscraper exports the main business photo under a few different column
 * names depending on the export type, and `photos` can hold a list. Take the
 * first usable https URL, whichever shape it arrives in.
 */
function firstImage(...values) {
  for (const value of values) {
    if (!value) continue;
    const candidates = Array.isArray(value)
      ? value
      : String(value)
          .split(/[,\s]+/)
          .filter(Boolean);
    for (const candidate of candidates) {
      const url = typeof candidate === "string" ? candidate.trim() : String(candidate?.photo ?? "").trim();
      if (/^https:\/\/\S+$/i.test(url)) return url;
    }
  }
  return "";
}

function parseHours(raw) {
  if (!raw) return [];
  let data = raw;
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return [];
    try {
      data = JSON.parse(text.replace(/'/g, '"'));
    } catch {
      // "Monday: 9AM-5PM, Tuesday: ..." style fallback
      const out = [];
      for (const chunk of text.split(/,(?=\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun))/i)) {
        const m = chunk.match(/^\s*([A-Za-z]+)\s*:\s*(.+)$/);
        if (!m) continue;
        const day = DAYS.find((d) => d.toLowerCase().startsWith(m[1].toLowerCase().slice(0, 3)));
        if (day) out.push({ day, hours: m[2].trim() });
      }
      return out;
    }
  }
  if (Array.isArray(data)) {
    return data
      .map((entry) => {
        if (typeof entry === "string") {
          const m = entry.match(/^\s*([A-Za-z]+)\s*:?\s*(.*)$/);
          if (!m) return null;
          const day = DAYS.find((d) => d.toLowerCase().startsWith(m[1].toLowerCase().slice(0, 3)));
          return day ? { day, hours: m[2].trim() || "Closed" } : null;
        }
        const day = DAYS.find(
          (d) => d.toLowerCase() === String(entry.day ?? entry.name ?? "").toLowerCase()
        );
        return day ? { day, hours: String(entry.hours ?? entry.time ?? "Closed").trim() } : null;
      })
      .filter(Boolean);
  }
  if (data && typeof data === "object") {
    return DAYS.filter((d) => data[d] !== undefined).map((d) => ({
      day: d,
      hours: String(data[d] || "Closed").trim(),
    }));
  }
  return [];
}

function splitList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(/[,|]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

const SERVICE_RULES = [
  { slug: "math-tutoring", label: "Math Tutoring", match: /math|algebra|geometry|calculus|kumon|mathnasium/i },
  { slug: "reading-tutoring", label: "Reading & Literacy", match: /read|literacy|phonics|dyslex/i },
  { slug: "english-tutoring", label: "English Tutoring", match: /english|language arts|\bela\b|grammar|literature|essay|vocabulary|writing/i },
  { slug: "test-prep", label: "Test Prep", match: /test prep|sat|act|gre|gmat|exam|prep/i },
  { slug: "stem-and-coding", label: "STEM & Coding", match: /stem|robot|coding|code|engineer|science/i },
  { slug: "special-needs-support", label: "Special Needs Support", match: /special|dyslex|adhd|learning difference|therapy/i },
  { slug: "early-learning", label: "Early Learning", match: /preschool|kindergarten|early|child care|pre-k/i },
  { slug: "homework-help", label: "Homework Help", match: /homework|after school|study skills|enrichment/i },
  { slug: "online-tutoring", label: "Online Tutoring", match: /online|virtual|remote/i },
];

function deriveServices(haystack) {
  const found = SERVICE_RULES.filter((r) => r.match.test(haystack)).map((r) => ({
    slug: r.slug,
    label: r.label,
  }));
  return found.length ? found : [{ slug: "homework-help", label: "Homework Help" }];
}

function normalise(row, index) {
  const name = pick(row, "name", "title", "business_name", "query");
  if (!name) return null;

  const city = pick(row, "city", "locality", "borough");
  const state = pick(row, "us_state", "state", "region") || "Georgia";
  const street = pick(row, "street", "address", "address_line_1");
  const postal = pick(row, "postal_code", "zip", "zip_code");
  const fullAddress =
    pick(row, "full_address", "formatted_address") ||
    [street, city, state, postal].filter(Boolean).join(", ");

  const category = pick(row, "category", "type", "primary_category") || "Tutoring service";
  const subtypes = splitList(pick(row, "subtypes", "categories", "types"));
  const rating = Number(pick(row, "rating", "average_rating")) || 0;
  const reviewCount = Number(pick(row, "reviews", "review_count", "reviews_count", "user_ratings_total")) || 0;

  const attributes = parseAttributes(row.about);
  // `description` carries prose when the export has it; `about` never does.
  const description = pick(row, "description", "editorial_summary", "summary");

  const hours = parseHours(row.working_hours ?? row.hours ?? row.opening_hours ?? "");
  const resolvedHours = hours.length ? hours : parseCsvHours(row.working_hours_csv_compatible);

  const ratingBreakdown = [1, 2, 3, 4, 5]
    .map((score) => Number(pick(row, `reviews_per_score_${score}`)) || 0)
    .map((count, i) => ({ score: i + 1, count }));
  const hasBreakdown = ratingBreakdown.some((entry) => entry.count > 0);

  const nameSlug = slugify(name);
  const citySlug = slugify(city);
  const slugBase =
    (citySlug && !nameSlug.endsWith(`-${citySlug}`)
      ? `${nameSlug}-${citySlug}`
      : nameSlug) || `listing-${index + 1}`;
  const haystack = [
    name,
    category,
    subtypes.join(" "),
    description,
    attributes.flatMap((group) => group.items).join(" "),
  ].join(" ");

  return {
    id: pick(row, "place_id", "google_id", "cid") || slugBase,
    slug: slugBase,
    name,
    category,
    subtypes,
    phone: pick(row, "phone", "phone_number", "formatted_phone_number"),
    website: pick(row, "site", "website", "url"),
    street,
    city: city || "Georgia",
    citySlug: citySlug || "georgia",
    state,
    postalCode: postal,
    fullAddress,
    latitude: Number(pick(row, "latitude", "lat")) || null,
    longitude: Number(pick(row, "longitude", "lng", "lon", "longtitude")) || null,
    rating,
    reviewCount,
    reviewsLink: pick(row, "reviews_link"),
    googleMapsLink: pick(row, "location_link", "google_maps_url", "location_reviews_link"),
    photosCount: Number(pick(row, "photos_count")) || 0,
    photo: firstImage(
      row.photo,
      row.photos,
      row.photos_sample,
      row.featured_image,
      row.image,
      row.logo
    ),
    streetView: firstImage(row.street_view, row.streetview),
    priceRange: pick(row, "range", "price_level", "price_range"),
    businessStatus: pick(row, "business_status") || "OPERATIONAL",
    verified: /true|yes|1/i.test(pick(row, "verified")),
    about:
      description ||
      buildSummary({
        category,
        city,
        state,
        subtypes,
        attributes,
        hours: resolvedHours,
        rating,
        reviewCount,
      }),
    attributes,
    bookingLink: pick(row, "booking_appointment_link", "reservation_links"),
    logo: pick(row, "logo"),
    ratingBreakdown: hasBreakdown ? ratingBreakdown : [],
    hours: resolvedHours,
    services: deriveServices(haystack),
  };
}


/* ------------------------------------------------------------ filtering -- */

/**
 * This is a Georgia directory, and an Outscraper radius search returns
 * neighbouring states plus businesses that are not education at all. Both are
 * filtered out here; the run prints how many rows each rule removed.
 */
const OFF_TOPIC = /^(gym|sports complex|physical fitness program|notary public|legal services|medical clinic|pediatrician|mental health clinic|local medical services|speech pathologist|charity|non-profit organization|youth organization|youth group|painting studio)$/i;

const EDUCATION_HINT =
  /tutor|learn|school|education|academ|teach|preschool|kindergarten|child care|childcare|day care|daycare|training|college|test prep|study|montessori|stem|language|music|reading|math/i;

function inGeorgia(listing, row) {
  const stateCode = pick(row, "state_code", "us_state_code");
  if (stateCode) return stateCode.toUpperCase() === "GA";
  return /^(ga|georgia)$/i.test(listing.state.trim());
}

function isEducation(listing) {
  if (OFF_TOPIC.test(listing.category.trim())) {
    // An off-topic primary category is still fine when the business also
    // reports itself as an education business.
    return listing.subtypes.some((type) => EDUCATION_HINT.test(type));
  }
  return (
    EDUCATION_HINT.test(listing.category) ||
    listing.subtypes.some((type) => EDUCATION_HINT.test(type))
  );
}

/* -------------------------------------------------------------- runner --- */

function readInputs() {
  if (!existsSync(inputDir)) return [];
  const files = readdirSync(inputDir).filter((f) =>
    [".csv", ".json", ".xlsx"].includes(extname(f).toLowerCase())
  );
  const rows = [];
  for (const file of files) {
    const path = join(inputDir, file);
    const ext = extname(file).toLowerCase();
    if (ext === ".xlsx") {
      rows.push(...parseXlsx(readFileSync(path)));
    } else if (ext === ".csv") {
      rows.push(...parseCsv(readFileSync(path, "utf8")));
    } else {
      const parsed = JSON.parse(readFileSync(path, "utf8"));
      rows.push(...(Array.isArray(parsed) ? parsed : parsed.data ?? []).flat());
    }
  }
  return rows;
}

function main() {
  let rows = readInputs();
  let isSample = false;

  if (!rows.length) {
    if (!existsSync(sampleFile)) {
      console.error("No Outscraper input and no sample data found.");
      process.exit(1);
    }
    rows = JSON.parse(readFileSync(sampleFile, "utf8"));
    isSample = true;
  }

  const seen = new Set();
  const listings = [];
  let skippedOutOfState = 0;
  let skippedOffTopic = 0;

  rows.forEach((row, i) => {
    const listing = normalise(row, i);
    if (!listing) return;
    if (!isSample && !inGeorgia(listing, row)) {
      skippedOutOfState += 1;
      return;
    }
    if (!isSample && !isEducation(listing)) {
      skippedOffTopic += 1;
      return;
    }
    let slug = listing.slug;
    let n = 2;
    while (seen.has(slug)) slug = `${listing.slug}-${n++}`;
    seen.add(slug);
    listings.push({ ...listing, slug });
  });

  listings.sort((a, b) => b.rating * Math.log10(b.reviewCount + 10) - a.rating * Math.log10(a.reviewCount + 10));

  // Keep the previous timestamp when nothing changed, so rebuilding does not
  // produce a meaningless diff in version control.
  let generatedAt = new Date().toISOString();
  if (existsSync(outFile)) {
    try {
      const previous = JSON.parse(readFileSync(outFile, "utf8"));
      if (JSON.stringify(previous.listings) === JSON.stringify(listings) && previous.generatedAt) {
        generatedAt = previous.generatedAt;
      }
    } catch {
      // A corrupt or older file just means we write a fresh timestamp.
    }
  }

  const payload = { generatedAt, isSample, count: listings.length, listings };
  writeFileSync(outFile, JSON.stringify(payload, null, 2) + "\n");
  console.log(
    `Imported ${listings.length} listings${isSample ? " (SAMPLE DATA — add an Outscraper export to data/outscraper/)" : ""}.`
  );
  if (skippedOutOfState || skippedOffTopic) {
    console.log(
      `Skipped ${skippedOutOfState} listings outside Georgia and ${skippedOffTopic} non-education listings.`
    );
  }
}

main();
