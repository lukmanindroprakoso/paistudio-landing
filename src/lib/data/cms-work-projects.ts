import type { ProjectImageRef, ProjectTestimonial } from "@/types/work";
import { sql, type WorkProjectRow } from "./work-db";

export type NewWorkProjectInput = {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  showcaseImages: string[];
  tags: string[];
  badge: string | null;
  sortOrder: number;
  detailTitle: string;
  detailDescription: string;
  curvedImage: ProjectImageRef;
  testimonialImage: ProjectImageRef;
  testimonial: ProjectTestimonial | null;
  richText: string[];
  fullWidthImage: ProjectImageRef;
  splitImages: [ProjectImageRef, ProjectImageRef];
};

function isDuplicateKeyError(err: unknown): boolean {
  return err instanceof Error && err.message.includes("duplicate key");
}

/** Same bound as cms-blog-posts.ts's — a safety cap, not an expected case. */
const MAX_SLUG_SUFFIX_ATTEMPTS = 50;

/** Every project, in display order — for the /cms/work table. There's no
 * draft/published concept for work projects (unlike blog posts): every
 * row here is already live on /work, matching how it worked before this
 * CMS existed (editing the database directly). */
export async function getAllWorkProjectsForCms(): Promise<WorkProjectRow[]> {
  const { rows } = await sql<WorkProjectRow>`SELECT * FROM work_projects ORDER BY sort_order`;
  return rows;
}

/** One full row by slug — used by /cms/work/[slug]/edit. */
export async function getWorkProjectForEditing(slug: string): Promise<WorkProjectRow | null> {
  const { rows } = await sql<WorkProjectRow>`SELECT * FROM work_projects WHERE slug = ${slug}`;
  return rows[0] ?? null;
}

/** The highest existing sort_order + 1 — the create form's default, so a
 * new project naturally lands at the end of the list instead of forcing
 * the author to know (or guess) the current max themselves. */
export async function getNextSortOrder(): Promise<number> {
  const { rows } = await sql<{ max: number | null }>`SELECT MAX(sort_order) as max FROM work_projects`;
  return (rows[0]?.max ?? 0) + 1;
}

/** Plain function — no Next.js APIs — same rationale as cms-blog-posts.ts's
 * insertBlogPost: testable standalone, and the "use server" wrapper lives
 * in src/lib/actions/cms-work-actions.ts. Same WordPress-style collision
 * handling as the blog CMS: retries with `-2`, `-3`, ... instead of
 * throwing on a slug collision. Returns the slug actually used. */
export async function insertWorkProject(input: NewWorkProjectInput): Promise<{ slug: string }> {
  for (let attempt = 1; attempt <= MAX_SLUG_SUFFIX_ATTEMPTS; attempt++) {
    const slug = attempt === 1 ? input.slug : `${input.slug}-${attempt}`;
    try {
      await sql`
        INSERT INTO work_projects (
          slug, title, description, cover_image, showcase_images, tags, badge, sort_order,
          detail_title, detail_description, curved_image, testimonial_image, testimonial,
          rich_text, full_width_image, split_images
        ) VALUES (
          ${slug}, ${input.title}, ${input.description}, ${input.coverImage},
          ${input.showcaseImages as unknown as string}, ${input.tags as unknown as string}, ${input.badge}, ${input.sortOrder},
          ${input.detailTitle}, ${input.detailDescription},
          ${JSON.stringify(input.curvedImage)}::jsonb, ${JSON.stringify(input.testimonialImage)}::jsonb,
          ${input.testimonial ? JSON.stringify(input.testimonial) : null}::jsonb,
          ${input.richText as unknown as string}, ${JSON.stringify(input.fullWidthImage)}::jsonb,
          ${JSON.stringify(input.splitImages)}::jsonb
        )
      `;
      return { slug };
    } catch (err) {
      if (!isDuplicateKeyError(err) || attempt === MAX_SLUG_SUFFIX_ATTEMPTS) throw err;
    }
  }
  throw new Error("Failed to generate a unique slug.");
}

/** Plain function, same rationale as insertWorkProject. `currentSlug` (the
 * row's slug before this save) is always the WHERE clause; `input.slug`
 * (possibly renamed) is the new SET value — same immutable-identifier-vs-
 * new-value split as cms-blog-posts.ts's updateBlogPostRow. */
export async function updateWorkProjectRow(
  currentSlug: string,
  input: NewWorkProjectInput,
): Promise<{ slug: string }> {
  for (let attempt = 1; attempt <= MAX_SLUG_SUFFIX_ATTEMPTS; attempt++) {
    const slug = attempt === 1 ? input.slug : `${input.slug}-${attempt}`;
    try {
      await sql`
        UPDATE work_projects SET
          slug = ${slug},
          title = ${input.title},
          description = ${input.description},
          cover_image = ${input.coverImage},
          showcase_images = ${input.showcaseImages as unknown as string},
          tags = ${input.tags as unknown as string},
          badge = ${input.badge},
          sort_order = ${input.sortOrder},
          detail_title = ${input.detailTitle},
          detail_description = ${input.detailDescription},
          curved_image = ${JSON.stringify(input.curvedImage)}::jsonb,
          testimonial_image = ${JSON.stringify(input.testimonialImage)}::jsonb,
          testimonial = ${input.testimonial ? JSON.stringify(input.testimonial) : null}::jsonb,
          rich_text = ${input.richText as unknown as string},
          full_width_image = ${JSON.stringify(input.fullWidthImage)}::jsonb,
          split_images = ${JSON.stringify(input.splitImages)}::jsonb
        WHERE slug = ${currentSlug}
      `;
      return { slug };
    } catch (err) {
      if (!isDuplicateKeyError(err) || attempt === MAX_SLUG_SUFFIX_ATTEMPTS) throw err;
    }
  }
  throw new Error("Failed to generate a unique slug.");
}

/** Plain function, same rationale as insertWorkProject. */
export async function deleteWorkProjectRow(slug: string): Promise<void> {
  await sql`DELETE FROM work_projects WHERE slug = ${slug}`;
}
