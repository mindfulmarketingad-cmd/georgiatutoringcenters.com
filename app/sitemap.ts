import type { MetadataRoute } from "next";
import { listings, dataGeneratedAt } from "@/lib/listings";
import { findPages } from "@/lib/content/find";
import { blogPosts } from "@/lib/content/blog";
import { costGuides } from "@/lib/content/costs";
import { authors } from "@/lib/content/authors";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path}`;
  const listingsUpdated = new Date(dataGeneratedAt);

  const staticEntries: MetadataRoute.Sitemap = ([
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/find"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/partners"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/reviews"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/costs"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/blog"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/search"), changeFrequency: "monthly", priority: 0.4 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: url("/authors"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.5 },
    { url: url("/sitemap"), changeFrequency: "weekly", priority: 0.3 },
    { url: url("/disclaimer"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ] as const).map((entry) => ({ ...entry, lastModified: listingsUpdated }));

  const findEntries: MetadataRoute.Sitemap = findPages().map((page) => ({
    url: url(`/find/${page.slug}`),
    lastModified: listingsUpdated,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const partnerEntries: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: url(`/partners/${listing.slug}`),
    lastModified: listingsUpdated,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const reviewEntries: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: url(`/reviews/${listing.slug}`),
    lastModified: listingsUpdated,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const authorEntries: MetadataRoute.Sitemap = authors.map((author) => ({
    url: url(`/authors/${author.slug}`),
    lastModified: listingsUpdated,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: url(`/blog/${post.slug}`),
    lastModified: new Date(post.updated),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const costEntries: MetadataRoute.Sitemap = costGuides.map((guide) => ({
    url: url(`/costs/${guide.slug}`),
    lastModified: new Date(guide.updated),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...findEntries,
    ...partnerEntries,
    ...reviewEntries,
    ...costEntries,
    ...blogEntries,
    ...authorEntries,
  ];
}
