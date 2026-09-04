#!/usr/bin/env node
/**
 * Optimises the supplied tutoring photographs into public/photos/.
 *
 * Sources live in assets/source-photos/ (Next does not serve files from there);
 * this writes a banner crop and an inline width for each, so pages never
 * download a 2x file to render a small one.
 */
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "photos");
mkdirSync(out, { recursive: true });

const photos = [
  { src: "assets/source-photos/tutor-and-student.jpg", name: "tutor-and-student" },
  { src: "assets/source-photos/one-to-one-instruction.jpg", name: "one-to-one-instruction" },
  { src: "assets/source-photos/online-tutoring.jpg", name: "online-tutoring" },
];

for (const photo of photos) {
  const input = join(root, photo.src);

  // Banner crop: wide, upscaled with a sharpening pass since the sources are
  // small. Cropped from the top so faces survive the 2.4:1 letterbox.
  await sharp(input)
    .resize({ width: 1800, height: 760, fit: "cover", position: "north", kernel: "lanczos3" })
    .sharpen({ sigma: 0.7 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(out, `${photo.name}-banner.jpg`));

  // Inline width for use inside content columns, at native resolution.
  await sharp(input)
    .resize({ width: 900, withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(join(out, `${photo.name}.jpg`));

  await sharp(input)
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(join(out, `${photo.name}.webp`));
}

console.log(`Optimised ${photos.length} photos into public/photos/.`);
