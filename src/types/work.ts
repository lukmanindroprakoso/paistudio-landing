export type Project = {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  showcaseImages: string[]; // alternate images shown on hover
  tags: string[];
  badge?: string; // e.g. "Coming Soon"
};

export type ProjectImageRef = { src: string; alt: string };

export type ProjectTestimonial = {
  quote: string;
  author: string;
  role: string;
  /** 1-5 stars. */
  rating: number;
};

/** The detail page's own content, alongside every `Project` list field —
 * `work_projects` is a single table now (see scripts/merge-work-tables.mjs;
 * this used to be split across work_projects + a separate
 * work_project_details_v2 table, with an even older "v1" template/table
 * pair dropped entirely in that same migration). `detailTitle`/
 * `detailDescription` are deliberately separate from `Project.title`/
 * `description` — the list card uses a short name + one-line blurb, the
 * detail hero uses a longer name + narrative paragraph, and both are real,
 * independently-edited content for the same project. */
export type ProjectDetail = Project & {
  detailTitle: string;
  detailDescription: string;
  /** Full-bleed image with a concave "scoop" mask on its top edge, directly under the hero. */
  curvedImage: ProjectImageRef;
  /** Image shown beside the testimonial + skills column. */
  testimonialImage: ProjectImageRef;
  /** Optional — most projects don't have a real client testimonial on
   * file, and this project doesn't fabricate one just to fill the field
   * (see scripts/migrate-hellorecruiters-project.mjs's reasoning, applied
   * consistently here). `TestimonialSkillsSection` renders the quote
   * block only when this is present; the skills list always renders
   * regardless. */
  testimonial?: ProjectTestimonial;
  /** Static body paragraphs for now — flagged to become a rich-text/CMS
   * field later (see RichTextSection.tsx). */
  richText: string[];
  fullWidthImage: ProjectImageRef;
  /** Exactly two images, rendered 50/50 side by side. */
  splitImages: [ProjectImageRef, ProjectImageRef];
};
