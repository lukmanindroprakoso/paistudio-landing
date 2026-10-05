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
 * no-ops rather than throwing.
 *
 * `debug_mode: true` in development makes every event show up in GA4's
 * DebugView in real time (Admin → DebugView, filtered to your own device)
 * — the standard way to test event wiring without waiting for it to show
 * up in regular reports, which can lag by hours. Never sent in
 * production, so it doesn't pollute DebugView for a real visitor. */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", name, {
    ...params,
    ...(process.env.NODE_ENV !== "production" ? { debug_mode: true } : {}),
  });
}
