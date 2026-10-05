"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { LETS_TALK_LINKS } from "@/lib/data/nav";
import { trackEvent } from "@/lib/analytics/track-event";

const LINKS = [
  {
    href: LETS_TALK_LINKS.whatsapp,
    label: "WhatsApp",
    external: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true" className="shrink-0">
        <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.6-.6-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.4 2.6 1.6.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.8-.1 1.5Z" />
      </svg>
    ),
  },
  {
    href: LETS_TALK_LINKS.email,
    label: "Email",
    external: false,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" stroke="#e6a15c" strokeWidth="1.6" />
        <path d="M3.5 6.5 12 12.5 20.5 6.5" stroke="#e6a15c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: LETS_TALK_LINKS.scheduleCall,
    label: "Schedule a call",
    external: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
        <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" stroke="#a9d6e5" strokeWidth="1.6" />
        <path d="M3.5 9.5h17M8 3v3M16 3v3" stroke="#a9d6e5" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

type LetsTalkMenuProps = {
  variant: "nav" | "footer";
  align: "right" | "center";
  /** Chrome + label text color, driven by what's actually behind the nav
   * right now (see useScrollDriver's `navOnLight`) — flips together with
   * `Nav`'s own pill instead of staying fixed per-page (see Nav.tsx's
   * Behavior comment). Only affects the 'nav' variant; the 'footer'
   * variant always sits on the dark green CTA panel, so it ignores this
   * and keeps its own fixed dark chrome + white text. */
  navOnLight?: boolean;
  /** Mirrors `Nav`'s own `chromeVariant` (see Nav-v2-docs.md) — only
   * matters together with `variant="nav"`. 'v1' (default): unchanged,
   * still branches on `navOnLight`. 'v2': its own glass treatment — no
   * drop shadow, `bg-white/12`/`hover:bg-white/20` over dark sections,
   * `bg-ink/10`/`hover:bg-ink/16` over light ones (see `greyChromeOnLight`
   * below) — matching `Nav`'s own pill, including why it flips on
   * `navOnLight` again despite "buat navigasi jadi tetap grey saat
   * background atau section berawarna gelap": that request was for the
   * old *opaque* `#767676` grey, which could stay fixed because it was
   * solid; this later became a *transparent* glass treatment, which can't
   * — ignoring `navOnLight` left white text on light glass unreadable over
   * light sections, so v2 flips its tint the same way `isLightNav` always
   * has (see Nav.tsx's `greyChromeOnLight` comment for the full story). */
  chromeVariant?: "v1" | "v2";
  /** Mirrors `Nav`'s own `atHero` (see useScrollDriver.tsx) — drops this
   * trigger's background while still within the hero, same as `Nav`'s own
   * pill/hamburger (on request — "saat scroll sampai di hero, sembunyikan
   * background color navbar dan si button lets talk"). Only affects the
   * 'nav' variant; the 'footer' variant never sits near the hero. */
  atHero?: boolean;
};

export function LetsTalkMenu({ variant, align, navOnLight = false, chromeVariant = "v1", atHero = false }: LetsTalkMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  const positionClass = align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
  const isLightNav = variant === "nav" && chromeVariant === "v1" && navOnLight;
  const isGreyChrome = variant === "nav" && chromeVariant === "v2";
  // Glass can't ignore `navOnLight` the way the old opaque `#767676` could
  // (see Nav.tsx's `greyChromeOnLight` comment — white text on light glass
  // over a light section was effectively invisible), so v2 flips its tint
  // too, same as `isLightNav` below.
  const greyChromeOnLight = isGreyChrome && navOnLight;

  // `variant="nav"` branches carry no `border-*` color — the nav CTA's
  // border was removed on request ("hapus border di navbar dan cta di
  // navbar"), matching Nav.tsx's own borderless pill/hamburger. The
  // `footer` branch is untouched (that variant isn't "the navbar" — see
  // this component's own `navOnLight` doc comment) and keeps its border.
  const navAtHero = variant === "nav" && atHero;
  const triggerClass = navAtHero
    ? isGreyChrome
      ? greyChromeOnLight
        ? "bg-transparent hover:bg-ink/16"
        : "bg-transparent hover:bg-white/20"
      : isLightNav
        ? "bg-transparent hover:bg-ink/10"
        : "bg-transparent hover:bg-white/16"
    : variant === "nav"
      ? isGreyChrome
        ? greyChromeOnLight
          ? "bg-ink/10 hover:bg-ink/16"
          : "bg-white/12 hover:bg-white/20"
        : isLightNav
          ? "bg-ink/5 shadow-[0_6px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-ink/10"
          : "bg-white/8 shadow-[0_6px_24px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-white/16"
      : "border border-white/30 bg-white/12 shadow-[0_6px_24px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.22)] hover:bg-white/20";
  const labelClass = variant === "nav" ? (isLightNav || greyChromeOnLight ? "text-gray-700" : "text-white") : "text-white";
  const panelClass = isLightNav
    ? "border-ink/10 bg-white/95 shadow-[0_18px_48px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)]"
    : "border-white/14 bg-[#121210f2] shadow-[0_18px_48px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.12)]";
  const linkClass = isLightNav ? "text-text/90 hover:bg-ink/8" : "text-white/90 hover:bg-white/10";

  return (
    <div
      ref={wrapRef}
      className="relative inline-flex"
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
        className={`flex cursor-pointer items-center gap-3 rounded-full backdrop-blur-lg backdrop-saturate-150 transition-[background-color] duration-150 ${triggerClass} ${
          variant === "nav"
            ? "py-2 pr-4 pl-2 max-[560px]:py-[5px] max-[560px]:pr-3 max-[560px]:pl-[5px]"
            : "py-2 pr-5 pl-2"
        }`}
      >
        <Image src="/avatars/appai.jpeg" alt="" width={32} height={32} className="block h-8 w-8 rounded-full object-cover" />
        <span
          className={`text-[14px] font-semibold tracking-[0.02em] transition-colors duration-150 ${labelClass} ${
            variant === "nav" ? "max-[560px]:hidden" : ""
          }`}
        >
          Let&apos;s Talk
        </span>
      </button>
      <div
        className={`absolute top-full z-[60] pt-3 transition-[opacity,transform] duration-200 ${positionClass}`}
        style={{
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div
          className={`flex w-[212px] flex-col gap-0.5 rounded-[32px] border p-3.5 text-left backdrop-blur-2xl backdrop-saturate-150 ${panelClass}`}
        >
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener" : undefined}
              onClick={() => trackEvent("contact_click", { method: link.label, location: variant })}
              className={`flex items-center gap-[11px] rounded-full px-3 py-2.5 text-[14px] no-underline transition-colors ${linkClass}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
