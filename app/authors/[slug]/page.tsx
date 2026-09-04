import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import LinkList from "@/components/LinkList";
import JsonLd from "@/components/JsonLd";
import { authors, getAuthor } from "@/lib/content/authors";
import { blogPosts } from "@/lib/content/blog";
import { costGuides } from "@/lib/content/costs";
import { pageMeta, personSchema } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return authors.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) {
    return pageMeta({ title: "Not found", description: "", path: `/authors/${slug}`, noindex: true });
  }
  return pageMeta({
    title: `${author.name} | ${author.role} | Georgia Tutoring Centers`,
    description: `${author.name} is ${author.role.toLowerCase()} at Georgia Tutoring Centers. ${author.short}`,
    path: `/authors/${author.slug}`,
    type: "article",
  });
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const posts = blogPosts.filter((post) => post.author === author.slug);
  const guides = costGuides.filter((guide) => guide.author === author.slug);

  return (
    <>
      <PageBanner title={author.name} eyebrow={author.role} priority>
        <ul className="banner-facts">
          <li>{posts.length + guides.length} guides published</li>
          <li>Covering {author.covers.slice(0, 2).join(", ").toLowerCase()}</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Authors", path: "/authors" },
          { name: author.name, path: `/authors/${author.slug}` },
        ]}
      />

      <section className="section">
        <div className="wrap prose">
          <div className="author-card" style={{ marginTop: 0 }}>
            <Image
              className="author-card-avatar"
              src={`/authors/${author.slug}.svg`}
              alt=""
              width={96}
              height={96}
            />
            <div>
              <p className="card-meta" style={{ marginBottom: "0.4rem" }}>
                {author.role} &middot; writing here since {author.joined}
              </p>
              <p style={{ margin: 0 }}>{author.focus}</p>
            </div>
          </div>

          <h2>About {author.name}</h2>
          {author.bio.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}

          <h2>Coverage Areas</h2>
          <ul>
            {author.covers.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>

          {posts.length > 0 && (
            <>
              <h2>Guides by {author.name}</h2>
              <LinkList
                items={posts.map((post) => ({
                  href: `/blog/${post.slug}`,
                  label: post.title,
                  note: `${post.category}, ${post.readMinutes} min read`,
                }))}
              />
            </>
          )}

          {guides.length > 0 && (
            <>
              <h2>Cost Guides by {author.name}</h2>
              <LinkList
                items={guides.map((guide) => ({
                  href: `/costs/${guide.slug}`,
                  label: guide.title,
                  note: guide.category,
                }))}
              />
            </>
          )}

          <h2>Corrections and Contact</h2>
          <p>
            Spotted something out of date or wrong in one of these guides? Send it through the{" "}
            <Link href="/contact">contact page</Link> and we will correct it. Our editorial approach
            is described on the <Link href="/about">about page</Link> and on the{" "}
            <Link href="/authors">editorial team page</Link>.
          </p>
        </div>
      </section>

      <JsonLd data={personSchema(author, [...posts, ...guides].length)} />
    </>
  );
}
