import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import Listicle from "@/components/Listicle";
import Faqs from "@/components/Faqs";
import Pagination from "@/components/Pagination";
import SampleNotice from "@/components/SampleNotice";
import JsonLd from "@/components/JsonLd";
import { photos } from "@/lib/photos";
import { averageRating, cities, listings, services, totalReviews } from "@/lib/listings";
import { paginate, pageHref } from "@/lib/pagination";
import { itemListSchema } from "@/lib/seo";

/**
 * The partner directory, one page of it. The full list is ~900 centers, which
 * is far too much HTML for a single document, so it is paginated and each page
 * carries its own numbering, canonical URL and ItemList schema.
 */
export default function PartnersView({ page }: { page: number }) {
  const cityGroups = cities();
  const serviceGroups = services();
  const paged = paginate(listings, page);
  const base = "/partners";
  const path = pageHref(base, paged.page);

  return (
    <>
      <PageBanner
        title="Georgia Tutoring Center Partner Directory"
        eyebrow="Partner directory"
        image={photos[0].banner}
        alt={photos[0].alt}
        priority
      >
        <ul className="banner-facts">
          <li>{listings.length} centers</li>
          <li>{cityGroups.length} cities</li>
          <li>{averageRating()} average rating</li>
          <li>{totalReviews().toLocaleString()} reviews</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Partners", path: base },
          ...(paged.page > 1 ? [{ name: `Page ${paged.page}`, path }] : []),
        ]}
      />

      <section className="section">
        <div className="wrap">
          <p className="lede">
            Every tutoring and learning center in the directory, in one numbered listicle. Ranked by
            rating and review volume, with hours of operation, review counts, addresses, phone
            numbers and websites for each center.
          </p>
          <SampleNotice />

          <div className="stat-row">
            <div className="stat">
              <b>{listings.length}</b>
              <span>Centers</span>
            </div>
            <div className="stat">
              <b>{cityGroups.length}</b>
              <span>Cities</span>
            </div>
            <div className="stat">
              <b>{averageRating()}</b>
              <span>Average rating</span>
            </div>
            <div className="stat">
              <b>{totalReviews().toLocaleString()}</b>
              <span>Reviews</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>
            All Georgia tutoring centers
            {paged.pageCount > 1 ? ` (page ${paged.page} of ${paged.pageCount})` : ""}
          </h2>
          <p className="lede">
            Showing {paged.startIndex}&ndash;{paged.startIndex + paged.items.length - 1} of{" "}
            {paged.total}. Use the chips to filter down to a subject, or toggle the map to see this
            page&apos;s centers at once.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Listicle
              listings={paged.items}
              startIndex={paged.startIndex}
              title="Every Georgia tutoring center"
              chips={[
                ...serviceGroups.map((s) => ({
                  label: s.label,
                  href: `/find/${s.slug}-in-georgia`,
                })),
                ...cityGroups.slice(0, 8).map((c) => ({
                  label: c.city,
                  href: `/find/tutoring-centers-in-${c.citySlug}`,
                })),
              ]}
            />
          </div>
          <Pagination
            base={base}
            page={paged.page}
            pageCount={paged.pageCount}
            label="Partner directory pages"
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>How this directory is put together</h2>
          <p>
            Listings are compiled from public business data and normalised into a single format so
            every center can be compared on the same fields. Ranking is calculated from rating and
            review volume together, so a center with a 5.0 rating from four reviews does not
            outrank a 4.8 with several hundred. Centers cannot pay for placement.
          </p>
          <p>
            Business owners can request a correction, an update or a new listing through the{" "}
            <Link href="/contact">contact page</Link>. See our{" "}
            <Link href="/disclaimer">disclaimer</Link> for how accuracy is handled.
          </p>
          <Faqs
            faqs={[
              {
                q: "How often is the directory updated?",
                a: "Listing data is refreshed on a rolling basis. Hours and phone numbers change frequently, so confirm directly with the center before visiting.",
              },
              {
                q: "Can a center pay to rank higher?",
                a: "No. Ranking is calculated from rating and review volume only.",
              },
              {
                q: "How do I add my tutoring center?",
                a: "Send the business name, address, phone number, website and the subjects you teach through the contact page and we will verify and add it.",
              },
            ]}
          />
        </div>
      </section>

      <JsonLd data={itemListSchema(paged.items, path, "Georgia tutoring center directory")} />
    </>
  );
}
