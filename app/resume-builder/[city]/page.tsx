import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import ResumeBuilder from "@/components/ResumeBuilder";
import Faqs from "@/components/Faqs";
import JsonLd from "@/components/JsonLd";
import LinkList from "@/components/LinkList";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { plan } from "@/lib/plan";
import { billingLive } from "@/lib/billing";
import { steps, templates } from "@/lib/resume";
import {
  cityFaqs,
  cityIntro,
  getResumeCity,
  resumeCities,
  shapeAdvice,
  type ResumeCity,
} from "@/lib/content/resume-cities";
import "../resume.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return resumeCities().map((entry) => ({ city: entry.citySlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const entry = getResumeCity(city);
  if (!entry) {
    return pageMeta({
      title: "Not found",
      description: "",
      path: `/resume-builder/${city}`,
      noindex: true,
    });
  }
  return pageMeta({
    title: `Resume Builder in ${entry.city}, Georgia | Tutor and Teacher Resumes`,
    description: `Build a tutoring or teaching resume for ${entry.city}, Georgia. Ten questions, five templates, and the ${entry.count} ${entry.city} learning centers your resume is aimed at.`,
    path: `/resume-builder/${entry.citySlug}`,
  });
}

function payLine(entry: ResumeCity) {
  const rated = entry.reviews > 0;
  const standing = rated
    ? `Centers here average ${entry.rating.toFixed(1)} out of five across ${entry.reviews.toLocaleString()} reviews, and the better-reviewed ones tend to pay at the top of their range because they lose fewer families and can keep instructors busy.`
    : `Few of the centers here carry much public feedback yet, so ask directly about hours and rates rather than assuming the posted figure is the whole picture.`;

  if (entry.count >= 20) {
    return `With ${entry.count} centers competing for the same instructors, ${entry.city} sits at the higher end of the Georgia range. Center work commonly pays $20 to $32 an hour here, and independent tutors billing families directly charge $45 to $90 depending on subject and level. ${standing}`;
  }
  if (entry.count >= 8) {
    return `${entry.city} runs close to the Georgia average: roughly $18 to $28 an hour through a center, and $40 to $75 an hour tutoring families directly. With ${entry.count} centers in town there is enough movement to compare two or three offers rather than taking the first. ${standing}`;
  }
  return `${entry.city} is a small market, and small markets pay less predictably: roughly $18 to $26 an hour through a center, with independent rates of $40 to $70 once you have families of your own. With only ${entry.count} centers here, building a private client list matters more than it would in a larger city. ${standing}`;
}

export default async function ResumeBuilderCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const entry = getResumeCity(city);
  if (!entry) notFound();

  const advice = shapeAdvice(entry);
  const intro = cityIntro(entry);
  const faqs = cityFaqs(entry);

  const nearbyLinks = entry.nearby.map((near) => ({
    href: `/resume-builder/${near.citySlug}`,
    label: `Resume Builder in ${near.city}, Georgia`,
    note: `${near.count} ${near.count === 1 ? "center" : "centers"}`,
  }));

  const localLinks = [
    {
      href: `/find/tutoring-centers-in-${entry.citySlug}`,
      label: `Tutoring Centers in ${entry.city}, Georgia`,
      note: "Every center in town, with hours and contact details",
    },
    ...(entry.county
      ? [
          {
            href: `/find/tutoring-centers-in-${entry.countySlug}-county`,
            label: `Tutoring Centers in ${entry.county} County Georgia`,
            note: "The wider county, if you can travel",
          },
        ]
      : []),
    { href: "/resume-builder", label: "Free Resume Builder", note: "The statewide builder" },
    { href: "/costs", label: "Tutoring Costs in Georgia", note: "What families here pay" },
  ];

  return (
    <>
      <PageBanner
        title={`Resume Builder in ${entry.city}, Georgia`}
        eyebrow="Career tools"
        image="/photos/one-to-one-instruction-banner.jpg"
        alt={`A tutor working with a student, as at the learning centers in ${entry.city}, Georgia`}
        priority
      >
        <ul className="banner-facts">
          <li>
            {entry.count} {entry.city} {entry.count === 1 ? "employer" : "employers"}
          </li>
          <li>{steps.length} questions</li>
          <li>{templates.length} templates</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Resume Builder", path: "/resume-builder" },
          { name: entry.city, path: `/resume-builder/${entry.citySlug}` },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <div className="rb-noprint">
            {intro.map((paragraph, i) => (
              <p key={i} className={i === 0 ? "lede" : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
          <ResumeBuilder />
        </div>
      </section>

      <section className="section section--tint rb-noprint">
        <div className="wrap prose">
          <h2>Who Hires Tutors in {entry.city}</h2>
          <p>
            These are the {entry.count} tutoring and learning{" "}
            {entry.count === 1 ? "center" : "centers"} this directory lists in {entry.city}, ordered
            by how much feedback families have left them. Not every one is hiring today, but between
            them they are where tutoring work in {entry.city} comes from. Read a center&apos;s
            listing before you apply and name the subjects it actually offers.
          </p>
          <ul>
            {entry.employers.map((employer) => (
              <li key={employer.slug}>
                <Link href={`/partners/${employer.slug}`}>{employer.name}</Link>
                {" — "}
                {employer.focus.toLowerCase()}
                {employer.reviewCount > 0 &&
                  `, ${employer.rating.toFixed(1)} from ${employer.reviewCount.toLocaleString()} reviews`}
              </li>
            ))}
          </ul>
          {entry.count > entry.employers.length && (
            <p>
              <Link href={`/find/tutoring-centers-in-${entry.citySlug}`}>
                See all {entry.count} centers in {entry.city}
              </Link>
              , including the smaller and newer ones that often have the openings.
            </p>
          )}

          <h2>{advice.heading}</h2>
          {advice.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}

          {entry.subjects.length > 0 && (
            <>
              <h3>What {entry.city} Centers Teach</h3>
              <p>
                Counted across every {entry.city} listing, so you can see which subjects have the
                most employers behind them:
              </p>
              <ul>
                {entry.subjects.map((subject) => (
                  <li key={subject.label}>
                    {subject.label} &mdash; {subject.count}{" "}
                    {subject.count === 1 ? "center" : "centers"}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2>Tutoring Pay in {entry.city}, Georgia</h2>
          <p>{payLine(entry)}</p>
          <p>
            Those are working ranges rather than quotes, and they move with subject, credentials and
            whether you are paid for planning time. Ask about it directly: whether prep and
            reporting are paid, whether a cancelled session is paid, and how many hours a week are
            realistically on offer. Our <Link href="/costs">cost guides</Link> cover the other side
            of the same market, which is what families in {entry.city} are charged.
          </p>

          <h2>Where to Apply Around {entry.city}</h2>
          <p>
            {entry.county
              ? `${entry.city} sits in ${entry.county} County, and a twenty minute drive usually opens up several more employers. `
              : ""}
            {entry.zips.length > 0 &&
              `Centers here carry ${entry.zips.length === 1 ? "the" : ""} ${entry.zips.slice(0, 6).join(", ")} ${entry.zips.length === 1 ? "ZIP code" : "ZIP codes"}, which is worth knowing when you set the commute filter on a job board. `}
            Build the resume once on this page, then send it to everything within range.
          </p>
          <LinkList items={localLinks} split />

          {nearbyLinks.length > 0 && (
            <>
              <h3>Resume Builders in Nearby Cities</h3>
              <LinkList items={nearbyLinks} split />
            </>
          )}
        </div>
      </section>

      <section className="section rb-noprint">
        <div className="wrap prose">
          <Faqs faqs={faqs} heading={`Resume Questions From ${entry.city}`} />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `Resume Builder in ${entry.city}, Georgia`,
          url: `${site.url}/resume-builder/${entry.citySlug}`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any modern web browser",
          browserRequirements: "Requires JavaScript",
          description: `Resume builder for tutoring and teaching work in ${entry.city}, Georgia.`,
          areaServed: {
            "@type": "City",
            name: entry.city,
            containedInPlace: { "@type": "State", name: "Georgia" },
          },
          ...(billingLive()
            ? {
                offers: {
                  "@type": "Offer",
                  price: plan.price.toFixed(2),
                  priceCurrency: plan.currency,
                  description: `${plan.priceLabel} ${plan.intervalLabel}, cancel at any time. Building and previewing a resume is free.`,
                },
              }
            : { isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }),
          publisher: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />
    </>
  );
}
