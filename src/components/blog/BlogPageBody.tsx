"use client";

import { useEffect, useState } from "react";
import { useHoverBubbles } from "@/lib/hover-bubble/useHoverBubbles";
import type { BlogPost } from "@/types/blog";
import { BlogFilterTabs } from "./BlogFilterTabs";
import { BlogPostCard } from "./BlogPostCard";
import { FeaturedPostCard } from "./FeaturedPostCard";

// Same mount-delay-then-reveal-together pattern as ProjectGrid on /work
// (CARDS_DELAY_MS there too) — content below the hero waits for the hero's
// own reveal to mostly settle, then reveals as one beat.
const CONTENT_DELAY_MS = 600;
const ALL_CATEGORY = "All";

type BlogPageBodyProps = {
  categories: string[];
  /** Nullable now that this comes from a database query (getFeaturedPost())
   * instead of a guaranteed static constant — an empty blog_posts table, or
   * one with no row marked is_featured, is a real possibility a DB-backed
   * page has to handle, unlike the old static data. */
  featuredPost: BlogPost | null;
  posts: BlogPost[];
};

/** Hero heading + filter tabs + featured/grid cards, all in one client
 * component — the tabs and the cards they filter are otherwise non-adjacent
 * server-rendered markup (hero near the top, "Latest articles" further
 * down), so the active-category state has to live somewhere that can reach
 * both. Was previously two pieces (`BlogFilterTabs` with its own unused
 * internal state, and a separate `BlogContent`) — merged here so the tabs
 * actually filter the posts instead of just looking clickable. */
export function BlogPageBody({ categories, featuredPost, posts }: BlogPageBodyProps) {
  const [revealed, setRevealed] = useState(false);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

  const showFeatured =
    featuredPost !== null && (activeCategory === ALL_CATEGORY || featuredPost.tag === activeCategory);
  const filteredPosts =
    activeCategory === ALL_CATEGORY ? posts : posts.filter((post) => post.tag === activeCategory);

  // Re-scan for `.pai-hover-card` whenever which cards are on screen
  // changes — the effect inside `useHoverBubbles` otherwise only runs once
  // on mount, so cards that appear after a filter change would never get
  // the hover-bubble effect wired up.
  useHoverBubbles(".pai-hover-card", [showFeatured, filteredPosts]);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), CONTENT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const playClass = `pai-work-copy pai-armed${revealed ? " pai-play" : ""}`;

  return (
    <>
      <section className="pai-container mx-auto w-full max-w-[1240px] px-10 pt-[130px] pb-16 max-[900px]:px-7 max-[560px]:px-5">
        <div className="pai-work-copy pai-armed pai-play flex flex-col items-center gap-8 text-center">
          <h1 className="m-0 text-[100px] leading-none font-bold tracking-[-1px] text-text text-balance max-[900px]:text-[clamp(40px,9vw,72px)] max-[560px]:text-[clamp(32px,10vw,48px)]">
            Notes from the build.
          </h1>
          <BlogFilterTabs categories={categories} active={activeCategory} onChange={setActiveCategory} />
        </div>
      </section>

      {showFeatured && featuredPost && (
        <section className="pai-container mx-auto w-full max-w-[1240px] px-10 pb-[100px] max-[900px]:px-7 max-[560px]:px-5">
          <div className={playClass}>
            <FeaturedPostCard post={featuredPost} />
          </div>
        </section>
      )}

      <section className="pai-container mx-auto w-full max-w-[1240px] px-10 pb-[140px] max-[900px]:px-7 max-[560px]:px-5">
        <h2 className="m-0 mb-12 text-center text-[50px] leading-[1.1] font-bold tracking-[-0.56px] text-text text-balance max-[900px]:text-[36px] max-[560px]:text-[28px]">
          Latest articles
        </h2>
        {filteredPosts.length > 0 ? (
          <div className={`${playClass} grid grid-cols-2 gap-x-6 gap-y-14 max-[560px]:grid-cols-1`}>
            {filteredPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} sizes="(max-width: 560px) 100vw, 50vw" />
            ))}
          </div>
        ) : (
          <p className="m-0 text-center text-[16px] text-muted">No articles in this category yet.</p>
        )}
      </section>
    </>
  );
}
