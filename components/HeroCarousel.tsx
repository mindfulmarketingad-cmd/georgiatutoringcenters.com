"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Stars from "@/components/Stars";
import type { Listing } from "@/lib/listings";

type Props = { listings: Listing[] };

function distanceMiles(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export default function HeroCarousel({ listings }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "asking" | "granted" | "denied">("idle");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const slides = useMemo(() => {
    if (!coords) return listings.slice(0, 8);
    return [...listings]
      .filter((l) => l.latitude != null && l.longitude != null)
      .map((l) => ({
        listing: l,
        miles: distanceMiles(coords.lat, coords.lng, l.latitude as number, l.longitude as number),
      }))
      .sort((a, b) => a.miles - b.miles)
      .slice(0, 8)
      .map((entry) => ({ ...entry.listing, distance: entry.miles })) as (Listing & {
      distance?: number;
    })[];
  }, [coords, listings]);

  useEffect(() => {
    setIndex(0);
  }, [coords]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const askForLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoState("denied");
      return;
    }
    setGeoState("asking");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoState("granted");
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  };

  const go = (next: number) => setIndex((next + slides.length) % slides.length);

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="carousel-window">
        <div
          className="carousel-track"
          ref={trackRef}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((listing, i) => {
            const withDistance = listing as Listing & { distance?: number };
            return (
              <div
                className="carousel-slide"
                key={listing.slug}
                aria-hidden={i !== index}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}`}
              >
                <article className="carousel-card">
                  <span className="eyebrow">
                    {coords && withDistance.distance != null
                      ? `${withDistance.distance.toFixed(1)} miles away`
                      : "Featured center"}
                  </span>
                  <h3>
                    <Link href={`/partners/${listing.slug}`} tabIndex={i === index ? 0 : -1}>
                      {listing.name}
                    </Link>
                  </h3>
                  <p className="carousel-meta">
                    {listing.category} &middot; {listing.city}, GA
                  </p>
                  <Stars rating={listing.rating} reviewCount={listing.reviewCount} />
                  {listing.about && <p className="carousel-meta">{listing.about}</p>}
                  <p className="carousel-meta">
                    <strong>Programs:</strong>{" "}
                    {listing.services.map((s) => s.label).join(", ") || listing.category}
                  </p>
                  <div className="listicle-actions" style={{ marginTop: "auto" }}>
                    <Link
                      className="btn btn--sm"
                      href={`/partners/${listing.slug}`}
                      tabIndex={i === index ? 0 : -1}
                    >
                      View center
                    </Link>
                    <Link
                      className="btn btn--ghost btn--sm"
                      href={`/find/tutoring-centers-in-${listing.citySlug}`}
                      tabIndex={i === index ? 0 : -1}
                    >
                      All in {listing.city}
                    </Link>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <div className="carousel-controls">
        <button
          type="button"
          className="carousel-btn"
          onClick={() => go(index - 1)}
          aria-label="Previous listing"
        >
          &#8592;
        </button>
        <div className="carousel-dots" role="tablist" aria-label="Choose a listing">
          {slides.map((listing, i) => (
            <button
              key={listing.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${listing.name}`}
              className={`carousel-dot${i === index ? " is-active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="carousel-btn"
          onClick={() => go(index + 1)}
          aria-label="Next listing"
        >
          &#8594;
        </button>
      </div>

      {geoState !== "granted" && (
        <p className="geo-note">
          <button type="button" className="btn btn--ghost btn--sm" onClick={askForLocation}>
            {geoState === "asking" ? "Locating…" : "Show centers near me"}
          </button>{" "}
          {geoState === "denied"
            ? "Location is unavailable, so these are our top rated Georgia centers."
            : "Your location stays in your browser and is never sent to our servers."}
        </p>
      )}
      {geoState === "granted" && (
        <p className="geo-note">Showing the tutoring centers closest to you first.</p>
      )}
    </div>
  );
}
