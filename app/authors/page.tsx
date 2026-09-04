import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import LinkList from "@/components/LinkList";
import { AuthorCard } from "@/components/AuthorByline";
import { authors } from "@/lib/content/authors";
import { blogPosts } from "@/lib/content/blog";
import { costGuides } from "@/lib/content/costs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Our Editorial Team | Georgia Tutoring Centers",
  description:
    "The editors behind Georgia Tutoring Centers: who writes the tutoring guides, cost breakdowns and directory data, and what each of them covers.",
  path: "/authors",
});

export default function AuthorsHub() {
  return (
    <>
      <PageBanner title="Our Editorial Team" eyebrow="Authors" priority>
        <ul className="banner-facts">
          <li>{authors.length} editors</li>
          <li>{blogPosts.length + costGuides.length} guides published</li>
        </ul>
      </PageBanner>

      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Authors", path: "/authors" }]} />

      <section className="section">
        <div className="wrap">
          <p className="lede">
            Every guide and cost page on this site carries a byline. These are the editors who
            write them, what each one covers, and how to reach us with a correction.
          </p>

          <div className="author-grid" style={{ marginTop: "1.6rem" }}>
            {authors.map((author) => (
              <AuthorCard key={author.slug} author={author} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap prose">
          <h2>How we work</h2>
          <p>
            Guides are written from published research on instruction and from the pricing and
            program patterns we see across the centers in this directory. We do not accept payment
            for coverage, centers cannot buy a mention, and advertising has no influence on what is
            published or how listings rank.
          </p>
          <p>
            Every guide shows the date it was last reviewed. If something is out of date or wrong,
            tell us through the contact page and we will correct it and note the change.
          </p>

          <h2>Author pages</h2>
          <LinkList
            items={authors.map((author) => ({
              href: `/authors/${author.slug}`,
              label: author.name,
              note: author.role,
            }))}
          />
        </div>
      </section>
    </>
  );
}
