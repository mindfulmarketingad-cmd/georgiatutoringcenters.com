import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import { photos } from "@/lib/photos";
import LinkList from "@/components/LinkList";
import Listicle from "@/components/Listicle";
import Faqs from "@/components/Faqs";
import SampleNotice from "@/components/SampleNotice";
import JsonLd from "@/components/JsonLd";
import { cities, listings, services, topRated } from "@/lib/listings";
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
  const featured = topRated(8);

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
            Two ways in: pick your city, or pick the subject your child needs help with. Every page
            below is a numbered listicle with hours, ratings, phone numbers and a toggleable map.
          </p>
          <SampleNotice />

          <div className="stat-row">
            <div className="stat">
              <b>{listings.length}</b>
              <span>Centers listed</span>
            </div>
            <div className="stat">
              <b>{cityGroups.length}</b>
              <span>Cities covered</span>
            </div>
            <div className="stat">
              <b>{serviceGroups.length}</b>
              <span>Subject areas</span>
            </div>
            <div className="stat">
              <b>{cityGroups.length + serviceGroups.length}</b>
              <span>Find pages</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>Browse by subject</h2>
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
          <h2>Browse by city</h2>
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

      <section className="section section--soft">
        <div className="wrap">
          <h2>Highest rated centers statewide</h2>
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
