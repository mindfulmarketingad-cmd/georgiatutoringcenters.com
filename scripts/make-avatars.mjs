#!/usr/bin/env node
/**
 * Generates a monogram avatar per author into public/authors/.
 *
 * Monograms rather than photographs: the site should not present invented
 * portraits of people who do not exist. Replace these with real headshots
 * when real bylines take over.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "authors");
mkdirSync(out, { recursive: true });

const people = [
  { slug: "editorial-team", initials: "GT", from: "#7ed957", to: "#3f8f46" },
  { slug: "dana-whitfield", initials: "DW", from: "#a9de92", to: "#4ea63f" },
  { slug: "marcus-reed", initials: "MR", from: "#8ed070", to: "#2e6b34" },
  { slug: "priya-raman", initials: "PR", from: "#c9ebb9", to: "#5cbb4c" },
];

for (const person of people) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="${person.initials}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${person.from}"/>
      <stop offset="100%" stop-color="${person.to}"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="46" fill="url(#g)"/>
  <circle cx="80" cy="64" r="26" fill="#ffffff" opacity="0.92"/>
  <path d="M32 142 c0 -30 22 -48 48 -48 s48 18 48 48 z" fill="#ffffff" opacity="0.92"/>
  <text x="80" y="124" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="34" font-weight="700" fill="${person.to}">${person.initials}</text>
</svg>`;
  writeFileSync(join(out, `${person.slug}.svg`), svg);
}

console.log(`Wrote ${people.length} author avatars.`);
