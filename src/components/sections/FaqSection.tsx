"use client";

import { useState } from "react";

type Faq = { question: string; answer: string };

type FaqSectionProps = {
  headline: string;
  /** Optional subhead under the headline. Content rule: questions/answers
   * (and this line, if used) must be specific to the page's actual topic
   * — do not search-and-replace one page's FAQ set into another's. */
  intro?: string;
  /** Exactly 5. See `intro`'s content rule — it applies here too. A
   * copywriting requirement for whoever fills this prop in; this
   * component renders whatever 5 pairs it's given. */
  faqs: Faq[];
};

/** SEC-10 · FAQ. Same big-headline treatment (no eyebrow label — removed
 * per request) and accordion look as the real `/faq` page (`app/faq/page.tsx` +
 * `components/faq/FaqAccordion.tsx`/`FaqAccordionItem.tsx`) — reused
 * directly rather than re-derived, right down to the 1240px container and
 * 18px answer copy, so a page assembled from this section library reads
 * as the same product as the dedicated FAQ page.
 *
 * **Critical DOM requirement**: answer text must be present in the
 * rendered HTML at all times, even while visually collapsed — a defect
 * fix per spec (a prior page on this site only rendered answers on click,
 * making them invisible to search engines and non-JS crawlers). Reuses
 * this project's existing `.pai-faq-panel`/`.pai-faq-panel-inner`/
 * `.pai-faq-open`/`.pai-faq-answer` classes (globals.css) rather than
 * inventing a new mechanism — a CSS grid-rows `0fr` → `1fr` trick, so the
 * answer `<div>` is always in the DOM and its height animates via CSS,
 * not JS measuring `scrollHeight`, and never `display: none` / conditional
 * rendering. Already `prefers-reduced-motion`-aware (see globals.css). */
export function FaqSection({ headline, intro, faqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (process.env.NODE_ENV !== "production" && faqs.length !== 5) {
    console.error(`FaqSection (SEC-10): expected exactly 5 faqs, got ${faqs.length}.`);
  }

  return (
    <section data-nav-bg="light" className="pai-container mx-auto w-full max-w-[1240px] px-10 py-20 max-[900px]:px-7 max-[560px]:px-5">
      <div className="pai-work-copy pai-armed pai-play flex flex-col gap-14">
        <div className="flex flex-col items-start gap-[18px]">
          <h2 className="m-0 text-[70px] leading-[1.04] font-bold tracking-[-0.56px] text-text text-balance max-[900px]:text-[50px] max-[560px]:text-[36px]">
            {headline}
          </h2>
          {intro && <p className="m-0 max-w-[640px] text-[18px] leading-[1.6] text-muted">{intro}</p>}
        </div>

        <div className="flex flex-col">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            const buttonId = `sec10-faq-question-${i}`;
            const panelId = `sec10-faq-panel-${i}`;

            return (
              <div key={i} className={`rounded-2xl transition-colors duration-300 ${isOpen ? "bg-cream" : "bg-transparent"}`}>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex((current) => (current === i ? null : i))}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 px-6 py-6 text-left"
                >
                  <span className="text-[18px] font-semibold text-text text-balance">{faq.question}</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0 text-text">
                    <path d="M3 9h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path
                      d="M9 3v12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      className="origin-center transition-transform duration-300"
                      style={{ transform: isOpen ? "scaleY(0)" : "scaleY(1)" }}
                    />
                  </svg>
                </button>

                <div id={panelId} role="region" aria-labelledby={buttonId} className={`pai-faq-panel${isOpen ? " pai-faq-open" : ""}`}>
                  <div className="pai-faq-panel-inner">
                    <div className="pai-faq-answer flex flex-col gap-3 px-6 pb-6">
                      <p className="m-0 text-[18px] leading-[1.6] text-muted">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}