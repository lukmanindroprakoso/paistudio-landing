import type { BlogPost } from "@/types/blog";
import { rowToBlogPost, sql, type BlogPostRow } from "./blog-db";

// Static — the category taxonomy itself isn't "content" in the sense the
// Postgres migration was for (blog posts), it's fixed UI structure the
// filter tabs render. Posts themselves now live in the blog_posts table
// (see blog-db.ts / scripts/setup-blog-db.mjs).
// "Guides", "Business", "Bubble Development", and "Development" added for
// migrated posts (see scripts/migrate-*.mjs) — the real categories each
// source page itself uses, not from the 5 categories this taxonomy
// originally shipped with.
export const BLOG_CATEGORIES = [
  "All",
  "Product Strategy",
  "No-Code & AI",
  "Case Studies",
  "Founder Stories",
  "Guides",
  "Business",
  "Bubble Development",
  "Development",
];

export async function getFeaturedPost(): Promise<BlogPost | null> {
  // ORDER BY is belt-and-suspenders: cms-blog-posts.ts's insert/update
  // functions now enforce at most one is_featured=true row, but this
  // keeps the result deterministic even if that invariant is ever
  // violated some other way (a direct SQL edit, a future migration).
  const { rows } = await sql<BlogPostRow>`
    SELECT * FROM blog_posts WHERE is_featured = true AND status = 'published'
    ORDER BY published_at DESC LIMIT 1
  `;
  return rows[0] ? rowToBlogPost(rows[0]) : null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { rows } = await sql<BlogPostRow>`
    SELECT * FROM blog_posts WHERE is_featured = false AND status = 'published' ORDER BY published_at DESC
  `;
  return rows.map(rowToBlogPost);
}

/** Up to `count` posts other than `slug`, for the article page's "Related
 * posts" grid — featured post first (if not the current article), then
 * newest first. Matches the old static `[FEATURED_POST, ...BLOG_POSTS]`
 * array's ordering, which had the same effect by construction. */
export async function getRelatedPosts(slug: string, count = 3): Promise<BlogPost[]> {
  const { rows } = await sql<BlogPostRow>`
    SELECT * FROM blog_posts
    WHERE slug != ${slug} AND status = 'published'
    ORDER BY is_featured DESC, published_at DESC
    LIMIT ${count}
  `;
  return rows.map(rowToBlogPost);
}
