import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import { photoFor } from "@/lib/photos";
import LinkList from "@/components/LinkList";
import Listicle from "@/components/Listicle";
import Faqs from "@/components/Faqs";
import SampleNotice from "@/components/SampleNotice";
import JsonLd from "@/components/JsonLd";
import { findPages, getFindPage } from "@/lib/content/find";
import { averageRating, cities, services, totalReviews } from "@/lib/listings";
import { itemListSchema, pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return findPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getFindPage(slug);
  if (!page) return pageMeta({ title: "Not found", description: "", path: `/find/${slug}`, noindex: true });
  return pageMeta({ title: page.metaTitle, description: page.description, path: `/find/${page.slug}` });
}

export default async function FindDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getFindPage(slug);
  if (!page) notFound();

  const rating = averageRating(page.listings);
  const reviews = totalReviews(page.listings);

  const chips =
    page.kind === "city"
      ? services().map((service) => ({
          label: service.label,
          href: `/find/${service.slug}-in-georgia`,
        }))
      : cities()
          .slice(0, 10)
          .map((city) => ({
            label: city.city,
            href: `/find/tutoring-centers-in-${city.citySlug}`,
          }));

  const siblings = findPages()
    .filter((p) => p.kind === page.kind && p.slug !== page.slug)
    .slice(0, 10);

  return (
    <>
      <PageBanner
        title={page.h1}
        eyebrow={page.kind === "city" ? "City guide" : "Subject guide"}
        image={photoFor(page.slug).banner}
        alt={photoFor(page.slug).alt}
        priority
      >
        <ul className="banner-facts">
          <li>{page.listings.length} centers</li>
          <li>{rating || "n/a"} average rating</li>
          <li>{reviews.toLocaleString()} reviews</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Find", path: "/find" },
          { name: page.h1, path: `/find/${page.slug}` },
        ]}
      />

      <section className="section">
        <div className="wrap">
          {page.intro.map((paragraph) => (
            <p className="lede" key={paragraph.slice(0, 40)}>
              {paragraph}
            </p>
          ))}
          <SampleNotice />

          <div className="stat-row">
            <div className="stat">
              <b>{page.listings.length}</b>
              <span>Centers on this page</span>
            </div>
            <div className="stat">
              <b>{rating || "n/a"}</b>
              <span>Average rating</span>
            </div>
            <div className="stat">
              <b>{reviews.toLocaleString()}</b>
              <span>Total reviews</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>
            {page.kind === "city"
              ? `Tutoring centers in ${page.label}, ranked`
              : `${page.label} centers in Georgia, ranked`}
          </h2>
          <p className="lede">
            Ranked by rating and review volume. Toggle the map to see the geography, and open any
            profile for full hours and contact details.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Listicle listings={page.listings} title={page.h1} chips={chips} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>How to choose between these centers</h2>
          <p>
            Shortlist two or three, then ask each the same five questions: what the intake
            assessment measures, who teaches your child each week, the student-to-instructor ratio
            in your time slot, the total first-month cost including registration and materials fees,
            and how progress is reported. The answers separate centers faster than any rating does.
          </p>
          <p>
            Before you call, it helps to know the going rate. Our{" "}
            <Link href="/costs">cost guides</Link> publish current Georgia ranges by subject and
            format, and our <Link href="/blog">learning blog</Link> covers what effective tutoring
            looks like week to week.
          </p>

          <h2>Keep browsing</h2>
          <LinkList
            split
            items={siblings.map((sibling) => ({
              href: `/find/${sibling.slug}`,
              label: sibling.h1,
              note: `${sibling.listings.length} centers`,
            }))}
          />
          <p>
            <Link className="btn btn--ghost" href="/find">
              Back to the Find hub
            </Link>{" "}
            <Link className="btn btn--ghost" href="/">
              Back to Georgia Tutoring Centers home
            </Link>
          </p>

          <Faqs faqs={page.faqs} />
        </div>
      </section>

      <JsonLd data={itemListSchema(page.listings, `/find/${page.slug}`, page.h1)} />
    </>
  );
}
