"use client";

import { useActionState, useState, useTransition, type FormEvent } from "react";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr";
import { createBlogPost, updateBlogPost, type CreatePostState } from "@/lib/actions/cms-blog-actions";
import { BlockEditor } from "./BlockEditor";
import { BlogAuthorRow } from "@/components/blog/BlogAuthorRow";
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

const fieldClass =
  "w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-text transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/** Eyebrow label shared by every section card — same uppercase-tracked
 * treatment as the marketing site's own section kickers (see e.g.
 * HeroSection.tsx's `HeroCardTag` / card header labels). */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[11px] font-medium tracking-[0.04em] text-muted uppercase">{children}</p>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(3,105,161,0.06)]">
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-text">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function ImagePathField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-typed path, informational preview only
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
              onLoad={(e) => {
                e.currentTarget.style.visibility = "visible";
              }}
            />
          ) : (
            <ImageIcon size={16} className="text-muted" />
          )}
        </div>
        <input
          name={name}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
        />
      </div>
    </Field>
  );
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

  const [coverImage, setCoverImage] = useState(initialPost?.cover_image ?? "");
  const [heroImage, setHeroImage] = useState(initialPost?.hero_image ?? "");
  const [authorName, setAuthorName] = useState(initialPost?.author_name ?? "");
  const [authorRole, setAuthorRole] = useState(initialPost?.author_role ?? "");
  const [authorHue, setAuthorHue] = useState(initialPost?.author_hue ?? 0);

  const initialDate = initialPost ? toDateInputValue(initialPost.published_at) : "";

  // Submitting through a plain onSubmit + manual dispatch (instead of the
  // <form action={fn}> prop) avoids React's built-in form-reset: React
  // resets every uncontrolled field the instant an action-bound form is
  // submitted (react-dom-client's startHostTransition calls
  // requestFormReset unconditionally, before the action even runs), which
  // silently wiped every field except the block list on any inline error
  // (e.g. a slug collision) — violates the spec's "entered values
  // preserved" requirement. This path never triggers that reset.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      dispatch(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-6">
      {state.error && (
        <p className="rounded-xl bg-cream px-4 py-3 text-sm text-text">{state.error}</p>
      )}

      {initialPost && (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 font-mono text-[11px] text-muted">
          {initialPost.slug}
        </span>
      )}

      <SectionCard>
        <SectionLabel>Content</SectionLabel>
        <div className="flex flex-col gap-4">
          <Field label="Title">
            <input
              name="title"
              required
              defaultValue={initialPost?.title}
              className={`${fieldClass} text-base font-medium`}
            />
          </Field>
          <Field label="Description">
            <textarea
              name="description"
              required
              rows={2}
              defaultValue={initialPost?.description}
              className={fieldClass}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionLabel>Details</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tag (primary category)">
            <input name="tag" required defaultValue={initialPost?.tag} className={fieldClass} />
          </Field>
          <Field label="Tags (comma-separated)">
            <input name="tags" defaultValue={initialPost?.tags.join(", ")} className={fieldClass} />
          </Field>
          <Field label="Published date">
            <input
              name="publishedAt"
              type="date"
              required
              defaultValue={initialDate}
              className={fieldClass}
            />
          </Field>
          <Field label="Read time">
            <input
              name="readTime"
              required
              placeholder='e.g. "6 min read"'
              defaultValue={initialPost?.read_time}
              className={fieldClass}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionLabel>Media</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImagePathField label="Cover image path" name="coverImage" value={coverImage} onChange={setCoverImage} />
          <ImagePathField label="Hero image path" name="heroImage" value={heroImage} onChange={setHeroImage} />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionLabel>Author</SectionLabel>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-cream/50 p-3">
            <BlogAuthorRow
              author={{ name: authorName || "Author name", role: authorRole, hue: Number(authorHue) || 0 }}
              meta={authorRole || "Role"}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input
                name="authorName"
                list="known-authors"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className={fieldClass}
              />
              <datalist id="known-authors">
                {Array.from(new Set(authors.map((author) => author.name))).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </Field>
            <Field label="Role">
              <input
                name="authorRole"
                required
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Avatar hue">
              <input
                name="authorHue"
                type="number"
                min={0}
                max={2}
                value={authorHue}
                onChange={(e) => setAuthorHue(Number(e.target.value))}
                className={fieldClass}
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionLabel>Publishing</SectionLabel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-text">
            <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
              <input
                name="isFeatured"
                type="checkbox"
                defaultChecked={initialPost?.is_featured}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full bg-cream transition-colors peer-checked:bg-brand" />
              <span className="absolute left-0.5 h-4 w-4 rounded-full bg-paper shadow transition-transform peer-checked:translate-x-4" />
            </span>
            Featured post
          </label>

          <div className="inline-flex rounded-full border border-ink/10 p-1">
            {(["draft", "published"] as const).map((value) => (
              <label
                key={value}
                className="relative cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium text-muted transition has-checked:bg-ink has-checked:text-paper"
              >
                <input
                  type="radio"
                  name="status"
                  value={value}
                  defaultChecked={(initialPost?.status ?? "draft") === value}
                  className="sr-only"
                />
                {value === "draft" ? "Draft" : "Published"}
              </label>
            ))}
          </div>
        </div>
      </SectionCard>

      <div>
        <SectionLabel>Body</SectionLabel>
        <BlockEditor initialBlocks={(initialPost?.body as ArticleBlock[]) ?? []} />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-paper p-4">
        <a href="/cms" className="text-sm text-muted hover:text-text">
          ← Back to CMS
        </a>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-deep"
        >
          Save
        </button>
      </div>
    </form>
  );
}
