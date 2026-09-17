import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import ExperienceList from "@/components/ExperienceList";
import Faqs from "@/components/Faqs";
import JsonLd from "@/components/JsonLd";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import {
  AFFILIATE_NOTE,
  experiences,
  filterOptions,
  locationOf,
} from "@/lib/content/experiences";
import "./experiences.css";

export const metadata: Metadata = pageMeta({
  title: "Experiences Worth Booking | Hands-On Classes and Tours",
  description:
    "Hands-on classes and tours we think are worth booking, with prices, ratings and what to check before you book. Filter by destination, category and price.",
  path: "/experiences",
});

const faqs = [
  {
    q: "Do you take the booking?",
    a: "No. Every experience on this page is booked on Viator, with the operator who runs it. We link to the listing; payment, changes, cancellations and the experience itself are between you and them.",
  },
  {
    q: "Do you make money from these links?",
    a: "Yes, and that is worth saying plainly. The links are affiliate links, so if you book through one we may earn a commission. It costs you nothing extra and it does not change the price you pay.",
  },
  {
    q: "How do you choose what goes on this page?",
    a: "An experience has to be something we would tell a friend to book: a real skill or a real place, run by an operator with a track record, and reviewed well enough by enough people that the rating means something. A commission is not a reason to list something.",
  },
  {
    q: "Are the prices on this page current?",
    a: "They are the starting price we read on the listing on the date printed next to it. Prices move with season, date and the option you pick, so treat ours as a guide and the figure on the booking page as the real one.",
  },
  {
    q: "What does the filter do?",
    a: "It narrows the list in your browser as you tap. Choices inside one group are alternatives, so picking two destinations shows both; choices across groups stack, so a destination plus a price band shows only what matches each.",
  },
];

export default function ExperiencesPage() {
  const options = filterOptions();
  const groups = [
    {
      key: "destination" as const,
      heading: "Destination",
      options: options.destinations.map((entry) => ({ value: entry.value, label: entry.value })),
    },
    {
      key: "category" as const,
      heading: "Category",
      options: options.categories.map((entry) => ({ value: entry.value, label: entry.value })),
    },
    {
      key: "tag" as const,
      heading: "Good for",
      options: options.tags.map((entry) => ({ value: entry.value, label: entry.value })),
    },
    {
      key: "price" as const,
      heading: "Price",
      options: options.prices.map((entry) => ({ value: entry.value, label: entry.label })),
    },
  ];

  return (
    <>
      <PageBanner
        title="Experiences Worth Booking"
        eyebrow="Travel and classes"
        image="/photos/online-tutoring-banner.jpg"
        alt="A hands-on learning session"
        priority
      >
        <ul className="banner-facts">
          <li>
            {experiences.length} {experiences.length === 1 ? "experience" : "experiences"}
          </li>
          <li>Booked on Viator</li>
          <li>Free cancellation on every listing</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[{ name: "Home", path: "/" }, { name: "Experiences", path: "/experiences" }]}
      />

      <section className="section">
        <div className="wrap">
          <p className="lede">
            Hands-on classes and tours worth the money, listed with what they cost, how they are
            rated and what to check before you book. This site is mostly about learning close to
            home; this page is the same instinct applied to a trip, where an afternoon spent being
            taught something beats an afternoon spent looking at it.
          </p>
          <p className="exp-disclosure">{AFFILIATE_NOTE}</p>
          <ExperienceList experiences={experiences} groups={groups} />
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap prose">
          <h2>How We Pick Them</h2>
          <p>
            Three things have to be true before an experience goes on this page. It teaches or
            shows something real, rather than moving a group between photo stops. The operator has
            a track record, measured in the number of people who have been and reviewed it rather
            than in the score alone, because a perfect five from nine reviews says very little. And
            the booking terms are reasonable, which in practice means free cancellation with enough
            notice to be useful when a trip moves.
          </p>
          <p>
            We book through Viator because it is the marketplace most of these operators already
            sell on, its cancellation terms are consistent, and a booking made there is traceable
            if something goes wrong. The affiliate commission is paid by Viator out of its own
            margin, so the price you see is the price you would pay going direct.
          </p>

          <h2>Read the Listing Before You Book</h2>
          <p>
            Every detail page here links straight through to the live listing, and that listing is
            the one that counts. Times, meeting points, group sizes and what is included change,
            and an operator can update them in an afternoon. The things worth checking on the
            booking page, every time:
          </p>
          <ul>
            <li>The start times actually available on your date, not the ones listed generally.</li>
            <li>The meeting point and how long it takes to reach from where you are staying.</li>
            <li>Which languages the session runs in.</li>
            <li>Age minimums, and whether an adult has to attend with a child.</li>
            <li>
              Dietary requirements for anything involving food, and how much notice the operator
              needs to accommodate them.
            </li>
            <li>The cancellation window in local time, which is rarely your own time zone.</li>
          </ul>

          <h2>Where This Fits</h2>
          <p>
            If you came here looking for tutoring rather than travel, the directory is the rest of
            the site: <Link href="/find">find a tutoring center</Link> by city or subject,{" "}
            <Link href="/costs">see what tutoring costs</Link> in Georgia, or{" "}
            <Link href="/resume-builder">build a resume</Link> if you are the one looking for
            teaching work. Our <Link href="/disclaimer">disclaimer</Link> covers affiliate links in
            full.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <Faqs faqs={faqs} heading="Questions About These Experiences" />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Experiences Worth Booking",
          url: `${site.url}/experiences`,
          numberOfItems: experiences.length,
          itemListElement: experiences.map((entry, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${site.url}/experiences/${entry.slug}`,
            name: entry.title,
            description: `${entry.category} in ${locationOf(entry)}`,
          })),
        }}
      />
    </>
  );
}
