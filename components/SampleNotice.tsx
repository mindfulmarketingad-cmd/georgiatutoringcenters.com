import { isSampleData } from "@/lib/listings";

export default function SampleNotice() {
  if (!isSampleData) return null;
  return (
    <p className="notice">
      <strong>Sample data.</strong> These listings are placeholders generated for the build. Add your
      Outscraper export to <code>data/outscraper/</code> and run <code>npm run import</code> to
      replace them with live business data.
    </p>
  );
}
