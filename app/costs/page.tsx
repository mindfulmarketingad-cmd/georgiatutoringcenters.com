import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import { photos } from "@/lib/photos";
import LinkList from "@/components/LinkList";
import Faqs from "@/components/Faqs";
import { costGuides } from "@/lib/content/costs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Tutoring Costs in Georgia | Hourly Rates and Monthly Pricing",
  description:
    "What tutoring costs in Georgia: hourly rates, learning center memberships, test prep packages and online tutoring pricing, broken down by subject and format.",
  path: "/costs",
});

export default function CostsHub() {
  return (
    <>
      <PageBanner
        title="How Much Does Tutoring Cost in Georgia?"
        eyebrow="Costs hub"
        image={photos[2].banner}
        alt={photos[2].alt}
        priority
      >
        <ul className="banner-facts">
          <li>$40 - $80 per hour in small groups</li>
          <li>$60 - $120 one-to-one</li>
          <li>{costGuides.length} cost guides</li>
        </ul>
      </PageBanner>

      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Costs", path: "/costs" }]} />

      <section className="section">
        <div className="wrap">
          <p className="lede">
            Tutoring prices in Georgia vary more by format than by city. Small-group instruction at
            a center commonly runs $40 to $80 per hour, one-to-one runs $60 to $120, and monthly
            learning center memberships land between $150 and $500. The guides below break each
            format down so you can tell a fair quote from an inflated one.
          </p>

          <div className="table-scroll">
            <table className="data-table">
              <caption className="form-help">
                Typical Georgia tutoring price ranges. Always confirm current pricing with the
                center.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Format</th>
                  <th scope="col">Typical range</th>
                  <th scope="col">Best for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Small group at a center</td>
                  <td>$40 - $80 per hour</td>
                  <td>Students close to grade level</td>
                </tr>
                <tr>
                  <td>One-to-one instruction</td>
                  <td>$60 - $120 per hour</td>
                  <td>Large gaps, anxiety, advanced courses</td>
                </tr>
                <tr>
                  <td>Monthly learning center membership</td>
                  <td>$150 - $500 per month</td>
                  <td>Year-long steady support</td>
                </tr>
                <tr>
                  <td>Group SAT or ACT course</td>
                  <td>$300 - $1,200 total</td>
                  <td>Structured test preparation</td>
                </tr>
                <tr>
                  <td>Online tutoring</td>
                  <td>$25 - $90 per hour</td>
                  <td>Flexible scheduling, specialist subjects</td>
                </tr>
                <tr>
                  <td>Specialized learning-difference support</td>
                  <td>$60 - $150 per hour</td>
                  <td>Dyslexia, ADHD, structured literacy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>Cost guides</h2>
          <LinkList
            items={costGuides.map((guide) => ({
              href: `/costs/${guide.slug}`,
              label: guide.title,
              note: guide.quickAnswer.replace(/^([^.]+\.).*$/s, "$1"),
            }))}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>How to compare two quotes fairly</h2>
          <p>
            Divide every quote by the instructional hours it actually includes. A $300 monthly
            membership with four forty-five-minute sessions costs $100 an hour, which is more than
            most one-to-one rates. The same $300 across eight full hours is excellent value. Ask for
            the total first-month cost, including registration, assessment and materials fees,
            before you compare anything.
          </p>
          <p>
            Once you know your budget, use the <Link href="/find">Find hub</Link> to shortlist
            centers near you and the <Link href="/reviews">Reviews hub</Link> to check how families
            rate them.
          </p>

          <Faqs
            faqs={[
              {
                q: "Is tutoring more expensive in metro Atlanta?",
                a: "Generally yes. Rates in metro Atlanta and the northern suburbs usually run above the ranges seen in smaller Georgia markets, though online options narrow the gap.",
              },
              {
                q: "Do tutoring centers offer discounts?",
                a: "Sibling discounts, prepaid package rates and summer promotions are all common. Ask directly, because they are rarely advertised.",
              },
              {
                q: "Is tutoring tax deductible in Georgia?",
                a: "Ordinary academic tutoring generally is not deductible as a personal expense. Rules around education-related credits and special-needs services are specific and change, so check with a tax professional about your situation.",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
