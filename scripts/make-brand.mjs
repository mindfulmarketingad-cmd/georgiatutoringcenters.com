#!/usr/bin/env node
/**
 * Generates the site brand assets from inline SVG sources:
 *   public/logo.svg        horizontal lockup used in the header
 *   public/logo-mark.svg   square mark
 *   app/icon.svg           browser tab icon (SVG)
 *   public/favicon.ico     32px PNG wrapped in an ICO container
 *   app/apple-icon.png     180px touch icon
 *   public/og-image.png    1200x630 social share card
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const GREEN = "#3F8F46";
const LIGHT = "#7ED957";
const MINT = "#E9F7E5";

const mark = (size = 64) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="Georgia Tutoring Centers">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${LIGHT}"/>
      <stop offset="100%" stop-color="${GREEN}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g)"/>
  <path d="M32 15 L53 24 L32 33 L11 24 Z" fill="#FFFFFF"/>
  <path d="M18 27.5 V38 c0 5 6.5 8.5 14 8.5 s14 -3.5 14 -8.5 V27.5 L32 34 Z" fill="${MINT}"/>
  <path d="M53 24 v11" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="53" cy="37.5" r="3.2" fill="#FFFFFF"/>
</svg>`;

const lockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 64" width="340" height="64" role="img" aria-label="Georgia Tutoring Centers">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${LIGHT}"/>
      <stop offset="100%" stop-color="${GREEN}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#lg)"/>
  <path d="M32 15 L53 24 L32 33 L11 24 Z" fill="#FFFFFF"/>
  <path d="M18 27.5 V38 c0 5 6.5 8.5 14 8.5 s14 -3.5 14 -8.5 V27.5 L32 34 Z" fill="${MINT}"/>
  <path d="M53 24 v11" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="53" cy="37.5" r="3.2" fill="#FFFFFF"/>
  <text x="78" y="30" font-family="Verdana,Geneva,sans-serif" font-size="19" font-weight="700" fill="${GREEN}">Georgia Tutoring</text>
  <text x="78" y="50" font-family="Verdana,Geneva,sans-serif" font-size="19" font-weight="700" fill="#2F3E30">Centers</text>
</svg>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="${MINT}"/>
    </linearGradient>
    <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${LIGHT}"/>
      <stop offset="100%" stop-color="${GREEN}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1080" cy="120" r="150" fill="${LIGHT}" opacity="0.25"/>
  <circle cx="120" cy="540" r="110" fill="${GREEN}" opacity="0.16"/>
  <g transform="translate(96,150) scale(2.4)">
    <rect width="64" height="64" rx="16" fill="url(#mg)"/>
    <path d="M32 15 L53 24 L32 33 L11 24 Z" fill="#FFFFFF"/>
    <path d="M18 27.5 V38 c0 5 6.5 8.5 14 8.5 s14 -3.5 14 -8.5 V27.5 L32 34 Z" fill="${MINT}"/>
  </g>
  <text x="96" y="380" font-family="Verdana,Geneva,sans-serif" font-size="62" font-weight="700" fill="#22321F">Georgia Tutoring Centers</text>
  <text x="96" y="446" font-family="Verdana,Geneva,sans-serif" font-size="32" fill="#3F5140">Test prep, math tutoring, reading help and more</text>
  <text x="96" y="520" font-family="Verdana,Geneva,sans-serif" font-size="28" font-weight="700" fill="${GREEN}">georgiatutoringcenters.com</text>
</svg>`;

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public", "logo.svg"), lockup);
writeFileSync(join(root, "public", "logo-mark.svg"), mark(64));
writeFileSync(join(root, "app", "icon.svg"), mark(64));

const markBuf = Buffer.from(mark(512));

async function build() {
  const png32 = await sharp(markBuf, { density: 384 }).resize(32, 32).png().toBuffer();
  const ico = Buffer.alloc(22 + png32.length);
  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(1, 4);
  ico.writeUInt8(32, 6);
  ico.writeUInt8(32, 7);
  ico.writeUInt8(0, 8);
  ico.writeUInt8(0, 9);
  ico.writeUInt16LE(1, 10);
  ico.writeUInt16LE(32, 12);
  ico.writeUInt32LE(png32.length, 14);
  ico.writeUInt32LE(22, 18);
  png32.copy(ico, 22);
  writeFileSync(join(root, "public", "favicon.ico"), ico);

  await sharp(markBuf, { density: 384 }).resize(180, 180).png().toFile(join(root, "app", "apple-icon.png"));
  await sharp(markBuf, { density: 384 }).resize(192, 192).png().toFile(join(root, "public", "icon-192.png"));
  await sharp(markBuf, { density: 384 }).resize(512, 512).png().toFile(join(root, "public", "icon-512.png"));
  await sharp(Buffer.from(og), { density: 96 }).png().toFile(join(root, "public", "og-image.png"));
  console.log("Brand assets generated.");
}

build();
