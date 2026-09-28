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

/** Plain function — no Next.js APIs (no revalidatePath/redirect) — so it
 * is testable standalone from a script, without a browser or a Next.js
 * request context. The "use server" Server Action wrapper that calls
 * this lives in src/lib/actions/cms-blog-actions.ts. Throws on slug
 * collision (blog_posts.slug is the primary key) — the caller decides
 * how to present that to the user. */
export async function insertBlogPost(input: NewBlogPostInput): Promise<void> {
  await sql`
    INSERT INTO blog_posts (
      slug, tag, tags, published_at, title, description, cover_image, hero_image,
      author_name, author_role, author_hue, read_time, is_featured, status, toc, body
    ) VALUES (
      ${input.slug}, ${input.tag}, ${input.tags as unknown as string}, ${input.publishedAt}, ${input.title}, ${input.description},
      ${input.coverImage}, ${input.heroImage}, ${input.authorName}, ${input.authorRole}, ${input.authorHue},
      ${input.readTime}, ${input.isFeatured}, ${input.status},
      ${JSON.stringify(input.toc)}::jsonb, ${JSON.stringify(input.body)}::jsonb
    )
  `;
}

/** Plain function, same rationale as insertBlogPost. Slug is the WHERE
 * clause, never the SET clause — slug is immutable once created (spec's
 * Data flow section: changing it after a post could be public/shared is
 * a broken-link risk this CMS doesn't take on). */
export async function updateBlogPostRow(slug: string, input: Omit<NewBlogPostInput, "slug">): Promise<void> {
  await sql`
    UPDATE blog_posts SET
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
    WHERE slug = ${slug}
  `;
}

/** Plain function, same rationale as insertBlogPost. */
export async function deleteBlogPostRow(slug: string): Promise<void> {
  await sql`DELETE FROM blog_posts WHERE slug = ${slug}`;
}
