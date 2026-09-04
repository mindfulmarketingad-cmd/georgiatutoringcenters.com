import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import { blogPosts } from "@/lib/content/blog";
import { costGuides } from "@/lib/content/costs";
import { findPages } from "@/lib/content/find";
import { listings } from "@/lib/listings";
import { authors } from "@/lib/content/authors";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Sitemap | Georgia Tutoring Centers",
  description:
    "Every page on Georgia Tutoring Centers: hubs, city and subject guides, tutoring center profiles, reviews, cost guides and articles.",
  path: "/sitemap",
});

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });
const byLabel = <T,>(items: T[], label: (item: T) => string) =>
  [...items].sort((a, b) => collator.compare(label(a), label(b)));

export default function SitemapPage() {
  const cityPages = byLabel(
    findPages().filter((p) => p.kind === "city"),
    (p) => p.h1
  );
  const servicePages = byLabel(
    findPages().filter((p) => p.kind === "service"),
    (p) => p.h1
  );
  const cityServicePages = byLabel(
    findPages().filter((p) => p.kind === "city-service" && !p.noindex),
    (p) => p.h1
  );
  const countyPages = byLabel(
    findPages().filter((p) => p.kind === "county"),
    (p) => p.h1
  );
  const zipPages = byLabel(
    findPages().filter((p) => p.kind === "zip" && !p.noindex),
    (p) => p.h1
  );
  const sortedAuthors = byLabel(authors, (a) => a.name);
  const sortedCostGuides = byLabel(costGuides, (g) => g.title);
  const sortedBlogPosts = byLabel(blogPosts, (post) => post.title);
  const sortedListings = byLabel(listings, (l) => l.name);

  const mainPages = byLabel(
    [
      { href: "/", label: "Home" },
      { href: "/find", label: "Find a tutoring center" },
      { href: "/counties", label: "Tutoring centers by county" },
      { href: "/zip-codes", label: "Tutoring centers by ZIP code" },
      { href: "/partners", label: "Partner directory" },
      { href: "/reviews", label: "Reviews" },
      { href: "/costs", label: "Costs and pricing" },
      { href: "/blog", label: "Learning blog" },
      { href: "/search", label: "Search" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/authors", label: "Our editorial team" },
    ],
    (p) => p.label
  );
  const legalPages = byLabel(
    [
      { href: "/disclaimer", label: "Disclaimer" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
      { href: "/sitemap", label: "Sitemap" },
    ],
    (p) => p.label
  );

  return (
    <>
      <PageBanner title="Sitemap" eyebrow="Site index" priority>
        <ul className="banner-facts">
          <li>{listings.length} center profiles</li>
          <li>
            {cityPages.length + servicePages.length + cityServicePages.length + countyPages.length + zipPages.length}{" "}
            find pages
          </li>
          <li>{blogPosts.length + costGuides.length} guides</li>
        </ul>
      </PageBanner>

      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Sitemap", path: "/sitemap" }]} />

      <section className="section">
        <div className="wrap prose">
          <p className="lede">
            Every page on Georgia Tutoring Centers, grouped by section. The machine-readable version
            lives at <Link href="/sitemap.xml">/sitemap.xml</Link>.
          </p>

          <h2>Main Pages</h2>
          <ul>
            {mainPages.map((page) => (
              <li key={page.href}>
                <Link href={page.href}>{page.label}</Link>
              </li>
            ))}
          </ul>

          <h2>Authors ({sortedAuthors.length})</h2>
          <ul>
            {sortedAuthors.map((author) => (
              <li key={author.slug}>
                <Link href={`/authors/${author.slug}`}>{author.name}</Link> &mdash; {author.role}
              </li>
            ))}
          </ul>

          <h2>Legal</h2>
          <ul>
            {legalPages.map((page) => (
              <li key={page.href}>
                <Link href={page.href}>{page.label}</Link>
              </li>
            ))}
          </ul>

          <h2>Find by County ({countyPages.length})</h2>
          <ul>
            {countyPages.map((page) => (
              <li key={page.slug}>
                <Link href={`/find/${page.slug}`}>{page.h1}</Link>
              </li>
            ))}
          </ul>

          <h2>Find by ZIP Code ({zipPages.length})</h2>
          <ul>
            {zipPages.map((page) => (
              <li key={page.slug}>
                <Link href={`/find/${page.slug}`}>{page.h1}</Link>
              </li>
            ))}
          </ul>

          <h2>Find by City ({cityPages.length})</h2>
          <ul>
            {cityPages.map((page) => (
              <li key={page.slug}>
                <Link href={`/find/${page.slug}`}>{page.h1}</Link>
              </li>
            ))}
          </ul>

          <h2>Find by Subject ({servicePages.length})</h2>
          <ul>
            {servicePages.map((page) => (
              <li key={page.slug}>
                <Link href={`/find/${page.slug}`}>{page.h1}</Link>
              </li>
            ))}
          </ul>

          <h2>Find by City and Subject ({cityServicePages.length})</h2>
          <ul>
            {cityServicePages.map((page) => (
              <li key={page.slug}>
                <Link href={`/find/${page.slug}`}>{page.h1}</Link>
              </li>
            ))}
          </ul>

          <h2>Cost Guides ({sortedCostGuides.length})</h2>
          <ul>
            {sortedCostGuides.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/costs/${guide.slug}`}>{guide.title}</Link>
              </li>
            ))}
          </ul>

          <h2>Blog Guides ({sortedBlogPosts.length})</h2>
          <ul>
            {sortedBlogPosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
          </ul>

          <h2>Tutoring Center Profiles ({sortedListings.length})</h2>
          <ul>
            {sortedListings.map((listing) => (
              <li key={listing.slug}>
                <Link href={`/partners/${listing.slug}`}>{listing.name}</Link> &middot;{" "}
                <Link href={`/reviews/${listing.slug}`}>reviews</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
