"use client";

import Image from "next/image";
import Link from "next/link";
import { FOOTER_COLUMNS, SOCIAL_LINKS } from "@/lib/data/nav";
import { fadeStyle, revealStyle, useReduceMotion, useScrollDriver } from "@/lib/scroll/useScrollDriver";
import { LetsTalkMenu } from "./nav/LetsTalkMenu";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" />
    </svg>
  ),
  LinkedIn: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 10.5V17M8 7.5V7.51M12 17V13.2C12 11.5 13 10.5 14.3 10.5C15.6 10.5 16.5 11.4 16.5 13.2V17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  // Bubble.io's actual icon mark (fetched from the real favicon at
  // bubble.io — a lowercase "b" letterform + a small accent dot at its
  // bottom-left), redrawn as simple stroke/circle primitives in
  // `currentColor` to match this row's existing monochrome-outline
  // treatment (Instagram/LinkedIn above don't use brand colors either).
  // The previous version here (two plain concentric-ish circles) wasn't
  // a Bubble mark at all — an abstract placeholder that read as broken/
  // unrecognizable, per report.
  Bubble: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7.5 4v11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12.5" cy="14" r="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="5.7" cy="18.3" r="1.6" fill="currentColor" />
    </svg>
  ),
};

/** No props — see the backdrop color history below for why. */
export function FinalCtaFooter() {
  const { revealed, gotoId } = useScrollDriver();
  const reduceMotion = useReduceMotion();

  return (
    // Backdrop behind the section's rounded top corners: the
    // `rounded-t-[56px]` section below doesn't fill this wrapper's full
    // rectangle, so this color shows through the corner cutouts. Went
    // through a few iterations: a `theme` prop toggling `bg-ink`/`bg-paper`
    // per call site (removed — getting it wrong or forgetting it on a new
    // page silently showed a mismatched color band, fixed reactively more
    // than once); then a single hardcoded `bg-ink` (right for every
    // dark/gradient page, wrong for the blog article page's `bg-paper`
    // background, so that one page briefly got a defaulted
    // `backdropClassName` override); now a single hardcoded `bg-white`
    // across every page instead, on explicit direction to make every
    // footer's corners consistent site-wide rather than page-background-
    // matched. (An earlier pass hardcoded this to `#0d2a1c`, the
    // gradient's own topmost color, so the corners would blend
    // seamlessly — but that made the rounded corners themselves visually
    // disappear entirely, since there was no longer any contrast to
    // reveal the curve. `bg-white` reveals the curve clearly against the
    // section's own dark gradient on every page.)
    <div className="relative overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute top-[-6%] left-1/2 z-0 h-[62%] w-[95%] -translate-x-1/2 blur-[26px]"
        style={{ background: "radial-gradient(50% 50% at 50% 28%, rgba(74,215,140,0.18), transparent 70%)" }}
      />
      <section
        id="contact"
        data-reveal="1"
        data-reveal-id="finalSection"
        className="relative z-1 overflow-hidden rounded-t-[56px] pt-[120px]"
        style={{
          background: "linear-gradient(180deg, #0d2a1c, #0f3322, #135232, #23A05D)",
          ...fadeStyle(revealed, "finalSection", reduceMotion),
        }}
      >
        <div className="pai-container mx-auto w-full max-w-[1200px] px-10">
          <div className="relative z-2 flex flex-col items-center gap-5 pb-[88px] text-center">
            <div className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="shrink-0">
                <path
                  d="M2 8L8 2M8 2H3M8 2V7"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[12px] font-medium tracking-[0.1em] text-white/85 uppercase">
                Let&apos;s Get In Touch
              </span>
            </div>
            <h2 className="pai-final-h2 m-0 text-[88px] leading-[1.08] font-bold tracking-[-0.4px] text-white text-balance max-[900px]:text-[50px] max-[560px]:text-[36px]">
              Not sure where to start?
            </h2>
            <p className="m-0 max-w-[800px] text-[18px] font-normal text-white/88">
              Whether you already have detailed requirements or just an idea, let&apos;s talk. We&apos;ll help
              define the scope, estimate the timeline, and recommend the best way to build your product.
            </p>
            <div className="mt-4 flex justify-center">
              <LetsTalkMenu variant="footer" align="center" />
            </div>
          </div>

          <div className="h-px w-full bg-white/16" />

          <footer className="pai-footer-grid grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-14 py-20 max-[900px]:grid-cols-2 max-[900px]:gap-8 max-[560px]:grid-cols-1 max-[560px]:gap-9">
            <div
              data-reveal="1"
              data-reveal-id="footerBrand"
              className="flex max-w-[320px] flex-col gap-[18px]"
              style={revealStyle(revealed, "footerBrand", reduceMotion)}
            >
              <span className="relative block h-6 w-[137px]">
                <Image src="/logos/paistudio-logo-light.svg" alt="paistudio" fill sizes="137px" className="object-contain" />
              </span>
              <p className="m-0 text-[14px] leading-[1.6] text-white/85">
                Helping founders design, build, and launch AI-powered SaaS, marketplaces, and internal tools faster
                using Bubble, AI, and modern no-code technologies.
              </p>
              <div className="mt-1 flex items-center gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white/90 transition-colors hover:bg-white/14 hover:text-white"
                  >
                    {SOCIAL_ICONS[social.label]}
                  </a>
                ))}
              </div>
            </div>

            {FOOTER_COLUMNS.map((col, i) => {
              const revealId = `footerCol${i}`;
              return (
                <nav
                  key={col.title}
                  data-reveal="1"
                  data-reveal-id={revealId}
                  className="flex flex-col gap-3.5"
                  style={revealStyle(revealed, revealId, reduceMotion)}
                >
                  <h3 className="m-0 text-[14px] font-medium text-white">{col.title}</h3>
                  {col.links.map((link) => {
                    const linkClass = "text-[14px] text-white/85 no-underline transition-colors hover:text-white";
                    // "Our Work" (#work) only has a real target on the
                    // homepage (WorkGallery is the only place that ever
                    // renders `id="work"`) — this footer renders on all 19
                    // pages. A plain `<Link href="#work">` would silently
                    // no-op on every other page (the browser just looks
                    // for that id on the *current* page, finds nothing).
                    // `gotoId` already solves exactly this for Nav's own
                    // "Our Work" link — same fix here: scroll if the
                    // section exists on this page, else navigate to `/#work`.
                    if (link.href.startsWith("#")) {
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            gotoId(link.href.slice(1));
                          }}
                          className={linkClass}
                        >
                          {link.label}
                        </a>
                      );
                    }
                    const isExternal = link.href.startsWith("http");
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener" : undefined}
                        className={linkClass}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              );
            })}
          </footer>

          <div className="h-px w-full bg-white/14" />

          <div className="flex flex-wrap items-center justify-between gap-3 py-7">
            <span className="text-[12px] text-white/78">© 2026 Paistudio. All rights reserved.</span>
            <span className="text-[12px] text-white/78">Designed and built in Indonesia.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
