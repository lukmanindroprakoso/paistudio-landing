"use client";

import Image from "next/image";
import { fadeStyle, useReduceMotion, useScrollDriver } from "@/lib/scroll/useScrollDriver";

type ArticleHeroImageProps = {
  src: string;
  alt: string;
};

/** Full-width (within the content container) rounded hero image — same
 * `rounded-[32px]`/`object-cover` treatment as every other image in this
 * app, `16 / 9` aspect ratio matching FullBleedImage's. Scroll-reveals with
 * `fadeStyle`, same as /work/[slug]'s FullBleedImage. */
export function ArticleHeroImage({ src, alt }: ArticleHeroImageProps) {
  const { revealed } = useScrollDriver();
  const reduceMotion = useReduceMotion();

  return (
    <div
      data-reveal="1"
      data-reveal-id="articleHero"
      className="relative w-full overflow-hidden rounded-[32px]"
      style={{ aspectRatio: "16 / 9", ...fadeStyle(revealed, "articleHero", reduceMotion) }}
    >
      <Image src={src} alt={alt} fill sizes="(max-width: 900px) 100vw, 900px" className="object-cover" />
    </div>
  );
}
