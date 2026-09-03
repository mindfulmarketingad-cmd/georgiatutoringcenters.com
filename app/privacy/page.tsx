import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy | Georgia Tutoring Centers",
  description:
    "Privacy policy for Georgia Tutoring Centers: what data we collect, how location and advertising cookies work, third-party advertising, and your choices.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const updated = "September 1, 2025";
  return (
    <>
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }]} />
      <section className="section">
        <div className="wrap prose">
          <span className="eyebrow">Legal</span>
          <h1>Privacy Policy</h1>
          <p className="form-help">Last updated: {updated}</p>
          <p className="lede">
            This policy explains what {site.name} collects when you use {site.domain}, why, and what
            control you have. The short version: we do not require an account, we do not sell
            personal information, and your location never leaves your browser.
          </p>

          <h2>Information you give us</h2>
          <p>
            If you send a message through our <Link href="/contact">contact page</Link>, we receive
            the name, email address, topic and message you submit. We use that information only to
            respond to you and to correct or add listings. We do not add you to a marketing list and
            we do not sell or rent it.
          </p>

          <h2>Location data</h2>
          <p>
            The &ldquo;centers near me&rdquo; feature on our homepage uses your browser&apos;s
            geolocation API, and only after you press the button and grant permission. Your
            coordinates are used in your browser to sort listings by distance. They are not
            transmitted to our servers, not stored, and not shared with anyone. Denying or ignoring
            the permission prompt simply shows the highest rated centers statewide instead.
          </p>

          <h2>Information collected automatically</h2>
          <p>
            Our hosting provider processes standard server request data, such as IP address, browser
            type and the pages requested, for security, abuse prevention and reliability. Contact
            form submissions are rate limited by IP address to prevent spam.
          </p>

          <h2>Cookies and advertising</h2>
          <p>
            This site displays advertising through Google AdSense. Third-party vendors, including
            Google, use cookies to serve ads based on a user&apos;s prior visits to this and other
            websites. Google&apos;s use of advertising cookies enables it and its partners to serve
            ads to you based on your visit to this site and other sites on the internet.
          </p>
          <ul>
            <li>
              You can opt out of personalised advertising through{" "}
              <a
                href="https://www.google.com/settings/ads"
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                Google Ads Settings
              </a>
              .
            </li>
            <li>
              You can opt out of some third-party vendor cookies at{" "}
              <a
                href="https://www.aboutads.info/choices/"
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                aboutads.info/choices
              </a>
              .
            </li>
            <li>Your browser settings let you block or delete cookies at any time.</li>
          </ul>
          <p>
            Third-party advertising partners have their own privacy policies, which govern their
            handling of the data they collect. We do not control those cookies and we do not receive
            the personal data they process.
          </p>

          <h2>Maps</h2>
          <p>
            Map views load map tiles from OpenStreetMap. When a map is displayed, your browser
            requests those tile images directly from the OpenStreetMap tile servers, which will see
            your IP address as part of that request. Maps are only loaded when you choose to open a
            map view.
          </p>

          <h2>Children&apos;s privacy</h2>
          <p>
            This site is written for parents and guardians. It is not directed at children under 13
            and we do not knowingly collect personal information from children. If you believe a
            child has sent us personal information, contact us and we will delete it.
          </p>

          <h2>How long we keep information</h2>
          <p>
            Contact messages are kept only as long as needed to handle the request and any
            reasonable follow-up. Server logs are retained for a limited period by our hosting
            provider for security and diagnostics.
          </p>

          <h2>Your choices and rights</h2>
          <p>
            You can ask us what personal information we hold about you, ask for it to be corrected,
            or ask for it to be deleted, by emailing{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>. Depending on where you live, you may
            have additional rights under applicable privacy laws, including the right to opt out of
            the sale or sharing of personal information. We do not sell or share personal
            information as those terms are commonly defined.
          </p>

          <h2>Security</h2>
          <p>
            The site is served over HTTPS with a strict content security policy and standard
            security headers. No system is perfectly secure, but we do not store payment details,
            passwords or accounts, which keeps the amount of sensitive data on this site close to
            zero.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy as the site changes. The date at the top of this page always
            reflects the current version.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about privacy: <a href={`mailto:${site.email}`}>{site.email}</a>, or use the{" "}
            <Link href="/contact">contact page</Link>. See also our{" "}
            <Link href="/terms">terms of use</Link> and{" "}
            <Link href="/disclaimer">disclaimer</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
