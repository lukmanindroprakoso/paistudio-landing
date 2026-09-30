"use client";

import { upload } from "@vercel/blob/client";

/** Uploads an image file directly from the browser to Vercel Blob (bypasses
 * Vercel Functions' 4.5MB request-body limit — the file never passes
 * through our server). `hint` becomes part of the stored pathname purely
 * for human-readability in the Blob dashboard; Blob itself guarantees
 * uniqueness via `addRandomSuffix` (set server-side in the upload route). */
export async function uploadCmsImage(file: File, hint: string): Promise<string> {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const pathname = `blog/${hint}-${Date.now()}.${extension}`;

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blog-image-upload",
  });

  return blob.url;
}
