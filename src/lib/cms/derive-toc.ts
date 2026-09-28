import type { ArticleBlock, ArticleTocEntry } from "@/types/blog";
import { slugify } from "./slugify";

/** Rewrites every heading block's `id` to its slugified form (falling
 * back to the heading's `text`, then a fixed placeholder, if the typed id
 * slugifies to empty) and de-duplicates collisions with a `-2`, `-3`, ...
 * suffix. Must run on the body BEFORE it's stored and before
 * `deriveTocFromBody` runs on it — otherwise the stored heading's `id`
 * attribute (rendered as `<h2 id={block.id}>`) and the toc's derived,
 * slugified id can disagree, breaking every TOC link whose typed id
 * wasn't already slug-shaped. */
export function normalizeBodyHeadingIds(body: ArticleBlock[]): ArticleBlock[] {
  const seen = new Map<string, number>();
  return body.map((block) => {
    if (block.type !== "heading") return block;
    const base = slugify(block.id) || slugify(block.text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return { ...block, id: count === 0 ? base : `${base}-${count + 1}` };
  });
}

/** The CMS form never collects `toc` directly — it's derived here from
 * the body's heading blocks on every save, so it can never drift out of
 * sync with the actual headings (see the spec's "Auto-derived table of
 * contents" section). Expects `body` to have already gone through
 * `normalizeBodyHeadingIds` — this function re-slugifies defensively
 * (a no-op on an already-normalized id) but does not de-duplicate, so
 * calling it on a non-normalized body can still produce colliding ids. */
export function deriveTocFromBody(body: ArticleBlock[]): ArticleTocEntry[] {
  return body
    .filter((block): block is Extract<ArticleBlock, { type: "heading" }> => block.type === "heading")
    .map((block) => ({ id: slugify(block.id), label: block.text }));
}
