"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MapView from "@/components/MapView";
import Stars from "@/components/Stars";
import { formatPhoneHref, type Listing } from "@/lib/listings";

export type Chip = { label: string; href: string; active?: boolean };

type Props = {
  listings: Listing[];
  title: string;
  chips?: Chip[];
  startIndex?: number;
  showHours?: boolean;
};

export default function Listicle({
  listings,
  title,
  chips = [],
  startIndex = 1,
  showHours = true,
}: Props) {
  const [mapOpen, setMapOpen] = useState(false);
  const containerRef = useRef<HTMLOListElement>(null);

  // Reveal on scroll plus a light parallax drift on the bubble accents.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(".listicle-item"));
    if (!items.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      items.forEach((item) => item.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    items.forEach((item) => observer.observe(item));

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const height = window.innerHeight || 1;
        for (const item of items) {
          const rect = item.getBoundingClientRect();
          if (rect.bottom < -200 || rect.top > height + 200) continue;
          const progress = (height - rect.top) / (height + rect.height);
          item.style.setProperty("--bubble", `${(0.5 - progress) * 34}px`);
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [listings]);

  if (!listings.length) {
    return <p className="notice">No listings match this view yet. Try another city or subject.</p>;
  }

  return (
    <div>
      {chips.length > 0 && (
        <ul className="chips" aria-label="Filter listings">
          {chips.map((chip) => (
            <li key={chip.href}>
              <Link className={`chip${chip.active ? " chip--active" : ""}`} href={chip.href}>
                {chip.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="map-toggle-row">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          aria-expanded={mapOpen}
          onClick={() => setMapOpen((v) => !v)}
        >
          {mapOpen ? "Hide map view" : "Show map view"}
        </button>
        <span className="form-help">
          {listings.length} {listings.length === 1 ? "center" : "centers"} in this list
        </span>
      </div>

      {mapOpen && <MapView listings={listings} title={title} />}

      <ol className="listicle" ref={containerRef} start={startIndex}>
        {listings.map((listing, index) => {
          const openDays = listing.hours.filter((h) => h.hours && !/closed/i.test(h.hours)).length;
          return (
            <li className="listicle-item" key={listing.slug}>
              <div className="listicle-head">
                <span className="rank" aria-hidden="true">
                  {startIndex + index}
                </span>
                <div>
                  <h3 className="listicle-title">
                    <Link href={`/partners/${listing.slug}`}>{listing.name}</Link>
                  </h3>
                  <p className="listicle-sub">
                    {listing.category} &middot; {listing.city}, GA
                    {listing.priceRange ? ` · ${listing.priceRange}` : ""}
                  </p>
                  <Stars rating={listing.rating} reviewCount={listing.reviewCount} />
                </div>
              </div>

              <div className="listicle-body">
                {listing.about && <p className="listicle-summary">{listing.about}</p>}

                <ul className="facts">
                  <li>
                    <strong>Address:</strong> {listing.fullAddress || `${listing.city}, GA`}
                  </li>
                  {listing.phone && (
                    <li>
                      <strong>Phone:</strong>{" "}
                      <a href={formatPhoneHref(listing.phone)}>{listing.phone}</a>
                    </li>
                  )}
                  {listing.website && (
                    <li>
                      <strong>Website:</strong>{" "}
                      <a href={listing.website} rel="noopener noreferrer nofollow" target="_blank">
                        Visit site
                      </a>
                    </li>
                  )}
                  <li>
                    <strong>Reviews:</strong> {listing.reviewCount.toLocaleString()} Google reviews
                  </li>
                  {listing.subtypes.length > 0 && (
                    <li>
                      <strong>Programs:</strong> {listing.subtypes.slice(0, 4).join(", ")}
                    </li>
                  )}
                  {openDays > 0 && (
                    <li>
                      <strong>Open:</strong> {openDays} days a week
                    </li>
                  )}
                </ul>

                {showHours && listing.hours.length > 0 && (
                  <details>
                    <summary>
                      <strong>Hours of operation</strong>
                    </summary>
                    <table className="hours-table">
                      <caption className="form-help">
                        Hours for {listing.name}. Confirm before visiting.
                      </caption>
                      <tbody>
                        {listing.hours.map((hour) => (
                          <tr key={hour.day}>
                            <th scope="row">{hour.day}</th>
                            <td>{hour.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                )}

                <div className="listicle-actions">
                  <Link className="btn btn--sm" href={`/partners/${listing.slug}`}>
                    View full profile
                  </Link>
                  <Link className="btn btn--ghost btn--sm" href={`/reviews/${listing.slug}`}>
                    Read reviews
                  </Link>
                  <Link
                    className="btn btn--ghost btn--sm"
                    href={`/find/tutoring-centers-in-${listing.citySlug}`}
                  >
                    More in {listing.city}
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
