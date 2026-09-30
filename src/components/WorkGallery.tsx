"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PROJECTS } from "@/lib/data/projects";
import { useScrollDriver } from "@/lib/scroll/useScrollDriver";
import { Marquee } from "./Marquee";

// Fallback only, for the moment before a real image reports its own size
// via `onLoad` below — this project's other fit-height treatment
// (ProjectCard.tsx) uses the same "close, not exact" reasoning for its
// own fallback constant.
const FALLBACK_ASPECT_RATIO = 16 / 10;

/** Real screenshot when `src` is set (real client work, e.g. "SaaS & Web
 * Apps"'s gallery — on request), otherwise the original placeholder tile
 * (rounded, bordered, `#d9d7d0` box + "IMAGE N" caption).
 *
 * The real-screenshot case briefly had its own rounded/bordered/tinted-
 * background/padded container (a light wash of the image's own extracted
 * `brandColor`) — removed on request ("jangan pake container. cukup
 * gambarnya aja"): no wrapper box, no background, no padding, just the
 * image itself. It then briefly stayed force-cropped into a fixed 16:10
 * box via `object-cover` — now fit-height instead ("buat fit-height"),
 * same technique as `ProjectCard.tsx`'s own fit-height fix: the tile's
 * `aspect-ratio` is set from the loaded `<img>`'s own
 * `naturalWidth`/`naturalHeight` rather than a fixed ratio, so the tile's
 * height matches the actual screenshot instead of cropping it to fit a
 * box shape that doesn't match. `rounded-[32px]` + `overflow-hidden`
 * (added on follow-up request, "put rounded corner in all images in
 * workgallery section") — same radius the placeholder tiles already use,
 * so real and placeholder tiles read as one consistent set again even
 * without the rest of the old container (border/background/padding). */
function GalleryTile({ label, src, alt }: { label: string; src?: string; alt?: string }) {
  const [aspectRatio, setAspectRatio] = useState(FALLBACK_ASPECT_RATIO);

  if (src) {
    return (
      <div className="relative mb-[18px] w-full overflow-hidden rounded-[32px]" style={{ aspectRatio }}>
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes="(max-width: 900px) 100vw, 50vw"
          className="object-cover"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setAspectRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="mb-[18px] overflow-hidden rounded-[32px] border border-black/8">
      <div
        className="flex items-center justify-center bg-[#d9d7d0] bg-cover bg-center"
        style={{ aspectRatio: "16 / 10" }}
      >
        <span className="text-[12px] tracking-[0.1em] text-muted">{label}</span>
      </div>
    </div>
  );
}

export function WorkGallery() {
  const { activeProject, setPinEl, setPinInnerEl, setTrackEl, setProjectCount } = useScrollDriver();

  useEffect(() => {
    setProjectCount(PROJECTS.length);
  }, [setProjectCount]);

  return (
    <section
      id="work"
      ref={setPinEl}
      className="relative z-1"
      style={{ height: `${PROJECTS.length * 100}vh` }}
    >
      {PROJECTS.map((project, i) => (
        <div
          key={project.id}
          className="pointer-events-none absolute left-0 w-px h-screen [scroll-snap-align:start]"
          style={{ top: `${i * 100}vh` }}
        />
      ))}

      <div ref={setPinInnerEl} className="sticky top-0 h-screen overflow-hidden [will-change:opacity,transform]">
        <div ref={setTrackEl} className="flex h-full w-max [will-change:transform]">
          {PROJECTS.map((project, i) => (
            <div key={project.id} className="flex h-screen w-screen shrink-0 items-center">
              <div className="pai-work-grid pai-container grid w-full grid-cols-2 items-center gap-14 px-[92px] max-[900px]:grid-cols-1 max-[900px]:gap-7">
                <div
                  className={`pai-work-copy pai-armed${i === activeProject ? " pai-play" : ""} flex h-full flex-col justify-center`}
                  style={{ animation: "paiCardIn 0.9s cubic-bezier(0.22,1,0.36,1) both" }}
                >
                  <div className="mb-3.5 flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="shrink-0">
                      <path
                        d="M2 8L8 2M8 2H3M8 2V7"
                        stroke="#0c310a"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[12px] font-medium tracking-[0.1em] text-deep uppercase">Our Work</span>
                  </div>
                  <h2 className="pai-work-h2 m-0 mb-4 text-[70px] leading-[1.04] font-bold tracking-[-0.56px] text-deep max-[560px]:text-[32px]">
                    {project.name}
                  </h2>
                  <p className="m-0 mb-6 max-w-[500px] text-[18px] leading-[1.4] font-medium text-deep">
                    {project.desc}
                  </p>
                  <div className="mb-6 max-w-[500px] pt-5">
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-pill px-3.5 py-1.5 text-[14px] text-text">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="pai-work-gallery relative h-[88vh] overflow-hidden max-[900px]:h-[44vh]"
                  style={{
                    animation: "paiCardIn 0.9s cubic-bezier(0.22,1,0.36,1) both",
                    maskImage: "linear-gradient(180deg, transparent 0, #000 6%, #000 94%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(180deg, transparent 0, #000 6%, #000 94%, transparent 100%)",
                  }}
                >
                  <Marquee direction="vertical" pauseOnHover className="absolute top-0 right-0 left-0">
                    {project.gallery.map((slot, gi) => (
                      <GalleryTile key={gi} label={`IMAGE ${slot.label}`} src={slot.src} alt={slot.alt} />
                    ))}
                  </Marquee>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
