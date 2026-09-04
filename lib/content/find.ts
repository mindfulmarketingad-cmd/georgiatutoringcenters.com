import { cities, listings as allListings, services, type Listing } from "@/lib/listings";
import { counties, countyOf, countySlugOf } from "./counties";
import type { Faq } from "./types";

export type RelatedBlock = { heading: string; items: { href: string; label: string; note?: string }[] };

export type FindPage = {
  slug: string;
  /** A page with a single listing is too thin to index; it stays crawlable and linked. */
  noindex: boolean;
  kind: "city" | "service" | "city-service" | "county" | "zip";
  key: string;
  label: string;
  h1: string;
  metaTitle: string;
  description: string;
  intro: string[];
  listings: Listing[];
  faqs: Faq[];
  /** Set on "city-service" pages so the view can link back to each parent page. */
  cityPage?: { slug: string; label: string };
  servicePage?: { slug: string; label: string };
  /** Extra link lists rendered under the listicle, e.g. cities within a county. */
  related?: RelatedBlock[];
};

/** Programs ranked by how many centers in this set offer them. */
function subjectMix(items: Listing[]): { slug: string; label: string; count: number }[] {
  const map = new Map<string, { slug: string; label: string; count: number }>();
  for (const listing of items) {
    for (const service of listing.services) {
      const entry = map.get(service.slug) ?? { slug: service.slug, label: service.label, count: 0 };
      entry.count += 1;
      map.set(service.slug, entry);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function ratingSummary(items: Listing[]) {
  const rated = items.filter((l) => l.rating > 0);
  const reviews = items.reduce((sum, l) => sum + l.reviewCount, 0);
  const average = rated.length
    ? Number((rated.reduce((sum, l) => sum + l.rating, 0) / rated.length).toFixed(2))
    : 0;
  return { rated: rated.length, reviews, average };
}

function listSentence(parts: string[], max = 6): string {
  const shown = parts.slice(0, max);
  const rest = parts.length - shown.length;
  const joined =
    shown.length > 1 ? `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}` : shown[0];
  return rest > 0 ? `${joined}, plus ${rest} more` : joined;
}

const SERVICE_COPY: Record<string, { blurb: string; who: string }> = {
  "math-tutoring": {
    blurb:
      "Math is the most requested subject at Georgia tutoring centers, covering everything from multiplication fluency in elementary school through Algebra II, pre-calculus and AP Calculus.",
    who: "students who are a grade level behind, students in a jump year such as sixth or ninth grade, and strong students taking an advanced course for the first time",
  },
  "reading-tutoring": {
    blurb:
      "Reading and literacy programs cover phonics, fluency, vocabulary and comprehension, and are the highest-value early intervention available to a Georgia family.",
    who: "early elementary readers, students who decode slowly, and older students whose comprehension lags their grade",
  },
  "english-tutoring": {
    blurb:
      "English and language arts tutoring covers grammar, essay writing, literature analysis and vocabulary, building on the reading foundation for students in upper elementary through high school.",
    who: "middle and high school students working on essays and literature, and any student whose writing needs more structure than a classroom can give it",
  },
  "test-prep": {
    blurb:
      "Test prep centers focus on the SAT, ACT, and admissions or placement exams, including score-threshold planning for Georgia scholarship programs.",
    who: "high school sophomores and juniors building toward a target score",
  },
  "stem-and-coding": {
    blurb:
      "STEM and coding programs blend academic support with project work: robotics, programming, engineering challenges and lab science.",
    who: "students who need science support and students who learn best by building",
  },
  "special-needs-support": {
    blurb:
      "Specialized programs serve students with dyslexia, ADHD and other learning differences using structured, explicit instruction and documented progress monitoring.",
    who: "students with an evaluation, a school support plan, or a persistent gap that general tutoring has not closed",
  },
  "early-learning": {
    blurb:
      "Early learning programs build kindergarten readiness: letter sounds, number sense, fine motor skills and the routines of a school day.",
    who: "pre-K and kindergarten students, and rising first graders",
  },
  "homework-help": {
    blurb:
      "Homework help and study skills programs give students a supervised place to work, plus coaching on planning, note-taking and test preparation.",
    who: "students who understand the material but struggle to complete and submit work",
  },
  "online-tutoring": {
    blurb:
      "Online tutoring removes drive time and widens the pool of subject specialists, which matters most for families outside metro Atlanta.",
    who: "middle and high school students, and any family with a tight afternoon schedule",
  },
};

const SERVICE_TUTOR: Record<string, { label: string; slugWord: string }> = {
  "math-tutoring": { label: "Math Tutors", slugWord: "math-tutors" },
  "reading-tutoring": { label: "Reading Tutors", slugWord: "reading-tutors" },
  "english-tutoring": { label: "English Tutors", slugWord: "english-tutors" },
  "test-prep": { label: "Test Prep Tutors", slugWord: "test-prep-tutors" },
  "stem-and-coding": { label: "STEM & Coding Tutors", slugWord: "stem-tutors" },
  "special-needs-support": { label: "Special Needs Tutors", slugWord: "special-needs-tutors" },
  "early-learning": { label: "Early Learning Tutors", slugWord: "early-learning-tutors" },
  "homework-help": { label: "Homework Help Tutors", slugWord: "homework-help-tutors" },
  "online-tutoring": { label: "Online Tutors", slugWord: "online-tutors" },
};

function cityServiceFaqs(tutorLabel: string, city: string, count: number): Faq[] {
  return [
    {
      q: `How many ${tutorLabel.toLowerCase()} are in ${city}, Georgia?`,
      a: `We currently list ${count} ${tutorLabel.toLowerCase()} serving ${city}. Each listing includes hours, contact details, ratings and a direct phone number.`,
    },
    {
      q: `How do I pick between them?`,
      a: `Ask what the intake assessment measures, who teaches your child each week, the student-to-instructor ratio, the total first-month cost, and how progress is reported. See our cost guides for what a fair quote looks like in Georgia.`,
    },
    {
      q: `Is there a closer option outside ${city}?`,
      a: `Check the nearby city pages linked below, or browse this subject across all of Georgia for the full list.`,
    },
  ];
}

function countyFaqs(county: string, count: number, cityNames: string[]): Faq[] {
  return [
    {
      q: `How many tutoring centers are in ${county} County, Georgia?`,
      a: `This directory lists ${count} tutoring and learning ${count === 1 ? "center" : "centers"} in ${county} County, across ${cityNames.length} ${cityNames.length === 1 ? "city" : "cities"}: ${cityNames.join(", ")}.`,
    },
    {
      q: `Which ${county} County city should I search first?`,
      a: `Start with the city you already drive through on a school day. Twenty minutes each way is the practical limit for twice-weekly sessions, so a center on an existing route beats a better-rated one across the county.`,
    },
    {
      q: `Do these centers serve students from neighbouring counties?`,
      a: `Most do. County lines rarely matter to enrollment, so if you live near the edge of ${county} County it is worth checking the adjacent county pages as well.`,
    },
  ];
}

function zipFaqs(zip: string, city: string, county: string, count: number): Faq[] {
  return [
    {
      q: `How many tutoring centers are in the ${zip} ZIP code?`,
      a: `We list ${count} tutoring and learning ${count === 1 ? "center" : "centers"} with a ${zip} address. ${zip} covers part of ${city}${county ? ` in ${county} County` : ""}, Georgia.`,
    },
    {
      q: `Should I only look at centers in ${zip}?`,
      a: `No. A ZIP code is a mail boundary, not a catchment area. Use it to find the closest options, then widen to the ${city} city page, which lists every center in town.`,
    },
    {
      q: `What does tutoring cost around ${zip}?`,
      a: `Georgia rates run roughly $40 to $80 per hour for small-group instruction and $60 to $120 one-to-one, with monthly memberships between $150 and $500. Our cost guides break that down by program.`,
    },
  ];
}

function cityFaqs(city: string, count: number): Faq[] {
  return [
    {
      q: `How many tutoring centers are listed in ${city}?`,
      a: `Our directory currently lists ${count} tutoring and learning ${count === 1 ? "center" : "centers"} serving ${city}, Georgia. Each listing includes hours, contact details, ratings and the subjects the center covers.`,
    },
    {
      q: `How much does tutoring cost in ${city}?`,
      a: `Most families in ${city} pay roughly $40 to $80 per hour for small-group instruction and $60 to $120 per hour for one-to-one tutoring. Monthly learning center memberships commonly run $150 to $500. See our cost guides for a full breakdown.`,
    },
    {
      q: `What should I ask a ${city} tutoring center before enrolling?`,
      a: `Ask what the intake assessment measures, who will teach your child each week, the student-to-instructor ratio, the total first-month cost including fees, and how progress will be reported to you.`,
    },
  ];
}

function serviceFaqs(label: string, count: number): Faq[] {
  return [
    {
      q: `How many Georgia centers offer ${label.toLowerCase()}?`,
      a: `We currently list ${count} Georgia ${count === 1 ? "center" : "centers"} offering ${label.toLowerCase()}. Use the city filters to narrow the list to your area.`,
    },
    {
      q: `How do I compare ${label.toLowerCase()} programs?`,
      a: `Compare instructor credentials, the student-to-instructor ratio, how progress is measured, session length and the total monthly cost. A center that assesses before quoting a package is usually the safer choice.`,
    },
    {
      q: `How quickly should we see results?`,
      a: `Expect the first month to be diagnostic and confidence-building, with visible improvement on homework by roughly week five. If nothing has changed by week six, ask the center to revise the plan.`,
    },
  ];
}

export function findPages(): FindPage[] {
  const pages: FindPage[] = [];

  for (const group of cities()) {
    pages.push({
      slug: `tutoring-centers-in-${group.citySlug}`,
      noindex: group.count < 2,
      kind: "city",
      key: group.citySlug,
      label: group.city,
      h1: `Tutoring Centers in ${group.city}, GA`,
      metaTitle: `Tutoring Centers in ${group.city}, GA | ${group.count} Learning Centers`,
      description: `Compare ${group.count} tutoring and learning centers in ${group.city}, Georgia. Hours, ratings, subjects, phone numbers and directions for every center.`,
      intro: [
        `${group.city} families have ${group.count} tutoring and learning ${group.count === 1 ? "center" : "centers"} in this directory, covering math, reading, test prep and homework support. Every listing below shows hours of operation, review counts, contact details and the subjects each center teaches.`,
        `Sort through the list, toggle the map to see which centers are closest to your school or office, and use the filter chips to jump to a specific subject.`,
      ],
      listings: group.listings,
      faqs: cityFaqs(group.city, group.count),
    });
  }

  for (const group of services()) {
    const copy = SERVICE_COPY[group.slug];
    pages.push({
      slug: `${group.slug}-in-georgia`,
      noindex: false,
      kind: "service",
      key: group.slug,
      label: group.label,
      h1: `${group.label} in Georgia`,
      metaTitle: `${group.label} in Georgia | ${group.count} Tutoring Centers`,
      description: `Find ${group.label.toLowerCase()} across Georgia. Compare ${group.count} centers by city, hours, ratings and cost.`,
      intro: [
        copy?.blurb ??
          `${group.label} programs across Georgia, compared by city, hours, ratings and price.`,
        `The ${group.count} ${group.count === 1 ? "center" : "centers"} below offer ${group.label.toLowerCase()}. This page is most useful for ${copy?.who ?? "families comparing programs across several cities"}.`,
      ],
      listings: group.listings,
      faqs: serviceFaqs(group.label, group.count),
    });
  }

  for (const cityGroup of cities()) {
    for (const serviceGroup of services()) {
      const matches = cityGroup.listings.filter((listing) =>
        listing.services.some((s) => s.slug === serviceGroup.slug)
      );
      if (!matches.length) continue;

      const tutor = SERVICE_TUTOR[serviceGroup.slug] ?? {
        label: `${serviceGroup.label} Tutors`,
        slugWord: `${serviceGroup.slug}-tutors`,
      };
      const cityPageSlug = `tutoring-centers-in-${cityGroup.citySlug}`;
      const servicePageSlug = `${serviceGroup.slug}-in-georgia`;

      pages.push({
        slug: `${tutor.slugWord}-in-${cityGroup.citySlug}`,
        noindex: matches.length < 2,
        kind: "city-service",
        key: `${serviceGroup.slug}:${cityGroup.citySlug}`,
        label: `${tutor.label} in ${cityGroup.city}`,
        h1: `${tutor.label} in ${cityGroup.city}, GA`,
        metaTitle: `${tutor.label} in ${cityGroup.city}, GA | ${matches.length} ${matches.length === 1 ? "Center" : "Centers"}`,
        description: `Compare ${matches.length} ${tutor.label.toLowerCase()} in ${cityGroup.city}, Georgia. Hours, ratings, phone numbers and directions for each center.`,
        intro: [
          `${cityGroup.city} families have ${matches.length} ${tutor.label.toLowerCase()} listed in this directory. Every listing below shows hours of operation, review counts and contact details.`,
          `For every subject in ${cityGroup.city}, see the full ${cityGroup.city} city guide. For ${serviceGroup.label.toLowerCase()} statewide, see the Georgia-wide subject page.`,
        ],
        listings: matches,
        faqs: cityServiceFaqs(tutor.label, cityGroup.city, matches.length),
        cityPage: { slug: cityPageSlug, label: cityGroup.city },
        servicePage: { slug: servicePageSlug, label: serviceGroup.label },
      });
    }
  }

  for (const group of counties()) {
    const cityNames = group.cities.map((c) => c.city);
    const mix = subjectMix(group.listings);
    const { average, reviews } = ratingSummary(group.listings);
    const topSubjects = mix.slice(0, 3);

    pages.push({
      slug: `tutoring-centers-in-${group.countySlug}-county`,
      noindex: group.count < 2,
      kind: "county",
      key: group.countySlug,
      label: `${group.county} County`,
      h1: `Tutoring & Learning Centers in ${group.county} County Georgia`,
      metaTitle: `Tutoring & Learning Centers in ${group.county} County Georgia | ${group.count} ${group.count === 1 ? "Center" : "Centers"}`,
      description: `Compare ${group.count} tutoring and learning centers across ${group.county} County, Georgia, covering ${listSentence(cityNames, 4)}. Hours, ratings, subjects and contact details.`,
      intro: [
        `${group.county} County has ${group.count} tutoring and learning ${group.count === 1 ? "center" : "centers"} in this directory, spread across ${cityNames.length} ${cityNames.length === 1 ? "city" : "cities"}: ${listSentence(cityNames, 8)}.`,
        topSubjects.length
          ? `The most common programs in the county are ${listSentence(topSubjects.map((t) => `${t.label.toLowerCase()} (${t.count} ${t.count === 1 ? "center" : "centers"})`), 3)}.${average ? ` Centers here average ${average} stars across ${reviews.toLocaleString("en-US")} reviews.` : ""}`
          : `Every listing below shows hours of operation, review counts and contact details.`,
      ],
      listings: group.listings,
      faqs: countyFaqs(group.county, group.count, cityNames),
      related: [
        {
          heading: `Cities in ${group.county} County`,
          items: group.cities.map((city) => ({
            href: `/find/tutoring-centers-in-${city.citySlug}`,
            label: `Tutoring centers in ${city.city}`,
            note: `${city.count} ${city.count === 1 ? "center" : "centers"}`,
          })),
        },
      ],
    });
  }

  const zipGroups = new Map<string, Listing[]>();
  for (const listing of allListings) {
    const zip = listing.postalCode.trim();
    if (!/^\d{5}$/.test(zip)) continue;
    zipGroups.set(zip, [...(zipGroups.get(zip) ?? []), listing]);
  }

  for (const [zip, items] of zipGroups) {
    const cityCounts = new Map<string, { city: string; citySlug: string; count: number }>();
    for (const listing of items) {
      const entry = cityCounts.get(listing.citySlug) ?? {
        city: listing.city,
        citySlug: listing.citySlug,
        count: 0,
      };
      entry.count += 1;
      cityCounts.set(listing.citySlug, entry);
    }
    const mainCity = [...cityCounts.values()].sort((a, b) => b.count - a.count)[0];
    const county = countyOf(items[0]) ?? "";
    const mix = subjectMix(items);
    const { average, reviews } = ratingSummary(items);

    pages.push({
      slug: `tutoring-centers-in-${zip}`,
      noindex: items.length < 2,
      kind: "zip",
      key: zip,
      label: zip,
      h1: `Tutoring & Learning Centers in ${zip}`,
      metaTitle: `Tutoring & Learning Centers in ${zip} (${mainCity.city}, GA) | ${items.length} ${items.length === 1 ? "Center" : "Centers"}`,
      description: `${items.length} tutoring and learning ${items.length === 1 ? "center" : "centers"} in the ${zip} ZIP code, ${mainCity.city}, Georgia. Hours, ratings, phone numbers and directions.`,
      intro: [
        `The ${zip} ZIP code covers part of ${mainCity.city}${county ? `, in ${county} County` : ""}, and has ${items.length} tutoring and learning ${items.length === 1 ? "center" : "centers"} in this directory.`,
        mix.length
          ? `Centers here offer ${listSentence(mix.slice(0, 3).map((t) => t.label.toLowerCase()), 3)}.${average ? ` They average ${average} stars across ${reviews.toLocaleString("en-US")} reviews.` : ""} A ZIP code is a mail boundary rather than a catchment area, so widen the search to ${mainCity.city} if nothing here fits.`
          : `A ZIP code is a mail boundary rather than a catchment area, so widen the search to ${mainCity.city} if nothing here fits.`,
      ],
      listings: items,
      faqs: zipFaqs(zip, mainCity.city, county, items.length),
      related: [
        {
          heading: "Wider searches",
          items: [
            {
              href: `/find/tutoring-centers-in-${mainCity.citySlug}`,
              label: `Tutoring centers in ${mainCity.city}`,
              note: `${mainCity.count} in this ZIP`,
            },
            ...(county
              ? [
                  {
                    href: `/find/tutoring-centers-in-${countySlugOf(county)}-county`,
                    label: `Tutoring & Learning Centers in ${county} County Georgia`,
                  },
                ]
              : []),
          ],
        },
      ],
    });
  }

  // City and subject pages link down into the deeper combos and ZIP pages.
  for (const page of pages) {
    if (page.kind === "city") {
      const zips = [...new Set(page.listings.map((l) => l.postalCode.trim()))]
        .filter((zip) => /^\d{5}$/.test(zip))
        .sort();
      const combos = pages.filter(
        (p) => p.kind === "city-service" && p.cityPage?.slug === page.slug
      );
      const county = countyOf(page.listings[0]);
      page.related = [
        ...(combos.length
          ? [
              {
                heading: `${page.label} tutors by subject`,
                items: combos.map((combo) => ({
                  href: `/find/${combo.slug}`,
                  label: combo.h1,
                  note: `${combo.listings.length} ${combo.listings.length === 1 ? "center" : "centers"}`,
                })),
              },
            ]
          : []),
        ...(zips.length
          ? [
              {
                heading: `ZIP codes in ${page.label}`,
                items: zips.map((zip) => ({
                  href: `/find/tutoring-centers-in-${zip}`,
                  label: `Tutoring & Learning Centers in ${zip}`,
                })),
              },
            ]
          : []),
        ...(county
          ? [
              {
                heading: "Wider search",
                items: [
                  {
                    href: `/find/tutoring-centers-in-${countySlugOf(county)}-county`,
                    label: `Tutoring & Learning Centers in ${county} County Georgia`,
                  },
                ],
              },
            ]
          : []),
      ];
    }

    if (page.kind === "service") {
      const combos = pages.filter(
        (p) => p.kind === "city-service" && p.servicePage?.slug === page.slug
      );
      if (combos.length) {
        page.related = [
          {
            heading: `${page.label} by city`,
            items: combos.map((combo) => ({
              href: `/find/${combo.slug}`,
              label: combo.h1,
              note: `${combo.listings.length} ${combo.listings.length === 1 ? "center" : "centers"}`,
            })),
          },
        ];
      }
    }
  }

  return pages;
}

export function getFindPage(slug: string): FindPage | undefined {
  return findPages().find((p) => p.slug === slug);
}
