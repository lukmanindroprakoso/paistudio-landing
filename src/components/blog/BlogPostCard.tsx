"use client";

import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { BlogAuthorRow } from "./BlogAuthorRow";
import { trackEvent } from "@/lib/analytics/track-event";

type BlogPostCardProps = {
  post: BlogPost;
  /** Passed through to next/image's `sizes` — the card is reused across
   * grids with different column counts (2-col on /blog, 3-col in related
   * posts), so each caller supplies its own accurate breakpoints rather
   * than this component guessing one. */
  sizes: string;
};

/** Repeating grid card: cover image with a tag-overlay badge (same
 * `bg-brand`/uppercase treatment as ProjectCard's badge), heading below,
 * author + read time footer. Links to the post's detail page. Same
 * cursor-follow hover bubble as /work's ProjectCard (see
 * `lib/hover-bubble/HoverBubble.ts`) — the card using it must call
 * `useHoverBubbles()` once (see BlogPageBody.tsx / RelatedPosts.tsx). */
export function BlogPostCard({ post, sizes }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      onClick={() => trackEvent("blog_post_click", { post: post.slug })}
      className="flex flex-col gap-4 no-underline"
    >
      <div className="pai-hover-card w-full rounded-[32px]" style={{ aspectRatio: "4 / 3" }}>
        <Image src={post.coverImage} alt="" fill sizes={sizes} className="object-cover" />
        <span className="absolute top-4 left-4 rounded-full bg-brand px-3 py-1 text-[12px] font-medium tracking-[0.1em] text-white uppercase">
          {post.tag}
        </span>
        <div className="pai-hover-bubble text-center text-[13px] leading-[1.2] tracking-[0.01em] text-ink">
          <span>View</span>
        </div>
      </div>
      {/* Clamped to 2 lines AND given a matching min-height (2 lines *
          leading-[1.3]) — line-clamp alone only caps long titles, it
          doesn't reserve space for short ones, so 1-line titles would still
          leave the author row sitting higher than 2-line titles' row. */}
      <h3 className="m-0 line-clamp-2 min-h-[2.6em] text-[18px] leading-[1.3] font-medium text-text text-balance">
        {post.title}
      </h3>
      <BlogAuthorRow author={post.author} meta={post.readTime} />
    </Link>
  );
}
