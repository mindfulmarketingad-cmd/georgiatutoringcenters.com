import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Listicle from "@/components/Listicle";
import Faqs from "@/components/Faqs";
import SampleNotice from "@/components/SampleNotice";
import JsonLd from "@/components/JsonLd";
import { averageRating, cities, listings, services, totalReviews } from "@/lib/listings";
import { itemListSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Partner Directory | Every Georgia Tutoring Center Listed",
  description:
    "The complete directory of Georgia tutoring and learning centers, numbered and ranked, with hours of operation, review counts, addresses, phone numbers and websites.",
  path: "/partners",
});

export default function PartnersHub() {
  const cityGroups = cities();
  const serviceGroups = services();

  return (
    <>
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Partners", path: "/partners" }]} />

      <section className="section">
        <div className="wrap">
          <span className="eyebrow">Partner directory</span>
          <h1>Georgia Tutoring Center Partner Directory</h1>
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
          <h2>All Georgia tutoring centers</h2>
          <p className="lede">
            Use the chips to filter down to a subject, or toggle the map to see every center at
            once.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Listicle
              listings={listings}
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

      <JsonLd data={itemListSchema(listings, "/partners", "Georgia tutoring center directory")} />
    </>
  );
}
