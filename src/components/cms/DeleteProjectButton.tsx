"use client";

import { TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { deleteWorkProject } from "@/lib/actions/cms-work-actions";

export function DeleteProjectButton({ slug, title }: { slug: string; title: string }) {
  return (
    <button
      type="button"
      aria-label={`Delete ${title}`}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-text"
      onClick={() => {
        if (confirm(`Delete "${title}"? This cannot be undone.`)) {
          deleteWorkProject(slug);
        }
      }}
    >
      <TrashIcon size={16} />
    </button>
  );
}
