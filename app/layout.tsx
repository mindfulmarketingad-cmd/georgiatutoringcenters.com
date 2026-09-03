import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSense from "@/components/AdSense";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Georgia Tutoring & Learning Centers | Test Prep, Math Tutoring and More",
    template: "%s",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "education",
  alternates: { canonical: site.url },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: true, address: true, email: true },
  other: { "google-adsense-account": site.adsenseClient },
};

export const viewport: Viewport = {
  themeColor: "#3f8f46",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <AdSense />
      </body>
    </html>
  );
}
