import { NextResponse, type NextRequest } from "next/server";

/**
 * Canonicalises URL casing. Next.js route matching is case-insensitive, so
 * /Find and /find would otherwise serve the same page at two URLs. Anything
 * containing an uppercase letter is redirected to its lowercase form, which
 * keeps one canonical URL per page for crawlers.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (/[A-Z]/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  // Trailing slashes (other than the root) also duplicate content.
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "");
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, the API and anything that looks like a static file.
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
