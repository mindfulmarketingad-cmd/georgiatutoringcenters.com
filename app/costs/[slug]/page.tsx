import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import ContentPhoto from "@/components/ContentPhoto";
import { photoFor } from "@/lib/photos";
import LinkList from "@/components/LinkList";
import ArticleBody from "@/components/ArticleBody";
import Faqs from "@/components/Faqs";
import JsonLd from "@/components/JsonLd";
import { AuthorByline, AuthorCard } from "@/components/AuthorByline";
import { authorOrDefault } from "@/lib/content/authors";
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
  const author = authorOrDefault(guide.author);

  return (
    <>
      <PageBanner title={guide.title} eyebrow={guide.category} priority>
        <ul className="banner-facts">
          <li>
            Updated{" "}
            {new Date(guide.updated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </li>
          <li>{guide.readMinutes} minute read</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Costs", path: "/costs" },
          { name: guide.title, path: `/costs/${guide.slug}` },
        ]}
      />

      <article className="section">
        <div className="wrap prose">
          <AuthorByline
            author={author}
            published={guide.published}
            updated={guide.updated}
            readMinutes={guide.readMinutes}
          />
          <div className="callout">
            <p style={{ margin: 0 }}>
              <strong>Quick answer:</strong> {guide.quickAnswer}
            </p>
          </div>
          <p className="lede">{guide.intro}</p>

          <ContentPhoto
            src={photoFor(guide.slug).inline}
            alt={photoFor(guide.slug).alt}
            caption={photoFor(guide.slug).caption}
            priority
          />

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

          <AuthorCard author={author} />

          <h2>Find centers in this price range</h2>
          <p>
            Use the <Link href="/find">Find hub</Link> to shortlist centers in your city, then check
            the <Link href="/reviews">Reviews hub</Link> before you call. Every listing in the{" "}
            <Link href="/partners">partner directory</Link> shows the published price range where
            the business reports one.
          </p>

          <h2>Other cost guides</h2>
          <LinkList
            items={others.map((other) => ({
              href: `/costs/${other.slug}`,
              label: other.title,
              note: other.category,
            }))}
          />

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
          author,
        })}
      />
    </>
  );
}
