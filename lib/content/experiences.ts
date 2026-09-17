import type { Faq } from "@/lib/content/types";

/**
 * Viator affiliate experiences.
 *
 * Every figure here was read off the live Viator listing on the date in
 * `dataAsOf`. Prices, ratings and review counts move, so the pages print that
 * date next to the numbers and send anyone booking to the listing itself.
 *
 * Fields are deliberately optional where the listing detail has not been
 * confirmed: an unset `durationLabel` renders nothing rather than a guess, and
 * `verifyOnViator` names what a reader should check before booking.
 */
export type Experience = {
  slug: string;
  title: string;
  /** Full affiliate URL, tracking parameters intact. */
  affiliateUrl: string;
  /** Viator product code, useful when reconciling bookings against reports. */
  productCode: string;
  operator?: string;
  city: string;
  region: string;
  country: string;
  category: string;
  /** Filter chips. Kept short so a row of them stays scannable. */
  tags: string[];
  priceFrom: number;
  currency: string;
  rating: number;
  reviewCount: number;
  /** Viator's "recommended by N% of travelers" figure, where shown. */
  recommendedPercent?: number;
  badgeOfExcellence?: boolean;
  freeCancellation?: string;
  reserveNowPayLater?: boolean;
  childRates?: boolean;
  durationLabel?: string;
  languages?: string[];
  /** Local file under /public/experiences. Falls back to a plain panel. */
  image?: string;
  summary: string;
  intro: string[];
  sections: { heading: string; body: string[] }[];
  goodFor: string[];
  verifyOnViator: string[];
  faqs: Faq[];
  dataAsOf: string;
};

export const experiences: Experience[] = [
  {
    slug: "award-winning-authentic-ramen-making-experience-in-kyoto",
    title: "Award-Winning Authentic Ramen Making Experience in Kyoto",
    affiliateUrl:
      "https://www.viator.com/tours/Kyoto/Making-Ramen-from-scratch-and-Japanese-Souvenir-by-Ramen-Factory-Kyoto/d332-60659P1?pid=P00320180&mcid=42383&medium=link",
    productCode: "60659P1",
    operator: "Ramen Factory Kyoto",
    city: "Kyoto",
    region: "Kansai",
    country: "Japan",
    category: "Cooking Classes",
    tags: ["Food and Drink", "Hands-On", "Good With Kids", "Indoors"],
    priceFrom: 130.28,
    currency: "USD",
    rating: 5,
    reviewCount: 2635,
    recommendedPercent: 100,
    badgeOfExcellence: true,
    freeCancellation: "Up to 24 hours before the experience starts, local time",
    reserveNowPayLater: true,
    childRates: true,
    summary:
      "Make ramen from scratch with Ramen Factory Kyoto: noodles, broth and a finished bowl you eat on the spot, plus a souvenir to take home. Rated 5.0 from 2,635 reviews and recommended by 100% of travelers.",
    intro: [
      "A hands-on cooking class in Kyoto where you make a bowl of ramen from the noodles up rather than watching someone else do it. It is run by Ramen Factory Kyoto and sells through Viator, where it holds a 5.0 rating from 2,635 reviews, a Badge of Excellence, and a recommendation from 100% of the travelers who have reviewed it.",
      "We list it here because it is the kind of trip booking this site is happy to stand behind: a real skill taught properly, in a city where the food is half the reason people visit. Booking runs through Viator, and the link on this page is an affiliate link, so we may earn a commission at no extra cost to you.",
    ],
    sections: [
      {
        heading: "What Making Ramen From Scratch Actually Involves",
        body: [
          "Ramen noodles are not pasta. The dough is wheat flour, water, salt and kansui, an alkaline solution that is the reason the noodles come out yellow, springy and able to stand up to a hot broth without going soft. Mixing and resting that dough, then rolling and cutting it to a consistent thickness, is the part of the process a class can genuinely teach you in a morning.",
          "The broth is the other half. Ramen is usually sorted by its seasoning base rather than its stock, which is where shoyu, shio and miso come from, with tonkotsu describing the rich pork bone stock rather than the seasoning. Kyoto's own ramen tradition leans heavier than its refined reputation suggests, and a class in the city is a good place to ask why.",
          "What you take away from a session like this is mostly technique and judgement: how the dough should feel before you stop kneading, how long the noodles want in the water, and how the toppings go in so the bowl is still hot when it reaches the table.",
        ],
      },
      {
        heading: "Fitting It Into a Kyoto Trip",
        body: [
          "Kyoto sits in the Kansai region, about fifteen minutes from Osaka and a little over two hours from Tokyo on the Shinkansen, so a cooking class works as a half-day anchor on a day you are already in the city rather than a trip of its own.",
          "Book a cooking class for a day with a loose afternoon. Temples and shrines reward an early start and cooking does not, so a class after a sunrise visit to a quieter site is a better-paced day than trying to fit both into an afternoon.",
          "The experience offers discounted rates for children and free cancellation up to 24 hours before it starts, which makes it one of the easier things to pencil into a family itinerary before the rest of the week is settled.",
        ],
      },
    ],
    goodFor: [
      "Families: children are charged a discounted rate",
      "Anyone who would rather learn a skill than watch a demonstration",
      "A first full day in Kyoto, when you want to be indoors and doing something",
      "Travelers who want to eat what they cooked rather than take it away",
    ],
    verifyOnViator: [
      "How long the class runs and the start times available on your date",
      "The meeting point and the nearest station",
      "Which languages the session is taught in",
      "Group size, and whether private sessions are offered",
      "Whether vegetarian, halal or allergy-safe options can be arranged, and how much notice they need",
      "What the souvenir is and whether it is included in the headline price",
    ],
    faqs: [
      {
        q: "How much does the Kyoto ramen making experience cost?",
        a: "Viator lists it from $130.28 per person, with discounted rates for children. That is the starting price at the time we last checked the listing and it varies by date and by the option you choose, so treat it as a guide and take the figure on Viator as the real one.",
      },
      {
        q: "Is it suitable for children?",
        a: "The listing offers discounted rates for children, so children are expected. Ages are handled by the operator rather than by us, so check the age minimum and any supervision requirement on the Viator listing before booking for young children.",
      },
      {
        q: "Can I cancel if my plans change?",
        a: "The listing offers free cancellation up to 24 hours before the experience starts, in local Kyoto time, and a reserve now and pay later option that holds a spot without charging immediately. Both are set by the operator and shown on the booking page.",
      },
      {
        q: "Do I need to speak Japanese?",
        a: "Cooking classes sold through Viator to international travelers are generally run in English, but the languages a given session is taught in are listed on the booking page. Check the language line for your chosen date rather than assuming.",
      },
      {
        q: "Do you take the booking?",
        a: "No. Booking, payment, changes and cancellations all happen on Viator with the operator. We link to the listing and earn a commission if you book through it, which costs you nothing extra and gives us no part in the transaction.",
      },
    ],
    dataAsOf: "September 17, 2026",
  },
];

export function getExperience(slug: string): Experience | undefined {
  return experiences.find((entry) => entry.slug === slug);
}

/* ---------------------------------------------------------------- filters */

export type FilterOption = { value: string; count: number };

const tally = (values: string[]): FilterOption[] => {
  const map = new Map<string, number>();
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
};

/** Price bands, so the filter stays readable as the list grows. */
export const PRICE_BANDS = [
  { value: "under-75", label: "Under $75", min: 0, max: 75 },
  { value: "75-150", label: "$75 to $150", min: 75, max: 150 },
  { value: "150-300", label: "$150 to $300", min: 150, max: 300 },
  { value: "over-300", label: "Over $300", min: 300, max: Infinity },
] as const;

export const priceBandOf = (experience: Experience) =>
  PRICE_BANDS.find(
    (band) => experience.priceFrom >= band.min && experience.priceFrom < band.max
  )?.value ?? "over-300";

export function filterOptions() {
  return {
    destinations: tally(experiences.map((entry) => entry.country)),
    categories: tally(experiences.map((entry) => entry.category)),
    tags: tally(experiences.flatMap((entry) => entry.tags)),
    prices: PRICE_BANDS.filter((band) =>
      experiences.some((entry) => priceBandOf(entry) === band.value)
    ).map((band) => ({
      value: band.value,
      label: band.label,
      count: experiences.filter((entry) => priceBandOf(entry) === band.value).length,
    })),
  };
}

export const formatPrice = (experience: Experience) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: experience.currency,
  }).format(experience.priceFrom);

export const locationOf = (experience: Experience) =>
  `${experience.city}, ${experience.country}`;

/** Shared wording, so the disclosure never drifts between pages. */
export const AFFILIATE_NOTE =
  "Booking happens on Viator, not here. The links on this page are affiliate links: if you book through one we may earn a commission, at no extra cost to you.";

export const AFFILIATE_REL = "sponsored nofollow noopener noreferrer";
