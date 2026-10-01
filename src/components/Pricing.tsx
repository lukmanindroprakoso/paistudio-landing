"use client";

import { revealStyle, useReduceMotion, useScrollDriver } from "@/lib/scroll/useScrollDriver";

const SPRINT_TAGS = [
  "Unlimited requests",
  "One priority at a time",
  "Dedicated developer",
  "UX/UI design",
  "AI & API integrations",
  "Weekly updates",
];

const MVP_TAGS = ["Product strategy", "UX/UI design", "Full development", "AI & integrations", "2-week launch"];

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-4 py-2 text-[14px] text-text/80">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0 text-brand">
        <path d="M2.5 6.2 5 8.7 9.5 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </span>
  );
}

export function Pricing() {
  const { revealed, gotoId } = useScrollDriver();
  const reduceMotion = useReduceMotion();

  return (
    <div className="relative">
      <section id="pricing" data-nav-bg="light" className="relative z-1 bg-paper pt-[130px] pb-[140px]">
        <div className="pai-container mx-auto w-full max-w-[1240px] px-10">
          <div
            data-reveal="1"
            data-reveal-id="pricingHeader"
            className="mt-6 mb-[88px]"
            style={revealStyle(revealed, "pricingHeader", reduceMotion)}
          >
            <div className="mb-[18px] flex items-center justify-center gap-1.5 text-muted">
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="shrink-0">
                <path d="M2 8L8 2M8 2H3M8 2V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[12px] font-medium tracking-[0.1em] uppercase">Pricing</span>
            </div>
            <h2 className="m-0 mb-[18px] text-center text-[88px] leading-[1.04] font-bold tracking-[-0.56px] text-text text-balance max-[900px]:text-[50px] max-[560px]:text-[36px]">
              Simple pricing for every stage of your product.
            </h2>
            <p className="m-0 mt-6 text-center text-[18px] leading-[1.6] font-normal text-muted">
              No hidden fees. Fast execution, and a dedicated product partner — without the agency overhead.
            </p>
          </div>

          <div
            data-reveal="1"
            data-reveal-id="pricingRow1"
            className="pai-pricing-row1 relative mb-6 grid grid-cols-[1.2fr_1fr] gap-14 overflow-hidden rounded-[32px] bg-cream p-12 max-[900px]:grid-cols-1"
            style={revealStyle(revealed, "pricingRow1", reduceMotion)}
          >
            <div className="flex flex-col justify-center">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h3 className="m-0 text-[26px] leading-[1.1] font-bold tracking-[-0.01em] text-text">
                  Biweekly Sprint
                </h3>
                <span className="inline-flex items-center rounded-full bg-brand px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-white uppercase">
                  Most popular
                </span>
              </div>
              <div className="mb-[18px] flex items-baseline gap-2">
                <span className="text-[40px] leading-[1] font-bold tracking-[-0.02em] text-text">$1,950</span>
                <span className="text-[14px] tracking-[0.06em] text-muted">/sprint</span>
              </div>
              <p className="m-0 mb-6 max-w-[480px] text-[14px] leading-[1.6] font-normal text-muted">
                Your dedicated product team — shipping features, improvements, and AI capabilities every sprint.
              </p>
              <div className="flex flex-wrap gap-2">
                {SPRINT_TAGS.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3.5">
              <div className="flex flex-col gap-2 rounded-[20px] border border-ink/10 px-6 py-[22px]">
                <span className="text-[14px] text-text">Try it for a week.</span>
                <p className="m-0 text-[14px] leading-[1.55] text-muted">
                  Still not feeling it? 75% back — no awkward conversation, no fine print.
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-[20px] border border-ink/10 px-6 py-[22px]">
                <span className="text-[14px] text-text">Pause or cancel anytime.</span>
                <p className="m-0 text-[14px] leading-[1.55] text-muted">
                  No lock-in contracts — stop or pause whenever your priorities change.
                </p>
              </div>
            </div>
          </div>

          <div className="pai-pricing-row2 grid grid-cols-2 items-stretch gap-5 max-[900px]:grid-cols-1">
            <div
              data-reveal="1"
              data-reveal-id="pricingRow2Card0"
              className="relative flex flex-col overflow-hidden rounded-[32px] bg-cream p-12"
              style={revealStyle(revealed, "pricingRow2Card0", reduceMotion)}
            >
              <h3 className="m-0 mb-3 text-[26px] font-bold tracking-[-0.01em] text-text">Rocket Launch MVP</h3>
              <span className="mb-4 flex items-baseline gap-2 text-[40px] leading-[1] font-bold tracking-[-0.02em] text-text">
                $3,950
                <span className="text-[14px] font-normal tracking-[0.06em] text-muted">/one-time</span>
              </span>
              <p className="m-0 mb-6 text-[14px] leading-[1.6] text-muted">
                From zero to launched — strategy, design, development, and launch, live in as little as 2 weeks.
              </p>
              <div className="flex flex-wrap gap-2">
                {MVP_TAGS.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>

            <div
              data-reveal="1"
              data-reveal-id="pricingRow2Card1"
              className="flex flex-col rounded-[32px] border border-ink/10 p-12"
              style={revealStyle(revealed, "pricingRow2Card1", reduceMotion)}
            >
              <h3 className="m-0 mb-3 text-[26px] font-bold tracking-[-0.01em] text-text">Custom scope &amp; pricing</h3>
              <p className="m-0 mb-7 text-[14px] leading-[1.6] text-muted">
                Tell us what you&apos;re building — fixed-price proposal, honest timeline, no fluff.
              </p>
              {/* No dedicated intake flow for custom scope yet — routes to the
                  footer's Let's Talk section (WhatsApp/email/call links)
                  instead of dead-ending on a disabled button. */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  gotoId("contact");
                }}
                className="mt-auto inline-flex w-fit cursor-pointer items-center gap-2.5 rounded-full border border-ink/12 bg-ink/5 px-6 py-[13px] text-[14px] text-text shadow-[0_6px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-lg backdrop-saturate-150 transition-colors hover:bg-ink/10"
              >
                Let&apos;s Talk
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
