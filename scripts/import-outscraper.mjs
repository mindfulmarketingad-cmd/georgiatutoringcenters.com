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
  { slug: "reading-tutoring", label: "Reading & Literacy", match: /read|literacy|phonics|dyslex|writing/i },
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
  const about = pick(row, "about", "description", "editorial_summary", "summary");
  const rating = Number(pick(row, "rating", "average_rating")) || 0;
  const reviewCount = Number(pick(row, "reviews", "review_count", "reviews_count", "user_ratings_total")) || 0;

  const nameSlug = slugify(name);
  const citySlug = slugify(city);
  const slugBase =
    (citySlug && !nameSlug.endsWith(`-${citySlug}`)
      ? `${nameSlug}-${citySlug}`
      : nameSlug) || `listing-${index + 1}`;
  const haystack = [name, category, subtypes.join(" "), about].join(" ");

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
    priceRange: pick(row, "range", "price_level", "price_range"),
    businessStatus: pick(row, "business_status") || "OPERATIONAL",
    verified: /true|yes|1/i.test(pick(row, "verified")),
    about,
    hours: parseHours(row.working_hours ?? row.hours ?? row.opening_hours ?? ""),
    services: deriveServices(haystack),
  };
}

/* -------------------------------------------------------------- runner --- */

function readInputs() {
  if (!existsSync(inputDir)) return [];
  const files = readdirSync(inputDir).filter((f) => [".csv", ".json"].includes(extname(f).toLowerCase()));
  const rows = [];
  for (const file of files) {
    const text = readFileSync(join(inputDir, file), "utf8");
    if (extname(file).toLowerCase() === ".csv") rows.push(...parseCsv(text));
    else {
      const parsed = JSON.parse(text);
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
  rows.forEach((row, i) => {
    const listing = normalise(row, i);
    if (!listing) return;
    let slug = listing.slug;
    let n = 2;
    while (seen.has(slug)) slug = `${listing.slug}-${n++}`;
    seen.add(slug);
    listings.push({ ...listing, slug });
  });

  listings.sort((a, b) => b.rating * Math.log10(b.reviewCount + 10) - a.rating * Math.log10(a.reviewCount + 10));

  const payload = {
    generatedAt: new Date().toISOString(),
    isSample,
    count: listings.length,
    listings,
  };
  writeFileSync(outFile, JSON.stringify(payload, null, 2) + "\n");
  console.log(
    `Imported ${listings.length} listings${isSample ? " (SAMPLE DATA — add an Outscraper export to data/outscraper/)" : ""}.`
  );
}

main();
