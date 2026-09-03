import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchForm from "@/components/SearchForm";
import Faqs from "@/components/Faqs";
import { popularSearches, runSearch, searchIndex } from "@/lib/search";
import { cities, services } from "@/lib/listings";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Search Georgia Tutoring Centers | Centers, Guides and Costs",
  description:
    "Search every Georgia tutoring center, guide and cost page in one place. Find centers by name, city, subject or price question.",
  path: "/search",
});

export default async function SearchHub({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").slice(0, 80);
  const results = query ? runSearch(query) : [];

  return (
    <>
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Search", path: "/search" }]} />

      <section className="section">
        <div className="wrap">
          <span className="eyebrow">Search hub</span>
          <h1>Search Georgia Tutoring Centers</h1>
          <p className="lede">
            One search box across every center profile, city page, subject page, cost guide and
            article on the site &mdash; {searchIndex().length} pages in total.
          </p>
          <SearchForm initialQuery={query} />

          {query && (
            <>
              <h2>
                {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{query}
                &rdquo;
              </h2>
              {results.length === 0 ? (
                <p className="notice">
                  Nothing matched that search. Try a city name, a subject like math tutoring, or a
                  center name.
                </p>
              ) : (
                <div>
                  {results.map((result) => (
                    <div className="result-item" key={result.url}>
                      <h3 style={{ marginBottom: "0.2rem" }}>
                        <Link href={result.url}>{result.title}</Link>
                        <span className="result-type">{result.type}</span>
                      </h3>
                      <p style={{ margin: 0 }}>{result.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>Popular searches</h2>
          <ul className="chips" style={{ marginTop: "1rem" }}>
            {popularSearches.map((term) => (
              <li key={term}>
                <Link className="chip" href={`/search/${encodeURIComponent(term)}`}>
                  {term}
                </Link>
              </li>
            ))}
          </ul>

          <h2 style={{ marginTop: "2rem" }}>Browse instead of searching</h2>
          <ul className="chips">
            {services().map((service) => (
              <li key={service.slug}>
                <Link className="chip" href={`/find/${service.slug}-in-georgia`}>
                  {service.label}
                </Link>
              </li>
            ))}
            {cities()
              .slice(0, 10)
              .map((city) => (
                <li key={city.citySlug}>
                  <Link className="chip" href={`/find/tutoring-centers-in-${city.citySlug}`}>
                    {city.city}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <Faqs
            faqs={[
              {
                q: "What can I search for?",
                a: "Center names, Georgia cities, subjects such as reading or SAT prep, and cost questions. Search covers every page on the site, not just business listings.",
              },
              {
                q: "Why are search result pages not in Google?",
                a: "Internal search result pages are set to no-index by design, in line with search engine guidelines. The pages they link to are fully indexable.",
              },
              {
                q: "I cannot find a center I know exists.",
                a: "It may not be in the directory yet. Send us the business details through the contact page and we will verify and add it.",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
