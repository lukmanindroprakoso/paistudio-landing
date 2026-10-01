import type { BlogPostDetail } from "@/types/blog";
import { rowToBlogPostDetail, sql, type BlogPostRow } from "./blog-db";

export async function getBlogPostDetail(slug: string): Promise<BlogPostDetail | null> {
  const { rows } = await sql<BlogPostRow>`
    SELECT * FROM blog_posts WHERE slug = ${slug} AND status = 'published'
  `;
  return rows[0] ? rowToBlogPostDetail(rows[0]) : null;
}

/** All slugs, for `generateStaticParams` — was `Object.keys(BLOG_POST_DETAILS)`
 * over the static object; same idea, now a query. */
export async function getAllBlogSlugs(): Promise<string[]> {
  const { rows } = await sql<{ slug: string }>`SELECT slug FROM blog_posts WHERE status = 'published'`;
  return rows.map((row) => row.slug);
}
