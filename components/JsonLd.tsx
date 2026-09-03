export default function JsonLd({ data }: { data: object | object[] }) {
  // JSON.stringify output is escaped so it can never break out of the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
