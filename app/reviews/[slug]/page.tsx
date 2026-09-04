import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import LinkList from "@/components/LinkList";
import PageBanner from "@/components/PageBanner";
import Faqs from "@/components/Faqs";
import Stars from "@/components/Stars";
import SampleNotice from "@/components/SampleNotice";
import JsonLd from "@/components/JsonLd";
import { getListing, listings, relatedListings } from "@/lib/listings";
import { listingSchema, pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = getListing(slug);
  if (!listing) {
    return pageMeta({ title: "Not found", description: "", path: `/reviews/${slug}`, noindex: true });
  }
  return pageMeta({
    title: `${listing.name} Reviews | ${listing.city}, GA Tutoring Center`,
    description: `${listing.name} in ${listing.city}, Georgia holds a ${listing.rating || "n/a"} rating from ${listing.reviewCount} reviews. See how it compares and what to ask before enrolling.`,
    path: `/reviews/${listing.slug}`,
  });
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getListing(slug);
  if (!listing) notFound();

  const cityPeers = listings.filter(
    (l) => l.citySlug === listing.citySlug && l.slug !== listing.slug
  );
  const cityAverage = cityPeers.length
    ? Number(
        (
          cityPeers.reduce((sum, l) => sum + l.rating, 0) / cityPeers.filter((l) => l.rating).length
        ).toFixed(2)
      )
    : 0;
  const related = relatedListings(listing, 4);
  const photo = listing.photo || listing.streetView;

  return (
    <>
      <PageBanner
        title={`${listing.name} Reviews`}
        eyebrow="Review summary"
        image={photo}
        alt={photo ? `${listing.name} in ${listing.city}, Georgia` : ""}
        priority
      >
        <ul className="banner-facts">
          <li>{listing.rating ? `${listing.rating} out of 5` : "Not yet rated"}</li>
          <li>{listing.reviewCount.toLocaleString()} reviews</li>
          <li>{listing.city}, GA</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Reviews", path: "/reviews" },
          { name: `${listing.name} reviews`, path: `/reviews/${listing.slug}` },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <Stars rating={listing.rating} reviewCount={listing.reviewCount} />
          <p className="lede" style={{ marginTop: "0.8rem" }}>
            {listing.name} is a {listing.category.toLowerCase()} in {listing.city}, Georgia
            {listing.rating
              ? `, currently rated ${listing.rating} out of 5 from ${listing.reviewCount.toLocaleString()} public reviews.`
              : ". It does not yet have enough public reviews for a rating."}
          </p>
          <SampleNotice />

          <div className="stat-row">
            <div className="stat">
              <b>{listing.rating || "n/a"}</b>
              <span>Star rating</span>
            </div>
            <div className="stat">
              <b>{listing.reviewCount.toLocaleString()}</b>
              <span>Reviews</span>
            </div>
            <div className="stat">
              <b>{cityAverage || "n/a"}</b>
              <span>{listing.city} average</span>
            </div>
            <div className="stat">
              <b>{listing.photosCount}</b>
              <span>Photos on file</span>
            </div>
          </div>

          <div className="listicle-actions">
            <Link className="btn" href={`/partners/${listing.slug}`}>
              Full center profile
            </Link>
            {listing.reviewsLink && (
              <a
                className="btn btn--ghost"
                href={listing.reviewsLink}
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                Read the reviews
              </a>
            )}
            <Link className="btn btn--ghost" href={`/find/tutoring-centers-in-${listing.citySlug}`}>
              Compare in {listing.city}
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap prose">
          <h2>How {listing.name} compares in {listing.city}</h2>
          <p>
            {cityPeers.length
              ? `We list ${cityPeers.length + 1} tutoring centers in ${listing.city}. The city average rating is ${cityAverage || "not established"}, so ${listing.name} sits ${
                  listing.rating > cityAverage ? "above" : listing.rating === cityAverage ? "at" : "below"
                } the local average.`
              : `${listing.name} is currently the only tutoring center we list in ${listing.city}, so there is no local average to compare against yet.`}
          </p>
          <p>
            Rating alone is not a verdict. Review volume, how recent the reviews are, and whether
            complaints repeat matter more than a tenth of a star. Read the three-star reviews first.
          </p>

          <h2>What to verify before enrolling</h2>
          <ul>
            <li>Whether the instructor named in the reviews still works there</li>
            <li>The current student-to-instructor ratio in your preferred time slot</li>
            <li>The total first-month cost, including registration and materials fees</li>
            <li>The cancellation and makeup-session policy in writing</li>
            <li>How progress is measured and reported to parents</li>
          </ul>

          {related.length > 0 && (
            <>
              <h2>Compare with similar centers</h2>
              <LinkList
                items={related.map((item) => ({
                  href: `/reviews/${item.slug}`,
                  label: `${item.name} reviews`,
                  note: `${item.city}, GA${item.rating ? `, ${item.rating} out of 5 from ${item.reviewCount.toLocaleString()} reviews` : ", not yet rated"}`,
                }))}
              />
            </>
          )}

          <p style={{ marginTop: "1.6rem" }}>
            <Link className="btn btn--ghost" href="/reviews">
              Back to the Reviews hub
            </Link>{" "}
            <Link className="btn btn--ghost" href="/">
              Back to home
            </Link>
          </p>

          <Faqs
            faqs={[
              {
                q: `Is ${listing.name} well reviewed?`,
                a: listing.rating
                  ? `${listing.name} holds ${listing.rating} out of 5 from ${listing.reviewCount.toLocaleString()} public reviews${cityAverage ? `, against a ${listing.city} average of ${cityAverage}` : ""}.`
                  : `${listing.name} does not yet have enough public reviews to establish a rating.`,
              },
              {
                q: "Do you collect your own reviews?",
                a: "No. We compile public rating and review-count data so centers can be compared on equal footing, and we link out to the source where available.",
              },
              {
                q: "How current is this rating?",
                a: "Ratings are refreshed on a rolling basis as listing data is re-imported. Check the center's own listing for the live count before making a decision.",
              },
            ]}
          />
        </div>
      </section>

      <JsonLd data={listingSchema(listing)} />
    </>
  );
}
