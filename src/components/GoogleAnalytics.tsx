"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Google Analytics (gtag.js) — property G-XT623RMP4L. `next/script` with
// `strategy="afterInteractive"` (not a plain <script> tag) is Next.js's
// own recommended pattern for third-party analytics: it loads after the
// page is interactive rather than blocking initial render/hydration.
const GA_MEASUREMENT_ID = "G-XT623RMP4L";

// Internal tooling, not public/marketing pages — no reason to track
// visits here, and it's the team's own usage, not a visitor's. Same
// prefixes proxy.ts gates, plus /sign-in (the one route in that area
// reachable while signed out).
const EXCLUDED_PREFIXES = ["/dashboard", "/cms", "/internal", "/sign-in"];

function isExcluded(pathname: string): boolean {
  return EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  if (isExcluded(pathname)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}'${process.env.NODE_ENV !== "production" ? ", { debug_mode: true }" : ""});
        `}
      </Script>
    </>
  );
}
