import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import { photos } from "@/lib/photos";
import Faqs from "@/components/Faqs";
import { cities, listings } from "@/lib/listings";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "About Georgia Tutoring Centers | Our Directory and Editorial Policy",
  description:
    "About Georgia Tutoring Centers: who we are, how listings are compiled and ranked, how the site is funded, and how families and business owners can work with us.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="About Georgia Tutoring Centers"
        eyebrow="About us"
        image={photos[0].banner}
        alt={photos[0].alt}
        priority
      >
        <ul className="banner-facts">
          <li>{listings.length} centers listed</li>
          <li>{cities().length} cities covered</li>
          <li>Free for families</li>
        </ul>
      </PageBanner>

      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />

      <section className="section">
        <div className="wrap prose">
          <p className="lede">
            Georgia Tutoring Centers is an independent directory of tutoring and learning centers
            across the state. We exist to make one specific task easier: comparing real options for
            your child, on the same set of facts, without a sales pitch in the middle.
          </p>


          <h2>What We Do</h2>
          <p>
            We compile public business data for tutoring and learning centers operating in Georgia,
            normalise it into one consistent format, and publish it as numbered, comparable
            listings. Every center page carries the same fields: address, hours of operation, phone
            number, website, category, programs, price range where published, star rating and review
            count. Consistency is the product. When every center is described the same way, a parent
            can actually compare them.
          </p>
          <p>
            Around the listings we publish city guides, subject guides, cost breakdowns and
            practical articles for parents. Those pages exist to answer the questions that come
            before a phone call: what does this cost, what should I ask, and how do I tell a good
            program from an expensive one.
          </p>

          <h2>What We Are Not</h2>
          <p>
            We are not a tutoring company. We do not employ tutors, we do not sell instruction, and
            we do not take a commission on enrollments. We are not affiliated with the centers
            listed here, and a listing is not an endorsement. Every family should verify hours,
            pricing, credentials and availability directly with a center before enrolling.
          </p>

          <h2>How Listings Are Ranked</h2>
          <p>
            Our listicles rank centers using star rating and review volume together, so a perfect
            rating from a handful of reviews does not outrank a strong rating from hundreds.
            Centers cannot pay for placement, and no ranking factor is for sale. Where a page ranks
            by a different rule, such as most reviewed, the page says so.
          </p>

          <h2>How We Are Funded</h2>
          <p>
            The site is supported by advertising, including Google AdSense. Advertising revenue has
            no influence on which centers are listed or how they rank. See our{" "}
            <Link href="/privacy">privacy policy</Link> for how advertising cookies work and our{" "}
            <Link href="/disclaimer">disclaimer</Link> for the limits of the information published
            here.
          </p>

          <h2>Who Writes for the Site</h2>
          <p>
            Every guide and cost page carries a byline linking to that editor&apos;s profile, with
            what they cover and everything else they have written. See the{" "}
            <Link href="/authors">editorial team page</Link> for the full list.
          </p>

          <h2>Corrections and Updates</h2>
          <p>
            Business hours, phone numbers and ownership change constantly. If something on this site
            is wrong, tell us and we will fix it. Business owners can request a correction, an
            update or a new listing through the <Link href="/contact">contact page</Link>. Include
            the business name and address so we can match it to the right record.
          </p>

          <h2>Start Browsing</h2>
          <p>
            Begin with the <Link href="/find">Find hub</Link> for your city or subject, the{" "}
            <Link href="/partners">partner directory</Link> for the complete list, the{" "}
            <Link href="/reviews">Reviews hub</Link> for ratings, the{" "}
            <Link href="/costs">Costs hub</Link> for pricing, or the{" "}
            <Link href="/blog">learning blog</Link> for guides. Everything is free and nothing
            requires an account.
          </p>

          <Faqs
            faqs={[
              {
                q: "Who runs Georgia Tutoring Centers?",
                a: `The site is run by a small independent editorial team focused on education directories. Reach us at ${site.email} or through the contact page.`,
              },
              {
                q: "Is the directory free for families?",
                a: "Yes, entirely. There is no account, no fee and no lead form standing between you and a center's own phone number.",
              },
              {
                q: "How do you decide which centers to include?",
                a: "We include tutoring centers, learning centers and educational support businesses that serve students in Georgia and have verifiable public business details.",
              },
              {
                q: "Do you verify credentials?",
                a: "We publish the business details as compiled and do not certify instructor credentials. Ask each center directly about the qualifications of the person who will teach your child.",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
