import Link from "next/link";
import Image from "next/image";
import { footerLinks, site } from "@/lib/site";
import { cities, services } from "@/lib/listings";

const socialIcons: Record<string, React.ReactElement> = {
  Facebook: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3 0-1.3-.1-2.5-.1-2.45 0-4.15 1.5-4.15 4.25V9.9H7.3V13h2.75v8h3.45z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
      <path d="M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-7.8a1.07 1.07 0 1 1-2.14 0 1.07 1.07 0 0 1 2.14 0zM21 8.9c-.05-1.45-.38-2.73-1.44-3.79-1.06-1.06-2.34-1.39-3.79-1.44C14.28 3.6 9.72 3.6 8.23 3.67c-1.44.05-2.72.38-3.78 1.44S3.06 7.45 3 8.9c-.08 1.49-.08 6.05 0 7.54.05 1.45.38 2.73 1.45 3.79 1.06 1.06 2.34 1.39 3.78 1.44 1.49.08 6.05.08 7.54 0 1.45-.05 2.73-.38 3.79-1.44 1.06-1.06 1.39-2.34 1.44-3.79.08-1.49.08-6.04 0-7.54zm-1.9 9.14a3.04 3.04 0 0 1-1.71 1.71c-1.18.47-3.99.36-5.3.36s-4.12.1-5.3-.36a3.04 3.04 0 0 1-1.71-1.71c-.47-1.18-.36-3.99-.36-5.3s-.11-4.12.36-5.3A3.04 3.04 0 0 1 6.79 5.7c1.18-.47 3.99-.36 5.3-.36s4.12-.11 5.3.36a3.04 3.04 0 0 1 1.71 1.71c.47 1.18.36 3.99.36 5.3s.11 4.12-.36 5.3z" />
    </svg>
  ),
  Twitter: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
      <path d="M17.2 3.5h3.1l-6.8 7.8 8 10.6h-6.3l-4.9-6.4-5.6 6.4H1.6l7.3-8.3L1.2 3.5h6.4l4.4 5.9 5.2-5.9zm-1.1 16.5h1.7L7.9 5.2H6.1l10 14.8z" />
    </svg>
  ),
};

export default function Footer() {
  const topCities = cities().slice(0, 6);
  const topServices = services().slice(0, 6);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-brand">
          <Image src="/logo-mark.svg" alt="" width={40} height={40} />
          <strong>{site.name}</strong>
        </div>

        <nav aria-label="Footer">
          <ul className="footer-nav">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="social">
          {[
            ["Facebook", site.social.facebook],
            ["Instagram", site.social.instagram],
            ["Twitter", site.social.twitter],
          ].map(([label, href]) => (
            <li key={label}>
              <a href={href} aria-label={label} rel="noopener noreferrer nofollow" target="_blank">
                {socialIcons[label]}
              </a>
            </li>
          ))}
        </ul>

        <div className="footer-cols">
          <div>
            <h2>Popular cities</h2>
            <ul>
              {topCities.map((city) => (
                <li key={city.citySlug}>
                  <Link href={`/find/tutoring-centers-in-${city.citySlug}`}>
                    Tutoring centers in {city.city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Popular subjects</h2>
            <ul>
              {topServices.map((service) => (
                <li key={service.slug}>
                  <Link href={`/find/${service.slug}-in-georgia`}>{service.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Explore</h2>
            <ul>
              <li><Link href="/find">Find a center</Link></li>
              <li><Link href="/counties">Browse by county</Link></li>
              <li><Link href="/partners">Partner directory</Link></li>
              <li><Link href="/reviews">Reviews</Link></li>
              <li><Link href="/costs">Costs and pricing</Link></li>
              <li><Link href="/blog">Learning blog</Link></li>
              <li><Link href="/search">Search</Link></li>
              <li><Link href="/authors">Our editorial team</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-legal">
          <p>
            {site.name} is an independent directory of tutoring and learning centers across Georgia.
            We are not affiliated with, and do not endorse, the businesses listed. Always confirm
            hours, pricing and availability directly with a center.
          </p>
          <p>
            &copy; {year} {site.name}. All rights reserved. &middot;{" "}
            <Link href="/privacy">Privacy</Link> &middot; <Link href="/terms">Terms</Link> &middot;{" "}
            <Link href="/disclaimer">Disclaimer</Link> &middot;{" "}
            <Link href="/sitemap">Sitemap</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
