/** Lowercase, hyphenate, strip anything that isn't a letter/number/hyphen,
 * and collapse repeated or edge hyphens. Used for both the post slug
 * (generated from title) and each heading block's anchor id (normalized
 * from whatever the CMS form's "id" field contains), so both are safe,
 * predictable URL/anchor fragments regardless of what a human typed. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
