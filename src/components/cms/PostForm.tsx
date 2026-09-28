"use client";

import { useActionState, useTransition, type FormEvent } from "react";
import { createBlogPost, updateBlogPost, type CreatePostState } from "@/lib/actions/cms-blog-actions";
import { BlockEditor } from "./BlockEditor";
import type { ArticleBlock } from "@/types/blog";
import type { CmsBlogPostRow } from "@/lib/data/cms-blog-posts";

type Author = { name: string; role: string; hue: number };

/** `published_at` comes back from the driver as a `Date` parsed at local
 * midnight (a plain `DATE` column has no timezone of its own). Reading it
 * with UTC-based methods (`toISOString`) shifts it a day on any host
 * whose local timezone is behind UTC — read the local calendar fields
 * instead, which round-trips exactly regardless of host timezone. */
function toDateInputValue(value: string | Date): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PostForm({
  authors,
  initialPost,
}: {
  authors: Author[];
  initialPost?: CmsBlogPostRow;
}) {
  const action = initialPost ? updateBlogPost.bind(null, initialPost.slug) : createBlogPost;
  const [state, dispatch] = useActionState<CreatePostState, FormData>(action, { error: null });
  const [, startTransition] = useTransition();

  const initialDate = initialPost ? toDateInputValue(initialPost.published_at) : "";

  // Submitting through a plain onSubmit + manual dispatch (instead of the
  // <form action={fn}> prop) avoids React's built-in form-reset: React
  // resets every uncontrolled field the instant an action-bound form is
  // submitted (react-dom-client's startHostTransition calls
  // requestFormReset unconditionally, before the action even runs), which
  // silently wiped every field except the block list on any inline error
  // (e.g. a slug collision) — violating the spec's "entered values
  // preserved" requirement. This path never triggers that reset.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      dispatch(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      {state.error && <p className="rounded bg-cream px-3 py-2 text-sm text-text">{state.error}</p>}

      {initialPost && (
        <p className="text-sm text-muted">
          Slug: <code>{initialPost.slug}</code> (cannot be changed)
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Title
        <input name="title" required defaultValue={initialPost?.title} className="rounded border border-ink/10 px-2 py-1" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          name="description"
          required
          rows={2}
          defaultValue={initialPost?.description}
          className="rounded border border-ink/10 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tag (primary category)
        <input name="tag" required defaultValue={initialPost?.tag} className="rounded border border-ink/10 px-2 py-1" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tags (comma-separated)
        <input
          name="tags"
          defaultValue={initialPost?.tags.join(", ")}
          className="rounded border border-ink/10 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Published date
        <input
          name="publishedAt"
          type="date"
          required
          defaultValue={initialDate}
          className="rounded border border-ink/10 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cover image path
        <input
          name="coverImage"
          required
          defaultValue={initialPost?.cover_image}
          className="rounded border border-ink/10 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Hero image path
        <input
          name="heroImage"
          required
          defaultValue={initialPost?.hero_image}
          className="rounded border border-ink/10 px-2 py-1"
        />
      </label>

      <fieldset className="rounded border border-ink/10 p-3">
        <legend className="px-1 text-sm text-muted">Author</legend>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            name="authorName"
            list="known-authors"
            required
            defaultValue={initialPost?.author_name}
            className="rounded border border-ink/10 px-2 py-1"
          />
        </label>
        <datalist id="known-authors">
          {authors.map((author) => (
            <option key={author.name} value={author.name} />
          ))}
        </datalist>
        <label className="mt-2 flex flex-col gap-1 text-sm">
          Role
          <input
            name="authorRole"
            required
            defaultValue={initialPost?.author_role}
            className="rounded border border-ink/10 px-2 py-1"
          />
        </label>
        <label className="mt-2 flex flex-col gap-1 text-sm">
          Avatar hue (0, 1, or 2)
          <input
            name="authorHue"
            type="number"
            min={0}
            max={2}
            defaultValue={initialPost?.author_hue ?? 0}
            className="rounded border border-ink/10 px-2 py-1"
          />
        </label>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        Read time (e.g. &quot;6 min read&quot;)
        <input
          name="readTime"
          required
          defaultValue={initialPost?.read_time}
          className="rounded border border-ink/10 px-2 py-1"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input name="isFeatured" type="checkbox" defaultChecked={initialPost?.is_featured} />
        Featured post
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Status
        <select
          name="status"
          defaultValue={initialPost?.status ?? "draft"}
          className="rounded border border-ink/10 px-2 py-1"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-ink">Body</p>
        <BlockEditor initialBlocks={(initialPost?.body as ArticleBlock[]) ?? []} />
      </div>

      <button type="submit" className="self-start rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper">
        Save
      </button>
    </form>
  );
}
