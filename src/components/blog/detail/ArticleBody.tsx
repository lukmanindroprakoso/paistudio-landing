"use client";

import Image from "next/image";
import { fadeStyle, useReduceMotion, useScrollDriver } from "@/lib/scroll/useScrollDriver";
import type { ArticleBlock } from "@/types/blog";

type ArticleBodyProps = {
  blocks: ArticleBlock[];
};

/** Renders the article's content blocks. Headings/paragraphs/images reuse
 * exact existing typography (DetailSection's heading/body treatment) and
 * image container (`rounded-[32px]`/`object-cover`) tokens.
 *
 * FLAGGED: bullet lists and video embeds have no prior component in the
 * docs (NumberedListGrid is a "( 01 )" numbered block, not a bulleted
 * list; there is no video/embed anywhere in this codebase). Lists reuse
 * the same body-paragraph size/color as plain text, with the browser's
 * default disc marker — no new typography introduced. The video block is
 * rendered as a placeholder frame using `bg-[#d9d7d0]`/`text-muted`
 * (`--color-muted` is already `#6b645c`, the exact fill every placeholder
 * SVG in this app uses) — no player, no new iconography, no new colors.
 *
 * `scroll-mt-[104px]` on headings offsets `#id` anchor jumps (from
 * TableOfContents) by the fixed nav's height so a heading doesn't land
 * hidden behind it — a structural value, not a visual style. */
export function ArticleBody({ blocks }: ArticleBodyProps) {
  const { revealed } = useScrollDriver();
  const reduceMotion = useReduceMotion();

  return (
    <div
      data-reveal="1"
      data-reveal-id="articleBody"
      className="flex flex-col gap-6"
      style={fadeStyle(revealed, "articleBody", reduceMotion)}
    >
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={i}
                id={block.id}
                className="m-0 mt-4 scroll-mt-[104px] text-[26px] leading-[1.2] font-medium tracking-[-0.01em] text-text text-balance"
              >
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={i} className="m-0 text-[18px] leading-[1.6] text-muted">
                {block.text}
              </p>
            );
          case "list":
            return (
              <ul key={i} className="m-0 flex flex-col gap-2 pl-5 text-[18px] leading-[1.6] text-muted">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "image":
            return (
              <div
                key={i}
                className="relative w-full overflow-hidden rounded-[32px]"
                style={{ aspectRatio: "16 / 9" }}
              >
                <Image
                  src={block.src}
                  alt={block.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 900px"
                  className="object-cover"
                />
              </div>
            );
          case "video":
            return (
              <div
                key={i}
                className="flex w-full items-center justify-center overflow-hidden rounded-[32px] bg-[#d9d7d0]"
                style={{ aspectRatio: "16 / 9" }}
              >
                <span className="text-[12px] font-medium tracking-[0.1em] text-muted uppercase">
                  Video — placeholder
                </span>
              </div>
            );
        }
      })}
    </div>
  );
}
