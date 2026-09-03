import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Disclaimer | Georgia Tutoring Centers",
  description:
    "Disclaimer for Georgia Tutoring Centers: listing accuracy, no endorsement of listed businesses, no professional advice, and third-party links.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  const updated = "September 1, 2025";
  return (
    <>
      <Breadcrumbs
        trail={[{ name: "Home", path: "/" }, { name: "Disclaimer", path: "/disclaimer" }]}
      />
      <section className="section">
        <div className="wrap prose">
          <span className="eyebrow">Legal</span>
          <h1>Disclaimer</h1>
          <p className="form-help">Last updated: {updated}</p>

          <h2>Information only</h2>
          <p>
            Everything published on {site.domain} is provided for general information. It is not
            educational, legal, financial, medical or professional advice, and it should not be
            relied on as a substitute for advice from a qualified professional who knows your
            child&apos;s situation.
          </p>

          <h2>Listing accuracy</h2>
          <p>
            Business listings are compiled from public data sources and normalised for comparison.
            Hours of operation, phone numbers, websites, pricing, program offerings, ratings and
            review counts change frequently and may be out of date or incomplete at any moment. We
            make no warranty that any listing is accurate, current or complete. Always verify
            details directly with a center before making a decision or traveling to a location.
          </p>

          <h2>No endorsement</h2>
          <p>
            A listing on this site is not an endorsement, recommendation, certification or guarantee
            of a business, its instructors, its curriculum or its results. We are not affiliated
            with the businesses listed unless expressly stated. We do not verify instructor
            credentials, background checks, licensing or insurance. Ranking positions reflect
            publicly reported rating and review data only.
          </p>

          <h2>Pricing figures</h2>
          <p>
            Price ranges published in our <Link href="/costs">cost guides</Link> are general market
            estimates for Georgia, gathered from published rates and typical market patterns. They
            are not quotes. Actual pricing varies by center, program, instructor and location. Get a
            written quote from any provider before committing.
          </p>

          <h2>Third-party links</h2>
          <p>
            This site links to third-party websites we do not control. We are not responsible for
            the content, accuracy, privacy practices or availability of those sites. Following an
            external link is at your own risk.
          </p>

          <h2>Advertising</h2>
          <p>
            This site displays advertising, including Google AdSense. Advertisements are served by
            third parties and do not constitute an endorsement by us. Advertising revenue does not
            influence which businesses are listed or how they are ranked.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, {site.name} is not liable for any loss or damage
            arising from your use of this site or from any decision made in reliance on information
            published here, including choosing, contacting or enrolling with any tutoring provider.
          </p>

          <h2>Corrections</h2>
          <p>
            If something here is wrong, tell us and we will fix it. Use the{" "}
            <Link href="/contact">contact page</Link> or email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>. See also our{" "}
            <Link href="/terms">terms of use</Link> and{" "}
            <Link href="/privacy">privacy policy</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
