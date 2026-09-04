import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import LinkList from "@/components/LinkList";
import Faqs from "@/components/Faqs";
import JsonLd from "@/components/JsonLd";
import CountyZipSearch, { type CountyEntry, type ZipEntry } from "@/components/CountyZipSearch";
import { photos } from "@/lib/photos";
import { counties, countyOf, countySlugOf } from "@/lib/content/counties";
import { listings } from "@/lib/listings";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Tutoring Centers by Georgia ZIP Code | ZIP Code Directory",
  description:
    "Browse tutoring and learning centers by Georgia ZIP code. Every ZIP code in the directory, with the city and county it covers and the number of centers in it.",
  path: "/zip-codes",
});

type ZipRow = ZipEntry & { cities: Set<string> };

function zipRows(): ZipEntry[] {
  const map = new Map<string, ZipRow>();
  for (const listing of listings) {
    const zip = listing.postalCode.trim();
    if (!/^\d{5}$/.test(zip)) continue;
    const county = countyOf(listing) ?? "";
    const row = map.get(zip) ?? {
      zip,
      city: listing.city,
      county,
      countySlug: county ? countySlugOf(county) : "",
      count: 0,
      cities: new Set<string>(),
    };
    row.count += 1;
    row.cities.add(listing.city);
    map.set(zip, row);
  }
  return [...map.values()]
    .map(({ cities, ...row }) => ({ ...row, city: [...cities].sort()[0] ?? row.city }))
    .sort((a, b) => a.zip.localeCompare(b.zip));
}

export default function ZipCodesHub() {
  const zips = zipRows();
  const countyGroups = counties();

  const countyEntries: CountyEntry[] = countyGroups.map((group) => ({
    county: group.county,
    countySlug: group.countySlug,
    count: group.count,
    cities: group.cities.map((city) => city.city),
  }));

  return (
    <>
      <PageBanner
        title="Tutoring Centers by Georgia ZIP Code"
        eyebrow="ZIP code hub"
        image={photos[2].banner}
        alt={photos[2].alt}
        priority
      >
        <ul className="banner-facts">
          <li>{zips.length} ZIP codes</li>
          <li>{countyGroups.length} counties</li>
          <li>{listings.length} centers</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[{ name: "Home", path: "/" }, { name: "ZIP Codes", path: "/zip-codes" }]}
      />

      <section className="section">
        <div className="wrap">
          <p className="lede">
            A ZIP code is the fastest way to see what is genuinely close to you. Enter yours below,
            or pick it out of the full list further down the page.
          </p>

          <CountyZipSearch zips={zips} counties={countyEntries} />

        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>Every ZIP Code in the Directory</h2>
          <p className="lede">
            All {zips.length} ZIP codes with a tutoring or learning center, in numerical order, with
            the city and county each one sits in.
          </p>
          <LinkList
            split
            items={zips.map((zip) => ({
              href: `/find/tutoring-centers-in-${zip.zip}`,
              label: `Tutoring & Learning Centers in ${zip.zip}`,
              note: `${zip.city}${zip.county ? `, ${zip.county} County` : ""} — ${zip.count} ${zip.count === 1 ? "center" : "centers"}`,
            }))}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>How to Use a ZIP Code Search</h2>
          <p>
            Each ZIP code page is a ranked listicle of the centers with an address in that ZIP,
            carrying the same data as the rest of the site: hours of operation, review counts, phone
            numbers, websites and a toggleable map. Treat it as a starting point rather than a
            boundary. A ZIP code is a mail delivery route, so a center two minutes away can easily
            sit in the next ZIP over.
          </p>
          <p>
            When a ZIP turns up thin, widen the search: the{" "}
            <Link href="/counties">county hub</Link> groups the same centers the way Georgia school
            districts are drawn, and the <Link href="/find">Find hub</Link> lets you browse by city
            or by subject instead.
          </p>

          <Faqs
            faqs={[
              {
                q: "Why do some ZIP codes have only one center?",
                a: "Because that is all the directory holds there. Pages with a single listing stay available but are left out of search engine indexes until a second center is added, so you are not landing on a near-empty page from a search result.",
              },
              {
                q: "Does a center only serve its own ZIP code?",
                a: "No. ZIP codes are mail routes, not catchment areas. Use them to find what is closest, then check the surrounding ZIPs and the city page before deciding.",
              },
              {
                q: "My ZIP code is not listed. What now?",
                a: "We do not yet have a center with an address in it. Try the nearest listed ZIP, or browse the county page, which covers a much wider area.",
              },
            ]}
          />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tutoring Centers by Georgia ZIP Code",
          url: `${site.url}/zip-codes`,
          hasPart: zips.map((zip) => ({
            "@type": "WebPage",
            name: `Tutoring & Learning Centers in ${zip.zip}`,
            url: `${site.url}/find/tutoring-centers-in-${zip.zip}`,
          })),
        }}
      />
    </>
  );
}
