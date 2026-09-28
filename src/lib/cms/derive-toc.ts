import type { ArticleBlock, ArticleTocEntry } from "@/types/blog";
import { slugify } from "./slugify";

/** The CMS form never collects `toc` directly — it's derived here from
 * the body's heading blocks on every save, so it can never drift out of
 * sync with the actual headings (see the spec's "Auto-derived table of
 * contents" section). Each heading block's own `id` field is slugified
 * (not trusted as-is) so a human typing "The Real Failure Mode" into the
 * id field still produces a valid anchor fragment. */
export function deriveTocFromBody(body: ArticleBlock[]): ArticleTocEntry[] {
  return body
    .filter((block): block is Extract<ArticleBlock, { type: "heading" }> => block.type === "heading")
    .map((block) => ({ id: slugify(block.id), label: block.text }));
}
