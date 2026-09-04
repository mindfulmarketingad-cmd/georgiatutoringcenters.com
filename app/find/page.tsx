import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import { photos } from "@/lib/photos";
import LinkList from "@/components/LinkList";
import FindSearch from "@/components/FindSearch";
import Listicle from "@/components/Listicle";
import Faqs from "@/components/Faqs";
import SampleNotice from "@/components/SampleNotice";
import JsonLd from "@/components/JsonLd";
import { cities, listings, services, topRated } from "@/lib/listings";
import { counties } from "@/lib/content/counties";
import { itemListSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Find Tutoring Centers in Georgia | Browse by City and Subject",
  description:
    "Find tutoring centers in Georgia by city or subject. Compare math tutoring, reading help, test prep, STEM and online programs with hours and ratings.",
  path: "/find",
});

export default function FindHub() {
  const cityGroups = cities();
  const serviceGroups = services();
  const countyGroups = counties();
  const featured = topRated(8);
  const zips = [...new Set(listings.map((l) => l.postalCode.trim()))]
    .filter((zip) => /^\d{5}$/.test(zip))
    .sort();

  return (
    <>
      <PageBanner
        title="Find Tutoring Centers in Georgia"
        eyebrow="Find hub"
        image={photos[1].banner}
        alt={photos[1].alt}
        priority
      >
        <ul className="banner-facts">
          <li>{listings.length} centers listed</li>
          <li>{cityGroups.length} cities</li>
          <li>{serviceGroups.length} subject areas</li>
        </ul>
      </PageBanner>

      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Find", path: "/find" }]} />

      <section className="section">
        <div className="wrap">
          <p className="lede">
            Search every Find page below, or pick your city, county, ZIP code or subject. Each one
            is a numbered listicle with hours, ratings, phone numbers and a toggleable map.
          </p>

          <FindSearch />

          <SampleNotice />

        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>Browse by Subject</h2>
          <p className="lede">Start here when you know what your child needs to work on.</p>
          <LinkList
            split
            items={serviceGroups.map((service) => ({
              href: `/find/${service.slug}-in-georgia`,
              label: `${service.label} in Georgia`,
              note: `${service.count} centers`,
            }))}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Browse by City</h2>
          <p className="lede">Every Georgia city currently represented in the directory.</p>
          <LinkList
            split
            items={cityGroups.map((city) => ({
              href: `/find/tutoring-centers-in-${city.citySlug}`,
              label: `Tutoring centers in ${city.city}`,
              note: `${city.count} centers`,
            }))}
          />
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>Browse by County</h2>
          <p className="lede">
            County lines follow Georgia school districts, so this is often the fastest way to
            narrow a search. The <Link href="/counties">county hub</Link> has the full list.
          </p>
          <LinkList
            split
            items={countyGroups.map((county) => ({
              href: `/find/tutoring-centers-in-${county.countySlug}-county`,
              label: `Tutoring & Learning Centers in ${county.county} County Georgia`,
              note: `${county.count} ${county.count === 1 ? "center" : "centers"}`,
            }))}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Browse by ZIP Code</h2>
          <p className="lede">
            Every ZIP code with a center in the directory, for when you already know the area you
            can drive to. The <Link href="/zip-codes">ZIP code hub</Link> has the searchable list.
          </p>
          <LinkList
            split
            items={zips.map((zip) => ({
              href: `/find/tutoring-centers-in-${zip}`,
              label: `Tutoring & Learning Centers in ${zip}`,
            }))}
          />
        </div>
      </section>

      <section className="section section--soft">
        <div className="wrap">
          <h2>Highest Rated Centers Statewide</h2>
          <p className="lede">
            A quick shortlist while you decide where to start. Filter chips jump straight to a
            subject page.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Listicle
              listings={featured}
              title="Highest rated Georgia tutoring centers"
              chips={serviceGroups.slice(0, 8).map((s) => ({
                label: s.label,
                href: `/find/${s.slug}-in-georgia`,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <Faqs
            faqs={[
              {
                q: "Should I search by city or by subject first?",
                a: "Search by subject when the need is specific, such as dyslexia support or SAT prep, because the number of qualified centers is smaller. Search by city when you need general homework help or math support, since most centers offer both.",
              },
              {
                q: "How far should we be willing to drive?",
                a: "Twenty minutes each way is the practical limit for most families twice a week during the school year. Beyond that, attendance slips by the second month. Consider online sessions for the second weekly slot instead.",
              },
              {
                q: "What if there are no centers listed in my town?",
                a: "Check the nearest larger city page, and look at the online tutoring page. Many Georgia centers now teach online with the same instructors who teach in the building.",
              },
            ]}
          />
        </div>
      </section>

      <JsonLd data={itemListSchema(featured, "/find", "Highest rated Georgia tutoring centers")} />
    </>
  );
}
