import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import LinkList from "@/components/LinkList";
import SearchForm from "@/components/SearchForm";
import { popularSearches, runSearch } from "@/lib/search";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = true;

export function generateStaticParams() {
  return popularSearches.map((query) => ({ query: encodeURIComponent(query) }));
}

function decode(value: string) {
  try {
    return decodeURIComponent(value).replace(/[<>]/g, "").slice(0, 80);
  } catch {
    return value.replace(/[<>]/g, "").slice(0, 80);
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ query: string }>;
}): Promise<Metadata> {
  const { query } = await params;
  const term = decode(query);
  // Internal search results are intentionally kept out of the index.
  return pageMeta({
    title: `Search: ${term} | Georgia Tutoring Centers`,
    description: `Georgia Tutoring Centers pages matching "${term}": tutoring centers, city guides, cost breakdowns and articles.`,
    path: `/search/${query}`,
    noindex: true,
  });
}

export default async function SearchQueryPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const { query } = await params;
  const term = decode(query);
  const results = runSearch(term);

  return (
    <>
      <PageBanner title={`Results for \u201c${term}\u201d`} eyebrow="Search results" priority>
        <ul className="banner-facts">
          <li>
            {results.length} matching {results.length === 1 ? "page" : "pages"}
          </li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Search", path: "/search" },
          { name: term, path: `/search/${query}` },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <p className="lede">
            {results.length} {results.length === 1 ? "page" : "pages"} on Georgia Tutoring Centers
            match this search.
          </p>
          <SearchForm initialQuery={term} />

          {results.length === 0 ? (
            <p className="notice">
              Nothing matched &ldquo;{term}&rdquo;. Try a city name, a subject such as math tutoring,
              or browse the <Link href="/find">Find hub</Link>.
            </p>
          ) : (
            <div>
              {results.map((result) => (
                <div className="result-item" key={result.url}>
                  <h2 style={{ fontSize: "1.15rem", marginBottom: "0.2rem" }}>
                    <Link href={result.url}>{result.title}</Link>
                    <span className="result-type">{result.type}</span>
                  </h2>
                  <p style={{ margin: 0 }}>{result.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>Other Popular Searches</h2>
          <LinkList
            split
            items={popularSearches
              .filter((t) => t !== term)
              .map((t) => ({ href: `/search/${encodeURIComponent(t)}`, label: t }))}
          />
          <p style={{ marginTop: "1.4rem" }}>
            <Link className="btn btn--ghost" href="/search">
              Back to the Search hub
            </Link>{" "}
            <Link className="btn btn--ghost" href="/">
              Back to home
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
