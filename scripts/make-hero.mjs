#!/usr/bin/env node
/**
 * Renders public/hero-banner.png, the homepage banner artwork.
 *
 * The scene is drawn here as SVG rather than sourced from a stock photo: it
 * stays on-brand (light green and white), carries no licensing questions, and
 * keeps the centre of the frame calm so the title bar sits legibly over it.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const W = 2400;
const H = 1000;

const tree = (x, y, scale, canopy, trunk = "#7a5c3e") => `
  <g transform="translate(${x},${y}) scale(${scale})">
    <rect x="-9" y="-70" width="18" height="90" rx="8" fill="${trunk}"/>
    <circle cx="0" cy="-110" r="76" fill="${canopy}"/>
    <circle cx="-58" cy="-72" r="52" fill="${canopy}"/>
    <circle cx="58" cy="-72" r="52" fill="${canopy}"/>
    <circle cx="-26" cy="-150" r="46" fill="${canopy}" opacity="0.92"/>
    <circle cx="34" cy="-146" r="42" fill="${canopy}" opacity="0.92"/>
    <circle cx="-30" cy="-120" r="7" fill="#ffffff" opacity="0.75"/>
    <circle cx="26" cy="-96" r="6" fill="#ffffff" opacity="0.6"/>
    <circle cx="8" cy="-158" r="5" fill="#ffffff" opacity="0.7"/>
  </g>`;

const bush = (x, y, scale, fill) => `
  <g transform="translate(${x},${y}) scale(${scale})">
    <circle cx="-34" cy="0" r="34" fill="${fill}"/>
    <circle cx="0" cy="-14" r="42" fill="${fill}"/>
    <circle cx="36" cy="0" r="32" fill="${fill}"/>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#dceffa"/>
      <stop offset="52%" stop-color="#edf8e7"/>
      <stop offset="100%" stop-color="#f7fbf2"/>
    </linearGradient>
    <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d5f0c8"/>
      <stop offset="100%" stop-color="#bfe7ac"/>
    </linearGradient>
    <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a9de92"/>
      <stop offset="100%" stop-color="#8ed070"/>
    </linearGradient>
    <linearGradient id="hillFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6ec457"/>
      <stop offset="100%" stop-color="#4ea63f"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>

  <!-- sun and clouds, kept high so the title bar sits over open sky -->
  <circle cx="286" cy="150" r="86" fill="#ffffff" opacity="0.9"/>
  <circle cx="286" cy="150" r="132" fill="#ffffff" opacity="0.28"/>
  <g fill="#ffffff" opacity="0.92">
    <ellipse cx="1780" cy="140" rx="128" ry="50"/>
    <ellipse cx="1872" cy="112" rx="92" ry="42"/>
    <ellipse cx="1692" cy="114" rx="76" ry="36"/>
    <ellipse cx="920" cy="96" rx="102" ry="40"/>
    <ellipse cx="998" cy="76" rx="72" ry="32"/>
    <ellipse cx="520" cy="186" rx="84" ry="34"/>
  </g>

  <!-- birds -->
  <g stroke="#8ab6c9" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7">
    <path d="M1320 176 q26 -22 52 0 q26 -22 52 0"/>
    <path d="M1470 232 q20 -17 40 0 q20 -17 40 0"/>
  </g>

  <!-- kite, upper right -->
  <g transform="translate(2080,196) rotate(12)">
    <path d="M0 -70 L54 0 L0 70 L-54 0 Z" fill="#7ed957"/>
    <path d="M0 -70 L0 70 M-54 0 L54 0" stroke="#ffffff" stroke-width="5"/>
    <path d="M0 70 q26 40 -12 66 q38 22 8 66" stroke="#3f8f46" stroke-width="6" fill="none"/>
  </g>

  <!-- layered hills; crests stay below the title bar band -->
  <path d="M0 612 C 340 556, 700 640, 1080 604 C 1460 568, 1840 646, 2400 588 L2400 1000 L0 1000 Z" fill="url(#hillFar)"/>
  <path d="M0 726 C 380 660, 780 764, 1200 716 C 1620 668, 2000 764, 2400 700 L2400 1000 L0 1000 Z" fill="url(#hillMid)"/>
  <path d="M0 846 C 420 786, 820 884, 1240 842 C 1660 800, 2020 882, 2400 828 L2400 1000 L0 1000 Z" fill="url(#hillFront)"/>

  <!-- winding path -->
  <path d="M1150 730 C 1108 812, 980 884, 840 1000 L1460 1000 C 1330 884, 1224 812, 1196 730 Z" fill="#f4f9ee" opacity="0.9"/>

  ${tree(250, 900, 1.35, "#3f8f46")}
  ${tree(520, 862, 1.0, "#4ea63f")}
  ${tree(740, 906, 0.78, "#5cbb4c")}
  ${tree(1960, 906, 1.4, "#3f8f46")}
  ${tree(2230, 862, 1.05, "#4ea63f")}
  ${tree(1760, 852, 0.8, "#5cbb4c")}
  ${bush(120, 972, 1.15, "#3f8f46")}
  ${bush(900, 984, 0.95, "#4ea63f")}
  ${bush(1560, 976, 1.05, "#4ea63f")}
  ${bush(2320, 968, 1.2, "#3f8f46")}

  <!-- learning motifs, placed above the bar band on the outer thirds -->
  <g transform="translate(600,392) rotate(-8)">
    <rect x="-92" y="-62" width="184" height="124" rx="14" fill="#ffffff" opacity="0.96"/>
    <path d="M0 -58 V58" stroke="#c9ebb9" stroke-width="8"/>
    <g stroke="#a9de92" stroke-width="8" stroke-linecap="round">
      <path d="M-68 -26 H-16"/><path d="M-68 0 H-16"/><path d="M-68 26 H-28"/>
      <path d="M16 -26 H68"/><path d="M16 0 H68"/><path d="M16 26 H56"/>
    </g>
  </g>
  <g transform="translate(1840,376) rotate(16)">
    <rect x="-15" y="-96" width="30" height="156" rx="10" fill="#ffffff"/>
    <rect x="-15" y="-96" width="30" height="40" rx="10" fill="#7ed957"/>
    <path d="M-15 60 L0 96 L15 60 Z" fill="#3f8f46"/>
  </g>
  <g transform="translate(1180,214)">
    <path d="M0 -30 L78 0 L0 30 L-78 0 Z" fill="#ffffff"/>
    <path d="M-46 10 V46 C -46 66, 46 66, 46 46 V10 L0 30 Z" fill="#e2f5d9"/>
    <path d="M60 8 V52" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <circle cx="60" cy="58" r="9" fill="#ffffff"/>
  </g>
</svg>`;

writeFileSync(join(root, "public", "hero-banner.svg"), svg);

await sharp(Buffer.from(svg), { density: 96 })
  .png({ compressionLevel: 9, palette: true })
  .toFile(join(root, "public", "hero-banner.png"));

console.log("Hero banner generated.");
