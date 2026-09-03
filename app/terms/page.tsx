import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Terms of Use | Georgia Tutoring Centers",
  description:
    "Terms of use for Georgia Tutoring Centers: acceptable use, intellectual property, listing data, third-party links, disclaimers and limitation of liability.",
  path: "/terms",
});

export default function TermsPage() {
  const updated = "September 1, 2025";
  return (
    <>
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }]} />
      <section className="section">
        <div className="wrap prose">
          <span className="eyebrow">Legal</span>
          <h1>Terms of Use</h1>
          <p className="form-help">Last updated: {updated}</p>
          <p className="lede">
            By using {site.domain} you agree to these terms. If you do not agree, please do not use
            the site.
          </p>

          <h2>What this site is</h2>
          <p>
            {site.name} is an independent directory of tutoring and learning centers in Georgia. We
            publish business information and editorial guidance. We do not provide tutoring, do not
            broker enrollments and are not a party to any agreement between you and a center.
          </p>

          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Scrape, harvest or bulk-copy listing data for republication or resale</li>
            <li>Attempt to gain unauthorized access to the site, its servers or its data</li>
            <li>Probe, scan or test the vulnerability of the site without written permission</li>
            <li>Interfere with the site&apos;s operation, including through automated overload</li>
            <li>Submit false, misleading, abusive or unlawful information through our forms</li>
            <li>Use the site or its content in a way that violates any applicable law</li>
          </ul>

          <h2>Intellectual property</h2>
          <p>
            The design, editorial content, guides, cost analysis and compilation of listings on this
            site are owned by {site.name} and protected by applicable law. Business names, logos and
            trademarks belong to their respective owners and are used for identification only. You
            may link to our pages freely. You may not republish substantial portions of the site
            without written permission.
          </p>

          <h2>Listing information</h2>
          <p>
            Listings are compiled from public sources and provided without warranty of accuracy or
            completeness. See our <Link href="/disclaimer">disclaimer</Link> for full detail.
            Business owners may request corrections or removal through the{" "}
            <Link href="/contact">contact page</Link>.
          </p>

          <h2>Third-party links and advertising</h2>
          <p>
            The site contains links to third-party sites and displays third-party advertising. We do
            not control and are not responsible for third-party content, products, services or
            privacy practices. Any dealings with a third party are solely between you and that
            party.
          </p>

          <h2>No warranty</h2>
          <p>
            The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, express or implied, including merchantability, fitness for a
            particular purpose, accuracy and non-infringement. We do not warrant uninterrupted or
            error-free operation.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, {site.name} and its operators are not liable for
            any indirect, incidental, special, consequential or punitive damages, or any loss of
            data, opportunity or profit, arising out of your use of the site or reliance on its
            content, including any decision to contact or enroll with a tutoring provider.
          </p>

          <h2>Indemnity</h2>
          <p>
            You agree to indemnify and hold harmless {site.name} from claims arising out of your
            misuse of the site or violation of these terms.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms as the site evolves. Continued use after an update means you
            accept the revised terms. The date at the top of this page reflects the current version.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of the State of Georgia, United States, without
            regard to conflict of law principles.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms: <a href={`mailto:${site.email}`}>{site.email}</a> or the{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
