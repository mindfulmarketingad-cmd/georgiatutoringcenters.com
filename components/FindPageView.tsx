import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import LinkList from "@/components/LinkList";
import Listicle from "@/components/Listicle";
import Faqs from "@/components/Faqs";
import Pagination from "@/components/Pagination";
import SampleNotice from "@/components/SampleNotice";
import JsonLd from "@/components/JsonLd";
import { photoFor } from "@/lib/photos";
import { findPages, type FindPage } from "@/lib/content/find";
import { averageRating, cities, services, totalReviews } from "@/lib/listings";
import { paginate, pageHref } from "@/lib/pagination";
import { itemListSchema } from "@/lib/seo";

/**
 * One page of a city or subject listing. The busiest subject page carries
 * several hundred centers, so the list is paginated rather than shipped as a
 * single very large document.
 */
export default function FindPageView({ page, pageNumber }: { page: FindPage; pageNumber: number }) {
  const paged = paginate(page.listings, pageNumber);
  const base = `/find/${page.slug}`;
  const path = pageHref(base, paged.page);

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
          { name: page.h1, path: base },
          ...(paged.page > 1 ? [{ name: `Page ${paged.page}`, path }] : []),
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
            {paged.pageCount > 1 ? ` (page ${paged.page} of ${paged.pageCount})` : ""}
          </h2>
          <p className="lede">
            Ranked by rating and review volume, showing {paged.startIndex}&ndash;
            {paged.startIndex + paged.items.length - 1} of {paged.total}. Toggle the map to see the
            geography, and open any profile for full hours and contact details.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Listicle
              listings={paged.items}
              startIndex={paged.startIndex}
              title={page.h1}
              chips={chips}
            />
          </div>
          <Pagination
            base={base}
            page={paged.page}
            pageCount={paged.pageCount}
            label={`${page.h1} pages`}
          />
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

      <JsonLd data={itemListSchema(paged.items, path, page.h1)} />
    </>
  );
}
