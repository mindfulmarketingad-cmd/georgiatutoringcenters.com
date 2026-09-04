/**
 * Supplied tutoring photographs, optimised into /public/photos by
 * scripts/make-photos.mjs.
 */
export type SitePhoto = {
  banner: string;
  inline: string;
  alt: string;
  caption: string;
};

export const photos: SitePhoto[] = [
  {
    banner: "/photos/tutor-and-student-banner.jpg",
    inline: "/photos/tutor-and-student.jpg",
    alt: "A tutor helping a student work through a problem at a desk",
    caption: "Tutoring centers across Georgia work with students from elementary through high school.",
  },
  {
    banner: "/photos/one-to-one-instruction-banner.jpg",
    inline: "/photos/one-to-one-instruction.jpg",
    alt: "A tutor and a student reviewing written work together",
    caption: "One-to-one instruction lets an instructor adjust pace mid-session.",
  },
  {
    banner: "/photos/online-tutoring-banner.jpg",
    inline: "/photos/online-tutoring.jpg",
    alt: "A student working through a lesson on a laptop at home",
    caption: "Online sessions remove drive time and widen the pool of subject specialists.",
  },
];

/** Deterministic pick, so a given page always shows the same photo. */
export function photoFor(seed: string): SitePhoto {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return photos[hash % photos.length];
}
