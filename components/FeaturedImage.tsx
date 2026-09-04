"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

type Props = {
  name: string;
  city: string;
  photo: string;
  streetView?: string;
  variant?: "banner" | "thumb";
};

function initials(name: string) {
  return (
    name
      .replace(/[^A-Za-z\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("") || "GA"
  );
}

/**
 * Business image taken from the Outscraper export. Falls back to a branded
 * placeholder when the export carries no photo or the remote image fails, so a
 * listing never shows a broken image.
 */
export default function FeaturedImage({
  name,
  city,
  photo,
  streetView = "",
  variant = "banner",
}: Props) {
  const sources = [photo, streetView].filter(Boolean);
  const [index, setIndex] = useState(0);
  const src = sources[index];
  const next = () => setIndex((i) => i + 1);
  // A remote image can fail before React hydrates, in which case the error
  // event is never delivered. Check the element's load state on mount too.
  const checkOnMount = (node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth === 0) next();
  };
  const className = `featured-media featured-media--${variant}`;

  if (!src) {
    return (
      <div
        className={`${className} featured-media--placeholder`}
        role="img"
        aria-label={`${name}, ${city}, Georgia`}
      >
        <span className="featured-initials" aria-hidden="true">
          {initials(name)}
        </span>
        {variant === "banner" && (
          <span className="featured-placeholder-text">
            {name}
            <br />
            {city}, Georgia
          </span>
        )}
      </div>
    );
  }

  if (variant === "thumb") {
    return (
      <div className={className}>
        <img
          src={src}
          alt={`${name} in ${city}, Georgia`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          ref={checkOnMount}
          onError={next}
        />
      </div>
    );
  }

  return (
    <figure className={className}>
      <img
        src={src}
        alt={`${name} in ${city}, Georgia`}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        ref={checkOnMount}
        onError={next}
      />
      <figcaption>Photo from this business&apos;s public map listing.</figcaption>
    </figure>
  );
}
