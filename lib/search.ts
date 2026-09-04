import { listings } from "@/lib/listings";
import { blogPosts } from "@/lib/content/blog";
import { costGuides } from "@/lib/content/costs";
import { findPages } from "@/lib/content/find";
import { authors } from "@/lib/content/authors";

export type SearchDoc = {
  title: string;
  url: string;
  type: "Center" | "Guide" | "Cost" | "Find" | "Page" | "Reviews";
  summary: string;
  keywords: string;
};

const staticPages: SearchDoc[] = [
  { title: "Georgia Tutoring Centers", url: "/", type: "Page", summary: "Directory home: find tutoring and learning centers across Georgia.", keywords: "home directory tutoring georgia" },
  { title: "About Georgia Tutoring Centers", url: "/about", type: "Page", summary: "Who we are, how listings are gathered, and how the directory is funded.", keywords: "about editorial policy" },
  { title: "Contact", url: "/contact", type: "Page", summary: "Reach the directory team, claim a listing, or report an error.", keywords: "contact claim listing support" },
  { title: "Find a Tutoring Center", url: "/find", type: "Page", summary: "Browse tutoring centers by Georgia city and by subject.", keywords: "find browse city subject" },
  { title: "Tutoring Centers by Georgia County", url: "/counties", type: "Page", summary: "Browse tutoring centers by Georgia county.", keywords: "county counties browse region" },
  { title: "Tutoring Centers by Georgia ZIP Code", url: "/zip-codes", type: "Page", summary: "Browse tutoring centers by Georgia ZIP code.", keywords: "zip code postal browse near me" },
  { title: "Partner Directory", url: "/partners", type: "Page", summary: "The full numbered listicle of every tutoring center on the site.", keywords: "partners listicle directory all centers" },
  { title: "Reviews", url: "/reviews", type: "Page", summary: "Ratings and review counts for Georgia tutoring centers.", keywords: "reviews ratings stars" },
  { title: "Costs and Pricing", url: "/costs", type: "Page", summary: "What tutoring costs in Georgia by program and format.", keywords: "cost price rates pricing" },
  { title: "Blog", url: "/blog", type: "Page", summary: "Guides for parents on tutoring, test prep and study habits.", keywords: "blog articles guides" },
  { title: "Our Editorial Team", url: "/authors", type: "Page", summary: "The editors who write the guides and cost pages.", keywords: "authors editorial team writers about" },
  { title: "Sitemap", url: "/sitemap", type: "Page", summary: "Every page on Georgia Tutoring Centers in one list.", keywords: "sitemap index" },
  { title: "Privacy Policy", url: "/privacy", type: "Page", summary: "How this site handles data, cookies and advertising.", keywords: "privacy cookies data" },
  { title: "Terms of Use", url: "/terms", type: "Page", summary: "The terms that govern use of this directory.", keywords: "terms conditions legal" },
  { title: "Disclaimer", url: "/disclaimer", type: "Page", summary: "Editorial and accuracy disclaimer for directory listings.", keywords: "disclaimer accuracy" },
];

let cache: SearchDoc[] | null = null;

export function searchIndex(): SearchDoc[] {
  if (cache) return cache;

  const docs: SearchDoc[] = [...staticPages];

  for (const listing of listings) {
    docs.push({
      title: listing.name,
      url: `/partners/${listing.slug}`,
      type: "Center",
      summary: `${listing.category} in ${listing.city}, GA. ${listing.rating ? `${listing.rating} stars from ${listing.reviewCount} reviews.` : ""}`.trim(),
      keywords: [listing.name, listing.city, listing.category, listing.subtypes.join(" "), listing.services.map((s) => s.label).join(" "), listing.postalCode, listing.about]
        .join(" ")
        .toLowerCase(),
    });
    docs.push({
      title: `${listing.name} Reviews`,
      url: `/reviews/${listing.slug}`,
      type: "Reviews",
      summary: `Ratings, review counts and what to ask ${listing.name} in ${listing.city}.`,
      keywords: `${listing.name} reviews ratings ${listing.city}`.toLowerCase(),
    });
  }

  for (const page of findPages()) {
    docs.push({
      title: page.h1,
      url: `/find/${page.slug}`,
      type: "Find",
      summary: page.description,
      keywords: `${page.h1} ${page.label} ${page.description}`.toLowerCase(),
    });
  }

  for (const post of blogPosts) {
    docs.push({
      title: post.title,
      url: `/blog/${post.slug}`,
      type: "Guide",
      summary: post.description,
      keywords: `${post.title} ${post.category} ${post.description}`.toLowerCase(),
    });
  }

  for (const author of authors) {
    docs.push({
      title: author.name,
      url: `/authors/${author.slug}`,
      type: "Page",
      summary: `${author.role}. ${author.short}`,
      keywords: `${author.name} ${author.role} ${author.covers.join(" ")} author`.toLowerCase(),
    });
  }

  for (const guide of costGuides) {
    docs.push({
      title: guide.title,
      url: `/costs/${guide.slug}`,
      type: "Cost",
      summary: guide.description,
      keywords: `${guide.title} ${guide.category} ${guide.description} cost price`.toLowerCase(),
    });
  }

  cache = docs;
  return docs;
}

export function runSearch(query: string, limit = 40): SearchDoc[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean).slice(0, 8);

  return searchIndex()
    .map((doc) => {
      const haystack = `${doc.title} ${doc.summary} ${doc.keywords}`.toLowerCase();
      const title = doc.title.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += 6;
        if (haystack.includes(term)) score += 2;
        if (title.startsWith(term)) score += 3;
      }
      if (haystack.includes(q)) score += 4;
      return { doc, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
    .slice(0, limit)
    .map((r) => r.doc);
}

export const popularSearches = [
  "math tutoring",
  "test prep",
  "reading tutor",
  "atlanta",
  "savannah",
  "tutoring cost",
  "online tutoring",
  "sat prep",
];
