"use client";

import { upload } from "@vercel/blob/client";

/** Uploads an image file directly from the browser to Vercel Blob (bypasses
 * Vercel Functions' 4.5MB request-body limit — the file never passes
 * through our server). Shared by both CMS sections (blog, work) — `folder`
 * separates their uploads in the Blob store. `hint` becomes part of the
 * stored pathname purely for human-readability in the Blob dashboard;
 * Blob itself guarantees uniqueness via `addRandomSuffix` (set server-side
 * in the upload route). */
export async function uploadCmsImage(file: File, hint: string, folder: "blog" | "work" = "blog"): Promise<string> {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const pathname = `${folder}/${hint}-${Date.now()}.${extension}`;

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/cms-image-upload",
  });

  return blob.url;
}
