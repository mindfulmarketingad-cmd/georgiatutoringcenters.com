import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import Stars from "@/components/Stars";
import Faqs from "@/components/Faqs";
import JsonLd from "@/components/JsonLd";
import LinkList from "@/components/LinkList";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import {
  AFFILIATE_NOTE,
  AFFILIATE_REL,
  experiences,
  formatPrice,
  getExperience,
  locationOf,
} from "@/lib/content/experiences";
import "../experiences.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return experiences.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getExperience(slug);
  if (!entry) {
    return pageMeta({
      title: "Not found",
      description: "",
      path: `/experiences/${slug}`,
      noindex: true,
    });
  }
  return pageMeta({
    title: `${entry.title} | Prices, Reviews and What to Know`,
    description: `${entry.title}: from ${formatPrice(entry)} per person, rated ${entry.rating.toFixed(1)} from ${entry.reviewCount.toLocaleString()} reviews. What the experience involves and what to check before booking.`,
    path: `/experiences/${entry.slug}`,
  });
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getExperience(slug);
  if (!entry) notFound();

  const others = experiences.filter((item) => item.slug !== entry.slug);

  return (
    <>
      <PageBanner
        title={entry.title}
        eyebrow={`${entry.category} in ${entry.city}`}
        image={entry.image}
        alt={entry.image ? entry.title : ""}
        priority
      >
        <ul className="banner-facts">
          <li>From {formatPrice(entry)} per person</li>
          <li>
            {entry.rating.toFixed(1)} from {entry.reviewCount.toLocaleString()} reviews
          </li>
          <li>{locationOf(entry)}</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Experiences", path: "/experiences" },
          { name: entry.city, path: `/experiences/${entry.slug}` },
        ]}
      />

      <section className="section">
        <div className="wrap prose">
          {entry.intro.map((paragraph, i) => (
            <p key={i} className={i === 0 ? "lede" : undefined}>
              {paragraph}
            </p>
          ))}

          <div className="exp-book">
            <h2>Book This Experience</h2>
            <p className="exp-book-price">
              <span className="exp-book-amount">{formatPrice(entry)}</span>
              <span className="exp-book-unit">per person, from</span>
            </p>
            <ul className="exp-facts">
              <li>
                <strong>Rating</strong>
                <Stars rating={entry.rating} reviewCount={entry.reviewCount} />
              </li>
              {entry.recommendedPercent ? (
                <li>
                  <strong>Recommended</strong>
                  By {entry.recommendedPercent}% of travelers who reviewed it
                </li>
              ) : null}
              <li>
                <strong>Where</strong>
                {entry.city}, {entry.region}, {entry.country}
              </li>
              {entry.operator ? (
                <li>
                  <strong>Run by</strong>
                  {entry.operator}
                </li>
              ) : null}
              {entry.durationLabel ? (
                <li>
                  <strong>Duration</strong>
                  {entry.durationLabel}
                </li>
              ) : null}
              {entry.freeCancellation ? (
                <li>
                  <strong>Cancellation</strong>
                  Free, {entry.freeCancellation.toLowerCase()}
                </li>
              ) : null}
              {entry.reserveNowPayLater ? (
                <li>
                  <strong>Payment</strong>
                  Reserve now and pay later available
                </li>
              ) : null}
              {entry.childRates ? (
                <li>
                  <strong>Children</strong>
                  Discounted rates offered
                </li>
              ) : null}
            </ul>
            <a className="btn" href={entry.affiliateUrl} target="_blank" rel={AFFILIATE_REL}>
              Check Dates and Prices on Viator
            </a>
            <p className="exp-book-asof">
              Price, rating and review count read from the Viator listing on {entry.dataAsOf}, and
              they move. Viator product {entry.productCode} holds the live figures.
            </p>
          </div>

          <p className="exp-disclosure">{AFFILIATE_NOTE}</p>

          {entry.sections.map((section) => (
            <div key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ))}

          <h2>Who It Suits</h2>
          <ul>
            {entry.goodFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>Check These on the Listing Before You Book</h2>
          <p>
            We have not confirmed the following, and they are the details most likely to change
            between now and your date, so read them off the booking page rather than off this one:
          </p>
          <ul>
            {entry.verifyOnViator.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            <a className="btn" href={entry.affiliateUrl} target="_blank" rel={AFFILIATE_REL}>
              Open the Viator Listing
            </a>
          </p>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap prose">
          <Faqs faqs={entry.faqs} heading="Questions About This Experience" />
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>More Experiences</h2>
          {others.length > 0 ? (
            <LinkList
              split
              items={others.map((item) => ({
                href: `/experiences/${item.slug}`,
                label: item.title,
                note: `${locationOf(item)}, from ${formatPrice(item)}`,
              }))}
            />
          ) : (
            <p>
              This is the only experience listed so far. More are on the way; the{" "}
              <Link href="/experiences">experiences page</Link> carries the full list as it grows.
            </p>
          )}
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: entry.title,
          category: entry.category,
          url: `${site.url}/experiences/${entry.slug}`,
          ...(entry.operator ? { brand: { "@type": "Brand", name: entry.operator } } : {}),
          // No aggregateRating here on purpose. The rating belongs to Viator's
          // reviewers, not to this page, and marking up someone else's rating
          // for a product we do not sell is the pattern Google penalises. The
          // figure is still shown to readers, attributed and dated.
          offers: {
            "@type": "Offer",
            price: entry.priceFrom.toFixed(2),
            priceCurrency: entry.currency,
            availability: "https://schema.org/InStock",
            url: entry.affiliateUrl,
          },
        }}
      />
    </>
  );
}
