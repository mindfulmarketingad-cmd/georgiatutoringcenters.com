import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleBody from "@/components/ArticleBody";
import Faqs from "@/components/Faqs";
import JsonLd from "@/components/JsonLd";
import { costGuides, getCostGuide } from "@/lib/content/costs";
import { articleSchema, pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return costGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getCostGuide(slug);
  if (!guide) return pageMeta({ title: "Not found", description: "", path: `/costs/${slug}`, noindex: true });
  return pageMeta({
    title: guide.metaTitle,
    description: guide.description,
    path: `/costs/${guide.slug}`,
    type: "article",
    published: guide.published,
    modified: guide.updated,
  });
}

export default async function CostGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getCostGuide(slug);
  if (!guide) notFound();
  const others = costGuides.filter((g) => g.slug !== guide.slug);

  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Costs", path: "/costs" },
          { name: guide.title, path: `/costs/${guide.slug}` },
        ]}
      />

      <article className="section">
        <div className="wrap prose">
          <span className="eyebrow">{guide.category}</span>
          <h1>{guide.title}</h1>
          <p className="form-help">
            Updated{" "}
            {new Date(guide.updated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            &middot; {guide.readMinutes} minute read
          </p>
          <div className="callout">
            <p style={{ margin: 0 }}>
              <strong>Quick answer:</strong> {guide.quickAnswer}
            </p>
          </div>
          <p className="lede">{guide.intro}</p>

          <h2>Price ranges at a glance</h2>
          <div className="table-scroll">
            <table className="data-table">
              <caption className="form-help">
                Typical Georgia ranges. Confirm current pricing directly with each center.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Option</th>
                  <th scope="col">Typical range</th>
                  <th scope="col">Best for</th>
                </tr>
              </thead>
              <tbody>
                {guide.priceRows.map((row) => (
                  <tr key={row.option}>
                    <th scope="row">{row.option}</th>
                    <td>{row.typicalRange}</td>
                    <td>{row.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ArticleBody sections={guide.sections} />

          <h2>Find centers in this price range</h2>
          <p>
            Use the <Link href="/find">Find hub</Link> to shortlist centers in your city, then check
            the <Link href="/reviews">Reviews hub</Link> before you call. Every listing in the{" "}
            <Link href="/partners">partner directory</Link> shows the published price range where
            the business reports one.
          </p>

          <h2>Other cost guides</h2>
          <ul className="chips">
            {others.map((other) => (
              <li key={other.slug}>
                <Link className="chip" href={`/costs/${other.slug}`}>
                  {other.title}
                </Link>
              </li>
            ))}
          </ul>

          <p>
            <Link className="btn btn--ghost" href="/costs">
              Back to the Costs hub
            </Link>{" "}
            <Link className="btn btn--ghost" href="/">
              Back to home
            </Link>
          </p>

          <Faqs faqs={guide.faqs} />
        </div>
      </article>

      <JsonLd
        data={articleSchema({
          headline: guide.title,
          description: guide.description,
          path: `/costs/${guide.slug}`,
          published: guide.published,
          modified: guide.updated,
        })}
      />
    </>
  );
}
