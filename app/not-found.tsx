import Link from "next/link";
import type { Metadata } from "next";
import SearchForm from "@/components/SearchForm";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Page Not Found | Georgia Tutoring Centers",
  description: "That page does not exist. Search the directory or start from a hub page.",
  path: "/404",
  noindex: true,
});

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap prose">
        <span className="eyebrow">404</span>
        <h1>We could not find that page</h1>
        <p className="lede">
          The link may be out of date, or the page may have moved. Search the directory or pick a
          hub below.
        </p>
        <SearchForm />
        <ul className="chips">
          <li><Link className="chip" href="/">Home</Link></li>
          <li><Link className="chip" href="/find">Find a center</Link></li>
          <li><Link className="chip" href="/partners">Partner directory</Link></li>
          <li><Link className="chip" href="/reviews">Reviews</Link></li>
          <li><Link className="chip" href="/costs">Costs</Link></li>
          <li><Link className="chip" href="/blog">Blog</Link></li>
          <li><Link className="chip" href="/sitemap">Sitemap</Link></li>
        </ul>
      </div>
    </section>
  );
}
