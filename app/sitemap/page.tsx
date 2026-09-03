import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { blogPosts } from "@/lib/content/blog";
import { costGuides } from "@/lib/content/costs";
import { findPages } from "@/lib/content/find";
import { listings } from "@/lib/listings";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Sitemap | Georgia Tutoring Centers",
  description:
    "Every page on Georgia Tutoring Centers: hubs, city and subject guides, tutoring center profiles, reviews, cost guides and articles.",
  path: "/sitemap",
});

export default function SitemapPage() {
  const cityPages = findPages().filter((p) => p.kind === "city");
  const servicePages = findPages().filter((p) => p.kind === "service");

  return (
    <>
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Sitemap", path: "/sitemap" }]} />

      <section className="section">
        <div className="wrap prose">
          <span className="eyebrow">Sitemap</span>
          <h1>Sitemap</h1>
          <p className="lede">
            Every page on Georgia Tutoring Centers, grouped by section. The machine-readable version
            lives at <Link href="/sitemap.xml">/sitemap.xml</Link>.
          </p>

          <h2>Main pages</h2>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/find">Find a tutoring center</Link></li>
            <li><Link href="/partners">Partner directory</Link></li>
            <li><Link href="/reviews">Reviews</Link></li>
            <li><Link href="/costs">Costs and pricing</Link></li>
            <li><Link href="/blog">Learning blog</Link></li>
            <li><Link href="/search">Search</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>

          <h2>Legal</h2>
          <ul>
            <li><Link href="/disclaimer">Disclaimer</Link></li>
            <li><Link href="/privacy">Privacy policy</Link></li>
            <li><Link href="/terms">Terms of use</Link></li>
            <li><Link href="/sitemap">Sitemap</Link></li>
          </ul>

          <h2>Find by city ({cityPages.length})</h2>
          <ul>
            {cityPages.map((page) => (
              <li key={page.slug}>
                <Link href={`/find/${page.slug}`}>{page.h1}</Link>
              </li>
            ))}
          </ul>

          <h2>Find by subject ({servicePages.length})</h2>
          <ul>
            {servicePages.map((page) => (
              <li key={page.slug}>
                <Link href={`/find/${page.slug}`}>{page.h1}</Link>
              </li>
            ))}
          </ul>

          <h2>Cost guides ({costGuides.length})</h2>
          <ul>
            {costGuides.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/costs/${guide.slug}`}>{guide.title}</Link>
              </li>
            ))}
          </ul>

          <h2>Blog guides ({blogPosts.length})</h2>
          <ul>
            {blogPosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
          </ul>

          <h2>Tutoring center profiles ({listings.length})</h2>
          <ul>
            {listings.map((listing) => (
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
