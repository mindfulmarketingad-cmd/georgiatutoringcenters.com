import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import { photos } from "@/lib/photos";
import LinkList from "@/components/LinkList";
import Faqs from "@/components/Faqs";
import { authorOrDefault } from "@/lib/content/authors";
import { blogPosts } from "@/lib/content/blog";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Tutoring Blog for Georgia Parents | Guides and Study Advice",
  description:
    "Guides for Georgia parents: choosing a tutoring center, SAT and ACT timelines, math and reading support, online versus in-person tutoring and summer plans.",
  path: "/blog",
});

export default function BlogHub() {
  const categories = [...new Set(blogPosts.map((p) => p.category))];

  return (
    <>
      <PageBanner
        title="Tutoring Guides for Georgia Parents"
        eyebrow="Learning blog"
        image={photos[2].banner}
        alt={photos[2].alt}
        priority
      >
        <ul className="banner-facts">
          <li>{blogPosts.length} guides</li>
          <li>{categories.length} topics</li>
          <li>Written for Georgia families</li>
        </ul>
      </PageBanner>

      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />

      <section className="section">
        <div className="wrap">
          <p className="lede">
            Straightforward guides on choosing a tutoring center, preparing for the SAT and ACT,
            supporting math and reading at home, and deciding between online and in-person help.
            Written for families comparing real options in Georgia.
          </p>
          <p className="form-help">
            Topics covered: {categories.join(", ")}.
          </p>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>All Guides</h2>
          <LinkList
            items={blogPosts.map((post) => ({
              href: `/blog/${post.slug}`,
              label: post.title,
              note: `${post.category} · by ${authorOrDefault(post.author).name} · ${post.readMinutes} min read`,
            }))}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>Where to Go Next</h2>
          <p>
            Ready to compare actual centers? Start with the <Link href="/find">Find hub</Link> for
            your city or subject, check the <Link href="/costs">cost guides</Link> to set a budget,
            and use the <Link href="/reviews">Reviews hub</Link> to see how families rate each
            center.
          </p>
          <Faqs
            faqs={[
              {
                q: "Who writes these guides?",
                a: "Each guide carries a byline linking to that editor's profile. The team and how we work are described on the editorial team page.",
              },
              {
                q: "Do centers pay to be mentioned in the blog?",
                a: "No. Guides link to directory pages, not to paid placements, and centers cannot buy a mention.",
              },
              {
                q: "How often are guides updated?",
                a: "Each guide shows its last updated date. Pricing and test-related guidance is reviewed regularly, since both change.",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
