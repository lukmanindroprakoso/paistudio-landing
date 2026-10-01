"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { NavLink } from "@/types/content";

type MegaMenuProps = {
  label: string;
  columns: { title?: string; links: NavLink[] }[];
  panelWidthClassName: string;
  /** `Nav`'s dynamic `navOnLight`, passed through raw (not pre-collapsed)
   * — see `chromeVariant` below for why. */
  navOnLight?: boolean;
  /** Mirrors `Nav`'s own `chromeVariant` (see `Nav-v2-docs.md`). Combined
   * with `navOnLight` to compute `isLightChrome` (drives panel/title/link
   * colors, same as before) and, separately, `greyChromeOnLight` (drives
   * the v2 trigger's own hover tint, matching `Nav`'s own pill hover —
   * see that variable's comment for why `isGreyChrome` needs to stay its
   * own flag instead of just inverting `isLightChrome`). */
  chromeVariant?: "v1" | "v2";
};

export function MegaMenu({ label, columns, panelWidthClassName, navOnLight = false, chromeVariant = "v1" }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  const isLightChrome = chromeVariant === "v1" && navOnLight;
  // The trigger has no background or text color of its own at rest — plain
  // inheritance from Nav's pill. Two things had to go for that inheritance
  // to actually track the pill's color smoothly instead of lagging behind
  // it ("transisi color text di navbar masih ga sama, contohnya text build
  // dan our work"): (1) the explicit `text-current` (`color: currentColor`)
  // this button used to carry, and (2) `color` being listed in this
  // button's own `transition-colors` at all. Both sound harmless — same
  // final color either way — but Tailwind's preflight already declares
  // `button { color: inherit }` (and `a { color: inherit }` for Nav's
  // plain "Our Work"/"Pricing" links), so *any* element with `color` in
  // its own transition-property list runs a *second*, independent color
  // transition chasing the pill's already-animating color as a moving
  // target — a classic CSS cascading-transition double-ease, slower and
  // out of sync with elements that don't have that redundant transition.
  // Fixed by dropping `text-current` entirely and swapping `transition-
  // colors` for `transition-[background-color]` here (background is the
  // only thing this trigger's own classes actually change, on hover) — see
  // Nav.tsx's matching change on the "Our Work"/"Pricing" links. The label
  // `<span>` is unaffected (no UA color rule applies to plain `<span>`s),
  // so its own `transition-colors duration-150` was already fine.
  const isGreyChrome = chromeVariant === "v2";
  // Glass can't ignore `navOnLight` the way an opaque pill could (see
  // Nav.tsx's `greyChromeOnLight` comment), so v2's hover flips its tint
  // too — mirrors Nav's own `pillLinkHoverClass` exactly ("hover
  // state-nya sekarang belum konsisten": this trigger's hover used to be a
  // flat `hover:bg-muted` regardless of `navOnLight`, while "Our
  // Work"/"Pricing" right next to it already split ink/16 vs white/20).
  const greyChromeOnLight = isGreyChrome && navOnLight;
  const triggerHoverClass = isGreyChrome
    ? greyChromeOnLight
      ? "hover:bg-ink/16"
      : "hover:bg-white/20"
    : isLightChrome
      ? "hover:bg-ink/10"
      : "hover:bg-white/14";
  const panelClass = isLightChrome
    ? "border-ink/10 bg-white/95 shadow-[0_18px_48px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)]"
    : "border-white/14 bg-[#121210f2] shadow-[0_18px_48px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)]";
  const titleClass = isLightChrome ? "text-text/66" : "text-white/66";
  const linkClass = isLightChrome
    ? "text-text/90 hover:bg-ink/8 hover:text-text"
    : "text-white/90 hover:bg-white/10 hover:text-white";

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) close();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          close();
          wrapRef.current?.querySelector("button")?.focus();
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-[18px] py-2 transition-[background-color] duration-150 ${triggerHoverClass}`}
      >
        <span className="transition-colors duration-150">{label}</span>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="opacity-60">
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className="absolute left-1/2 top-full pt-3.5 transition-[opacity,transform] duration-200"
        style={{
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
          transform: open ? "translate(-50%,0)" : "translate(-50%,8px)",
        }}
      >
        <div
          className={`flex gap-7 rounded-[32px] border px-4 py-[22px] text-left backdrop-blur-2xl backdrop-saturate-150 ${panelClass} ${panelWidthClassName}`}
        >
          {columns.map((col, i) => (
            <div key={i} className="flex flex-1 flex-col gap-0.5">
              {col.title && (
                <div className={`mb-2 px-2.5 text-[12px] font-medium tracking-[0.1em] uppercase ${titleClass}`}>
                  {col.title}
                </div>
              )}
              {col.links.map((link) => {
                const isExternal = link.href.startsWith("http");
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener" : undefined}
                    className={`rounded-full px-2.5 py-[7px] text-[14px] transition-colors ${linkClass}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
