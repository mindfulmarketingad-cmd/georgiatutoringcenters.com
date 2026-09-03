import type { Metadata } from "next";
import { site } from "@/lib/site";
import type { Listing } from "@/lib/listings";
import type { Faq } from "@/lib/content/types";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  published?: string;
  modified?: string;
  noindex?: boolean;
};

export function pageMeta({
  title,
  description,
  path,
  type = "website",
  published,
  modified,
  noindex = false,
}: PageMetaInput): Metadata {
  const url = `${site.url}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type,
      locale: "en_US",
      images: [{ url: `${site.url}/logo.svg`, width: 1200, height: 630, alt: site.name }],
      ...(published ? { publishedTime: published } : {}),
      ...(modified ? { modifiedTime: modified } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${site.url}/logo.svg`],
    },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

const DAY_URI: Record<string, string> = {
  Monday: "https://schema.org/Monday",
  Tuesday: "https://schema.org/Tuesday",
  Wednesday: "https://schema.org/Wednesday",
  Thursday: "https://schema.org/Thursday",
  Friday: "https://schema.org/Friday",
  Saturday: "https://schema.org/Saturday",
  Sunday: "https://schema.org/Sunday",
};

export function listingSchema(listing: Listing) {
  const openingHours = listing.hours
    .filter((h) => h.hours && !/closed/i.test(h.hours))
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_URI[h.day],
      description: h.hours,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${site.url}/partners/${listing.slug}#organization`,
    name: listing.name,
    description: listing.about || `${listing.category} in ${listing.city}, Georgia.`,
    url: `${site.url}/partners/${listing.slug}`,
    ...(listing.website ? { sameAs: [listing.website] } : {}),
    ...(listing.phone ? { telephone: listing.phone } : {}),
    ...(listing.priceRange ? { priceRange: listing.priceRange } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.street || undefined,
      addressLocality: listing.city,
      addressRegion: "GA",
      postalCode: listing.postalCode || undefined,
      addressCountry: "US",
    },
    ...(listing.latitude && listing.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: listing.latitude,
            longitude: listing.longitude,
          },
        }
      : {}),
    ...(openingHours.length ? { openingHoursSpecification: openingHours } : {}),
    ...(listing.rating > 0 && listing.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: listing.rating,
            reviewCount: listing.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function itemListSchema(listings: Listing[], path: string, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: `${site.url}${path}`,
    numberOfItems: listings.length,
    itemListElement: listings.map((listing, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}/partners/${listing.slug}`,
      name: listing.name,
    })),
  };
}

export function articleSchema(input: {
  headline: string;
  description: string;
  path: string;
  published: string;
  modified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    datePublished: input.published,
    dateModified: input.modified,
    mainEntityOfPage: `${site.url}${input.path}`,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: { "@type": "ImageObject", url: `${site.url}/logo.svg` },
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}#organization`,
    name: site.name,
    url: site.url,
    description: site.description,
    logo: { "@type": "ImageObject", url: `${site.url}/logo.svg` },
    areaServed: { "@type": "State", name: "Georgia" },
    sameAs: [site.social.facebook, site.social.instagram, site.social.twitter],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: site.email,
        areaServed: "US-GA",
        availableLanguage: "English",
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}#website`,
    name: site.name,
    url: site.url,
    description: site.description,
    publisher: { "@id": `${site.url}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${site.url}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}
