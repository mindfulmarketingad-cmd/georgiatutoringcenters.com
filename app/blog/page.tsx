import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Faqs from "@/components/Faqs";
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
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />

      <section className="section">
        <div className="wrap">
          <span className="eyebrow">Learning blog</span>
          <h1>Tutoring Guides for Georgia Parents</h1>
          <p className="lede">
            Straightforward guides on choosing a tutoring center, preparing for the SAT and ACT,
            supporting math and reading at home, and deciding between online and in-person help.
            Written for families comparing real options in Georgia.
          </p>
          <ul className="chips" style={{ marginTop: "1.2rem" }}>
            {categories.map((category) => (
              <li key={category}>
                <span className="chip">{category}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>All guides</h2>
          <div className="card-grid" style={{ marginTop: "1.4rem" }}>
            {blogPosts.map((post) => (
              <article className="card" key={post.slug}>
                <p className="card-meta">
                  {post.category} &middot; {post.readMinutes} min read
                </p>
                <h3>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p>{post.description}</p>
                <Link className="card-link" href={`/blog/${post.slug}`}>
                  Read the guide &rarr;
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>Where to go next</h2>
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
                a: "They are written by the Georgia Tutoring Centers editorial team from published research on instruction plus the pricing and program patterns we see across the centers in this directory.",
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
