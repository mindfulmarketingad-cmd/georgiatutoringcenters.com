import type { Listing } from "@/lib/listings";
import type { Faq } from "./types";

/**
 * Business-category page families, taken from the Google categories in the
 * export's `subtypes` column rather than from our derived subject tags.
 *
 * These describe what kind of business a center is — an after-school program
 * is childcare-shaped, an educational consultant does not teach at all — so
 * every field below is written per category. Nothing here is shared boilerplate:
 * the intro, the advice section and the FAQs all differ, because the pages are
 * answering genuinely different questions.
 */
export type CategoryVariant = {
  key: string;
  slugWord: string;
  /** Plural, title case: used in H1s and link text. */
  label: string;
  /** Singular, lower case: used mid-sentence. */
  singular: string;
  match: (listing: Listing) => boolean;
  /** Statewide page copy. */
  statewide: string[];
  /** City page copy; receives the city and the number of matches. */
  intro: (city: string, count: number) => string[];
  /** Replaces the generic "How to Choose Between These Centers" block. */
  advice: { heading: string; body: string[] };
  faqs: (city: string, count: number) => Faq[];
};

const hasSubtype = (listing: Listing, ...names: string[]) =>
  names.some(
    (name) =>
      listing.subtypes.some((subtype) => subtype.toLowerCase() === name.toLowerCase()) ||
      listing.category.toLowerCase() === name.toLowerCase()
  );

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

export const CATEGORY_VARIANTS: CategoryVariant[] = [
  {
    key: "after-school-programs",
    slugWord: "after-school-programs",
    label: "After School Programs",
    singular: "after school program",
    match: (listing) => hasSubtype(listing, "After school program"),
    statewide: [
      "An after school program solves a scheduling problem before it solves an academic one. It covers the gap between the last bell and the end of a working day, with homework supervision, a snack and usually some enrichment built into the afternoon.",
      "That makes it a different purchase from tutoring. You are buying supervised hours and consistency rather than instruction aimed at a specific skill gap, and the questions worth asking are about ratios, pickup and licensing as much as academics.",
    ],
    intro: (city, count) => [
      `${city} has ${count} after school ${plural(count, "program", "programs")} in this directory. These cover the stretch between the school bell and the end of a working day, with supervised homework time and, at most sites, enrichment activities alongside it.`,
      `Programs vary widely on the things that matter to a working parent: whether they collect children from your school, how many children each adult supervises, how late pickup runs and what a late pickup costs.`,
    ],
    advice: {
      heading: "What to Check Before You Enroll",
      body: [
        "Start with transport. Ask which schools the program collects from and at what time, because a program that does not serve your child's school turns your 3pm into a problem no amount of enrichment fixes.",
        "Then ask about ratios and staffing: how many children per adult, whether the same staff are there every day, and whether homework time is supervised or actually taught. Supervision keeps a child on task; instruction closes a gap. Programs charge similar rates for both, so it is worth knowing which one you are buying.",
        "Finally, get the full monthly cost including registration, late pickup fees and holiday or teacher-workday coverage, which is often billed separately. Ask whether the site is licensed for childcare, since that determines what oversight applies.",
      ],
    },
    faqs: (city, count) => [
      {
        q: `How many after school programs are in ${city}?`,
        a: `This directory lists ${count} after school ${plural(count, "program", "programs")} in ${city}, Georgia. Each listing shows hours, contact details and review counts, so you can check pickup times before you call.`,
      },
      {
        q: "Is an after school program the same as tutoring?",
        a: "No. An after school program is primarily supervised care with homework time attached, priced monthly for a set number of afternoons. Tutoring is instruction aimed at a specific skill gap, priced by the hour or by package. Many families use a program for coverage and add tutoring separately when a subject needs real work.",
      },
      {
        q: `What does an after school program cost in ${city}?`,
        a: "Monthly rates are the norm rather than hourly ones, and they scale with how many afternoons a week you need and how late pickup runs. Ask for the total including registration, late fees and school-holiday coverage, which is frequently quoted separately.",
      },
    ],
  },
  {
    key: "learning-centers",
    slugWord: "learning-centers",
    label: "Learning Centers",
    singular: "learning center",
    match: (listing) => hasSubtype(listing, "Learning center", "Education center"),
    statewide: [
      "A learning center is a physical site running its own curriculum: a diagnostic assessment on the way in, a written plan, and sessions on a repeating weekly schedule. Both the national franchises and independent Georgia centers work this way.",
      "It suits families who want structure across a full school year rather than help with next week's test. The trade-off is that you are buying a program, so the contract terms matter as much as the teaching.",
    ],
    intro: (city, count) => [
      `${city} has ${count} learning ${plural(count, "center", "centers")} listed here. A learning center runs its own curriculum from a fixed location, normally starting with an assessment and then working a written plan week by week.`,
      `That structure is the reason to choose one: progress is measured and reported rather than assumed. It is also why the paperwork deserves a read, because most centers sell membership rather than hours.`,
    ],
    advice: {
      heading: "How Learning Centers Are Priced",
      body: [
        "Most centers sell a monthly membership covering a set number of sessions, often with an enrollment fee and an assessment fee on top of the advertised rate. Work out the real hourly cost before comparing: a $300 month across four 45-minute sessions is $100 an hour, while the same $300 across eight full hours is excellent value.",
        "Ask what happens to sessions you miss, whether unused ones roll over, and what notice period cancellation requires. Ask too whether your child works with the same instructor each week, since consistency is what a center offers over an independent tutor.",
        "A center that assesses before quoting a package is generally the safer choice. One that quotes a package before it has met your child is selling seat time.",
      ],
    },
    faqs: (city, count) => [
      {
        q: `How many learning centers are in ${city}?`,
        a: `We list ${count} learning ${plural(count, "center", "centers")} in ${city}, Georgia, covering both national brands and independent centers. Each listing carries hours, ratings and contact details.`,
      },
      {
        q: "How is a learning center different from a private tutor?",
        a: "A center gives you a curriculum, a facility, formal assessments and cover if an instructor leaves. A private tutor gives you flexibility and usually a lower hourly rate, but no institutional backup. Neither is better in the abstract; match it to whether you value structure or flexibility more.",
      },
      {
        q: "Should we sign up for a year?",
        a: "Not before you have seen movement. Ask for the cancellation notice period in writing and whether you can pause over the summer without paying a new enrollment fee. Eight to twelve weeks is enough to judge whether a program is working.",
      },
    ],
  },
  {
    key: "private-tutors",
    slugWord: "private-tutors",
    label: "Private Tutors",
    singular: "private tutor",
    match: (listing) => hasSubtype(listing, "Private tutor", "Tutor"),
    statewide: [
      "A private tutor works one to one, often travelling to you or meeting at a library or online. There is no facility overhead and no curriculum team, which usually means a lower hourly rate and far more flexibility over scheduling.",
      "What you give up is institutional backup: no cover if your tutor is ill, no formal assessments, and no paper trail to hand a school. For a specific subject at a specific time, that is frequently the right trade.",
    ],
    intro: (city, count) => [
      `${city} has ${count} private ${plural(count, "tutor", "tutors")} listed in this directory. These are individual instructors rather than centers, working one to one and generally setting their own schedule and rates.`,
      `They are the usual answer when a student needs one subject covered at an awkward hour, when a center's fixed timetable does not fit, or when a family wants the same person every week without paying membership pricing for it.`,
    ],
    advice: {
      heading: "What a Fair Arrangement Looks Like",
      body: [
        "Rates in Georgia run roughly $30 to $60 an hour for elementary subjects, $45 to $90 for middle and high school, and $70 to $150 for AP, IB or dual-enrollment work. A certified classroom teacher commands a premium at the upper end of each band, and travel to your home usually adds a further charge.",
        "The rate should include session planning and a short note back to you afterwards. A 24-hour cancellation policy is standard and reasonable; be wary of terms that charge full price for late cancellations on top of a prepaid block, which effectively bills the session twice.",
        "Paying for a small block of sessions up front is normal. Large prepayments to an individual with no institutional backing are not — there is nobody to refund you if the arrangement ends early.",
      ],
    },
    faqs: (city, count) => [
      {
        q: `How many private tutors are listed in ${city}?`,
        a: `This directory lists ${count} private ${plural(count, "tutor", "tutors")} in ${city}, Georgia. Independent tutors are under-represented on business directories generally, so also ask your child's school which tutors local families use.`,
      },
      {
        q: "Do private tutors come to your home?",
        a: "Many do, and most charge extra for it — commonly $10 to $25 a session for travel. Others meet at a library, a coffee shop or online. Confirm the location before booking, because a tutor who only teaches online is a different proposition from one who will sit at your kitchen table.",
      },
      {
        q: "Is a private tutor cheaper than a learning center?",
        a: "Usually per hour, yes, and the scheduling is far more flexible. A center is worth the premium when you want assessments, progress reports you can share with a school, and continuity if an instructor leaves.",
      },
    ],
  },
  {
    key: "educational-consultants",
    slugWord: "educational-consultants",
    label: "Educational Consultants",
    singular: "educational consultant",
    match: (listing) => hasSubtype(listing, "Educational consultant"),
    statewide: [
      "An educational consultant advises rather than teaches. The work is school selection, placement decisions, navigating an IEP or 504 process, arranging evaluations, and planning a college admissions timeline.",
      "That distinction matters when you are comparing quotes. A consultant who charges more per hour than a tutor is not overpriced; they are selling a different service, and most of them do not provide instruction at all.",
    ],
    intro: (city, count) => [
      `${city} has ${count} educational ${plural(count, "consultant", "consultants")} in this directory. Consultants advise families on decisions rather than teaching a subject: which school to apply to, how to work a special education process, when to seek an evaluation, and how to sequence a college application year.`,
      `Families usually arrive here after something has stalled — a placement that is not working, a school process that has become adversarial, or an admissions timeline nobody has mapped out.`,
    ],
    advice: {
      heading: "Scoping the Work Before You Pay",
      body: [
        "Ask first what is actually included, because the label covers very different practices. Some consultants specialize in special education advocacy and will attend school meetings with you; others work exclusively on college admissions; a few do both. Very few provide tutoring, so do not expect instruction to come bundled.",
        "Get the fee structure in writing: hourly, retainer or package, what a package covers, and what counts as billable — school meetings, phone calls and document review often do.",
        "Ask directly about conflicts of interest. A consultant who is paid by, or formally affiliated with, schools they recommend is in a different position from one paid only by you, and either can be fine so long as you know which you are dealing with.",
      ],
    },
    faqs: (city, count) => [
      {
        q: `How many educational consultants are in ${city}?`,
        a: `We list ${count} educational ${plural(count, "consultant", "consultants")} in ${city}, Georgia. Consultants often serve a wide area and work remotely, so it is worth checking listings in neighboring cities as well.`,
      },
      {
        q: "Do educational consultants tutor?",
        a: "Generally no. Consultants advise on decisions — placement, advocacy, admissions planning — while tutoring is instruction. Some practices offer both, but treat them as two separate services with separate prices unless the consultant says otherwise.",
      },
      {
        q: "Can a consultant help with an IEP or 504 plan?",
        a: "Many do, including attending school meetings as an advocate. Ask how many meetings they have attended in your district specifically, and be clear that an advocate is not a lawyer; if the situation is genuinely adversarial you may need legal advice instead.",
      },
    ],
  },
  {
    key: "math-schools",
    slugWord: "math-schools",
    label: "Math Schools",
    singular: "math school",
    match: (listing) =>
      hasSubtype(listing, "Mathematics school", "Math school", "Math tutoring center"),
    statewide: [
      "A math school teaches only mathematics, on its own sequence, usually through repeated short practice rather than weekly homework help. The franchise programs and the Russian-school style academies both work this way.",
      "The model asks more of a family than ordinary tutoring — often daily worksheets — and in exchange it builds fluency that a once-a-week session rarely reaches. It suits both students who are behind on fundamentals and strong students who want to work ahead.",
    ],
    intro: (city, count) => [
      `${city} has ${count} math ${plural(count, "school", "schools")} listed here: programs that teach mathematics exclusively, on their own curriculum, rather than helping with whatever the class covered this week.`,
      `Expect a placement test, a starting point that may sit below your child's school grade, and short practice sets between sessions. That gap between school grade and placement level is normal and is the point of the model.`,
    ],
    advice: {
      heading: "How Math Schools Actually Work",
      body: [
        "Almost all of them start with a placement test and put a student where their fluency actually is, which is often a level or two below their school grade. Parents who expect the program to shadow the school syllabus are frequently surprised by this; it is deliberate, and it is why the approach builds fluency.",
        "Ask about the practice load between sessions. Some programs expect a short worksheet every day, and that daily habit is doing most of the work — a family that cannot sustain it will not get the results the program advertises.",
        "Ask, too, how long until you should expect change, and what happens when the school is teaching one thing while the program is drilling another. A good center will tell you plainly that it does not fix next week's test, and will offer a separate arrangement if that is what you need.",
      ],
    },
    faqs: (city, count) => [
      {
        q: `How many math schools are in ${city}?`,
        a: `This directory lists ${count} math ${plural(count, "school", "schools")} in ${city}, Georgia — programs teaching mathematics exclusively, as distinct from general tutoring centers that cover several subjects.`,
      },
      {
        q: "Will a math school help with my child's homework?",
        a: "Usually not, and it is worth knowing that before enrolling. These programs run their own sequence to build fluency, not to shadow the school calendar. If your immediate problem is Friday's test, general math tutoring is the better fit.",
      },
      {
        q: "Why did the placement test put my child below their grade?",
        a: "Because placement follows fluency rather than school grade, and a gap in the fundamentals shows up there. Working from that point is what makes the later material stick; a program that started at grade level would be building on the same gap.",
      },
    ],
  },
];

export function getCategoryVariant(key: string): CategoryVariant | undefined {
  return CATEGORY_VARIANTS.find((variant) => variant.key === key);
}
