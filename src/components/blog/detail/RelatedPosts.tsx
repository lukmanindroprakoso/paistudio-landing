"use client";

import { useHoverBubbles } from "@/lib/hover-bubble/useHoverBubbles";
import { fadeStyle, useReduceMotion, useScrollDriver } from "@/lib/scroll/useScrollDriver";
import type { BlogPost } from "@/types/blog";
import { BlogPostCard } from "../BlogPostCard";

type RelatedPostsProps = {
  posts: BlogPost[];
};

/** Centered heading (same size/cascade as BlogPageBody's "Latest articles")
 * + a 3-column grid of the exact same `BlogPostCard` used on /blog,
 * stacking to 1 column on mobile — no new card design. */
export function RelatedPosts({ posts }: RelatedPostsProps) {
  const { revealed } = useScrollDriver();
  const reduceMotion = useReduceMotion();
  useHoverBubbles();

  return (
    <div data-reveal="1" data-reveal-id="relatedPosts" style={fadeStyle(revealed, "relatedPosts", reduceMotion)}>
      <h2 className="m-0 mb-12 text-center text-[50px] leading-[1.1] font-bold tracking-[-0.56px] text-text text-balance max-[900px]:text-[36px] max-[560px]:text-[28px]">
        Related posts
      </h2>
      <div className="grid grid-cols-3 gap-x-6 gap-y-14 max-[900px]:grid-cols-1">
        {posts.map((post) => (
          <BlogPostCard key={post.slug} post={post} sizes="(max-width: 900px) 100vw, 33vw" />
        ))}
      </div>
    </div>
  );
}
