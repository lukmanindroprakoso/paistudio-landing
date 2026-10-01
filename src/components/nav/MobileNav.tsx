"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BUILD_MENU, RESOURCES_MENU } from "@/lib/data/nav";
import { useScrollDriver } from "@/lib/scroll/useScrollDriver";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  theme?: "light" | "dark";
};

export function MobileNav({ open, onClose, theme = "dark" }: MobileNavProps) {
  const { gotoId } = useScrollDriver();
  const [buildOpen, setBuildOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isLight = theme === "light";

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const go = (id: string) => {
    onClose();
    gotoId(id);
  };

  const panelClass = isLight
    ? "border-ink/10 bg-white/90 text-text shadow-[-18px_0_48px_rgba(0,0,0,0.12)]"
    : "border-white/14 bg-[#0c0c0ae6] text-white shadow-[-18px_0_48px_rgba(0,0,0,0.4)]";
  const iconButtonClass = isLight ? "border-ink/12 bg-ink/5" : "border-white/16 bg-white/8";
  const itemHoverClass = isLight ? "hover:bg-ink/8" : "hover:bg-white/8";
  const subLinkClass = isLight
    ? "text-text/78 hover:bg-ink/8 hover:text-text"
    : "text-white/78 hover:bg-white/8 hover:text-white";
  const resourcesLabelClass = isLight ? "text-text/50" : "text-white/50";
  // No `border-*` color — the CTA's border was removed on request ("hapus
  // border di navbar dan cta di navbar"), matching the desktop pill's own
  // borderless CTA in Nav.tsx/LetsTalkMenu.tsx.
  const ctaClass = isLight
    ? "bg-ink/5 text-text shadow-[0_6px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)]"
    : "bg-white/8 text-white shadow-[0_6px_24px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.18)]";

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: open ? "auto" : "none" }} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/60 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0 }}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute top-0 right-0 flex h-full w-[86vw] max-w-[360px] flex-col gap-2 overflow-y-auto border-l p-6 pt-8 backdrop-blur-2xl backdrop-saturate-150 transition-transform duration-300 ${panelClass}`}
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="relative block h-6 w-[137px]" aria-label="Paistudio home">
            <Image
              src={isLight ? "/logos/paistudio-logo-dark.svg" : "/logos/paistudio-logo-light.svg"}
              alt="paistudio"
              fill
              sizes="137px"
              className="object-contain"
            />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className={`flex h-9 w-9 items-center justify-center rounded-full border ${iconButtonClass}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => go("work")}
          className={`rounded-2xl px-3 py-3 text-left text-[16px] transition-colors ${itemHoverClass}`}
        >
          Our Work
        </button>

        <div>
          <button
            type="button"
            aria-expanded={buildOpen}
            onClick={() => setBuildOpen((v) => !v)}
            className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-[16px] transition-colors ${itemHoverClass}`}
          >
            <span>Build</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
              className="opacity-60 transition-transform"
              style={{ transform: buildOpen ? "rotate(180deg)" : "none" }}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {buildOpen && (
            <div className="flex flex-col gap-0.5 py-1 pl-4">
              {[...BUILD_MENU.whatWeBuild, ...BUILD_MENU.howWeBuildIt].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={onClose}
                  className={`rounded-xl px-3 py-2 text-[14px] no-underline transition-colors ${subLinkClass}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => go("pricing")}
          className={`rounded-2xl px-3 py-3 text-left text-[16px] transition-colors ${itemHoverClass}`}
        >
          Pricing
        </button>

        <div className="flex flex-col gap-0.5">
          <span className={`px-3 pt-2 text-[12px] font-medium tracking-[0.1em] uppercase ${resourcesLabelClass}`}>
            Resources
          </span>
          {RESOURCES_MENU.map((link) => {
            const isExternal = link.href.startsWith("http");
            return (
              <Link
                key={link.label}
                href={link.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener" : undefined}
                onClick={onClose}
                className={`rounded-xl px-3 py-2 text-[14px] no-underline transition-colors ${subLinkClass}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        {/* This CTA link was briefly removed entirely (misread of "hapus
            border di navbar dan cta di navbar" as "remove the CTA," not
            "remove the border from the navbar and its CTA") — restored
            ("cta di navbar hilang. kembalikan"), now borderless via
            `ctaClass` instead of gone. */}
        <a
          href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ05uOSQ6yl1esZXIC4E1tTxaHjO4J_gYaSvvfilV3L0884qFAars-E8LLeaXy5bkSBkVvXmpnAu?gv=true"
          target="_blank"
          rel="noopener"
          className={`mt-4 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] no-underline backdrop-blur-lg ${ctaClass}`}
        >
          Let&apos;s Talk
        </a>
      </div>
    </div>
  );
}
