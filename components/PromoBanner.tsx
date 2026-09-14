import { promo } from "@/lib/site";

/**
 * Site-wide promotional bar above the header. The destination is a paid
 * affiliate link, so the bar is labeled as one on its face and the link
 * carries rel="sponsored" as search engines require.
 */
export default function PromoBanner() {
  return (
    <aside className="promo-bar" aria-label="Promotion">
      <a
        className="promo-bar-link"
        href={promo.href}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
      >
        <span className="promo-bar-flag">Deal</span>
        <span className="promo-bar-text">
          <strong>{promo.headline}</strong>
          <span className="promo-bar-sub">{promo.subline}</span>
        </span>
        <span className="promo-bar-cta" aria-hidden="true">
          Shop Now
        </span>
        <span className="promo-bar-note">
          Affiliate link<span className="visually-hidden">, opens in a new tab</span>
        </span>
      </a>
    </aside>
  );
}
