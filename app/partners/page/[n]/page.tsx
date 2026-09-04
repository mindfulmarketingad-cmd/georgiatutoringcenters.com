import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PartnersView from "@/components/PartnersView";
import { listings } from "@/lib/listings";
import { extraPageParams, paginate } from "@/lib/pagination";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return extraPageParams(listings.length);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  const page = Number(n);
  const { pageCount } = paginate(listings, page);
  return pageMeta({
    title: `Partner Directory, Page ${page} of ${pageCount} | Georgia Tutoring Centers`,
    description: `Page ${page} of the Georgia tutoring center directory: hours, review counts, addresses, phone numbers and websites for every listed center.`,
    path: `/partners/page/${page}`,
  });
}

export default async function PartnersPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2) notFound();
  return <PartnersView page={page} />;
}
