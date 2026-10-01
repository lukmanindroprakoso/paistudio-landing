import type { ArticleBlock, ArticleTocEntry } from "@/types/blog";
import { sql, type BlogPostRow } from "./blog-db";

export type BlogPostStatus = "draft" | "published";

export type CmsBlogPostRow = BlogPostRow & { status: BlogPostStatus };

export type NewBlogPostInput = {
  slug: string;
  tag: string;
  tags: string[];
  publishedAt: string;
  title: string;
  description: string;
  coverImage: string;
  heroImage: string;
  authorName: string;
  authorRole: string;
  authorHue: number;
  readTime: string;
  isFeatured: boolean;
  status: BlogPostStatus;
  toc: ArticleTocEntry[];
  body: ArticleBlock[];
};

/** Every post, both statuses, newest first — for the /cms table. Unlike
 * the public-facing queries in blog-posts.ts, this intentionally has no
 * status filter: the CMS is the one place drafts must be visible. */
export async function getAllBlogPostsForCms(): Promise<CmsBlogPostRow[]> {
  const { rows } = await sql<CmsBlogPostRow>`
    SELECT * FROM blog_posts ORDER BY published_at DESC
  `;
  return rows;
}

/** One full row by slug, no status filter — used by the /cms/[slug]/edit
 * page, which must be able to load a draft for editing. */
export async function getBlogPostForEditing(slug: string): Promise<CmsBlogPostRow | null> {
  const { rows } = await sql<CmsBlogPostRow>`SELECT * FROM blog_posts WHERE slug = ${slug}`;
  return rows[0] ?? null;
}

/** Distinct author identities already used across posts, for the
 * author-picker dropdown — avoids retyping "Marcus Okafor, Founder &
 * Product Lead" every time the same person writes a new post. */
export async function getDistinctAuthors(): Promise<Array<{ name: string; role: string; hue: number }>> {
  const { rows } = await sql<{ author_name: string; author_role: string; author_hue: number }>`
    SELECT DISTINCT author_name, author_role, author_hue FROM blog_posts ORDER BY author_name
  `;
  return rows.map((row) => ({ name: row.author_name, role: row.author_role, hue: row.author_hue }));
}

function isDuplicateKeyError(err: unknown): boolean {
  return err instanceof Error && err.message.includes("duplicate key");
}

/** Maximum number of `-2`, `-3`, ... suffixes tried before giving up — a
 * safety bound, not an expected case (2-4 people would need to create 50
 * posts with the exact same title for this to ever trigger). */
const MAX_SLUG_SUFFIX_ATTEMPTS = 50;

/** Plain function — no Next.js APIs (no revalidatePath/redirect) — so it
 * is testable standalone from a script, without a browser or a Next.js
 * request context. The "use server" Server Action wrapper that calls
 * this lives in src/lib/actions/cms-blog-actions.ts.
 *
 * On a slug collision (blog_posts.slug is the primary key), retries with
 * `-2`, `-3`, ... appended — same behavior as WordPress — instead of
 * failing, so the caller never needs to show a collision error for the
 * common case (two posts with the same/similar title). Returns the slug
 * actually used, which may differ from `input.slug` if a suffix was
 * needed. Still throws on a non-collision error (e.g. a real DB outage),
 * or if every suffix up to MAX_SLUG_SUFFIX_ATTEMPTS is also taken. */
export async function insertBlogPost(input: NewBlogPostInput): Promise<{ slug: string }> {
  // `getFeaturedPost` takes the single is_featured=true row with no
  // secondary ordering; if two rows carried it, which one the public
  // homepage shows would be arbitrary, and the other would appear
  // nowhere on /blog (getBlogPosts excludes every featured row). Only
  // one post may be featured at a time — enforced here rather than with
  // a DB constraint, matching this codebase's existing no-migration-tool
  // pattern of enforcing invariants in the data-layer functions.
  if (input.isFeatured) {
    await sql`UPDATE blog_posts SET is_featured = false WHERE is_featured = true`;
  }

  for (let attempt = 1; attempt <= MAX_SLUG_SUFFIX_ATTEMPTS; attempt++) {
    const slug = attempt === 1 ? input.slug : `${input.slug}-${attempt}`;
    try {
      await sql`
        INSERT INTO blog_posts (
          slug, tag, tags, published_at, title, description, cover_image, hero_image,
          author_name, author_role, author_hue, read_time, is_featured, status, toc, body
        ) VALUES (
          ${slug}, ${input.tag}, ${input.tags as unknown as string}, ${input.publishedAt}, ${input.title}, ${input.description},
          ${input.coverImage}, ${input.heroImage}, ${input.authorName}, ${input.authorRole}, ${input.authorHue},
          ${input.readTime}, ${input.isFeatured}, ${input.status},
          ${JSON.stringify(input.toc)}::jsonb, ${JSON.stringify(input.body)}::jsonb
        )
      `;
      return { slug };
    } catch (err) {
      if (!isDuplicateKeyError(err) || attempt === MAX_SLUG_SUFFIX_ATTEMPTS) throw err;
    }
  }
  // Unreachable — the loop always returns or throws — but keeps TypeScript
  // happy about every code path returning a value.
  throw new Error("Failed to generate a unique slug.");
}

/** Plain function, same rationale as insertBlogPost. `currentSlug` (the
 * row's slug before this save, from the edit page's URL — immutable
 * within a single request) is always the WHERE clause; `input.slug` (the
 * possibly-renamed slug from the form) is the new value being SET. When
 * unchanged these are the same string and the update is a no-op rename.
 * When `input.slug` collides with a *different* row, retries with
 * `-2`, `-3`, ... the same way insertBlogPost does. Returns the slug
 * actually saved. */
export async function updateBlogPostRow(
  currentSlug: string,
  input: NewBlogPostInput,
): Promise<{ slug: string }> {
  // Same single-featured-post invariant as insertBlogPost, above.
  if (input.isFeatured) {
    await sql`UPDATE blog_posts SET is_featured = false WHERE is_featured = true AND slug != ${currentSlug}`;
  }

  for (let attempt = 1; attempt <= MAX_SLUG_SUFFIX_ATTEMPTS; attempt++) {
    const slug = attempt === 1 ? input.slug : `${input.slug}-${attempt}`;
    try {
      await sql`
        UPDATE blog_posts SET
          slug = ${slug},
          tag = ${input.tag},
          tags = ${input.tags as unknown as string},
          published_at = ${input.publishedAt},
          title = ${input.title},
          description = ${input.description},
          cover_image = ${input.coverImage},
          hero_image = ${input.heroImage},
          author_name = ${input.authorName},
          author_role = ${input.authorRole},
          author_hue = ${input.authorHue},
          read_time = ${input.readTime},
          is_featured = ${input.isFeatured},
          status = ${input.status},
          toc = ${JSON.stringify(input.toc)}::jsonb,
          body = ${JSON.stringify(input.body)}::jsonb
        WHERE slug = ${currentSlug}
      `;
      return { slug };
    } catch (err) {
      if (!isDuplicateKeyError(err) || attempt === MAX_SLUG_SUFFIX_ATTEMPTS) throw err;
    }
  }
  throw new Error("Failed to generate a unique slug.");
}

/** Plain function, same rationale as insertBlogPost. */
export async function deleteBlogPostRow(slug: string): Promise<void> {
  await sql`DELETE FROM blog_posts WHERE slug = ${slug}`;
}
