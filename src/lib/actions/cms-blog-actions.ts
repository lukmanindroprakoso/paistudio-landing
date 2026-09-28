"use server";

import { revalidatePath } from "next/cache";
import { deleteBlogPostRow } from "@/lib/data/cms-blog-posts";

export async function deleteBlogPost(slug: string): Promise<void> {
  await deleteBlogPostRow(slug);
  revalidatePath("/cms");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}
