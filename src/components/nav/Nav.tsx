"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BUILD_MENU, RESOURCES_MENU } from "@/lib/data/nav";
import { useScrollDriver } from "@/lib/scroll/useScrollDriver";
import { LetsTalkMenu } from "./LetsTalkMenu";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";

type NavProps = {
  /** Controls only `MobileNav`'s drawer chrome (background, border, shadow)
   * — a per-page fallback for that one full-screen-ish overlay. 'dark'
   * (default) is the homepage's dark look; 'light' is for permanently
   * light pages (e.g. /work). Everything else — the pill/hamburger/
   * MegaMenu/LetsTalkMenu chrome, and text/logo color — is driven
   * dynamically by `navOnLight` (below) instead, regardless of this prop;
   * see Behavior in Nav-docs.md for why. */
  theme?: "light" | "dark";
  /** Selects the pill/hamburger/`LetsTalkMenu`-trigger chrome treatment —
   * the logo is unaffected either way (see Nav-v2-docs.md). 'v1' (default)
   * still branches on `navOnLight`: a light-glass pill (`bg-ink/5`, dark
   * text) over light sections, translucent-white glass (`bg-white/8`,
   * white text) over dark ones. 'v2' ignores `navOnLight` entirely for its
   * own chrome — always the solid grey pill (`bg-[#767676]`, white text),
   * regardless of what's behind the nav, so the chrome never flips color
   * mid-scroll (on request — see `isGreyChrome`'s own comment below for
   * the change history). `MegaMenu`'s dropdown *panel* (not its trigger)
   * stays independently dark for v2 either way — that was already
   * unconditional on `navOnLight`, unaffected by this. */
  chromeVariant?: "v1" | "v2";
};

export function Nav({ theme = "dark", chromeVariant = "v1" }: NavProps) {
  const { navOnLight, atHero, gotoId } = useScrollDriver();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Logo always follows what's actually behind the nav (navOnLight — see
  // useScrollDriver.tsx) regardless of chromeVariant — it sits directly on
  // the page background, not on the pill, so v2's chrome swap doesn't
  // touch it (see Nav-v2-docs.md).
  const showDarkLogo = navOnLight;

  // `isLightChrome` drives Nav's own pill/hamburger light-vs-dark branch
  // below — in v1 it's just `navOnLight` (unchanged, original behavior);
  // in v2 it's always `false`. `MegaMenu` and `LetsTalkMenu` both need
  // their *raw* `navOnLight` plus `chromeVariant` passed through instead
  // of this collapsed value — they each compute their own `isGreyChrome`
  // internally, because their existing "dark" branches (`bg-white/8` for
  // LetsTalkMenu's trigger, `hover:bg-white/14` for both trigger hovers)
  // are translucent-white values tuned for a *dark* page behind them, and
  // silently go invisible if collapsed straight into via a passed-in
  // `false` over v2's actually-white page — bit this project once already
  // (see Nav-v2-docs.md's Implementation section for the full story).
  const isLightChrome = chromeVariant === "v1" && navOnLight;
  const isGreyChrome = chromeVariant === "v2";
  // v2's pill was briefly a *fixed* glass tint ("transparent glass",
  // independent of `navOnLight`, like the old unconditional solid-grey
  // branch it replaced) — but true transparency has no contrast guarantee
  // of its own: white text on light glass over a light section read as
  // basically invisible ("ada issue ketika navigasi ada di section terang,
  // jadi ga terlihat"). Solid grey could afford to ignore `navOnLight`
  // because it was opaque; glass can't, so v2 now flips its tint — still
  // translucent glass in both states, just dark-glass/white-text over dark
  // sections and light-glass/dark-text over light ones, mirroring v1's own
  // `isLightChrome` split below.
  const greyChromeOnLight = isGreyChrome && navOnLight;
  const textColorClass = isLightChrome || greyChromeOnLight ? "text-gray-700" : "text-white/82";
  const hamburgerTextClass = isLightChrome || greyChromeOnLight ? "text-gray-700" : "text-white";

  // No `border-*` color in any branch — the pill/hamburger border was
  // removed entirely on request ("hapus border di navbar"), so these are
  // background-only now (no shadow either — removed on request).
  const chromeClass = isGreyChrome
    ? greyChromeOnLight
      ? "bg-ink/10"
      : "bg-white/12"
    : isLightChrome
      ? "bg-ink/5 shadow-[0_6px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)]"
      : "bg-white/8 shadow-[0_6px_24px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.18)]";
  const pillLinkHoverClass = isGreyChrome
    ? greyChromeOnLight
      ? "hover:bg-ink/16"
      : "hover:bg-white/20"
    : isLightChrome
      ? "hover:bg-ink/10"
      : "hover:bg-white/14";
  const hamburgerChromeClass = isGreyChrome ? (greyChromeOnLight ? "bg-ink/10" : "bg-white/12") : isLightChrome ? "bg-ink/5" : "bg-white/8";
  // Still within the hero (top < one viewport — see `atHero`'s own comment
  // in useScrollDriver.tsx): drop the pill/hamburger's own background
  // entirely (on request — "saat scroll sampai di hero, sembunyikan
  // background color navbar dan si button lets talk") so the links sit
  // directly on the hero's own dark background instead of inside a visible
  // pill. Text color is untouched — it already tracks `navOnLight`/
  // `isLightChrome` regardless of this, so it stays legible either way.
  const pillChromeClass = atHero ? "bg-transparent" : chromeClass;
  const hamburgerBgClass = atHero ? "bg-transparent" : hamburgerChromeClass;

  return (
    <nav className="fixed top-0 right-0 left-0 z-40 h-20 max-[560px]:h-[68px]">
      <div className="pai-container relative mx-auto flex h-full w-full max-w-[1900px] items-center justify-between px-10 max-[900px]:px-6 max-[560px]:px-4">
        <Link href="/" className="relative block h-6 w-[137px] shrink-0" aria-label="Paistudio home">
          <Image
            src="/logos/paistudio-logo-dark.svg"
            alt="paistudio"
            fill
            unoptimized
            className="object-contain"
            style={{ opacity: showDarkLogo ? 1 : 0 }}
          />
          <Image
            src="/logos/paistudio-logo-light.svg"
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            className="object-contain"
            style={{ opacity: showDarkLogo ? 0 : 1 }}
          />
        </Link>

        <div
          className={`absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full p-[5px] text-[14px] font-semibold tracking-[0.02em] backdrop-blur-lg backdrop-saturate-150 transition-colors duration-150 max-[900px]:hidden ${pillChromeClass} ${textColorClass}`}
        >
          <Link href="/work" className={`rounded-full px-[18px] py-2 no-underline transition-[background-color] duration-150 ${pillLinkHoverClass}`}>
            Our Work
          </Link>
          <MegaMenu
            label="Build"
            navOnLight={navOnLight}
            chromeVariant={chromeVariant}
            panelWidthClassName="w-[420px]"
            columns={[
              { title: "What We Build", links: BUILD_MENU.whatWeBuild },
              { title: "How We Build It", links: BUILD_MENU.howWeBuildIt },
            ]}
          />
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              gotoId("pricing");
            }}
            className={`cursor-pointer rounded-full px-[18px] py-2 transition-[background-color] duration-150 ${pillLinkHoverClass}`}
          >
            Pricing
          </a>
          <MegaMenu
            label="Resources"
            navOnLight={navOnLight}
            chromeVariant={chromeVariant}
            panelWidthClassName="w-[230px]"
            columns={[{ links: RESOURCES_MENU }]}
          />
        </div>

        {/* CTA (`LetsTalkMenu variant="nav"`) was briefly removed entirely
            here on a misread of "hapus border di navbar dan cta di navbar"
            — the actual request was to strip the *border* from both the
            navbar and its CTA, not delete the CTA itself ("cta di navbar
            hilang. kembalikan" — restored). `LetsTalkMenu`'s own `nav`-variant
            trigger no longer applies `border` (see LetsTalkMenu.tsx), so this
            button is borderless like the rest of the pill/hamburger, but the
            button itself is back. */}
        <div className="flex items-center gap-8 max-[900px]:gap-3">
          <div className="max-[900px]:hidden">
            <LetsTalkMenu variant="nav" align="right" navOnLight={navOnLight} chromeVariant={chromeVariant} atHero={atHero} />
          </div>
          <button
            type="button"
            className={`hidden items-center justify-center rounded-full p-2.5 backdrop-blur-lg backdrop-saturate-150 transition-colors duration-150 max-[900px]:flex ${hamburgerBgClass} ${hamburgerTextClass}`}
            aria-label="Open menu"
            aria-haspopup="true"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} theme={theme} />
    </nav>
  );
}
