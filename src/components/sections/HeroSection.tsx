import Image from "next/image";
import { Marquee } from "@/components/Marquee";

type TrustBadge = {
  label: string;
  sourceUrl?: string;
};

/** One real image in the Hero's horizontal image marquee (see `images`
 * below). */
type HeroImage = { src: string; alt: string };

/** One step in a `HeroCard` timeline — e.g. `{ label: "Received", time: "2:14 PM" }`. */
type HeroCardStep = { label: string; time: string };

/** A single floating status card for the hero's optional card canvas (see
 * `cards` below). Three block types, matching the "Lassie-style" card
 * system's Header/Status/Working/Metric blocks: `timeline` (an entity +
 * value header, then a 2-step status timeline), `working` (a single
 * in-progress line + optional meta), and `metrics` (a small labeled list,
 * e.g. a weekly summary). Each optionally carries a `tag` — a small
 * pill-shaped footer badge naming the workspace/team/category the card
 * belongs to. Content is illustrative output copy (what a real SaaS
 * product's UI would show), never marketing language about the product
 * itself — calm, factual, present tense for in-progress states,
 * past tense for completed ones. */
type HeroCard =
  | { type: "timeline"; header: string; steps: HeroCardStep[]; tag?: string }
  | { type: "working"; text: string; meta?: string; tag?: string }
  | { type: "metrics"; header: string; rows: { label: string; value: string }[]; tag?: string };

type HeroSectionProps = {
  eyebrow: string;
  /** Template: "Why [X] Is Essential for [Outcome]" — enforced by whoever
   * writes the copy at call time, not by this component (it renders
   * whatever string it's given). */
  headline: string;
  /** 1-2 sentences. */
  subhead: string;
  trustBadges: TrustBadge[];
  cta: { label: string; href: string };
  /** Optional 3 floating status cards, scattered over a panel in place of
   * the two plain image-placeholder boxes. Omit (the default) to keep the
   * original placeholder row unchanged — every other page using this
   * component is unaffected. See `HeroCard` above for content rules.
   * Takes priority over `images` if both are somehow passed. */
  cards?: HeroCard[];
  /** Optional real images, replacing the two plain placeholder boxes with a
   * continuously auto-scrolling horizontal marquee (same technique as the
   * homepage's `WorkGallery`, but moving horizontally instead of
   * vertically, on request — see `HeroMarqueeTile` below for the
   * width/height reasoning). Was a fixed `{ primary, secondary }` pair;
   * widened to an arbitrary-length array on request ("gunakan gambar yg
   * dipake sesuai di work gallery") so a page can reuse its matching
   * `WorkGallery` project's full real gallery (e.g.
   * `PROJECTS.find(p => p.id === "saas-web-apps").gallery`) 1:1 instead of
   * being capped at 2 images. Omit (the default) to keep the plain
   * placeholder boxes — every other page is unaffected. Ignored if `cards`
   * is also passed. */
  images?: HeroImage[];
  /** Set true to skip the image row entirely (no cards, no marquee, no
   * placeholder boxes) — for pages with no matching real gallery to show,
   * on request ("hide the marque in n8n, softr, airtable, claude ai,
   * lovable"): those 5 tool pages have no direct 1:1 `WorkGallery`
   * category, so their placeholder boxes are just empty gray filler with
   * no real content coming later, unlike every other page's placeholder
   * which is a "not wired up yet" state. Omit (the default, `false`) to
   * keep the existing `cards` → `images` → placeholder fallback chain —
   * every other page is unaffected. Takes priority over both `cards` and
   * `images` if somehow combined. */
  hideImages?: boolean;
};

/** Small pill-shaped footer badge shared by all three `HeroCard` types. */
function HeroCardTag({ tag }: { tag: string }) {
  return (
    <span className="mt-3 inline-block rounded-full bg-pill px-2.5 py-1 text-[10px] font-medium tracking-[0.04em] text-text uppercase">
      {tag}
    </span>
  );
}

/** Renders one `HeroCard` inside the shared white card shell — same
 * `rounded-[32px]`-family radius as the rest of this project's image/card
 * treatments, scaled down (`rounded-2xl`) to suit a small floating card. */
function HeroCardContent({ card }: { card: HeroCard }) {
  if (card.type === "timeline") {
    return (
      <div className="rounded-2xl bg-white p-4 text-left shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]">
        <p className="m-0 text-[13px] font-semibold text-text">{card.header}</p>
        <div className="mt-3 flex items-center gap-2">
          {card.steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="text-muted">
                  →
                </span>
              )}
              <div>
                <p className="m-0 text-[11px] font-medium text-ink">{step.label}</p>
                <p className="m-0 text-[11px] text-muted">{step.time}</p>
              </div>
            </div>
          ))}
        </div>
        {card.tag && <HeroCardTag tag={card.tag} />}
      </div>
    );
  }

  if (card.type === "working") {
    return (
      <div className="rounded-2xl bg-white p-4 text-left shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand" aria-hidden="true" />
          <p className="m-0 text-[13px] font-medium text-text">{card.text}</p>
        </div>
        {card.meta && <p className="m-0 mt-2 text-[11px] text-muted">{card.meta}</p>}
        {card.tag && <HeroCardTag tag={card.tag} />}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 text-left shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]">
      <p className="m-0 text-[11px] font-medium tracking-[0.04em] text-muted uppercase">{card.header}</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {card.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <span className="text-[12px] text-muted">{row.label}</span>
            <span className="text-[12px] font-semibold text-text">{row.value}</span>
          </div>
        ))}
      </div>
      {card.tag && <HeroCardTag tag={card.tag} />}
    </div>
  );
}

/** One real image tile inside the Hero's horizontal image marquee (see
 * `images` below) — the mirror image of `WorkGallery.tsx`'s vertical
 * `GalleryTile`: that one fixes each tile's *width* to the row and lets
 * `aspect-ratio` drive its height; this fixes the row's *height* (the
 * marquee track is stretched to the wrapper's `h-full` via flex's default
 * cross-axis `stretch`) and lets `aspect-ratio` drive each tile's width,
 * since a horizontally-scrolling row needs a fixed height, not a fixed
 * width. Same `rounded-[32px]` + `object-cover` treatment as every other
 * image box in this project. */
function HeroMarqueeTile({ src, alt }: HeroImage) {
  return (
    <div className="relative h-full shrink-0 overflow-hidden rounded-[32px] bg-[#d9d7d0]" style={{ aspectRatio: "16 / 10" }}>
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}

/** Desktop scatter position for each of the (up to 3) cards — top-left,
 * lower-center (layered above the first, `z-10`), bottom-right (`z-20`).
 * Every position resets to a plain stacked flow on mobile
 * (`max-[900px]:static ...`), matching the rest of this component's
 * `max-[900px]` breakpoint. Percentages are tuned to stay clear of each
 * other's shadows at the card widths below without overlapping. */
const HERO_CARD_POSITION_CLASSES = [
  "absolute left-[4%] top-[8%] w-[260px] max-w-[65%] -rotate-2 max-[900px]:static max-[900px]:w-full max-[900px]:max-w-full max-[900px]:rotate-0",
  "absolute left-[32%] top-[44%] z-10 w-[240px] max-w-[65%] rotate-1 max-[900px]:static max-[900px]:z-auto max-[900px]:w-full max-[900px]:max-w-full max-[900px]:rotate-0",
  "absolute right-[5%] bottom-[8%] z-20 w-[220px] max-w-[65%] -rotate-1 max-[900px]:static max-[900px]:z-auto max-[900px]:w-full max-[900px]:max-w-full max-[900px]:rotate-0",
];

/** SEC-01 · Hero / Value Proposition.
 *
 * NOTE ON `src/components/Hero.tsx`: that existing component is this
 * site's own homepage hero — zero props (fully hardcoded copy), no
 * eyebrow, no CTA button, and its stats row is logos + big numbers in a
 * divided 4-column layout. It doesn't match SEC-01's spec on props,
 * render order, or content model, so this is a new component rather than
 * a reuse/edit of that one — see the task's own instruction to
 * verify-not-duplicate. Not modified; still in active use on the homepage.
 *
 * Trust badges went through a few iterations on request — logo images
 * matching the real Hero, then a centered no-divider layout — before
 * landing here on a single collapsed text line (no logos), which is what
 * ships now: each badge is plain text, joined on one line with `·`
 * separators.
 *
 * Render order: eyebrow → H1 → subhead → CTA → trust badges → image
 * h-stack. This is a deliberate deviation from SEC-01's originally-spec'd
 * order (trust badges before the CTA, and no image row at all) — trust
 * badges placed below the CTA, and a two-image h-stack added at the very
 * end, both on direct request. The image row is placeholder-only for now
 * (no image props yet) — matching this project's own placeholder
 * convention (`WorkGallery.tsx`'s `GalleryTile`: a labeled `bg-[#d9d7d0]`
 * box, muted uppercase caption) rather than wiring up `next/image`
 * against fabricated file paths that don't exist yet. Split 50/50 via
 * `flex-[50]`/`flex-[50]` (not raw `w-[50%]`/`w-[50%]`) so the ratio holds
 * against the *remaining* width after the gap is subtracted, rather than
 * the gap pushing the total past 100% — was 65/35 originally, evened out
 * to 50/50 on request. Corners are `rounded-[32px]`, the
 * same radius already used for every large image/card treatment
 * elsewhere in this project (ProjectCard, FeaturedPostCard,
 * ContainedImage, ...). Gap between the two images is `gap-4` (16px) —
 * started smaller (`gap-2`) on an earlier request, opened up slightly on
 * a follow-up.
 *
 * Optional `cards` prop (added on request, for /saas-web-app-development):
 * when passed, replaces the two placeholder image boxes with a floating
 * status-card canvas instead — up to 3 small white `HeroCard`s (timeline /
 * working / metrics, per the "Lassie-style" card system: Header row,
 * Status timeline, Working row, Metric list, Tag footer blocks) scattered
 * with slight rotation over a translucent panel (`HERO_CARD_POSITION_CLASSES`).
 * Every other page omits `cards` and keeps the original placeholder row —
 * fully backward compatible, opt-in per page rather than a global Hero
 * redesign. Card content is illustrative SaaS *output* (what a dashboard
 * would actually show), never marketing copy about Paistudio itself, per
 * the content rules it was written against — no fabricated Paistudio
 * claims live inside a card.
 *
 * Optional `images` prop: real images instead of the placeholder text,
 * originally the same two-box 50/50 row (`fill` + `object-cover`, static)
 * — now a continuously auto-scrolling horizontal marquee of the same two
 * images instead, on request ("masukin animasi kaya di workgallery... tapi
 * gambar bergerak horizontally"): reuses the exact `Marquee` primitive and
 * `.pai-hmarquee` CSS animation `WorkGallery.tsx` uses for its own
 * vertical marquee (including the same `prefers-reduced-motion` handling,
 * defined once in `globals.css` and shared by both), just with
 * `direction="horizontal"` instead of `"vertical"`. See `HeroMarqueeTile`
 * for why the row is now height-fixed with aspect-ratio-driven width
 * (the mirror of `GalleryTile`'s width-fixed/height-driven tiles) rather
 * than the old flex-[50]/flex-[50] split. Rendered as a sibling of the
 * `pai-container` div rather than nested inside it, so the marquee spans
 * the full viewport edge-to-edge instead of being capped at 1240px —
 * on request ("buat full-width sekarang masih kena max width"); every
 * other row in this component (text stack, `cards` canvas, placeholder
 * boxes) stays inside `pai-container` as before, this is the one
 * full-bleed exception. Each page now reuses its matching `WorkGallery`
 * project's real gallery via `getGalleryImages()`
 * (`src/lib/data/projects.ts`) rather than dedicated hero-only stills, on
 * request ("gunakan gambar yg dipake sesuai di work gallery") — see that
 * function's own doc comment for the id → page mapping. Ignored if
 * `cards` is also passed; omitted entirely on every other page, which
 * keeps the plain static placeholder boxes.
 *
 * Dark theme, now a green gradient rather than flat `bg-ink` — not in the
 * original spec, added on direct request to match "the index page's hero
 * section." The real Hero (src/components/Hero.tsx) has no background of
 * its own — its green comes from a separate `FixedBackground` layer
 * driven by `heroBgGradient()` (src/lib/scroll/gradients.ts), a
 * scroll-interpolated gradient spanning a 150vh canvas that eventually
 * fades to white. That machinery only makes sense wired into this site's
 * specific scroll pipeline, not a standalone reusable section, so this
 * bakes in a static gradient using `heroBgGradient(0)`'s own resting-state
 * colors instead (its first four stops — ATM_TOP → nearBlack → FOREST.g1
 * → FOREST.g2 — same near-black-to-forest-green sequence), capped before
 * the real gradient's later stops brighten toward white, since a bounded
 * section (unlike the homepage's scroll-through canvas) needs to stay
 * dark enough for the white text throughout to keep working.
 * `bg-[...]` sits on the outer, full-width `<section>`; the `pai-container`
 * max-width/padding wrapper is a separate inner `<div>` so the gradient
 * spans edge-to-edge instead of being boxed in at 1240px.
 *
 * Mobile aspect ratio (placeholder row only): each box's
 * `aspectRatio: "16 / 10"` inline style is unconditional — never
 * overridden at `max-[900px]`/`max-[560px]` — so the 16:10 shape itself
 * never changes between desktop and mobile, only the box's absolute pixel
 * size does. On mobile the row switches from `flex-[50]`/`flex-[50]` to a
 * stacked column (`max-[900px]:flex-col`); each box also gets an explicit
 * `max-[900px]:w-full` there rather than relying on flex's cross-axis
 * `stretch` default to imply full width — belt-and-suspenders against the
 * `aspect-ratio` + `flex-basis: auto` sizing interaction being a known
 * cross-browser rough edge, so the 16:10 ratio holds reliably everywhere
 * rather than depending on stretch resolving before aspect-ratio applies.
 * The `images` marquee row instead fixes the row's *height* per breakpoint
 * (`h-[360px]`/`max-[900px]:h-[240px]`/`max-[560px]:h-[180px]`) and lets
 * each tile's own `aspectRatio: "16 / 10"` drive its width — see
 * `HeroMarqueeTile`.
 */
export function HeroSection({ eyebrow, headline, subhead, trustBadges, cta, cards, images, hideImages }: HeroSectionProps) {
  return (
    <section
      className="py-32 max-[900px]:py-20"
      style={{ background: "linear-gradient(180deg, #04070b 0%, #040c11 30%, #06102e 60%, #0b3d91 100%)" }}
    >
      <div className="pai-container mx-auto w-full max-w-[1240px] px-10 max-[900px]:px-7 max-[560px]:px-5">
        {/* Stepped rhythm instead of one flat gap for every pairing —
            16/24/40/16/64px, expressing which elements are tightly coupled
            vs. which moment is meant to read as a decisive step (bumped up
            a notch from an earlier, cramped-feeling 12/20/32/12/48 pass —
            same shape, more room to breathe): eyebrow sits tight against
            its headline (16px, a label introducing it, not an evenly-spaced
            peer); headline→subhead is a touch looser (24px) as the rest of
            the same pitch; the CTA gets the biggest gap in the text stack
            (40px) since it's the one decisive action, not just another
            paragraph; the trust line then sits tight under the CTA again
            (16px) as supporting microcopy reinforcing it; the image
            h-stack — a distinct, visually heavier block — gets the most
            separation of all (64px). */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[12px] font-medium tracking-[0.1em] text-white/60 uppercase">{eyebrow}</span>

          <h1 className="m-0 mt-4 max-w-[900px] text-[64px] leading-[1.08] font-bold tracking-[-0.02em] text-white text-balance max-[900px]:text-[44px] max-[560px]:text-[32px]">
            {headline}
          </h1>

          <p className="m-0 mt-6 max-w-[640px] text-[18px] leading-[1.6] text-white/70">{subhead}</p>

          <a
            href={cta.href}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-deep"
          >
            {cta.label}
          </a>

          {trustBadges.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] tracking-[0.02em] text-white/70">
              {trustBadges.map((badge, i) => (
                <span key={badge.label} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">·</span>}
                  {/* Renders as a link only if sourceUrl is present — never
                      fabricate a destination for a badge that doesn't have one. */}
                  {badge.sourceUrl ? (
                    <a href={badge.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 no-underline hover:text-white">
                      {badge.label}
                    </a>
                  ) : (
                    badge.label
                  )}
                </span>
              ))}
            </div>
          )}

          {hideImages ? null : cards && cards.length > 0 ? (
            <div
              className="relative mt-16 w-full rounded-[32px] border border-white/10 bg-white/[0.04] max-[900px]:flex max-[900px]:flex-col max-[900px]:gap-4 max-[900px]:rounded-none max-[900px]:border-0 max-[900px]:bg-transparent max-[900px]:p-0"
              style={{ aspectRatio: "16 / 9" }}
            >
              {cards.slice(0, 3).map((card, i) => (
                <div key={i} className={HERO_CARD_POSITION_CLASSES[i] ?? HERO_CARD_POSITION_CLASSES[HERO_CARD_POSITION_CLASSES.length - 1]}>
                  <HeroCardContent card={card} />
                </div>
              ))}
            </div>
          ) : !images?.length ? (
            <div className="mt-16 flex w-full gap-4 max-[900px]:flex-col">
              <div
                className="flex flex-[50] basis-0 items-center justify-center overflow-hidden rounded-[32px] bg-[#d9d7d0] max-[900px]:w-full max-[900px]:flex-none"
                style={{ aspectRatio: "16 / 10" }}
              >
                <span className="text-[12px] tracking-[0.1em] text-muted uppercase">Image placeholder — 50%</span>
              </div>
              <div
                className="flex flex-[50] basis-0 items-center justify-center overflow-hidden rounded-[32px] bg-[#d9d7d0] max-[900px]:w-full max-[900px]:flex-none"
                style={{ aspectRatio: "16 / 10" }}
              >
                <span className="text-[12px] tracking-[0.1em] text-muted uppercase">Image placeholder — 50%</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Rendered as a sibling of `pai-container` (outside its `max-w-[1240px]`
          cap), not nested inside it, so the marquee spans the full viewport
          edge-to-edge — on request ("buat full-width sekarang masih kena max
          width"), since `<section>` itself carries no horizontal max-width
          or padding of its own (those only live on the `pai-container` div
          above), placing it here is enough to get true full-bleed without a
          negative-margin/breakout hack. */}
      {!hideImages && !cards?.length && images && images.length > 0 && (
        <div className="mt-16 h-[360px] w-full overflow-hidden max-[900px]:h-[240px] max-[560px]:h-[180px]">
          {/* `.pai-hmarquee`'s 26s default (globals.css) is shared with
              `CtaSection`'s tools-logo strip — slowed down for this
              instance only via an `animationDuration` override (an inline
              longhand always wins over the class's `animation` shorthand,
              same specificity rule either way) rather than touching the
              shared class, so the logo strip's own speed is untouched. On
              request ("its too fast"). */}
          <Marquee direction="horizontal" pauseOnHover style={{ height: "100%", gap: "16px", animationDuration: "70s" }}>
            {images.map((img, i) => (
              <HeroMarqueeTile key={i} src={img.src} alt={img.alt} />
            ))}
          </Marquee>
        </div>
      )}
    </section>
  );
}
