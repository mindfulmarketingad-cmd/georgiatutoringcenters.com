import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import { photos } from "@/lib/photos";
import Faqs from "@/components/Faqs";
import Stars from "@/components/Stars";
import SampleNotice from "@/components/SampleNotice";
import JsonLd from "@/components/JsonLd";
import { averageRating, listings, topRated, totalReviews } from "@/lib/listings";
import { itemListSchema, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Georgia Tutoring Center Reviews | Ratings and Review Counts",
  description:
    "Compare Georgia tutoring center reviews: star ratings, review counts and how to read them. See which learning centers families rate highest across the state.",
  path: "/reviews",
});

export default function ReviewsHub() {
  const ranked = [...listings].sort(
    (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount
  );
  const mostReviewed = [...listings].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8);

  return (
    <>
      <PageBanner
        title="Georgia Tutoring Center Reviews"
        eyebrow="Reviews hub"
        image={photos[1].banner}
        alt={photos[1].alt}
        priority
      >
        <ul className="banner-facts">
          <li>{averageRating()} average rating</li>
          <li>{totalReviews().toLocaleString()} reviews counted</li>
          <li>{listings.filter((l) => l.rating >= 4.5).length} centers rated 4.5+</li>
        </ul>
      </PageBanner>

      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Reviews", path: "/reviews" }]} />

      <section className="section">
        <div className="wrap">
          <p className="lede">
            Ratings and review counts for every tutoring center in the directory, plus what those
            numbers actually tell you. A high rating from six reviews is a weaker signal than a
            slightly lower rating from three hundred.
          </p>
          <SampleNotice />

          <div className="stat-row">
            <div className="stat">
              <b>{averageRating()}</b>
              <span>Average rating</span>
            </div>
            <div className="stat">
              <b>{totalReviews().toLocaleString()}</b>
              <span>Reviews counted</span>
            </div>
            <div className="stat">
              <b>{listings.filter((l) => l.rating >= 4.5).length}</b>
              <span>Centers rated 4.5+</span>
            </div>
            <div className="stat">
              <b>{listings.length}</b>
              <span>Centers reviewed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>Highest rated tutoring centers in Georgia</h2>
          <p className="lede">Ranked by star rating, then by review volume.</p>
          <ol className="listicle" style={{ marginTop: "1.4rem" }}>
            {ranked.slice(0, 20).map((listing, index) => (
              <li className="listicle-item is-in" key={listing.slug}>
                <div className="listicle-head">
                  <span className="rank" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="listicle-title">
                      <Link href={`/reviews/${listing.slug}`}>{listing.name}</Link>
                    </h3>
                    <p className="listicle-sub">
                      {listing.category} &middot; {listing.city}, GA
                    </p>
                    <Stars rating={listing.rating} reviewCount={listing.reviewCount} />
                    <p style={{ margin: "0.6rem 0 0" }}>
                      <Link className="btn btn--sm" href={`/reviews/${listing.slug}`}>
                        Review details
                      </Link>{" "}
                      <Link className="btn btn--ghost btn--sm" href={`/partners/${listing.slug}`}>
                        Full profile
                      </Link>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>Most reviewed centers</h2>
          <ul>
            {mostReviewed.map((listing) => (
              <li key={listing.slug}>
                <Link href={`/reviews/${listing.slug}`}>{listing.name}</Link> &mdash;{" "}
                {listing.reviewCount.toLocaleString()} reviews, {listing.rating} stars
              </li>
            ))}
          </ul>

          <h2>How to read tutoring center reviews</h2>
          <p>
            Review counts matter more than the average. Ten reviews cannot tell you much; two
            hundred can. Read the three-star reviews first, since they tend to be the most specific,
            and look for patterns rather than individual complaints. Repeated mentions of instructor
            turnover, billing surprises or scheduling problems are worth taking seriously; a single
            angry review about a cancelled session usually is not.
          </p>
          <p>
            Reviews also skew toward the beginning and end of a relationship. Families rarely post
            in month four, which is exactly when tutoring either works or does not. That is why we
            pair review data with our <Link href="/costs">cost guides</Link> and the questions in
            our <Link href="/blog">learning blog</Link>.
          </p>

          <Faqs
            faqs={[
              {
                q: "Where do these ratings come from?",
                a: "Ratings and review counts are compiled from public business data for each center and refreshed on a rolling basis. We do not host or collect our own reviews.",
              },
              {
                q: "Is a 5.0 rating better than a 4.6?",
                a: "Not necessarily. A 4.6 from three hundred families is a far stronger signal than a 5.0 from five. Look at rating and volume together.",
              },
              {
                q: "Can a center remove a bad review from this site?",
                a: "No. We publish the aggregate rating and review count as compiled. Owners can request a factual correction to their business details through the contact page.",
              },
            ]}
          />
        </div>
      </section>

      <JsonLd data={itemListSchema(topRated(20), "/reviews", "Highest rated Georgia tutoring centers")} />
    </>
  );
}
