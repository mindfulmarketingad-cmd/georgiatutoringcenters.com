import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageBanner from "@/components/PageBanner";
import ResumeBuilder from "@/components/ResumeBuilder";
import Faqs from "@/components/Faqs";
import JsonLd from "@/components/JsonLd";
import LinkList from "@/components/LinkList";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { plan } from "@/lib/plan";
import { billingLive } from "@/lib/billing";
import { steps, templates } from "@/lib/resume";
import { resumeCities } from "@/lib/content/resume-cities";
import "./resume.css";

const paid = billingLive();

export const metadata: Metadata = pageMeta({
  title: "Free Resume Builder | Build a Resume Online in Minutes",
  description: paid
    ? `Resume builder for tutors, teachers and students in Georgia. Answer ten questions and lay the result out in five templates, free. Downloads are ${plan.priceLabel} a month, cancel anytime.`
    : "Free resume builder for tutors, teachers and students in Georgia. Answer ten questions, pick from five templates and download a finished resume. No account, no watermark.",
  path: "/resume-builder",
});

const pricingFaqs = paid
  ? [
      {
        q: "What is free and what costs money?",
        a: `Building a resume, editing it, switching between all five templates and reading the finished page on screen are free and need no account. Downloading the file, as a PDF, a Word document or plain text, needs an account and a subscription at ${plan.priceLabel} a month.`,
      },
      {
        q: `How does the ${plan.priceLabel} subscription work?`,
        a: `It is a monthly subscription that renews automatically at ${plan.priceLabel} until you cancel. It covers unlimited downloads and re-downloads in every template while it is active. You can cancel at any time from the account panel on this page, which opens the billing portal directly, and there is no cancellation fee.`,
      },
      {
        q: "Where does my information go?",
        a: "While you are building, every answer stays in your browser and a draft is saved on your own device so you can close the tab and come back. Your resume is sent to our server only at the moment you download it, where it is turned into a file and returned. It is not stored, logged or shared. Payment details never touch this site at all: the checkout is handled by Stripe.",
      },
    ]
  : [
      {
        q: "Is the resume builder really free?",
        a: "Yes. There is no account to create, no trial that expires, no watermark on the finished resume and no payment step.",
      },
      {
        q: "Where does my information go?",
        a: "While you are building, every answer stays in your browser and a draft is saved on your own device so you can close the tab and come back. Your resume is sent to our server only at the moment you download it, where it is turned into a file and returned. It is not stored, logged or shared.",
      },
    ];

const faqs = [
  ...pricingFaqs,
  {
    q: "Which template should I pick?",
    a: "If you are applying through an online portal, pick one of the four single-column templates, because applicant tracking software reads a single column far more reliably than a sidebar. The Executive template is the two-column option and is better suited to a resume you email or hand over in person.",
  },
  {
    q: "What if I already have a resume?",
    a: "Start with the option that says you already have one and paste in your current resume. The builder pulls out the contact details and any summary and skills it can recognize, then walks you through every question so you can correct what it got wrong and fill in the rest.",
  },
  {
    q: "How long should a resume be?",
    a: "One page for most people, and one page for anyone with less than about ten years of work. Two pages is reasonable for a long teaching or tutoring career with a list of certifications. The Compact template exists to keep a long history on a single page.",
  },
  {
    q: "What should a tutor put on a resume?",
    a: "Subjects and grade levels you teach, the format you work in, any certification or degree in the subject, and results you can point to. Specifics carry the most weight: the grade levels, the number of students and the change in their grades or scores say more than a line about being passionate about learning.",
  },
];

const relatedLinks = [
  { href: "/find", label: "Find a Tutoring Center in Georgia", note: "Browse every center by city and subject" },
  { href: "/partners", label: "Partner Directory", note: "The full listicle of centers on this site" },
  { href: "/counties", label: "Tutoring Centers by County", note: "Every Georgia county we cover" },
  { href: "/costs", label: "Tutoring Costs and Pricing", note: "What tutoring pays and charges in Georgia" },
  { href: "/blog", label: "Learning Blog", note: "Guides for families and tutors" },
  { href: "/find/private-tutors-in-georgia", label: "Private Tutors in Georgia", note: "Independent tutors listed statewide" },
  { href: "/find/learning-centers-in-georgia", label: "Learning Centers in Georgia", note: "Centers hiring across the state" },
  { href: "/find/after-school-programs-in-georgia", label: "After School Programs in Georgia", note: "Programs that staff tutors and aides" },
];

export default function ResumeBuilderPage() {
  const cityLinks = resumeCities().map((entry) => ({
    href: `/resume-builder/${entry.citySlug}`,
    label: `Resume Builder in ${entry.city}, Georgia`,
    note: `${entry.count} ${entry.count === 1 ? "employer" : "employers"}`,
  }));

  return (
    <>
      <PageBanner
        title="Free Resume Builder"
        eyebrow="Career tools"
        image="/photos/tutor-and-student-banner.jpg"
        alt="A tutor working through a problem with a student at a table"
        priority
      >
        <ul className="banner-facts">
          <li>{steps.length} questions</li>
          <li>{templates.length} templates</li>
          <li>Free to build</li>
        </ul>
      </PageBanner>

      <Breadcrumbs
        trail={[{ name: "Home", path: "/" }, { name: "Resume Builder", path: "/resume-builder" }]}
      />

      <section className="section">
        <div className="wrap">
          <div className="rb-noprint">
            <p className="lede">
              Build a resume one question at a time, then lay it out in one of five templates.{" "}
              {paid
                ? `Building and previewing it costs nothing; downloading the finished file is ${plan.priceLabel} ${plan.intervalLabel}.`
                : "Free, with no account to create and no watermark on the finished page."}{" "}
              Written for the tutors, teachers, aides and students who apply to the centers listed
              on this site, and it works just as well for any other job.
            </p>
          </div>
          <ResumeBuilder />
        </div>
      </section>

      <section className="section section--tint rb-noprint">
        <div className="wrap prose">
          <h2>How the Resume Builder Works</h2>
          <p>
            Two routes in. If you already have a resume, paste it in and the builder reads out your
            name, email, phone number, LinkedIn address and, where it can find them, your summary
            and skills. If you do not have one, you start from a blank page and answer the same
            questions in order. Either way you end up at the same place, with every answer in front
            of you where you can change it.
          </p>
          <p>
            The questions run in the order a reader meets them on the finished page: your name, the
            job title you are going for, how an employer reaches you, where you have worked, what
            you are good at, where you studied, and finally the two or three sentences at the top
            that tie it together. The summary comes last on purpose. It is much easier to write once
            the rest of the page exists.
          </p>

          {paid && (
            <>
              <h2>What It Costs</h2>
              <p>
                Everything up to the download is free and needs no account: the questions, all five
                templates, as many edits as you like and the finished resume on screen. The{" "}
                {plan.priceLabel} {plan.intervalLabel} subscription covers the download itself.
              </p>
              <ul>
                {plan.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{plan.renewalNotice}</p>
              <p>
                Cancelling takes the same number of clicks as subscribing: the account panel on the
                finished resume opens the billing portal, where you cancel in one step. Full terms
                are on the <Link href="/terms">terms of use</Link> page.
              </p>
            </>
          )}

          <h2>What Goes on a Tutoring Resume</h2>
          <p>
            Georgia tutoring centers hire on evidence. A center staffing an elementary reading
            program wants to see the grade levels you have taught and the reading programs you know
            by name. A test prep center wants your own scores and the score changes your students
            have made. Put the specific thing in the bullet:
          </p>
          <ul>
            <li>
              The subjects and grade levels you teach, named exactly, so a hiring manager can match
              you against an opening without guessing.
            </li>
            <li>
              The format you have worked in, whether that is one to one, small group, a classroom
              or online, since the skills differ and centers staff for each.
            </li>
            <li>
              Numbers wherever you honestly have them: students taught, sessions a week, grade or
              score changes, retention from term to term.
            </li>
            <li>
              Degrees, certification, background checks already cleared and any state teaching
              certificate, which several centers treat as a pay band rather than a nice extra.
            </li>
            <li>
              Software you use for lesson planning, progress reporting and online sessions, because
              a center that runs on one of them will look for it.
            </li>
          </ul>
          <p>
            Skip the objective statement that says you want a challenging role at a growing
            organization. Every reader has seen thousands of those, and the space is better spent on
            the first line of your experience.
          </p>

          <h2>Choosing Between the Five Templates</h2>
          <p>
            Four of the five templates are single column, which matters more than how they look.
            Large employers and most online application portals push your file through applicant
            tracking software before a person sees it, and that software reads a page top to bottom.
            A two-column layout can interleave the sidebar with the main column and turn a clean
            resume into scrambled text. The picker labels each template so you know which you are
            choosing:
          </p>
          <ul>
            {templates.map((template) => (
              <li key={template.key}>
                <strong>{template.name}.</strong> {template.blurb} {template.best}{" "}
                {template.atsSafe
                  ? "Single column, so it survives applicant tracking software."
                  : "Two columns, so keep it for resumes you email or hand over."}
              </li>
            ))}
          </ul>

          <h2>What Happens to Your Details</h2>
          <p>
            A resume holds a full set of personal details: your name, your phone number, your home
            city, where you have worked and where you studied. While you are building, none of it
            leaves your browser. The draft that lets you close the tab and come back is stored by
            your own browser on your own device, and the start over button deletes it.
          </p>
          <p>
            The one moment your resume is transmitted is when you download it: the answers go to our
            server, are turned into a file and are sent straight back. Nothing is written to a
            database or kept afterwards.{" "}
            {paid ? "Card details never reach this site at any point, because the checkout runs on Stripe." : ""}
          </p>
          <p>
            A saved draft is visible to anyone else using the same browser profile on the same
            computer. On a shared or library machine, use the start over button when you are
            finished. See our <Link href="/privacy">privacy policy</Link> for how the rest of{" "}
            {site.domain} handles data.
          </p>

          <h2>After the Resume</h2>
          <p>
            A resume gets read next to the place you are sending it. If you are applying to tutoring
            work in Georgia, the directory on this site lists every center we know of by city,
            county and program type, along with hours, ratings and what each one teaches. Read the
            listing before you write the cover letter, and name the subjects that center actually
            offers.
          </p>
          <LinkList items={relatedLinks} split />
        </div>
      </section>

      <section className="section rb-noprint">
        <div className="wrap prose">
          <h2>Resume Builder by City</h2>
          <p>
            Each city page carries the same builder plus the local employers your resume is aimed
            at: who runs tutoring in that city, what they teach, what the work pays there and which
            neighboring cities are worth applying to.
          </p>
          <LinkList items={cityLinks} split />
        </div>
      </section>

      <section className="section section--tint rb-noprint">
        <div className="wrap prose">
          <Faqs faqs={faqs} heading="Resume Builder Questions" />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Resume Builder",
          url: `${site.url}/resume-builder`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any modern web browser",
          browserRequirements: "Requires JavaScript",
          description: paid
            ? "Browser-based resume builder: answer ten questions and choose one of five templates. Building and previewing is free; downloading the finished file requires a subscription."
            : "Free browser-based resume builder: answer ten questions, choose one of five templates and download the result.",
          ...(paid
            ? {
                offers: {
                  "@type": "Offer",
                  price: plan.price.toFixed(2),
                  priceCurrency: plan.currency,
                  description: `${plan.priceLabel} ${plan.intervalLabel}, cancel at any time. Building and previewing a resume is free.`,
                },
              }
            : { isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }),
          publisher: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />
    </>
  );
}
