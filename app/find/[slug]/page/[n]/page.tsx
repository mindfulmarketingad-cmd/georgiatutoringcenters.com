import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FindPageView from "@/components/FindPageView";
import { findPages, getFindPage } from "@/lib/content/find";
import { extraPageParams, paginate } from "@/lib/pagination";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return findPages().flatMap((page) =>
    extraPageParams(page.listings.length).map(({ n }) => ({ slug: page.slug, n }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}): Promise<Metadata> {
  const { slug, n } = await params;
  const page = getFindPage(slug);
  if (!page) {
    return pageMeta({ title: "Not found", description: "", path: `/find/${slug}`, noindex: true });
  }
  const number = Number(n);
  const { pageCount } = paginate(page.listings, number);
  return pageMeta({
    title: `${page.h1}, Page ${number} of ${pageCount}`,
    description: `${page.description} Page ${number} of ${pageCount}.`,
    path: `/find/${page.slug}/page/${number}`,
    noindex: page.noindex,
  });
}

export default async function FindDetailPaged({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}) {
  const { slug, n } = await params;
  const page = getFindPage(slug);
  const number = Number(n);
  if (!page || !Number.isInteger(number) || number < 2) notFound();
  return <FindPageView page={page} pageNumber={number} />;
}
