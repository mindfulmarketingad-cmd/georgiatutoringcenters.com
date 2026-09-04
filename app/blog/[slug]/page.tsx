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
import { blogPosts, getPost } from "@/lib/content/blog";
import { articleSchema, pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return pageMeta({ title: "Not found", description: "", path: `/blog/${slug}`, noindex: true });
  return pageMeta({
    title: post.metaTitle,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    published: post.published,
    modified: post.updated,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const others = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 4);
  const author = authorOrDefault(post.author);

  return (
    <>
      <PageBanner title={post.title} eyebrow={post.category} priority>
        <ul className="banner-facts">
          <li>
            Updated{" "}
            {new Date(post.updated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </li>
          <li>{post.readMinutes} minute read</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      <article className="section">
        <div className="wrap prose">
          <AuthorByline
            author={author}
            published={post.published}
            updated={post.updated}
            readMinutes={post.readMinutes}
          />
          <p className="lede">{post.intro}</p>

          <ContentPhoto
            src={photoFor(post.slug).inline}
            alt={photoFor(post.slug).alt}
            caption={photoFor(post.slug).caption}
            priority
          />

          <ArticleBody sections={post.sections} />

          <AuthorCard author={author} />

          <h2>Put this into practice</h2>
          <p>
            Shortlist centers on the <Link href="/find">Find hub</Link>, compare ratings on the{" "}
            <Link href="/reviews">Reviews hub</Link>, and set your budget with our{" "}
            <Link href="/costs">Georgia tutoring cost guides</Link>. Every center in the{" "}
            <Link href="/partners">partner directory</Link> lists hours, contact details and
            programs.
          </p>

          <h2>More guides</h2>
          <LinkList
            items={others.map((other) => ({
              href: `/blog/${other.slug}`,
              label: other.title,
              note: `${other.category}, ${other.readMinutes} min read`,
            }))}
          />

          <p style={{ marginTop: "1.6rem" }}>
            <Link className="btn btn--ghost" href="/blog">
              Back to the Blog hub
            </Link>{" "}
            <Link className="btn btn--ghost" href="/">
              Back to home
            </Link>
          </p>

          <Faqs faqs={post.faqs} />
        </div>
      </article>

      <JsonLd
        data={articleSchema({
          headline: post.title,
          description: post.description,
          path: `/blog/${post.slug}`,
          published: post.published,
          modified: post.updated,
          author,
        })}
      />
    </>
  );
}
