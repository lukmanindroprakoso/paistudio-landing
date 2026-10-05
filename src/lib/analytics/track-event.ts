"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fires a GA4 custom event via the gtag.js loaded by GoogleAnalytics.tsx.
 * Safe to call anywhere, including pages where GA is intentionally not
 * loaded (the internal /dashboard, /cms, /internal routes — see that
 * component's EXCLUDED_PREFIXES) or before the script has finished
 * loading — `window.gtag` simply won't exist yet in either case, and this
 * no-ops rather than throwing. */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", name, params);
}
