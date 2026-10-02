"use server";

import { requireSession } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/cms/slugify";
import {
  deleteWorkProjectRow,
  insertWorkProject,
  updateWorkProjectRow,
  type NewWorkProjectInput,
} from "@/lib/data/cms-work-projects";
import type { ProjectImageRef, ProjectTestimonial } from "@/types/work";

export async function deleteWorkProject(slug: string): Promise<void> {
  await requireSession();
  await deleteWorkProjectRow(slug);
  revalidatePath("/cms/work");
  revalidatePath("/work");
  revalidatePath("/work/grid-alt");
  revalidatePath(`/work/${slug}`);
}

export type WorkPostState = { error: string | null };

function imageRefFromForm(formData: FormData, srcField: string, altField: string): ProjectImageRef {
  return { src: String(formData.get(srcField) ?? ""), alt: String(formData.get(altField) ?? "") };
}

/** Required-field validation beyond title/description/slug (checked inline
 * in each action) — never trust the client's `required` attributes alone. */
function validateWorkFields(formData: FormData): string | null {
  if (!String(formData.get("detailTitle") ?? "").trim()) return "Detail title is required.";
  if (!String(formData.get("detailDescription") ?? "").trim()) return "Detail description is required.";
  if (!String(formData.get("coverImage") ?? "").trim()) return "Cover image is required.";
  return null;
}

function readWorkFormFields(formData: FormData, title: string): Omit<NewWorkProjectInput, "slug"> {
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const badge = String(formData.get("badge") ?? "").trim();

  const hasTestimonial = formData.get("hasTestimonial") === "on";
  const testimonial: ProjectTestimonial | null = hasTestimonial
    ? {
        quote: String(formData.get("testimonialQuote") ?? ""),
        author: String(formData.get("testimonialAuthor") ?? ""),
        role: String(formData.get("testimonialRole") ?? ""),
        rating: Number(formData.get("testimonialRating") ?? 5),
      }
    : null;

  return {
    title,
    description: String(formData.get("description") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    showcaseImages: JSON.parse(String(formData.get("showcaseImagesJson") ?? "[]")) as string[],
    tags,
    badge: badge || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    detailTitle: String(formData.get("detailTitle") ?? ""),
    detailDescription: String(formData.get("detailDescription") ?? ""),
    curvedImage: imageRefFromForm(formData, "curvedImageSrc", "curvedImageAlt"),
    testimonialImage: imageRefFromForm(formData, "testimonialImageSrc", "testimonialImageAlt"),
    testimonial,
    richText: JSON.parse(String(formData.get("richTextJson") ?? "[]")) as string[],
    fullWidthImage: imageRefFromForm(formData, "fullWidthImageSrc", "fullWidthImageAlt"),
    splitImages: [
      imageRefFromForm(formData, "splitImage0Src", "splitImage0Alt"),
      imageRefFromForm(formData, "splitImage1Src", "splitImage1Alt"),
    ],
  };
}

export async function createWorkProject(_prevState: WorkPostState, formData: FormData): Promise<WorkPostState> {
  await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const description = String(formData.get("description") ?? "").trim();
  if (!description) return { error: "Description is required." };

  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(rawSlug || title);
  if (!slug) return { error: "Slug is required." };

  const fieldError = validateWorkFields(formData);
  if (fieldError) return { error: fieldError };

  const fields = readWorkFormFields(formData, title);

  let finalSlug: string;
  try {
    ({ slug: finalSlug } = await insertWorkProject({ slug, ...fields }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Failed to save: ${message}` };
  }

  revalidatePath("/cms/work");
  revalidatePath("/work");
  revalidatePath("/work/grid-alt");
  revalidatePath(`/work/${finalSlug}`);
  redirect("/cms/work");
}

export async function updateWorkProject(
  currentSlug: string,
  _prevState: WorkPostState,
  formData: FormData,
): Promise<WorkPostState> {
  await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const description = String(formData.get("description") ?? "").trim();
  if (!description) return { error: "Description is required." };

  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(rawSlug || title);
  if (!slug) return { error: "Slug is required." };

  const fieldError = validateWorkFields(formData);
  if (fieldError) return { error: fieldError };

  const fields = readWorkFormFields(formData, title);

  let finalSlug: string;
  try {
    ({ slug: finalSlug } = await updateWorkProjectRow(currentSlug, { slug, ...fields }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Failed to save: ${message}` };
  }

  revalidatePath("/cms/work");
  revalidatePath("/work");
  revalidatePath("/work/grid-alt");
  revalidatePath(`/work/${currentSlug}`);
  if (finalSlug !== currentSlug) revalidatePath(`/work/${finalSlug}`);
  redirect("/cms/work");
}
