# CMS – Blogs Design Spec

## Context

Blog posts (`/blog`, `/blog/[slug]`) are already Postgres-backed via
`src/lib/data/blog-db.ts` and the `blog_posts` table (see
`scripts/setup-blog-db.mjs`), but there is no authoring UI. Every post so
far was added by writing a one-off Node migration script
(`scripts/migrate-*.mjs`) and running it manually from the terminal. This
spec adds a real CMS — a form-based editor living under the already
Clerk-gated `/cms` route (built in the auth-foundation branch) — so
writing a post is a form submission, not a script.

This is a small, fixed-team, flat-access tool (2-4 people, per the auth
foundation's own requirements) — no per-post author permissions or
approval workflow beyond a simple draft/published status.

## Requirements

- **Create, edit, and delete posts** through a UI instead of scripts.
- **Draft support:** a post can be saved without going live. The public
  `/blog` and `/blog/[slug]` must never show a draft.
- **Images stay manual:** the CMS takes an image *path* (e.g.
  `/blog/my-post-cover.jpg`) as a text field — uploading the actual file
  to `public/blog` remains a manual step outside the CMS, same as today.
- **Block-based body editor:** the article body is a structured block
  list (`heading` / `paragraph` / `list` / `image` / `video` — see
  `src/types/blog.ts`'s `ArticleBlock` union), not markdown or rich text.
  The editor is a plain ordered list of typed blocks with add/remove/
  reorder controls and a small form per block type — no WYSIWYG, no
  markdown parsing.
- **No new dependencies:** built with the same Next.js Server
  Components + Server Actions pattern already used everywhere else in
  this codebase (no React Query, no form library, no rich-text editor
  package).

## Schema change

Add a `status` column to `blog_posts`:

```sql
ALTER TABLE blog_posts
  ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published'));
```

Existing rows (all currently-live posts) get backfilled to `'published'`
in the same migration script, so nothing already public disappears:

```sql
UPDATE blog_posts SET status = 'published';
```

New migration script: `scripts/alter-blog-add-status.mjs`, following the
existing one-off `scripts/alter-*.mjs` pattern (reads `.env.local`,
runs the `ALTER`/`UPDATE`, logs, exits).

`src/lib/data/blog-db.ts`'s public-facing queries (list + detail, used by
`/blog` and `/blog/[slug]`) get `WHERE status = 'published'` added. CMS
queries (list-all, get-one-for-editing) have no such filter — they need
to see drafts too.

## Auto-derived table of contents

`toc` (`ArticleTocEntry[]`) is currently hand-maintained data that must
stay in sync with the body's `heading`-type blocks — a real risk for a
form-based editor where nothing enforces that sync. Instead of a
separate `toc` field in the CMS form, `toc` is derived automatically on
save from the body's `heading` blocks: each heading block becomes one
`{ id, label }` entry, with `id` slugified from the heading's own `id`
field (which the heading-block form already collects, since
`ArticleBlock`'s heading variant requires it) and `label` copied from the
heading's `text`. The CMS form never asks for `toc` directly.

## Architecture

### Routes (all under the existing Clerk-gated `/cms` prefix)

- `/cms` — table of all posts (draft and published), each row showing
  title, status badge, tag, published date, and Edit/Delete actions, plus
  a "New Post" link.
- `/cms/new` — the post form, empty, for creating a post.
- `/cms/[slug]/edit` — the same post form component, pre-filled from the
  existing row, for editing.

### Data flow

- Reads: Server Components fetch directly via `sql` from
  `@vercel/postgres` (same pattern as `src/lib/data/blog-db.ts`), through
  new CMS-specific query functions in that same file (e.g.
  `getAllBlogPostsForCms()`, `getBlogPostForEditing(slug)`) — these
  don't filter by `status`, unlike the public-facing ones.
- Writes: Server Actions (`"use server"` functions) colocated with the
  form component handle create/update/delete, each running a
  parameterized `sql` statement. No REST API routes — Server Actions are
  this codebase's only write mechanism, consistent with there being zero
  `app/api/*` routes anywhere in the project today.
- On create: generate `slug` from `title` (lowercase, hyphenated,
  stripped of non-alphanumerics) at submit time, shown to the user
  before saving so they can see the resulting URL. Reject on save if the
  slug already exists (primary-key collision) with an inline error,
  rather than a raw Postgres error.
- On edit: `slug` is read-only — it's the primary key and the public
  URL, so changing it after a post could already be public/shared is a
  broken-link risk this CMS doesn't take on.

### Components

- `src/app/(protected)/cms/page.tsx` — the post table (Server Component,
  reads via the new CMS query functions).
- `src/app/(protected)/cms/new/page.tsx` and
  `src/app/(protected)/cms/[slug]/edit/page.tsx` — thin wrappers that
  render the shared form component (`new` with empty initial values,
  `edit` with the fetched row).
- `src/components/cms/PostForm.tsx` — the shared create/edit form:
  metadata fields (title, description, tag, tags, cover/hero image path,
  author name/role, read time, featured checkbox, status toggle) plus
  the block-list editor.
- `src/components/cms/BlockEditor.tsx` — the ordered block list: renders
  one typed sub-form per block (heading/paragraph/list/image/video),
  with add-block (pick a type), remove, and reorder (move up/down)
  controls. Client Component (needs interactive add/remove/reorder
  state) that submits its current block array as a hidden JSON field
  when the parent form is submitted, keeping the whole save a single
  Server Action call rather than incremental autosave.
- `src/lib/actions/cms-blog-actions.ts` — the Server Actions:
  `createBlogPost`, `updateBlogPost`, `deleteBlogPost`.
- `src/lib/data/blog-db.ts` — extended with the CMS read functions and
  the `status`-filtered public read functions (existing functions gain
  the `WHERE status = 'published'` clause; new unfiltered functions are
  added alongside for the CMS).

### Author handling

No separate `authors` table exists — `author_name`/`author_role`/
`author_hue` are plain columns on `blog_posts`. The form offers a
dropdown populated from `DISTINCT author_name, author_role, author_hue`
across existing posts (so reusing "Marcus Okafor, Founder & Product
Lead" doesn't mean retyping it), plus a "new author" option that reveals
free-text fields and an `author_hue` picker (reusing whichever palette
`AVATAR_HUES` in `src/lib/data/testimonials.ts` already defines).

## Error handling

- Slug collision on create → inline form error, no save, no partial
  write.
- Required-field validation (title, description, at least one body
  block) happens both client-side (basic HTML `required`) and
  server-side in the Server Action (never trust the client alone) —
  server-side failure returns to the form with the entered values
  preserved and an error message, not a generic 500.
- Delete requires a confirmation step (a "type the slug to confirm" or a
  simple browser `confirm()` is enough — this is a low-stakes internal
  tool for 2-4 people, not a system needing an undo/trash mechanism).

## Explicitly out of scope (deferred)

- Rich-text/WYSIWYG editing or markdown — the plain block-form editor is
  the whole of this spec's editing experience.
- Image upload — paths are typed/pasted, files are copied to
  `public/blog` manually, as today.
- Autosave, version history, or concurrent-edit conflict handling — a
  2-4 person team editing sequentially doesn't need this yet.
- A dedicated `authors` table — the per-post columns stay as they are;
  the dropdown is a convenience over existing data, not a new entity.
- Scheduled publishing (publish-at-a-future-date) — status is a simple
  draft/published toggle, set immediately.

## Testing

No automated test runner exists in this repo. Verification is manual:

1. Run the migration script, confirm `status` column exists and all
   existing posts show `'published'`.
2. Create a new draft post through `/cms/new` with at least one block of
   each type; confirm it appears in `/cms`'s table but NOT on the public
   `/blog` list or at its `/blog/[slug]` URL.
3. Edit that post, add/remove/reorder a few blocks, save; confirm the
   changes persist and `toc` was correctly derived from the current
   heading blocks (not stale from before the edit).
4. Toggle it to published; confirm it now appears on the public `/blog`
   list and its detail page renders correctly, including the
   auto-derived table of contents matching the body's headings.
5. Attempt to create a post whose auto-generated slug collides with an
   existing one; confirm an inline error, not a crash or partial write.
6. Delete a post; confirm it disappears from `/cms` and (if it was
   published) from the public site.
7. Confirm the existing pre-CMS posts (migrated via scripts) still
   render correctly on `/blog` after the `status` backfill.
