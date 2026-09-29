"use server";

import { requireSession } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/cms/slugify";
import { deriveTocFromBody, normalizeBodyHeadingIds } from "@/lib/cms/derive-toc";
import { deleteBlogPostRow, insertBlogPost, updateBlogPostRow } from "@/lib/data/cms-blog-posts";
import type { ArticleBlock } from "@/types/blog";

export async function deleteBlogPost(slug: string): Promise<void> {
  await requireSession();
  await deleteBlogPostRow(slug);
  revalidatePath("/cms");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

export type CreatePostState = { error: string | null };

export async function createBlogPost(_prevState: CreatePostState, formData: FormData): Promise<CreatePostState> {
  await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const description = String(formData.get("description") ?? "").trim();
  if (!description) return { error: "Description is required." };

  const rawBody = JSON.parse(String(formData.get("blocksJson") ?? "[]")) as ArticleBlock[];
  if (rawBody.length === 0) return { error: "At least one body block is required." };
  const body = normalizeBodyHeadingIds(rawBody);

  const slug = slugify(title);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  try {
    await insertBlogPost({
      slug,
      tag: String(formData.get("tag") ?? ""),
      tags,
      publishedAt: String(formData.get("publishedAt") ?? new Date().toISOString().slice(0, 10)),
      title,
      description,
      coverImage: String(formData.get("coverImage") ?? ""),
      heroImage: String(formData.get("heroImage") ?? ""),
      authorName: String(formData.get("authorName") ?? ""),
      authorRole: String(formData.get("authorRole") ?? ""),
      authorHue: Number(formData.get("authorHue") ?? 0),
      readTime: String(formData.get("readTime") ?? ""),
      isFeatured: formData.get("isFeatured") === "on",
      status: formData.get("status") === "published" ? "published" : "draft",
      toc: deriveTocFromBody(body),
      body,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("duplicate key")) {
      return { error: `A post with slug "${slug}" already exists. Change the title slightly and try again.` };
    }
    return { error: `Failed to save: ${message}` };
  }

  revalidatePath("/cms");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/cms");
}

export async function updateBlogPost(
  slug: string,
  _prevState: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const description = String(formData.get("description") ?? "").trim();
  if (!description) return { error: "Description is required." };

  const rawBody = JSON.parse(String(formData.get("blocksJson") ?? "[]")) as ArticleBlock[];
  if (rawBody.length === 0) return { error: "At least one body block is required." };
  const body = normalizeBodyHeadingIds(rawBody);

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  try {
    await updateBlogPostRow(slug, {
      tag: String(formData.get("tag") ?? ""),
      tags,
      publishedAt: String(formData.get("publishedAt") ?? ""),
      title,
      description,
      coverImage: String(formData.get("coverImage") ?? ""),
      heroImage: String(formData.get("heroImage") ?? ""),
      authorName: String(formData.get("authorName") ?? ""),
      authorRole: String(formData.get("authorRole") ?? ""),
      authorHue: Number(formData.get("authorHue") ?? 0),
      readTime: String(formData.get("readTime") ?? ""),
      isFeatured: formData.get("isFeatured") === "on",
      status: formData.get("status") === "published" ? "published" : "draft",
      toc: deriveTocFromBody(body),
      body,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Failed to save: ${message}` };
  }

  revalidatePath("/cms");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/cms");
}
