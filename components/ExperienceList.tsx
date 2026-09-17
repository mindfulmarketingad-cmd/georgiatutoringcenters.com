"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Stars from "@/components/Stars";
import {
  AFFILIATE_REL,
  formatPrice,
  locationOf,
  priceBandOf,
  type Experience,
} from "@/lib/content/experiences";

type Group = { key: GroupKey; heading: string; options: { value: string; label: string }[] };
type GroupKey = "destination" | "category" | "tag" | "price";

/**
 * The experiences listicle and its filter.
 *
 * Filtering runs in the browser over the whole list, which is the right shape
 * while the list is small and keeps every experience server-rendered into the
 * page for search engines rather than fetched after load.
 */
export default function ExperienceList({
  experiences,
  groups,
}: {
  experiences: Experience[];
  groups: Group[];
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Record<GroupKey, string[]>>({
    destination: [],
    category: [],
    tag: [],
    price: [],
  });

  const toggle = (key: GroupKey, value: string) =>
    setPicked((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((entry) => entry !== value)
        : [...current[key], value],
    }));

  const activeCount = Object.values(picked).reduce((total, list) => total + list.length, 0);

  const clear = () => {
    setPicked({ destination: [], category: [], tag: [], price: [] });
    setQuery("");
  };

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return experiences.filter((entry) => {
      // Within a group the choices are alternatives; across groups they stack.
      if (picked.destination.length && !picked.destination.includes(entry.country)) return false;
      if (picked.category.length && !picked.category.includes(entry.category)) return false;
      if (picked.price.length && !picked.price.includes(priceBandOf(entry))) return false;
      if (picked.tag.length && !picked.tag.some((tag) => entry.tags.includes(tag))) return false;
      if (!needle) return true;
      return [entry.title, entry.city, entry.country, entry.category, entry.summary, ...entry.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [experiences, picked, query]);

  return (
    <div className="exp">
      <div className="exp-filters">
        <div className="form-field exp-search">
          <label htmlFor="exp-search">Search experiences</label>
          <input
            id="exp-search"
            type="search"
            value={query}
            maxLength={80}
            placeholder="Try ramen, Kyoto, or cooking"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {groups.map((group) => (
          <fieldset className="exp-group" key={group.key}>
            <legend>{group.heading}</legend>
            <ul className="chips">
              {group.options.map((option) => {
                const on = picked[group.key].includes(option.value);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      className={`chip${on ? " chip--active" : ""}`}
                      aria-pressed={on}
                      onClick={() => toggle(group.key, option.value)}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      <p className="exp-count" role="status">
        Showing {results.length} of {experiences.length}{" "}
        {experiences.length === 1 ? "experience" : "experiences"}
        {activeCount > 0 || query.trim() ? (
          <>
            {" "}
            <button type="button" className="rb-link" onClick={clear}>
              Clear filters
            </button>
          </>
        ) : null}
      </p>

      {results.length === 0 ? (
        <p className="notice">
          Nothing matches that combination yet.{" "}
          <button type="button" className="rb-link" onClick={clear}>
            Clear the filters
          </button>{" "}
          to see everything.
        </p>
      ) : (
        <ol className="listicle exp-list">
          {results.map((entry, index) => (
            <li className="listicle-item is-in" key={entry.slug}>
              <div className="listicle-head">
                <span className="rank" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="listicle-text">
                  <h3 className="listicle-title">
                    <Link href={`/experiences/${entry.slug}`}>{entry.title}</Link>
                  </h3>
                  <p className="listicle-sub">
                    {locationOf(entry)} &middot; {entry.category}
                    {entry.operator ? ` · ${entry.operator}` : ""}
                  </p>
                  <Stars rating={entry.rating} reviewCount={entry.reviewCount} />
                </div>
                <p className="exp-price">
                  <span className="exp-price-from">From</span>
                  <span className="exp-price-amount">{formatPrice(entry)}</span>
                  <span className="exp-price-unit">per person</span>
                </p>
              </div>

              <div className="listicle-body">
                <p className="listicle-summary">{entry.summary}</p>
                <ul className="exp-badges">
                  {entry.badgeOfExcellence && <li>Badge of Excellence</li>}
                  {entry.recommendedPercent ? (
                    <li>Recommended by {entry.recommendedPercent}% of travelers</li>
                  ) : null}
                  {entry.freeCancellation && <li>Free cancellation</li>}
                  {entry.reserveNowPayLater && <li>Reserve now, pay later</li>}
                  {entry.childRates && <li>Discounted child rates</li>}
                  {entry.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="listicle-actions">
                  <Link className="btn btn--sm" href={`/experiences/${entry.slug}`}>
                    Full details
                  </Link>
                  <a
                    className="btn btn--sm btn--ghost"
                    href={entry.affiliateUrl}
                    target="_blank"
                    rel={AFFILIATE_REL}
                  >
                    Check dates on Viator
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
