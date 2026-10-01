"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ctaBgGradient, heroBgGradient } from "./gradients";

type ScrollDriverState = {
  activeProject: number;
  overLightWork: boolean;
  /** General "is nav currently over a light-background section" — true while
   * `overLightWork` is true (preserves the homepage's tuned pin-section timing
   * exactly), OR while any `[data-nav-bg="light"]` element spans the nav's
   * vertical position. Nav uses this (not `overLightWork` directly) so the
   * same light/dark text logic works on any page, not just the homepage's
   * pinned work gallery. */
  navOnLight: boolean;
  /** True while the page is still scrolled within the hero section (top <
   * one viewport height) — Nav uses this to hide its own pill/CTA chrome
   * background entirely while the hero's own dark background is right
   * behind it, letting the links/button sit directly on the hero instead
   * of inside a pill. Goes `false` as soon as the user scrolls past the
   * hero into the next section, same as `logoMode` flipping to "cta" is
   * driven by scroll position rather than by section membership. */
  atHero: boolean;
  logoMode: "hero" | "cta";
  revealed: Record<string, boolean>;
};

type ScrollDriverContextValue = ScrollDriverState & {
  setHeroBgEl: (el: HTMLDivElement | null) => void;
  setGlHostEl: (el: HTMLDivElement | null) => void;
  setPinEl: (el: HTMLDivElement | null) => void;
  setPinInnerEl: (el: HTMLDivElement | null) => void;
  setTrackEl: (el: HTMLDivElement | null) => void;
  setCtaSectionEl: (el: HTMLDivElement | null) => void;
  setFooterEl: (el: HTMLDivElement | null) => void;
  setProjectCount: (n: number) => void;
  goto: (index: number) => void;
  gotoId: (id: string) => void;
};

const ScrollDriverContext = createContext<ScrollDriverContextValue | null>(null);

const REVEAL_DELAYS: Record<string, number> = {
  ctaCard1: 90,
  ctaCard2: 180,
  pricingRow2Card0: 0,
  pricingRow2Card1: 110,
  footerCol0: 80,
  footerCol1: 160,
  footerCol2: 240,
};

export function revealStyle(
  revealed: Record<string, boolean>,
  id: string,
  reduceMotion: boolean
): CSSProperties {
  if (reduceMotion) return { opacity: 1, transform: "none" };
  const shown = !!revealed[id];
  const delay = REVEAL_DELAYS[id] ?? 0;
  const t = `0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`;
  return {
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0) scale(1)" : "translateY(26px) scale(0.98)",
    transition: `opacity ${t}, transform ${t}`,
  };
}

export function fadeStyle(
  revealed: Record<string, boolean>,
  id: string,
  reduceMotion: boolean,
  ms = 900
): CSSProperties {
  if (reduceMotion) return { opacity: 1, transform: "none" };
  const shown = !!revealed[id];
  const t = `${ms}ms cubic-bezier(0.22,1,0.36,1)`;
  return {
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(36px)",
    transition: `opacity ${t}, transform ${t}`,
  };
}

export function ScrollDriverProvider({ children }: { children: ReactNode }) {
  const heroBgElRef = useRef<HTMLDivElement | null>(null);
  const glHostElRef = useRef<HTMLDivElement | null>(null);
  const pinElRef = useRef<HTMLDivElement | null>(null);
  const pinInnerElRef = useRef<HTMLDivElement | null>(null);
  const trackElRef = useRef<HTMLDivElement | null>(null);
  const ctaSectionElRef = useRef<HTMLDivElement | null>(null);
  const footerElRef = useRef<HTMLDivElement | null>(null);
  const projectCountRef = useRef(0);
  const reduceMotionRef = useRef(false);

  const [state, setState] = useState<ScrollDriverState>({
    activeProject: -1,
    overLightWork: false,
    navOnLight: false,
    atHero: true,
    logoMode: "hero",
    revealed: {},
  });
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    reduceMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ticking = false;

    const update = () => {
      const vh = window.innerHeight || 1;
      const vw = window.innerWidth || 1;
      let top = window.scrollY || window.pageYOffset || 0;
      const se = document.scrollingElement;
      if (se && se.scrollTop > top) top = se.scrollTop;

      // hero parallax
      document.querySelectorAll<HTMLElement>("[data-para]").forEach((el) => {
        const s = parseFloat(el.dataset.para || "0");
        const r = el.getBoundingClientRect();
        const d = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-d * s).toFixed(1)}px, 0)`;
      });

      // hero fade-out
      const o = Math.max(0, 1 - top / (vh * 0.62));
      document.querySelectorAll<HTMLElement>("[data-fade]").forEach((el) => {
        el.style.opacity = o.toFixed(2);
      });

      // fixed background gradient morph + 3D logo position/opacity
      let logoMode: "hero" | "cta" = "hero";
      if (heroBgElRef.current) {
        const p = Math.max(0, Math.min(1, top / vh));
        const pBg = Math.max(0, Math.min(1, top / (vh * 0.62)));
        let bg = heroBgGradient(pBg);
        let glOpacity = Math.max(0, 1 - p * 1.6);
        let glTransform = `translate3d(0, ${(-top * 0.55).toFixed(1)}px, 0)`;

        if (ctaSectionElRef.current) {
          const r = ctaSectionElRef.current.getBoundingClientRect();
          const rt = r.top / vh;

          if (pinInnerElRef.current) {
            const out = Math.max(0, Math.min(1, (rt - 0.45) / 0.45));
            pinInnerElRef.current.style.opacity = out.toFixed(3);
            pinInnerElRef.current.style.transform = `translateY(${((1 - out) * -64).toFixed(1)}px)`;
          }

          // `rt` only ever gets more negative as you scroll past the CTA
          // section's *top*, so a `q` built from `rt` alone clamps at 1 and
          // *stays* there for the rest of the page — `bg` would stay locked
          // on `ctaBgGradient(1)` (near-black) behind every later section,
          // forever. Normally invisible (every later section — Work
          // Gallery, Testimonials, Pricing — paints its own opaque white
          // background over this fixed one), but it showed through as a
          // solid black band right above the footer, in the gap the
          // footer's own clip-path-driven "uncover" reveal leaves
          // temporarily uncovered while the footer is still scrolling in
          // ("transisi footer, ada masalah" — elements clashing: the
          // footer's rounded panel entering on top of this leftover black
          // band instead of white).
          //
          // First fix folded `testimonialsSection`'s position into `q`
          // itself (not just `glOpacity`) — but that fadeOut was tuned for
          // the subtle GL logo, starting as soon as Testimonials is within
          // 1.1 viewport-heights *below* the viewport, i.e. well before
          // it's actually visible. Applied to `bg` too, it prematurely
          // washed the CTA section's own dark background back to white
          // while its content (e.g. "We are a focused product team...")
          // was still on screen, mid-section — this section is tall
          // (`pt-[60vh]` + content + `pb-[140px]`), so `rt` is already deep
          // negative well before a viewer has actually scrolled past it.
          //
          // Fixed properly by making `q` symmetric on the CTA section's
          // *own* box instead of coupling it to an unrelated section:
          // `qEnter` rises as the section's top approaches/passes the
          // reveal line (unchanged), `qExit` falls only once the section's
          // *bottom* (`rb`) has scrolled above the viewport — i.e. once the
          // section has actually fully passed, regardless of how tall it
          // is or where Testimonials happens to sit. `glOpacity` keeps its
          // own Testimonials-based fadeOut below (fine for a subtle visual
          // fade, just no longer driving `bg`).
          const rb = r.bottom / vh;
          const qEnter = Math.max(0, Math.min(1, (0.5 - rt) / 0.42));
          const qExit = Math.max(0, Math.min(1, (rb + 0.1) / 0.42));
          const q = Math.min(qEnter, qExit);

          if (q > 0) {
            bg = ctaBgGradient(q);
            logoMode = "cta";
            glOpacity = q;
            glTransform = "translate3d(0,0,0)";
          }

          // GL logo only (not `bg`/`q` — see above): fades out a bit early
          // as Testimonials approaches, purely cosmetic for the 3D mark.
          const testimonialsSection = document.getElementById("testimonials");
          if (testimonialsSection) {
            const fr = testimonialsSection.getBoundingClientRect();
            const frt = fr.top / vh;
            const fadeOut = Math.max(0, Math.min(1, (1.1 - frt) / 0.6));
            glOpacity *= 1 - fadeOut;
          }
        }

        heroBgElRef.current.style.background = bg;
        if (glHostElRef.current) {
          glHostElRef.current.style.opacity = glOpacity.toFixed(3);
          glHostElRef.current.style.transform = glTransform;
        }
      }

      // pinned horizontal work gallery
      let active = -1;
      let overLightWork = false;
      const n = projectCountRef.current;
      if (pinElRef.current && trackElRef.current && n > 1) {
        const travel = (n - 1) * vh;
        const pinTop = pinElRef.current.getBoundingClientRect().top;
        overLightWork = pinTop <= vh * 0.55 && pinTop > -(travel + 2);
        const progress = Math.max(0, Math.min(1, -pinTop / travel));
        trackElRef.current.style.transform = `translate3d(${(-progress * (n - 1) * vw).toFixed(1)}px, 0, 0)`;
        if (overLightWork) active = Math.round(progress * (n - 1));
      }

      // nav text/logo contrast — generalizes overLightWork beyond the pinned
      // work gallery so any page can mark a section [data-nav-bg="light"] and
      // get the same "dark text/logo over light backgrounds" behavior. Probe
      // near the nav's own vertical center (it's an 80px/68px bar pinned at
      // top:0) rather than mid-viewport, so this reflects what's actually
      // behind the nav bar itself.
      let navOnLight = overLightWork;
      if (!navOnLight) {
        const probeY = 40;
        document.querySelectorAll<HTMLElement>('[data-nav-bg="light"]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top <= probeY && r.bottom > probeY) navOnLight = true;
        });
      }

      const atHero = top < vh;

      // footer "uncover": clip-path wipe (+ a small rise) synced to how far the
      // footer has scrolled into view, so it reads as already sitting there and
      // being progressively revealed rather than just scrolling in like any
      // other section. Driven imperatively here (not CSS position:sticky —
      // sticky+negative-margin on the last element of an unconstrained-height
      // page renders permanently "stuck" from scroll position 0 in Chromium,
      // confirmed via manual testing, so this scroll-tick-driven clip is used
      // instead).
      if (footerElRef.current) {
        if (reduceMotionRef.current) {
          footerElRef.current.style.clipPath = "none";
          footerElRef.current.style.transform = "none";
        } else {
          const r = footerElRef.current.getBoundingClientRect();
          // Short, capped range so the wipe resolves quickly after the footer
          // starts entering rather than dragging blank for most of its
          // transit (which read as broken, not as an "uncover" effect).
          const revealDistance = vh * 0.4;
          const raw = Math.max(0, Math.min(1, (vh - r.top) / revealDistance));
          const fp = 1 - (1 - raw) * (1 - raw); // ease-out, resolves faster early
          const clipTop = (1 - fp) * 55; // cap: always show at least the bottom 45%
          footerElRef.current.style.clipPath = `inset(${clipTop.toFixed(2)}% 0 0 0)`;
          footerElRef.current.style.transform = `translate3d(0, ${((1 - fp) * 22).toFixed(1)}px, 0)`;
        }
      }

      // reveal-on-scroll
      let revealed = stateRef.current.revealed;
      if (!reduceMotionRef.current) {
        const next: Record<string, boolean> = { ...revealed };
        let changed = false;
        document.querySelectorAll<HTMLElement>("[data-reveal-id]").forEach((el) => {
          const id = el.dataset.revealId;
          if (!id) return;
          const r = el.getBoundingClientRect();
          const visible = r.bottom > 0 && r.top < vh * 0.92;
          if (next[id] !== visible) {
            next[id] = visible;
            changed = true;
          }
        });
        if (changed) revealed = next;
      }

      setState((prev) => {
        if (
          prev.activeProject === active &&
          prev.overLightWork === overLightWork &&
          prev.navOnLight === navOnLight &&
          prev.atHero === atHero &&
          prev.logoMode === logoMode &&
          prev.revealed === revealed
        ) {
          return prev;
        }
        return { activeProject: active, overLightWork, navOnLight, atHero, logoMode, revealed };
      });
    };

    const scheduleUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    update();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  const goto = useCallback((index: number) => {
    window.scrollTo({ top: (index + 1) * window.innerHeight, behavior: "smooth" });
  }, []);

  const gotoId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // `offsetTop` is relative to the nearest *positioned* ancestor, not
      // the document — several sections (e.g. FinalCtaFooter's own
      // `position: relative` wrapper around `#contact`) sit inside one, so
      // offsetTop alone under-reports how far down the page they actually
      // are. getBoundingClientRect() + the current scroll offset gives the
      // real document-relative position regardless of what's positioned in
      // between.
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      // Nav is shared across routes; on a page that doesn't have this
      // section (e.g. /work), fall back to the homepage anchor instead of
      // doing nothing.
      window.location.href = `/#${id}`;
    }
  }, []);

  const value: ScrollDriverContextValue = {
    ...state,
    setHeroBgEl: (el) => {
      heroBgElRef.current = el;
    },
    setGlHostEl: (el) => {
      glHostElRef.current = el;
    },
    setPinEl: (el) => {
      pinElRef.current = el;
    },
    setPinInnerEl: (el) => {
      pinInnerElRef.current = el;
    },
    setTrackEl: (el) => {
      trackElRef.current = el;
    },
    setCtaSectionEl: (el) => {
      ctaSectionElRef.current = el;
    },
    setFooterEl: (el) => {
      footerElRef.current = el;
    },
    setProjectCount: (n) => {
      projectCountRef.current = n;
    },
    goto,
    gotoId,
  };

  return <ScrollDriverContext.Provider value={value}>{children}</ScrollDriverContext.Provider>;
}

export function useScrollDriver() {
  const ctx = useContext(ScrollDriverContext);
  if (!ctx) throw new Error("useScrollDriver must be used within ScrollDriverProvider");
  return ctx;
}

function subscribeReduceMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReduceMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReduceMotionServerSnapshot() {
  return false;
}

export function useReduceMotion() {
  return useSyncExternalStore(subscribeReduceMotion, getReduceMotionSnapshot, getReduceMotionServerSnapshot);
}
