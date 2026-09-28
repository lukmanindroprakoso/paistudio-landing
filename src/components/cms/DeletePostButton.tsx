"use client";

import { deleteBlogPost } from "@/lib/actions/cms-blog-actions";

export function DeletePostButton({ slug }: { slug: string }) {
  return (
    <button
      type="button"
      className="text-muted hover:text-text"
      onClick={() => {
        if (confirm(`Delete "${slug}"? This cannot be undone.`)) {
          deleteBlogPost(slug);
        }
      }}
    >
      Delete
    </button>
  );
}
