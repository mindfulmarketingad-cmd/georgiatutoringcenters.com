"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type ZipEntry = {
  zip: string;
  city: string;
  county: string;
  countySlug: string;
  count: number;
};

export type CountyEntry = {
  county: string;
  countySlug: string;
  count: number;
  cities: string[];
};

type Match = { href: string; label: string; note: string };

const MAX_RESULTS = 12;

/**
 * ZIP, county and city lookup for the county hub. Filters entirely in the
 * browser over the ~300 entries the page already knows about, and jumps
 * straight to the ZIP page when someone types a full ZIP we cover.
 */
export default function CountyZipSearch({
  zips,
  counties,
}: {
  zips: ZipEntry[];
  counties: CountyEntry[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();
  const exactZip = zips.find((entry) => entry.zip === trimmed);

  const matches = useMemo<Match[]>(() => {
    if (trimmed.length < 2) return [];

    if (/^\d+$/.test(trimmed)) {
      return zips
        .filter((entry) => entry.zip.startsWith(trimmed))
        .slice(0, MAX_RESULTS)
        .map((entry) => ({
          href: `/find/tutoring-centers-in-${entry.zip}`,
          label: `Tutoring & Learning Centers in ${entry.zip}`,
          note: `${entry.city}, ${entry.county} County — ${entry.count} ${entry.count === 1 ? "center" : "centers"}`,
        }));
    }

    const countyHits: Match[] = counties
      .filter(
        (entry) =>
          entry.county.toLowerCase().includes(trimmed) ||
          entry.cities.some((city) => city.toLowerCase().includes(trimmed))
      )
      .map((entry) => ({
        href: `/find/tutoring-centers-in-${entry.countySlug}-county`,
        label: `Tutoring & Learning Centers in ${entry.county} County Georgia`,
        note: `${entry.count} ${entry.count === 1 ? "center" : "centers"} in ${entry.cities.length} ${entry.cities.length === 1 ? "city" : "cities"}`,
      }));

    const cityHits: Match[] = zips
      .filter((entry) => entry.city.toLowerCase().includes(trimmed))
      .map((entry) => ({
        href: `/find/tutoring-centers-in-${entry.zip}`,
        label: `Tutoring & Learning Centers in ${entry.zip}`,
        note: `${entry.city}, ${entry.county} County — ${entry.count} ${entry.count === 1 ? "center" : "centers"}`,
      }));

    const seen = new Set<string>();
    return [...countyHits, ...cityHits]
      .filter((match) => !seen.has(match.href) && seen.add(match.href))
      .slice(0, MAX_RESULTS);
  }, [trimmed, zips, counties]);

  return (
    <div className="zip-search">
      <form
        className="search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (exactZip) router.push(`/find/tutoring-centers-in-${exactZip.zip}`);
          else if (matches.length) router.push(matches[0].href);
        }}
      >
        <label className="skip-link" htmlFor="zip-search-input">
          Search by ZIP code, county or city
        </label>
        <input
          id="zip-search-input"
          type="search"
          inputMode="text"
          autoComplete="postal-code"
          maxLength={40}
          placeholder="Enter your ZIP code, county or city"
          aria-label="Search by ZIP code, county or city"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="btn" type="submit">
          Search
        </button>
      </form>

      {trimmed.length >= 2 && (
        <div className="zip-search-results" role="status" aria-live="polite">
          {matches.length > 0 ? (
            <>
              <p className="form-help">
                {matches.length === MAX_RESULTS ? `First ${MAX_RESULTS} matches` : `${matches.length} ${matches.length === 1 ? "match" : "matches"}`} for &ldquo;{query.trim()}&rdquo;
              </p>
              <ul className="link-list">
                {matches.map((match) => (
                  <li key={match.href}>
                    <Link href={match.href}>{match.label}</Link>
                    <span className="link-note"> &mdash; {match.note}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="notice">
              No center in the directory has a {/^\d+$/.test(trimmed) ? "ZIP code" : "county or city"} matching
              &ldquo;{query.trim()}&rdquo;. Try a nearby ZIP, browse the counties below, or{" "}
              <Link href="/find">search by city and subject</Link>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
