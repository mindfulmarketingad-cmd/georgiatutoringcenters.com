import raw from "@/data/listings.json";

export type Hours = { day: string; hours: string };
export type Service = { slug: string; label: string };

export type Listing = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subtypes: string[];
  phone: string;
  website: string;
  street: string;
  city: string;
  citySlug: string;
  state: string;
  postalCode: string;
  fullAddress: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  reviewCount: number;
  reviewsLink: string;
  googleMapsLink: string;
  photosCount: number;
  photo: string;
  streetView: string;
  priceRange: string;
  businessStatus: string;
  verified: boolean;
  about: string;
  hours: Hours[];
  services: Service[];
};

type Dataset = {
  generatedAt: string;
  isSample: boolean;
  count: number;
  listings: Listing[];
};

const dataset = raw as Dataset;

export const listings: Listing[] = dataset.listings;
export const isSampleData = dataset.isSample;
export const dataGeneratedAt = dataset.generatedAt;

export function getListing(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug);
}

export type CityGroup = { city: string; citySlug: string; count: number; listings: Listing[] };

export function cities(): CityGroup[] {
  const map = new Map<string, CityGroup>();
  for (const listing of listings) {
    const group = map.get(listing.citySlug) ?? {
      city: listing.city,
      citySlug: listing.citySlug,
      count: 0,
      listings: [],
    };
    group.count += 1;
    group.listings.push(listing);
    map.set(listing.citySlug, group);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export type ServiceGroup = { label: string; slug: string; count: number; listings: Listing[] };

export function services(): ServiceGroup[] {
  const map = new Map<string, ServiceGroup>();
  for (const listing of listings) {
    for (const service of listing.services) {
      const group = map.get(service.slug) ?? {
        label: service.label,
        slug: service.slug,
        count: 0,
        listings: [],
      };
      group.count += 1;
      group.listings.push(listing);
      map.set(service.slug, group);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function topRated(limit = 10): Listing[] {
  return [...listings]
    .filter((l) => l.reviewCount > 0)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export function relatedListings(listing: Listing, limit = 6): Listing[] {
  const sameCity = listings.filter((l) => l.slug !== listing.slug && l.citySlug === listing.citySlug);
  const sameService = listings.filter(
    (l) =>
      l.slug !== listing.slug &&
      l.citySlug !== listing.citySlug &&
      l.services.some((s) => listing.services.some((t) => t.slug === s.slug))
  );
  return [...sameCity, ...sameService].slice(0, limit);
}

export function averageRating(items: Listing[] = listings): number {
  const rated = items.filter((l) => l.rating > 0);
  if (!rated.length) return 0;
  return Number((rated.reduce((sum, l) => sum + l.rating, 0) / rated.length).toFixed(2));
}

export function totalReviews(items: Listing[] = listings): number {
  return items.reduce((sum, l) => sum + l.reviewCount, 0);
}

export function formatPhoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
