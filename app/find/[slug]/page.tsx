import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FindPageView from "@/components/FindPageView";
import { findPages, getFindPage } from "@/lib/content/find";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return findPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getFindPage(slug);
  if (!page) {
    return pageMeta({ title: "Not found", description: "", path: `/find/${slug}`, noindex: true });
  }
  return pageMeta({
    title: page.metaTitle,
    description: page.description,
    path: `/find/${page.slug}`,
    noindex: page.noindex,
  });
}

export default async function FindDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getFindPage(slug);
  if (!page) notFound();
  return <FindPageView page={page} pageNumber={1} />;
}
