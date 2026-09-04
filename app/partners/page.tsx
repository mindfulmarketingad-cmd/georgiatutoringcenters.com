import type { Metadata } from "next";
import PartnersView from "@/components/PartnersView";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Partner Directory | Every Georgia Tutoring Center Listed",
  description:
    "The complete directory of Georgia tutoring and learning centers, numbered and ranked, with hours of operation, review counts, addresses, phone numbers and websites.",
  path: "/partners",
});

export default function PartnersHub() {
  return <PartnersView page={1} />;
}
