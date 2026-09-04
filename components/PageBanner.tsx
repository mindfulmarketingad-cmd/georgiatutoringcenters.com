"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

const DEFAULT_IMAGE = "/hero-banner.png";

type Props = {
  title: string;
  eyebrow?: string;
  /** Banner artwork. Business photos from the import fall back to the site artwork. */
  image?: string;
  alt?: string;
  priority?: boolean;
  /** Short key facts or a call to action, shown in the panel below the title. */
  children?: React.ReactNode;
};

export default function PageBanner({
  title,
  eyebrow,
  image,
  alt = "",
  priority = false,
  children,
}: Props) {
  const [src, setSrc] = useState(image || DEFAULT_IMAGE);
  const fallBack = () => setSrc(DEFAULT_IMAGE);
  // Covers remote images that fail before React hydrates, where the error
  // event is never delivered to the handler below.
  const checkOnMount = (node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth === 0) fallBack();
  };

  return (
    <section className="page-banner">
      <img
        className="page-banner-img"
        src={src}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        width={2400}
        height={1000}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        ref={checkOnMount}
        onError={fallBack}
      />
      <div className="page-banner-inner">
        <div className="page-banner-bar">
          {eyebrow && <span className="page-banner-eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
        </div>
        {children && <div className="page-banner-panel">{children}</div>}
      </div>
    </section>
  );
}
