import Link from "next/link";
import type { Metadata } from "next";
import HeroCarousel from "@/components/HeroCarousel";
import PageBanner from "@/components/PageBanner";
import ContentPhoto from "@/components/ContentPhoto";
import HubGrid from "@/components/HubGrid";
import Listicle from "@/components/Listicle";
import LinkList from "@/components/LinkList";
import Faqs from "@/components/Faqs";
import SearchForm from "@/components/SearchForm";
import SampleNotice from "@/components/SampleNotice";
import JsonLd from "@/components/JsonLd";
import { averageRating, cities, listings, services, topRated, totalReviews } from "@/lib/listings";
import { itemListSchema, pageMeta } from "@/lib/seo";
import { blogPosts } from "@/lib/content/blog";
import { costGuides } from "@/lib/content/costs";
import type { Faq } from "@/lib/content/types";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Georgia Tutoring & Learning Centers | Test Prep, Math Tutoring and More",
    description:
      "Free directory of Georgia tutoring and learning centers. Compare math tutoring, reading help, test prep and STEM programs by city, hours, ratings and cost.",
    path: "/",
  }),
};

const faqs: Faq[] = [
  {
    q: "What is the best tutoring center in Georgia?",
    a: "There is no single best center, because the right fit depends on the subject, your child's grade level and how far you can reasonably drive. Start with our city pages, compare ratings and review counts, then shortlist two or three centers and ask each the same questions about assessment, instructor credentials and total monthly cost.",
  },
  {
    q: "How much does tutoring cost in Georgia?",
    a: "Small-group instruction at a center typically runs $40 to $80 per hour, one-to-one tutoring runs $60 to $120 per hour, and monthly learning center memberships commonly land between $150 and $500. Our cost guides break the ranges down by subject and format.",
  },
  {
    q: "Is Georgia Tutoring Centers free to use?",
    a: "Yes. Browsing, comparing and contacting centers through this directory is free for families. The site is supported by advertising.",
  },
  {
    q: "How do I find tutoring centers near me?",
    a: "Use the carousel at the top of this page and allow location access to sort centers by distance, or open the Find hub and choose your city. Every listing shows the address, hours, phone number and a map pin.",
  },
  {
    q: "Do these centers offer online tutoring?",
    a: "Many do. Look for the online tutoring tag on a listing, or browse the online tutoring page under Find. Online sessions are common for middle school, high school and test prep.",
  },
  {
    q: "How are listings added to this directory?",
    a: "Listings are compiled from public business data, then normalised into a single format so hours, ratings, review counts and contact details can be compared side by side. Business owners can request an update or correction through our contact page.",
  },
  {
    q: "Can a tutoring center get listed or claim its profile?",
    a: "Yes. Send us the business name and location through the contact page and we will verify the details and update the listing.",
  },
];

export default function HomePage() {
  const featured = topRated(8);
  const best = topRated(10);
  const cityGroups = cities();
  const serviceGroups = services();
  const rating = averageRating();
  const reviews = totalReviews();

  const chips = [
    ...serviceGroups.slice(0, 6).map((service) => ({
      label: service.label,
      href: `/find/${service.slug}-in-georgia`,
    })),
    ...cityGroups.slice(0, 4).map((city) => ({
      label: city.city,
      href: `/find/tutoring-centers-in-${city.citySlug}`,
    })),
  ];

  return (
    <>
      <PageBanner
        title="Georgia Tutoring &amp; Learning Centers | Test Prep, Math Tutoring and More"
        eyebrow="The #1 resource for tutoring and learning services in Georgia"
        image="/photos/tutor-and-student-banner.jpg"
        alt="A tutor working one to one with a student"
        priority
      >
        <SearchForm />
        <ul className="banner-facts">
          <li>{listings.length} centers listed</li>
          <li>{cityGroups.length} Georgia cities</li>
          <li>{reviews.toLocaleString()} reviews analysed</li>
          <li>{rating} average rating</li>
        </ul>
        <div className="banner-actions">
          <Link className="btn" href="/find">
            Find a center near you
          </Link>
          <Link className="btn btn--ghost" href="/costs">
            See what tutoring costs
          </Link>
        </div>
      </PageBanner>

      <section className="section">
        <div className="wrap center">
          <h2>Tutoring Centers Near Me</h2>
          <p className="lede">
            Compare {listings.length} tutoring and learning centers across Georgia in one place.
            Hours, ratings, subjects, pricing guidance and directions for every center, with no
            sign-up and no fee for families. Browse the centers closest to you, or start with the
            highest rated in the state.
          </p>
          <div className="carousel-shell">
            <HeroCarousel listings={featured} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SampleNotice />
          <h2>Start with a hub</h2>
          <p className="lede" style={{ marginBottom: "1.6rem" }}>
            Six places to begin, depending on what you need today.
          </p>
          <HubGrid />
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <h2>Find The Best Tutoring Center For You</h2>
          <p className="lede">
            These are the highest rated tutoring centers in our Georgia directory, ranked by rating
            and review volume. Toggle the map to see which are closest to your school or office, and
            use the chips to jump straight to a subject or city.
          </p>
          <div style={{ marginTop: "1.6rem" }}>
            <Listicle listings={best} title="Top rated Georgia tutoring centers" chips={chips} />
          </div>
          <p style={{ marginTop: "1.6rem" }}>
            <Link className="btn" href="/partners">
              See the full partner directory
            </Link>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>Jumpstart learning with our One-to-One Instruction</h2>
          <div className="photo-split">
            <div>
              <p>
                One-to-one instruction is the fastest way to close a skill gap, and it is the
                format most Georgia tutoring centers recommend for a student who is more than a
                grade level behind. A single instructor working with a single student can diagnose
                in real time, adjust pace mid-session, and rebuild confidence in a way a classroom
                of thirty cannot.
              </p>
            </div>
            <ContentPhoto
              src="/photos/one-to-one-instruction.jpg"
              alt="A tutor and a student working through a problem together at a desk"
              caption="One-to-one sessions move fastest for students who are behind grade level."
            />
          </div>
          <p>
            The centers in this directory offer a mix of formats: one-to-one sessions, small groups
            of three to six students working on individual plans, and supervised self-paced
            programs. Many families start one-to-one for the first eight to twelve weeks, then step
            down to a small group once the student is back at grade level. Ask any center whether
            you can change formats without repurchasing a package, because that flexibility is what
            keeps tutoring affordable across a full school year.
          </p>
          <div className="callout">
            <p style={{ margin: 0 }}>
              <strong>What to ask on your first call:</strong> what the intake assessment measures,
              who will teach your child each week, the student-to-instructor ratio in your time
              slot, the total first-month cost including fees, and how progress will be reported to
              you.
            </p>
          </div>

          <h2>What is Georgia Tutoring Centers?</h2>
          <p>
            Georgia Tutoring Centers is an independent directory of tutoring and learning centers
            operating across the state, from metro Atlanta through Savannah, Augusta, Columbus,
            Macon, Athens and the smaller markets in between. We collect public business data for
            each center, normalise it into one consistent format, and publish it so parents can
            compare centers on the details that actually matter: subjects taught, hours of
            operation, review counts, ratings, price range and location.
          </p>
          <p>
            We are not a tutoring company and we do not sell tutoring. We do not take a commission
            on enrollments, and centers cannot pay to rank higher in our listicles. That
            independence is the point: a parent should be able to compare a national brand and an
            independent center on the same page, using the same fields, without a sales pitch in
            between.
          </p>

          <h2>How Does Georgia Tutoring Centers Work?</h2>
          <ol>
            <li>
              <strong>Start with your city or subject.</strong> The{" "}
              <Link href="/find">Find hub</Link> splits the directory two ways: by Georgia city and
              by subject, so you can begin from wherever your need is clearest.
            </li>
            <li>
              <strong>Compare the shortlist.</strong> Every listicle is numbered and shows hours,
              review counts, phone numbers, websites and programs. Toggle the map view to see the
              geography before you commit to a drive.
            </li>
            <li>
              <strong>Check the ratings.</strong> The <Link href="/reviews">Reviews hub</Link>{" "}
              collects rating and review-count data for each center, plus the questions worth asking
              before you enroll.
            </li>
            <li>
              <strong>Budget honestly.</strong> Our <Link href="/costs">cost guides</Link> publish
              the going rates in Georgia by subject and format, so you can tell a fair quote from an
              inflated one.
            </li>
            <li>
              <strong>Contact the center directly.</strong> Call or visit the center&apos;s own
              website from its profile page. We never sit between you and the center.
            </li>
          </ol>

          <ContentPhoto
            src="/photos/online-tutoring.jpg"
            alt="A student working through a lesson on a laptop at home"
            caption="Many Georgia centers now teach online with the same instructors who teach in the building."
          />

          <h2>Browse Georgia tutoring centers by city</h2>
          <LinkList
            split
            items={cityGroups.map((city) => ({
              href: `/find/tutoring-centers-in-${city.citySlug}`,
              label: `Tutoring centers in ${city.city}`,
              note: `${city.count} centers`,
            }))}
          />

          <h2>Browse by subject</h2>
          <LinkList
            split
            items={serviceGroups.map((service) => ({
              href: `/find/${service.slug}-in-georgia`,
              label: `${service.label} in Georgia`,
              note: `${service.count} centers`,
            }))}
          />
        </div>
      </section>

      <section className="section section--soft">
        <div className="wrap">
          <h2>Guides and cost breakdowns</h2>
          <LinkList
            split
            items={[
              ...blogPosts.map((post) => ({
                href: `/blog/${post.slug}`,
                label: post.title,
                note: `${post.category}, ${post.readMinutes} min read`,
              })),
              ...costGuides.map((guide) => ({
                href: `/costs/${guide.slug}`,
                label: guide.title,
                note: guide.category,
              })),
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <Faqs faqs={faqs} />
        </div>
      </section>

      <JsonLd data={itemListSchema(best, "/", "Top rated Georgia tutoring centers")} />
    </>
  );
}
