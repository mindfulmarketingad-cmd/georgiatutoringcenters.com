import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";
import Faqs from "@/components/Faqs";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Contact Georgia Tutoring Centers | Add or Correct a Listing",
  description:
    "Contact Georgia Tutoring Centers to add a tutoring center, correct a listing, claim a profile or ask a question about the directory.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />

      <section className="section">
        <div className="wrap prose">
          <span className="eyebrow">Contact</span>
          <h1>Contact Georgia Tutoring Centers</h1>
          <p className="lede">
            Questions about the directory, a listing that needs correcting, or a tutoring center
            that should be here? Send us a note. We read everything and reply to messages that need
            a reply.
          </p>

          <div className="callout">
            <p style={{ margin: 0 }}>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <br />
              <strong>Response time:</strong> usually two to three business days.
            </p>
          </div>

          <h2>Send a message</h2>
          <ContactForm />

          <h2>What we can help with</h2>
          <ul>
            <li>
              <strong>Adding a tutoring center.</strong> Send the business name, address, phone
              number, website and the subjects taught.
            </li>
            <li>
              <strong>Correcting a listing.</strong> Tell us which field is wrong and what it should
              say. Hours and phone numbers change often and we would rather be corrected than
              wrong.
            </li>
            <li>
              <strong>Claiming a profile.</strong> Business owners can request an updated
              description and program list for their center.
            </li>
            <li>
              <strong>Advertising.</strong> The site carries display advertising. Advertising never
              affects listing order or inclusion.
            </li>
          </ul>

          <h2>What we cannot help with</h2>
          <p>
            We are a directory, not a tutoring provider. We cannot schedule sessions, quote prices,
            handle billing disputes or pass messages to a center. For any of those, contact the
            center directly using the phone number or website on its{" "}
            <Link href="/partners">profile page</Link>.
          </p>

          <Faqs
            faqs={[
              {
                q: "How do I get my tutoring center listed?",
                a: "Send the business name, full address, phone number, website and the subjects you teach through this page. We verify public business details before publishing.",
              },
              {
                q: "How long does a correction take?",
                a: "Most corrections are made within a few business days of verification.",
              },
              {
                q: "Do you sell leads or contact information?",
                a: "No. We do not sell leads and we do not sell the contact details of people who write to us. See our privacy policy for details.",
              },
              {
                q: "Can I request removal of my business?",
                a: "Yes. Send the business name and address and we will remove the listing.",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
