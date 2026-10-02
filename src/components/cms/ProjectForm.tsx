"use client";

import { useActionState, useState, useTransition, type FormEvent } from "react";
import { ImageIcon, PlusIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { createWorkProject, updateWorkProject, type WorkPostState } from "@/lib/actions/cms-work-actions";
import { ImageUploadButton } from "./ImageUploadButton";
import { slugify } from "@/lib/cms/slugify";
import type { ProjectImageRef, ProjectTestimonial } from "@/types/work";
import type { WorkProjectRow } from "@/lib/data/work-db";

const fieldClass =
  "w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-text transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

/** Eyebrow label shared by every section card — same treatment as the
 * blog CMS's PostForm.tsx (see that file's own comment for the source). */
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
  uploadHint,
  required = true,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  uploadHint: string;
  required?: boolean;
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
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
        />
      </div>
      <ImageUploadButton hint={uploadHint} onUploaded={onChange} folder="work" />
    </Field>
  );
}

/** Src + alt pair, with an upload button — used for the four single
 * ProjectImageRef fields (curved/testimonial/full-width/each split image). */
function ImageRefFields({
  label,
  srcName,
  altName,
  value,
  onChange,
  uploadHint,
}: {
  label: string;
  srcName: string;
  altName: string;
  value: ProjectImageRef;
  onChange: (next: ProjectImageRef) => void;
  uploadHint: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ImagePathField
        label={label}
        name={srcName}
        value={value.src}
        onChange={(src) => onChange({ ...value, src })}
        uploadHint={uploadHint}
      />
      <input
        name={altName}
        placeholder="Alt text"
        value={value.alt}
        onChange={(e) => onChange({ ...value, alt: e.target.value })}
        className={fieldClass}
      />
    </div>
  );
}

/** A repeatable list of plain image paths (work_projects.showcase_images —
 * unlike the detail-page image refs, these have no alt text of their own).
 * Submits as one hidden JSON field, same pattern as BlockEditor's
 * blocksJson. */
function ShowcaseImagesEditor({
  initial,
  uploadHintPrefix,
}: {
  initial: string[];
  uploadHintPrefix: string;
}) {
  const [images, setImages] = useState<string[]>(initial);

  function updateAt(index: number, value: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? value : img)));
  }
  function removeAt(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="showcaseImagesJson" value={JSON.stringify(images)} />
      {images.map((src, index) => (
        <div key={index} className="flex items-end gap-2">
          <div className="flex-1">
            <ImagePathField
              label={`Showcase image ${index + 1}`}
              name={`showcaseImage${index}`}
              value={src}
              onChange={(value) => updateAt(index, value)}
              uploadHint={`${uploadHintPrefix}-showcase-${index}`}
              required={false}
            />
          </div>
          <button
            type="button"
            aria-label={`Remove showcase image ${index + 1}`}
            onClick={() => removeAt(index)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-text"
          >
            <XIcon size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/10 px-3.5 py-1.5 text-sm font-medium text-text transition hover:bg-cream"
        onClick={() => setImages((prev) => [...prev, ""])}
      >
        <PlusIcon size={12} />
        Add showcase image
      </button>
    </div>
  );
}

/** A repeatable list of plain paragraphs (work_projects.rich_text) —
 * simpler than the blog's typed BlockEditor since work content is always
 * plain paragraphs, no headings/lists/video. Submits as one hidden JSON
 * field. */
function RichTextEditor({ initial }: { initial: string[] }) {
  const [paragraphs, setParagraphs] = useState<string[]>(initial.length > 0 ? initial : [""]);

  function updateAt(index: number, value: string) {
    setParagraphs((prev) => prev.map((p, i) => (i === index ? value : p)));
  }
  function removeAt(index: number) {
    setParagraphs((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="richTextJson" value={JSON.stringify(paragraphs)} />
      {paragraphs.map((text, index) => (
        <div key={index} className="flex gap-2">
          <textarea
            aria-label={`Paragraph ${index + 1}`}
            rows={3}
            value={text}
            onChange={(e) => updateAt(index, e.target.value)}
            className={fieldClass}
          />
          <button
            type="button"
            aria-label={`Remove paragraph ${index + 1}`}
            onClick={() => removeAt(index)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-text"
          >
            <XIcon size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/10 px-3.5 py-1.5 text-sm font-medium text-text transition hover:bg-cream"
        onClick={() => setParagraphs((prev) => [...prev, ""])}
      >
        <PlusIcon size={12} />
        Add paragraph
      </button>
    </div>
  );
}

const EMPTY_IMAGE_REF: ProjectImageRef = { src: "", alt: "" };

export function ProjectForm({
  initialProject,
  defaultSortOrder,
}: {
  initialProject?: WorkProjectRow;
  /** Suggested sort_order for a brand-new project (max existing + 1) —
   * ignored when editing, since the row already has a real value. */
  defaultSortOrder?: number;
}) {
  const action = initialProject ? updateWorkProject.bind(null, initialProject.slug) : createWorkProject;
  const [state, dispatch] = useActionState<WorkPostState, FormData>(action, { error: null });
  const [, startTransition] = useTransition();

  const [slug, setSlug] = useState(initialProject?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProject));
  const [coverImage, setCoverImage] = useState(initialProject?.cover_image ?? "");
  const [curvedImage, setCurvedImage] = useState<ProjectImageRef>(initialProject?.curved_image ?? EMPTY_IMAGE_REF);
  const [testimonialImage, setTestimonialImage] = useState<ProjectImageRef>(
    initialProject?.testimonial_image ?? EMPTY_IMAGE_REF,
  );
  const [fullWidthImage, setFullWidthImage] = useState<ProjectImageRef>(
    initialProject?.full_width_image ?? EMPTY_IMAGE_REF,
  );
  const [splitImages, setSplitImages] = useState<[ProjectImageRef, ProjectImageRef]>(
    initialProject?.split_images ?? [EMPTY_IMAGE_REF, EMPTY_IMAGE_REF],
  );
  const [hasTestimonial, setHasTestimonial] = useState(Boolean(initialProject?.testimonial));
  const [testimonial, setTestimonial] = useState<ProjectTestimonial>(
    initialProject?.testimonial ?? { quote: "", author: "", role: "", rating: 5 },
  );

  const uploadHintPrefix = initialProject?.slug ?? "new-project";

  // Same rationale as the blog CMS's PostForm.tsx: onSubmit + manual
  // dispatch instead of <form action={fn}> avoids React's built-in
  // form-reset wiping every field on an inline error.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      dispatch(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {state.error && <p className="rounded-xl bg-cream px-4 py-3 text-sm text-text">{state.error}</p>}

      <SectionCard>
        <SectionLabel>Content</SectionLabel>
        <div className="flex flex-col gap-4">
          <Field label="Title (list card)">
            <input
              name="title"
              required
              defaultValue={initialProject?.title}
              onChange={(e) => {
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={`${fieldClass} text-base font-medium`}
            />
          </Field>
          <Field label="Slug">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-sm text-muted">/work/</span>
              <input
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className={`${fieldClass} font-mono text-sm`}
              />
            </div>
            {initialProject && (
              <p className="text-xs text-muted">
                Changing this breaks the project&apos;s existing public URL for anyone who already has it.
              </p>
            )}
          </Field>
          <Field label="Description (list card)">
            <textarea
              name="description"
              required
              rows={2}
              defaultValue={initialProject?.description}
              className={fieldClass}
            />
          </Field>
          <Field label="Detail title (detail page)">
            <input name="detailTitle" required defaultValue={initialProject?.detail_title} className={fieldClass} />
          </Field>
          <Field label="Detail description (detail page)">
            <textarea
              name="detailDescription"
              required
              rows={3}
              defaultValue={initialProject?.detail_description}
              className={fieldClass}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionLabel>Details</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tags (comma-separated)">
            <input name="tags" required defaultValue={initialProject?.tags.join(", ")} className={fieldClass} />
          </Field>
          <Field label="Badge (optional, e.g. &quot;Coming Soon&quot;)">
            <input name="badge" defaultValue={initialProject?.badge ?? ""} className={fieldClass} />
          </Field>
          <Field label="Sort order">
            <input
              name="sortOrder"
              type="number"
              required
              defaultValue={initialProject?.sort_order ?? defaultSortOrder}
              className={fieldClass}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionLabel>Media</SectionLabel>
        <div className="flex flex-col gap-4">
          <ImagePathField
            label="Cover image (list card)"
            name="coverImage"
            value={coverImage}
            onChange={setCoverImage}
            uploadHint={`${uploadHintPrefix}-cover`}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-text">Showcase images (hover alternates on the list card)</p>
            <ShowcaseImagesEditor
              initial={initialProject?.showcase_images ?? []}
              uploadHintPrefix={uploadHintPrefix}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImageRefFields
              label="Curved image (detail page)"
              srcName="curvedImageSrc"
              altName="curvedImageAlt"
              value={curvedImage}
              onChange={setCurvedImage}
              uploadHint={`${uploadHintPrefix}-curved`}
            />
            <ImageRefFields
              label="Testimonial-column image (detail page)"
              srcName="testimonialImageSrc"
              altName="testimonialImageAlt"
              value={testimonialImage}
              onChange={setTestimonialImage}
              uploadHint={`${uploadHintPrefix}-testimonial`}
            />
            <ImageRefFields
              label="Full-width image (detail page)"
              srcName="fullWidthImageSrc"
              altName="fullWidthImageAlt"
              value={fullWidthImage}
              onChange={setFullWidthImage}
              uploadHint={`${uploadHintPrefix}-full`}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-text">Split images (exactly two, shown 50/50)</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ImageRefFields
                label="Split image 1"
                srcName="splitImage0Src"
                altName="splitImage0Alt"
                value={splitImages[0]}
                onChange={(next) => setSplitImages([next, splitImages[1]])}
                uploadHint={`${uploadHintPrefix}-split-0`}
              />
              <ImageRefFields
                label="Split image 2"
                srcName="splitImage1Src"
                altName="splitImage1Alt"
                value={splitImages[1]}
                onChange={(next) => setSplitImages([splitImages[0], next])}
                uploadHint={`${uploadHintPrefix}-split-1`}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionLabel>Testimonial</SectionLabel>
        <div className="flex flex-col gap-4">
          <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-text">
            <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
              <input
                name="hasTestimonial"
                type="checkbox"
                checked={hasTestimonial}
                onChange={(e) => setHasTestimonial(e.target.checked)}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full bg-cream transition-colors peer-checked:bg-brand" />
              <span className="absolute left-0.5 h-4 w-4 rounded-full bg-paper shadow transition-transform peer-checked:translate-x-4" />
            </span>
            Has a real client testimonial
          </label>
          {!hasTestimonial && (
            <p className="text-xs text-muted">
              Most projects don&apos;t have one on file — the detail page shows the description above instead.
            </p>
          )}
          {hasTestimonial && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Quote">
                <textarea
                  name="testimonialQuote"
                  rows={2}
                  value={testimonial.quote}
                  onChange={(e) => setTestimonial({ ...testimonial, quote: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Author">
                <input
                  name="testimonialAuthor"
                  value={testimonial.author}
                  onChange={(e) => setTestimonial({ ...testimonial, author: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Role">
                <input
                  name="testimonialRole"
                  value={testimonial.role}
                  onChange={(e) => setTestimonial({ ...testimonial, role: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Rating (1-5)">
                <input
                  name="testimonialRating"
                  type="number"
                  min={1}
                  max={5}
                  value={testimonial.rating}
                  onChange={(e) => setTestimonial({ ...testimonial, rating: Number(e.target.value) })}
                  className={fieldClass}
                />
              </Field>
            </div>
          )}
        </div>
      </SectionCard>

      <div>
        <SectionLabel>Rich text (detail page body paragraphs)</SectionLabel>
        <RichTextEditor initial={initialProject?.rich_text ?? []} />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-paper p-4">
        <a href="/cms/work" className="text-sm text-muted hover:text-text">
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
