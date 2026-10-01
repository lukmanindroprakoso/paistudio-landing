"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Project } from "@/types/work";

const CYCLE_MS = 1300;

const noopSubscribe = () => () => {};

/** Not-hovered default image, randomized among `[coverImage, ...showcaseImages]`
 * instead of always `coverImage` — via `useSyncExternalStore` (same pattern
 * `useReduceMotion` uses in useScrollDriver.tsx) rather than `useState` +
 * `useEffect`, since a `Math.random()` pick needs to differ safely between
 * server and client without a hydration mismatch: `getServerSnapshot`
 * always returns `coverImage` (what the server rendered), `getSnapshot`
 * picks once per mount and caches it in a ref so it stays stable across
 * re-renders. */
function useRandomDefaultImage(coverImage: string, showcaseImages: string[]) {
  const pickedRef = useRef<string | null>(null);
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      if (pickedRef.current === null) {
        const pool = [coverImage, ...showcaseImages];
        pickedRef.current = pool[Math.floor(Math.random() * pool.length)];
      }
      return pickedRef.current;
    },
    () => coverImage
  );
}

// Fallback aspect ratio only — used until the real image has loaded
// client-side and reported its own natural size (see `aspectRatio` state
// below). Close to this project's real cover-image ratios (~1.25–1.41,
// i.e. landscape) so there's minimal layout shift once the real value
// swaps in, unlike the old fixed "4 / 5" (portrait) every card used to
// share regardless of its actual image shape — that mismatch is exactly
// why this changed: a landscape screenshot inside a portrait box left
// large empty gaps above/below it under `object-contain`.
const FALLBACK_ASPECT_RATIO = 4 / 3;

type ProjectCardProps = {
  project: Project;
  /** Controlled by the grid so every card reveals together, on a delay after the hero. */
  revealed: boolean;
};

export function ProjectCard({ project, revealed }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const defaultImage = useRandomDefaultImage(project.coverImage, project.showcaseImages);

  // Each card fits its own resting/default image's real proportions
  // instead of every card in the grid sharing one fixed shape — set once
  // from the loaded `<img>`'s `naturalWidth`/`naturalHeight` (real
  // per-image, per-card sizing; genuinely different projects can render at
  // genuinely different heights now, on request: "tiap card bikin fit
  // height to gambarnya"). Deliberately only updates from the *resting*
  // image's load, not the hover-cycled showcase images — those still
  // report through the same `onLoad` handler, but the `hovered` guard
  // skips the `setAspectRatio` call for them, so the card's box stays put
  // instead of resizing every ~1.3s as the hover cycle swaps images.
  const [aspectRatio, setAspectRatio] = useState(FALLBACK_ASPECT_RATIO);

  useEffect(() => {
    if (!hovered || project.showcaseImages.length === 0) return;
    const interval = setInterval(() => {
      setImageIndex((i) => (i + 1) % project.showcaseImages.length);
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, [hovered, project.showcaseImages.length]);

  const handleMouseEnter = () => {
    setHovered(true);
    setImageIndex(0);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    setImageIndex(0);
  };

  const displayedImage =
    hovered && project.showcaseImages.length > 0 ? project.showcaseImages[imageIndex] : defaultImage;

  return (
    <Link
      // /work/[slug] (the "v2" template, primary since the route swap —
      // see src/types/work.ts's ProjectDetailV2 comment) is the default;
      // /work/archive/[slug] (the older template) is a defensive fallback
      // for the rare project without a work_project_details_v2 row, so a
      // card never links to a route that 404s.
      href={project.hasV2 ? `/work/${project.slug}` : `/work/archive/${project.slug}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group block"
    >
      {/* Same reveal used by the hero and the homepage's "Our Work" gallery
          (pai-work-copy/pai-armed/pai-play, see globals.css) — thumbnail and
          text are its two staggered children, so the image fades/slides in
          first (nth-child(1), 0.04s delay) and the text follows right after
          (nth-child(2), 0.13s delay). */}
      <div className={`pai-work-copy pai-armed${revealed ? " pai-play" : ""}`}>
        {/* Container + max-width treatment, same idiom as the v2 detail
            page's images (ContainedImage/SplitImageRow/CurvedRevealImage):
            #E0E0E0 container, image capped at max-width and centered
            inside it via object-contain, instead of filling the frame. */}
        <div className="pai-hover-card w-full rounded-[32px] bg-[#E0E0E0]" style={{ aspectRatio }}>
          <div className="relative mx-auto h-full w-full max-w-[100%]">
            <Image
              src={displayedImage}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              onLoad={(e) => {
                if (hovered) return;
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setAspectRatio(img.naturalWidth / img.naturalHeight);
                }
              }}
            />
          </div>
          {project.badge && (
            <span className="absolute top-4 left-4 rounded-full bg-brand px-3 py-1 text-[12px] font-medium tracking-[0.1em] text-white uppercase">
              {project.badge}
            </span>
          )}
          <div className="pai-hover-bubble text-center text-[13px] leading-[1.2] tracking-[0.01em] text-ink">
            <span>View</span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-[18px] leading-[1.3] font-medium text-text text-balance">{project.title}</h3>
          <p className="mt-2 text-[14px] leading-[1.6] text-muted">{project.description}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {project.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-pill px-3.5 py-1.5 text-[14px] text-text">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
