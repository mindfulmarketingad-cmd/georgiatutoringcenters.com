import { cities, averageRating, totalReviews, type Listing } from "@/lib/listings";
import { CITY_COUNTY, countySlugOf } from "@/lib/content/counties";
import type { Faq } from "@/lib/content/types";
import { billingLive } from "@/lib/billing";
import { plan } from "@/lib/plan";

/**
 * City pages for the resume builder.
 *
 * Everything that differs between these pages comes out of the listing data
 * rather than out of reworded boilerplate: how many centers a city has, which
 * ones they are, what those centers teach, the county and ZIP codes, and the
 * neighboring cities. A city whose centers are mostly test prep gets different
 * advice from one whose centers are mostly early reading, because the hiring
 * criteria genuinely differ.
 */

/** Below this a city has too little local detail to say anything specific. */
const MIN_LISTINGS = 3;

export type Employer = {
  name: string;
  slug: string;
  focus: string;
  rating: number;
  reviewCount: number;
};

export type MarketShape = "test-prep" | "reading" | "math" | "online" | "early-years" | "general";

export type ResumeCity = {
  city: string;
  citySlug: string;
  county: string;
  countySlug: string;
  count: number;
  zips: string[];
  employers: Employer[];
  subjects: { label: string; count: number }[];
  programs: { label: string; count: number }[];
  rating: number;
  reviews: number;
  nearby: { city: string; citySlug: string; count: number }[];
  shape: MarketShape;
};

/** The subject a single listing leads with, used to describe an employer. */
function focusOf(listing: Listing): string {
  const primary = listing.services[0]?.label;
  if (primary) return primary;
  const subtype = listing.subtypes.find((s) => s.toLowerCase() !== "tutoring service");
  return subtype ?? "General tutoring";
}

function tally(values: string[]): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/**
 * Homework help is on three quarters of all listings, so it says nothing about
 * a city. The specialty that leads once it is set aside does, and that is what
 * picks the advice section.
 */
const SPECIALTIES: { label: string; shape: MarketShape }[] = [
  { label: "Early Learning", shape: "early-years" },
  { label: "Math Tutoring", shape: "math" },
  { label: "Online Tutoring", shape: "online" },
  { label: "Reading & Literacy", shape: "reading" },
  { label: "Test Prep", shape: "test-prep" },
];

/** Below this the leading subject is not a specialty, just noise. */
const SPECIALTY_SHARE = 0.15;

function shapeOf(subjects: { label: string; count: number }[], count: number): MarketShape {
  const ranked = SPECIALTIES.map((entry) => ({
    shape: entry.shape,
    // Ordered alphabetically above, so an exact tie resolves the same way on
    // every build rather than following listing order.
    share: (subjects.find((s) => s.label === entry.label)?.count ?? 0) / Math.max(count, 1),
  })).sort((a, b) => b.share - a.share);

  return ranked[0].share >= SPECIALTY_SHARE ? ranked[0].shape : "general";
}

let cache: ResumeCity[] | null = null;

export function resumeCities(): ResumeCity[] {
  if (cache) return cache;

  const groups = cities().filter((group) => group.count >= MIN_LISTINGS);
  const byCounty = new Map<string, { city: string; citySlug: string; count: number }[]>();

  for (const group of groups) {
    const county = CITY_COUNTY[group.citySlug];
    if (!county) continue;
    const list = byCounty.get(county) ?? [];
    list.push({ city: group.city, citySlug: group.citySlug, count: group.count });
    byCounty.set(county, list);
  }

  cache = groups.map((group) => {
    const county = CITY_COUNTY[group.citySlug] ?? "";
    const subjects = tally(group.listings.flatMap((l) => l.services.map((s) => s.label)));
    const programs = tally(
      group.listings.flatMap((l) =>
        l.subtypes.filter((s) => s.toLowerCase() !== "tutoring service")
      )
    );

    const employers: Employer[] = [...group.listings]
      .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating)
      .slice(0, 8)
      .map((listing) => ({
        name: listing.name,
        slug: listing.slug,
        focus: focusOf(listing),
        rating: listing.rating,
        reviewCount: listing.reviewCount,
      }));

    const nearby = (byCounty.get(county) ?? [])
      .filter((entry) => entry.citySlug !== group.citySlug)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      city: group.city,
      citySlug: group.citySlug,
      county,
      countySlug: county ? countySlugOf(county) : "",
      count: group.count,
      zips: [...new Set(group.listings.map((l) => l.postalCode).filter(Boolean))].sort(),
      employers,
      subjects: subjects.slice(0, 6),
      programs: programs.slice(0, 5),
      rating: averageRating(group.listings),
      reviews: totalReviews(group.listings),
      nearby,
      shape: shapeOf(subjects, group.count),
    };
  });

  return cache;
}

export function getResumeCity(slug: string): ResumeCity | undefined {
  return resumeCities().find((entry) => entry.citySlug === slug);
}

/* ------------------------------------------------------------------- copy */

const listSentence = (items: string[]) =>
  items.length <= 1
    ? items[0] ?? ""
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/** How many of this city's centers list a given subject. */
const countFor = (entry: ResumeCity, label: string) =>
  entry.subjects.find((subject) => subject.label === label)?.count ?? 0;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Advice that follows from the subject mix the city actually has, written
 * around that city's own numbers and named centers. Two cities with the same
 * leading subject still get different paragraphs, because the counts, the
 * employers and the size of the market are different.
 */
const SHAPE_ADVICE: Record<
  MarketShape,
  { heading: string; body: (entry: ResumeCity) => string[] }
> = {
  "test-prep": {
    heading: "Put Your Own Scores on the Page",
    body: (entry) => [
      `Test prep leads the mix in ${entry.city}: ${plural(countFor(entry, "Test Prep"), "center", "centers")} of the ${entry.count} here list it. Test prep hiring is unusually literal, because the first thing a director checks is the score you earned yourself. Put your SAT, ACT, GRE or subject test results in the education section with the year, and do not round them up.`,
      `Underneath that, give the evidence that you can move someone else's score. An average point gain across a named number of students beats any adjective. If you have only tutored a handful of people, say how many and by how much: a small honest number reads better in ${entry.city} than a vague large claim, because the people reading it prep students for a living.`,
      `Name the materials you have taught from. A center like ${entry.employers[0]?.name ?? "the ones listed above"} may run its own curriculum and still want to know you have worked through official practice tests and can explain the scoring bands to a nervous seventeen-year-old and their parent.`,
    ],
  },
  reading: {
    heading: "Name the Reading Programs You Know",
    body: (entry) => [
      `Reading and literacy is the standout subject in ${entry.city}, on ${plural(countFor(entry, "Reading & Literacy"), "of its centers", "of its centers")}. It is also the corner of tutoring where named training carries the most weight. If you are trained in Orton-Gillingham, Wilson, LETRS, Lindamood-Bell or a similar structured literacy program, put the program name in your skills section rather than describing it generically.`,
      `Say which assessments you can administer and read, whether that is DIBELS, running records or a district screener. Centers staffing intervention groups in ${entry.county ? `${entry.county} County` : entry.city} need someone who can place a child correctly in the first week rather than after a month of guessing.`,
      `Give the grade band you are strongest with. Teaching a struggling second grader to decode and helping a ninth grader with comprehension are different jobs, and with ${plural(entry.count, "employer", "employers")} in town a resume that is specific about which one you do gets routed to the right opening instead of the wrong one.`,
    ],
  },
  math: {
    heading: "Be Specific About the Math You Teach",
    body: (entry) => [
      `Math leads in ${entry.city}, listed by ${plural(countFor(entry, "Math Tutoring"), "center", "centers")} of the ${entry.count} here. The single most common gap in a math tutoring resume is vagueness about level, so write out the courses: pre-algebra, Algebra I, geometry, Algebra II, precalculus, statistics, calculus. A center staffing a high school algebra group needs to know at a glance whether you are one of the people who can take it.`,
      `Georgia math instruction is tied closely to the state standards and to end-of-course milestones, so say if you have taught to them. Familiarity with what a student is actually assessed on is worth more than a general claim of strong math skills, and it is the difference between being handed a group and being handed the homework table.`,
      `If your background is in engineering, accounting, data or another quantitative field rather than teaching, lead with the subject knowledge and pair it with whatever instruction you have done, including informal tutoring. Centers hire career changers for math more readily than for any other subject, which in a market the size of ${entry.city}'s is worth knowing.`,
    ],
  },
  online: {
    heading: "Show That You Can Teach Through a Screen",
    body: (entry) => [
      `${plural(countFor(entry, "Online Tutoring"), "center", "centers")} in ${entry.city} list online tutoring, more than any other specialty here, which changes what a hiring manager is checking for. Alongside the subject, they want evidence that you can hold a student's attention remotely and run a session without a physical whiteboard between you.`,
      `List the tools by name: the meeting platform, the shared whiteboard, the scheduling system, the homework platform. A center that runs on one of them will treat that line as a shortcut through training, and it is a cheap thing to put on a page.`,
      `Mention your setup honestly, since it is part of the job: a reliable connection, a quiet room, a headset, and a tablet or pen input if you teach anything that needs handwriting. It reads as professionalism rather than padding. It also widens your search well past ${entry.city}, because an employer hiring for online work is not counting your drive time.`,
    ],
  },
  "early-years": {
    heading: "Lead With Patience and Classroom Management",
    body: (entry) => [
      `${plural(countFor(entry, "Early Learning"), "center", "centers")} in ${entry.city} work with early elementary and pre-kindergarten children, the largest specialty in town. At that age subject depth matters less than the ability to keep five small people on task for forty-five minutes, and resumes get read with that in mind.`,
      `Put group size in your bullets. Running a table of six kindergarteners through a phonics routine is a specific, checkable skill, and it is the thing an early years program is actually staffing for.`,
      `Include the practical credentials these programs are required to care about: CPR and first aid certification, a cleared background check, and any child care or early childhood coursework. For programs licensed as child care, and several of the ${entry.count} in ${entry.city} are, those lines are not optional extras.`,
    ],
  },
  general: {
    heading: "Lead With the Subjects and Grades You Cover",
    body: (entry) => [
      `No single subject dominates in ${entry.city}. Its ${plural(entry.count, "center", "centers")} cover a broad mix rather than specializing, which means they hire tutors who can take a range of students and they read resumes looking for coverage.`,
      `Write the subjects and grade bands you can actually take, in plain words, near the top of the page. Homework help across several subjects is a legitimate and well-paid thing to offer, and it is what most of the work in ${entry.city} looks like day to day, so say so rather than trying to sound more specialized than you are.`,
      `Then give one or two specifics that show depth somewhere, so the page does not read as a list of things you are willing to try. Breadth gets you considered; one demonstrated strength gets you hired.`,
    ],
  },
};

export function shapeAdvice(entry: ResumeCity) {
  const advice = SHAPE_ADVICE[entry.shape];
  return { heading: advice.heading, body: advice.body(entry) };
}

export function cityIntro(entry: ResumeCity): string[] {
  const subjects = entry.subjects.slice(0, 3).map((s) => s.label.toLowerCase());
  const topProgram = entry.programs[0]?.label.toLowerCase();
  const employerCount = entry.count;

  const opening =
    `Build a resume for tutoring and teaching work in ${entry.city}, Georgia, one question at a time, ` +
    `then lay it out in one of five templates. This directory lists ${employerCount} tutoring and learning ` +
    `${employerCount === 1 ? "center" : "centers"} in ${entry.city}${entry.county ? `, ${entry.county} County` : ""}, ` +
    `which is the pool of local employers your resume is aimed at.`;

  const detail = subjects.length
    ? `Those centers lead with ${listSentence(subjects)}, so the page you build here is worth tailoring to that mix rather than sending the same document everywhere.`
    : `The builder walks through the same ten questions whatever subject you teach.`;

  const scale =
    entry.count >= 20
      ? `${entry.city} is one of the larger tutoring markets in the state, which means more openings and more competition for each one. A resume that names grade levels and results specifically is what separates candidates here.`
      : entry.count >= 8
        ? `${entry.city} has a working local market rather than a handful of centers, so it is realistic to apply to several without leaving town.`
        : `${entry.city} has a small number of centers, so it is worth widening to the nearby cities listed below and applying to all of them rather than waiting for one opening.`;

  const program = topProgram
    ? `The most common type of center here is the ${topProgram}, and the rest of this page covers what that kind of employer looks for.`
    : "";

  return [opening, detail, [scale, program].filter(Boolean).join(" ")];
}

export function cityFaqs(entry: ResumeCity): Faq[] {
  const subjects = entry.subjects.slice(0, 3).map((s) => s.label.toLowerCase());
  return [
    {
      q: `How many tutoring employers are there in ${entry.city}, Georgia?`,
      a: `This directory lists ${entry.count} tutoring and learning ${entry.count === 1 ? "center" : "centers"} in ${entry.city}${entry.county ? `, in ${entry.county} County` : ""}. Not all of them are hiring at any given moment, but they are the local employers worth sending a resume to, and each one is listed on this site with hours, contact details and the subjects it covers.`,
    },
    {
      q: `What should a tutor resume in ${entry.city} say?`,
      a: subjects.length
        ? `Lead with the subjects and grade levels you teach. Centers in ${entry.city} lead with ${listSentence(subjects)}, so if your experience matches any of those, put it in the first third of the page rather than burying it in an employment bullet.`
        : `Lead with the subjects and grade levels you teach, then give specific results: students taught, sessions per week, and the change in their grades or scores.`,
    },
    {
      q: `Do I need a teaching certificate to tutor in ${entry.city}?`,
      a: `Not usually. Private tutoring centers set their own hiring bars, and most require a degree in or near the subject rather than a state teaching certificate. A Georgia certificate is still worth listing where you have one, because several centers treat it as a higher pay band.`,
    },
    {
      q: `What does tutoring pay around ${entry.city}?`,
      a: `Tutors working through a center in Georgia commonly earn roughly $18 to $30 an hour, with test prep and higher level math at the upper end. Independent tutors charging families directly bill more, generally $40 to $80 an hour, but carry their own scheduling, billing and cancellations. Our cost guides break down what families pay, which is the other half of that picture.`,
    },
    {
      q: `Is the ${entry.city} resume builder free?`,
      a: billingLive()
        ? `Building your resume, editing it and previewing it in any of the five templates costs nothing and needs no account. Downloading the finished file requires an account and a subscription at ${plan.priceLabel} a month, which you can cancel at any time.`
        : `Yes. Building, editing, previewing and downloading your resume are all free, with no account and no watermark.`,
    },
  ];
}

export const citySlugs = () => resumeCities().map((entry) => entry.citySlug);
