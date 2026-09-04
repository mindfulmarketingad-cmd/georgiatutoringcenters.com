import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import LinkList from "@/components/LinkList";
import CountyZipSearch, { type CountyEntry, type ZipEntry } from "@/components/CountyZipSearch";
import Faqs from "@/components/Faqs";
import JsonLd from "@/components/JsonLd";
import { photos } from "@/lib/photos";
import { counties, countyOf } from "@/lib/content/counties";
import { averageRating, listings, totalReviews } from "@/lib/listings";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Tutoring Centers by Georgia County | County Directory",
  description:
    "Browse tutoring and learning centers by Georgia county. Every county in the directory, with the number of centers, the cities it covers and links to each county guide.",
  path: "/counties",
});

export default function CountiesHub() {
  const groups = counties();
  const cityCount = new Set(listings.map((l) => l.citySlug)).size;

  const zipMap = new Map<string, ZipEntry>();
  for (const listing of listings) {
    const zip = listing.postalCode.trim();
    if (!/^\d{5}$/.test(zip)) continue;
    const county = countyOf(listing) ?? "";
    const entry = zipMap.get(zip) ?? {
      zip,
      city: listing.city,
      county,
      countySlug: county.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      count: 0,
    };
    entry.count += 1;
    zipMap.set(zip, entry);
  }
  const zipEntries = [...zipMap.values()].sort((a, b) => a.zip.localeCompare(b.zip));

  const countyEntries: CountyEntry[] = groups.map((group) => ({
    county: group.county,
    countySlug: group.countySlug,
    count: group.count,
    cities: group.cities.map((city) => city.city),
  }));

  return (
    <>
      <PageBanner
        title="Tutoring Centers by Georgia County"
        eyebrow="County hub"
        image={photos[0].banner}
        alt={photos[0].alt}
        priority
      >
        <ul className="banner-facts">
          <li>{groups.length} counties</li>
          <li>{cityCount} cities</li>
          <li>{listings.length} centers</li>
        </ul>
      </PageBanner>

      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Counties", path: "/counties" }]} />

      <section className="section">
        <div className="wrap">
          <p className="lede">
            County lines are how Georgia school districts are drawn, so they are often the fastest
            way to narrow a search. Enter your ZIP code to jump straight to the centers near you,
            or search by county or city name.
          </p>

          <CountyZipSearch zips={zipEntries} counties={countyEntries} />

          <p className="lede">
            Every county below has its own guide listing the centers in it, the cities it covers,
            and how those centers rate.
          </p>

          <div className="stat-row">
            <div className="stat">
              <b>{groups.length}</b>
              <span>Counties covered</span>
            </div>
            <div className="stat">
              <b>{cityCount}</b>
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
          <h2>Every Georgia County in the Directory</h2>
          <p className="lede">
            Listed alphabetically, with the number of tutoring and learning centers in each.
          </p>
          <LinkList
            split
            items={groups.map((group) => ({
              href: `/find/tutoring-centers-in-${group.countySlug}-county`,
              label: `Tutoring & Learning Centers in ${group.county} County Georgia`,
              note: `${group.count} ${group.count === 1 ? "center" : "centers"} in ${group.cities.length} ${group.cities.length === 1 ? "city" : "cities"}`,
            }))}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>How County Pages Work</h2>
          <p>
            Each county guide is a ranked listicle of every center we hold in that county, drawn
            from the same data as the rest of the site: hours of operation, review counts, phone
            numbers, websites and a toggleable map. Counties are assigned from each center&apos;s
            city, so a center in Alpharetta appears under Fulton County.
          </p>
          <p>
            If your county is not listed, we do not yet have a center in it. Send us a business
            through the <Link href="/contact">contact page</Link> and it will appear here once
            verified. You can also browse by <Link href="/find">city or subject</Link>, or search
            the whole directory from the <Link href="/search">search page</Link>.
          </p>

          <Faqs
            faqs={[
              {
                q: "Why search by county instead of city?",
                a: "School districts in Georgia are organised by county, so a county view lines up with how families already think about schools, calendars and testing. It also catches centers one town over that a city search would miss.",
              },
              {
                q: "How is a center assigned to a county?",
                a: "From the city on its listing. A handful of Georgia towns straddle a county line; those are assigned to the county holding the town centre, so check the neighbouring county page too if you live near a boundary.",
              },
              {
                q: "Do centers only serve their own county?",
                a: "No. County boundaries do not restrict enrollment. They are a search convenience, not a catchment area.",
              },
            ]}
          />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tutoring Centers by Georgia County",
          url: `${site.url}/counties`,
          hasPart: groups.map((group) => ({
            "@type": "WebPage",
            name: `Tutoring & Learning Centers in ${group.county} County Georgia`,
            url: `${site.url}/find/tutoring-centers-in-${group.countySlug}-county`,
          })),
        }}
      />
    </>
  );
}
