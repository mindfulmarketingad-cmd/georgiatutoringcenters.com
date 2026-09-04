/**
 * Editorial bylines.
 *
 * These describe roles on the site's editorial team. They deliberately claim
 * no degrees, licences or named institutions: replace the names and biography
 * text with the real people who write for the site before publishing, rather
 * than inventing credentials that cannot be verified.
 */
export type Author = {
  slug: string;
  name: string;
  role: string;
  short: string;
  bio: string[];
  covers: string[];
  focus: string;
  joined: string;
};

export const authors: Author[] = [
  {
    slug: "editorial-team",
    name: "The Georgia Tutoring Centers Editorial Team",
    role: "Directory research and data",
    short: "Compiles and verifies the listing data behind every page on the site.",
    bio: [
      "The editorial team maintains the directory itself: importing business data, normalising it into one comparable format, checking addresses and hours against public sources, and handling correction requests from families and business owners.",
      "Anything published under this byline is a data-driven page rather than an opinion piece. When numbers appear on the site, this is the team that gathered them and that will correct them when a reader writes in.",
    ],
    covers: ["Directory data", "Listing corrections", "Methodology"],
    focus: "Keeping the listing data accurate and comparable",
    joined: "2024",
  },
  {
    slug: "dana-whitfield",
    name: "Dana Whitfield",
    role: "Editor, choosing a tutor",
    short: "Writes the parent-facing guides on evaluating and choosing a tutoring center.",
    bio: [
      "Dana edits the guides that help families work out whether tutoring is the right answer and, if it is, how to pick between the centers near them. The recurring theme in that work is that the questions a parent asks on the first phone call predict the experience better than any rating does.",
      "Her guides lean on what centers actually offer in Georgia: assessment practices, instructor staffing, group sizes, contract terms and how progress gets reported back to parents.",
    ],
    covers: ["Choosing a tutor", "Progress reporting", "Questions to ask a center"],
    focus: "How families compare centers and what to ask before enrolling",
    joined: "2024",
  },
  {
    slug: "marcus-reed",
    name: "Marcus Reed",
    role: "Editor, test prep and high school",
    short: "Covers SAT and ACT preparation, study plans and the high school calendar.",
    bio: [
      "Marcus writes the test preparation coverage: when to sit the SAT or ACT, how many hours of practice a score goal realistically needs, and how prep fits around a Georgia high school year that is already full.",
      "He is deliberately conservative about score-gain claims. Where a threshold matters for a scholarship, his guides point readers to the administering agency for the current rules rather than restating numbers that change.",
    ],
    covers: ["High school scheduling", "SAT and ACT prep", "Study plans"],
    focus: "Test preparation that matches the hours a student actually has",
    joined: "2024",
  },
  {
    slug: "priya-raman",
    name: "Priya Raman",
    role: "Editor, early learning and pricing",
    short: "Covers reading and math foundations, plus what tutoring costs across Georgia.",
    bio: [
      "Priya covers the two ends of the site: the early reading and math instruction that determines how the later years go, and the pricing pages that tell families what the going rate is before they call anyone.",
      "The cost guides under her byline publish ranges rather than single figures, because tutoring is priced by format far more than by city, and a monthly membership and an hourly rate rarely compare the way a quote implies.",
    ],
    covers: ["Math foundations", "Reading and literacy", "Tutoring costs"],
    focus: "Early instruction and honest pricing comparisons",
    joined: "2024",
  },
];

export function getAuthor(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

export function authorOrDefault(slug: string): Author {
  return getAuthor(slug) ?? authors[0];
}
