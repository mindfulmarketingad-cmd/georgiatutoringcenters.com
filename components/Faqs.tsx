import JsonLd from "@/components/JsonLd";
import { faqSchema } from "@/lib/seo";
import type { Faq } from "@/lib/content/types";

export default function Faqs({
  faqs,
  heading = "Frequently Asked Questions",
  withSchema = true,
}: {
  faqs: Faq[];
  heading?: string;
  withSchema?: boolean;
}) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading">{heading}</h2>
      <div className="faq-list">
        {faqs.map((faq) => (
          <details className="faq-item" key={faq.q}>
            <summary>{faq.q}</summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </div>
      {withSchema && <JsonLd data={faqSchema(faqs)} />}
    </section>
  );
}
