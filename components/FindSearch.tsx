"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Entry = { s: string; l: string; k: string; n: number };

const MAX_RESULTS = 15;

const KIND_LABEL: Record<string, string> = {
  city: "City",
  service: "Subject",
  "city-service": "City + subject",
  "city-keyword": "City + subject",
  county: "County",
  zip: "ZIP code",
};

/**
 * Searches every page under /find — cities, subjects, counties, ZIP codes and
 * the city+subject combinations. The index is fetched on first interaction so
 * the hub's own HTML stays small.
 */
export default function FindSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (entries || loading) return;
    setLoading(true);
    fetch("/find-index.json")
      .then((response) => (response.ok ? response.json() : []))
      .then((data: Entry[]) => setEntries(data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  };

  const trimmed = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!entries || trimmed.length < 2) return [];
    const terms = trimmed.split(/\s+/).filter(Boolean).slice(0, 4);
    return entries
      .map((entry) => {
        const label = entry.l.toLowerCase();
        let score = 0;
        for (const term of terms) {
          if (!label.includes(term)) return { entry, score: 0 };
          score += label.startsWith(term) ? 3 : 1;
        }
        // Prefer pages with more centers on them when scores tie.
        return { entry, score: score * 100 + Math.min(entry.n, 99) };
      })
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.l.localeCompare(b.entry.l))
      .slice(0, MAX_RESULTS)
      .map((hit) => hit.entry);
  }, [entries, trimmed]);

  return (
    <div className="zip-search">
      <form
        className="search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (results.length) router.push(`/find/${results[0].s}`);
        }}
      >
        <label className="skip-link" htmlFor="find-search-input">
          Search every Find page
        </label>
        <input
          id="find-search-input"
          type="search"
          maxLength={60}
          placeholder="Try Marietta, math tutors, Cobb County or 30060"
          aria-label="Search every Find page"
          value={query}
          onFocus={load}
          onChange={(event) => {
            // Fetch on the first real keystroke rather than from an effect, so
            // typing never triggers a cascading render.
            if (event.target.value.trim().length >= 2) load();
            setQuery(event.target.value);
          }}
        />
        <button className="btn" type="submit">
          Search
        </button>
      </form>

      {trimmed.length >= 2 && (
        <div className="zip-search-results" role="status" aria-live="polite">
          {!entries && loading ? (
            <p className="form-help">Loading the page index…</p>
          ) : results.length > 0 ? (
            <>
              <p className="form-help">
                {results.length === MAX_RESULTS
                  ? `First ${MAX_RESULTS} matches`
                  : `${results.length} ${results.length === 1 ? "match" : "matches"}`}{" "}
                for &ldquo;{query.trim()}&rdquo;
              </p>
              <ul className="link-list">
                {results.map((entry) => (
                  <li key={entry.s}>
                    <Link href={`/find/${entry.s}`}>{entry.l}</Link>
                    <span className="link-note">
                      {" "}
                      &mdash; {KIND_LABEL[entry.k] ?? "Guide"}, {entry.n}{" "}
                      {entry.n === 1 ? "center" : "centers"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="notice">
              Nothing under Find matches &ldquo;{query.trim()}&rdquo;. Try a city, a county, a ZIP
              code or a subject, or <Link href="/search">search the whole site</Link>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
