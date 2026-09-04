import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import LinkList from "@/components/LinkList";
import PageBanner from "@/components/PageBanner";
import Faqs from "@/components/Faqs";
import Stars from "@/components/Stars";
import MapView from "@/components/MapView";
import SampleNotice from "@/components/SampleNotice";
import JsonLd from "@/components/JsonLd";
import { formatPhoneHref, getListing, listings, relatedListings } from "@/lib/listings";
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
    return pageMeta({ title: "Not found", description: "", path: `/partners/${slug}`, noindex: true });
  }
  return pageMeta({
    title: `${listing.name} | Tutoring Center in ${listing.city}, GA`,
    description: `${listing.name} is a ${listing.category.toLowerCase()} in ${listing.city}, Georgia. Hours, phone number, address, programs and ${listing.reviewCount} reviews.`,
    path: `/partners/${listing.slug}`,
  });
}

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getListing(slug);
  if (!listing) notFound();

  const related = relatedListings(listing, 6);
  const openDays = listing.hours.filter((h) => h.hours && !/closed/i.test(h.hours));
  const photo = listing.photo || listing.streetView;

  return (
    <>
      <PageBanner
        title={listing.name}
        eyebrow={listing.category}
        image={photo}
        alt={photo ? `${listing.name} in ${listing.city}, Georgia` : ""}
        priority
      >
        <ul className="banner-facts">
          <li>{listing.city}, GA</li>
          <li>
            {listing.rating
              ? `${listing.rating} out of 5 from ${listing.reviewCount.toLocaleString()} reviews`
              : "Not yet rated"}
          </li>
          {listing.priceRange ? <li>{listing.priceRange}</li> : null}
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Partners", path: "/partners" },
          { name: listing.name, path: `/partners/${listing.slug}` },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <Stars rating={listing.rating} reviewCount={listing.reviewCount} />
          <p className="lede" style={{ marginTop: "0.8rem" }}>
            {listing.about ||
              `${listing.name} is a ${listing.category.toLowerCase()} serving families in ${listing.city}, Georgia.`}
          </p>
          <SampleNotice />

          <div className="listicle-actions">
            {listing.bookingLink && (
              <a
                className="btn"
                href={listing.bookingLink}
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                Book an appointment
              </a>
            )}
            {listing.phone && (
              <a className="btn" href={formatPhoneHref(listing.phone)}>
                Call {listing.phone}
              </a>
            )}
            {listing.website && (
              <a
                className="btn btn--ghost"
                href={listing.website}
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                Visit website
              </a>
            )}
            <Link className="btn btn--ghost" href={`/reviews/${listing.slug}`}>
              Read reviews
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>Center Details</h2>
          <div className="table-scroll">
            <table className="data-table">
              <caption className="form-help">
                Business details for {listing.name}. Confirm directly with the center before
                visiting.
              </caption>
              <tbody>
                <tr>
                  <th scope="row">Business name</th>
                  <td>{listing.name}</td>
                </tr>
                <tr>
                  <th scope="row">Category</th>
                  <td>{listing.category}</td>
                </tr>
                {listing.subtypes.length > 0 && (
                  <tr>
                    <th scope="row">Programs</th>
                    <td>{listing.subtypes.join(", ")}</td>
                  </tr>
                )}
                <tr>
                  <th scope="row">Address</th>
                  <td>{listing.fullAddress || `${listing.city}, GA`}</td>
                </tr>
                <tr>
                  <th scope="row">City</th>
                  <td>
                    <Link href={`/find/tutoring-centers-in-${listing.citySlug}`}>
                      {listing.city}, Georgia
                    </Link>
                  </td>
                </tr>
                {listing.phone && (
                  <tr>
                    <th scope="row">Phone</th>
                    <td>
                      <a href={formatPhoneHref(listing.phone)}>{listing.phone}</a>
                    </td>
                  </tr>
                )}
                {listing.website && (
                  <tr>
                    <th scope="row">Website</th>
                    <td>
                      <a href={listing.website} rel="noopener noreferrer nofollow" target="_blank">
                        {listing.website.replace(/^https?:\/\//, "")}
                      </a>
                    </td>
                  </tr>
                )}
                <tr>
                  <th scope="row">Rating</th>
                  <td>
                    {listing.rating ? `${listing.rating} out of 5` : "Not rated yet"}
                    {listing.reviewCount ? ` (${listing.reviewCount.toLocaleString()} reviews)` : ""}
                  </td>
                </tr>
                {listing.priceRange && (
                  <tr>
                    <th scope="row">Price range</th>
                    <td>{listing.priceRange}</td>
                  </tr>
                )}
                <tr>
                  <th scope="row">Status</th>
                  <td>{listing.businessStatus === "OPERATIONAL" ? "Open for business" : listing.businessStatus}</td>
                </tr>
                {listing.photosCount > 0 && (
                  <tr>
                    <th scope="row">Photos on file</th>
                    <td>{listing.photosCount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {listing.hours.length > 0 && (
            <>
              <h2>Hours of Operation</h2>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Day</th>
                      <th scope="col">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listing.hours.map((hour) => (
                      <tr key={hour.day}>
                        <th scope="row">{hour.day}</th>
                        <td>{hour.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="form-help">
                Open {openDays.length} {openDays.length === 1 ? "day" : "days"} a week. Hours change
                seasonally, so call ahead.
              </p>
            </>
          )}

          {listing.attributes.length > 0 && (
            <>
              <h2>Features and Amenities</h2>
              <p className="form-help">
                Reported by the business on its public map listing.
              </p>
              <div className="attribute-groups">
                {listing.attributes.map((group) => (
                  <div key={group.group}>
                    <h3>{group.group}</h3>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}

          {listing.latitude != null && listing.longitude != null && (
            <>
              <h2>Location</h2>
              <MapView listings={[listing]} title={listing.name} />
            </>
          )}
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>What to Ask {listing.name}</h2>
          <ul>
            <li>What does the intake assessment measure, and how long does it take?</li>
            <li>Will my child work with the same instructor every week?</li>
            <li>What is the student-to-instructor ratio in our time slot?</li>
            <li>What is the total first-month cost, including registration and materials?</li>
            <li>How will progress be reported to me, and how often?</li>
          </ul>
          <p>
            Compare the answers against the going rates in our{" "}
            <Link href="/costs">Georgia tutoring cost guides</Link>, and read{" "}
            <Link href="/blog/how-to-choose-a-tutoring-center-in-georgia">
              our full checklist for choosing a tutoring center
            </Link>{" "}
            before you enroll.
          </p>

          {related.length > 0 && (
            <>
              <h2>Similar Centers</h2>
              <LinkList
                items={related.map((item) => ({
                  href: `/partners/${item.slug}`,
                  label: item.name,
                  note: `${item.category} in ${item.city}${item.rating ? `, ${item.rating} stars` : ""}`,
                }))}
              />
            </>
          )}

          <p style={{ marginTop: "1.6rem" }}>
            <Link className="btn btn--ghost" href="/partners">
              Back to the partner directory
            </Link>{" "}
            <Link className="btn btn--ghost" href={`/find/tutoring-centers-in-${listing.citySlug}`}>
              All centers in {listing.city}
            </Link>
          </p>

          <Faqs
            faqs={[
              {
                q: `Where is ${listing.name} located?`,
                a: `${listing.name} is located at ${listing.fullAddress || `${listing.city}, Georgia`}.`,
              },
              {
                q: `What are ${listing.name}'s hours?`,
                a: listing.hours.length
                  ? `Published hours are: ${listing.hours.map((h) => `${h.day} ${h.hours}`).join("; ")}. Confirm before visiting.`
                  : "Published hours are not available for this center. Call ahead to confirm availability.",
              },
              {
                q: `How is ${listing.name} rated?`,
                a: listing.rating
                  ? `${listing.name} holds a ${listing.rating} out of 5 rating from ${listing.reviewCount.toLocaleString()} reviews.`
                  : "This center does not have enough reviews yet for a rating.",
              },
            ]}
          />
        </div>
      </section>

      <JsonLd data={listingSchema(listing)} />
    </>
  );
}
