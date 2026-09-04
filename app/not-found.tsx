import type { Metadata } from "next";
import LinkList from "@/components/LinkList";
import PageBanner from "@/components/PageBanner";
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
    <>
      <PageBanner title="We could not find that page" eyebrow="404" priority />
      <section className="section">
      <div className="wrap prose">
        <p className="lede">
          The link may be out of date, or the page may have moved. Search the directory or pick a
          hub below.
        </p>
        <SearchForm />
        <LinkList
          split
          items={[
            { href: "/", label: "Home", note: "Georgia tutoring directory" },
            { href: "/find", label: "Find a center", note: "Browse by city or subject" },
            { href: "/partners", label: "Partner directory", note: "Every center listed" },
            { href: "/reviews", label: "Reviews", note: "Ratings and review counts" },
            { href: "/costs", label: "Costs", note: "What tutoring costs in Georgia" },
            { href: "/blog", label: "Blog", note: "Guides for parents" },
            { href: "/sitemap", label: "Sitemap", note: "Every page on the site" },
          ]}
        />
      </div>
      </section>
    </>
  );
}
