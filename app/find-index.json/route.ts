import { findPages } from "@/lib/content/find";

export const dynamic = "force-static";

/**
 * Search index for the Find hub, served as a static file rather than embedded
 * in the page. It is ~80 KB, so shipping it inline would double the hub's HTML
 * for a feature most visitors never touch; the search box fetches it on first
 * use instead, and the CDN caches it.
 */
export function GET() {
  const entries = findPages().map((page) => ({
    s: page.slug,
    l: page.h1,
    k: page.kind,
    n: page.listings.length,
  }));

  return new Response(JSON.stringify(entries), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
