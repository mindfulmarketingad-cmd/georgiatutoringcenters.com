import Script from "next/script";
import { site } from "@/lib/site";

/**
 * Loads the Google AdSense library once per page. Ad slots themselves are
 * placed by AdSense Auto Ads, so no per-slot markup is required here.
 */
export default function AdSense() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}`}
    />
  );
}
