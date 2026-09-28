"use client";

import { useActionState } from "react";
import { createBlogPost, type CreatePostState } from "@/lib/actions/cms-blog-actions";
import { BlockEditor } from "./BlockEditor";

type Author = { name: string; role: string; hue: number };

export function PostForm({ authors }: { authors: Author[] }) {
  const [state, formAction] = useActionState<CreatePostState, FormData>(createBlogPost, { error: null });

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {state.error && <p className="rounded bg-cream px-3 py-2 text-sm text-text">{state.error}</p>}

      <label className="flex flex-col gap-1 text-sm">
        Title
        <input name="title" required className="rounded border border-ink/10 px-2 py-1" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea name="description" required rows={2} className="rounded border border-ink/10 px-2 py-1" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tag (primary category)
        <input name="tag" required className="rounded border border-ink/10 px-2 py-1" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tags (comma-separated)
        <input name="tags" className="rounded border border-ink/10 px-2 py-1" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Published date
        <input name="publishedAt" type="date" required className="rounded border border-ink/10 px-2 py-1" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cover image path
        <input name="coverImage" required className="rounded border border-ink/10 px-2 py-1" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Hero image path
        <input name="heroImage" required className="rounded border border-ink/10 px-2 py-1" />
      </label>

      <fieldset className="rounded border border-ink/10 p-3">
        <legend className="px-1 text-sm text-muted">Author</legend>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input name="authorName" list="known-authors" required className="rounded border border-ink/10 px-2 py-1" />
        </label>
        <datalist id="known-authors">
          {authors.map((author) => (
            <option key={author.name} value={author.name} />
          ))}
        </datalist>
        <label className="mt-2 flex flex-col gap-1 text-sm">
          Role
          <input name="authorRole" required className="rounded border border-ink/10 px-2 py-1" />
        </label>
        <label className="mt-2 flex flex-col gap-1 text-sm">
          Avatar hue (0, 1, or 2)
          <input name="authorHue" type="number" min={0} max={2} defaultValue={0} className="rounded border border-ink/10 px-2 py-1" />
        </label>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        Read time (e.g. "6 min read")
        <input name="readTime" required className="rounded border border-ink/10 px-2 py-1" />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input name="isFeatured" type="checkbox" />
        Featured post
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Status
        <select name="status" defaultValue="draft" className="rounded border border-ink/10 px-2 py-1">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-ink">Body</p>
        <BlockEditor initialBlocks={[]} />
      </div>

      <button type="submit" className="self-start rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper">
        Save
      </button>
    </form>
  );
}
