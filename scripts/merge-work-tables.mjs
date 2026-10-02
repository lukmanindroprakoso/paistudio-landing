// One-off migration: merges work_project_details_v2's content columns
// directly into work_projects (same row, same table) and drops both
// work_project_details (v1, dead — nothing links to /work/archive
// anymore) and work_project_details_v2 once the merge is verified.
//
// `skills` (v2) is NOT copied over — it was always a literal duplicate of
// work_projects.tags (confirmed identical across all 19 rows before this
// script was written), kept as its own column only because it lived in a
// separate table. The merged table just reuses `tags`.
//
// `title`/`description` collide: work_projects already has a short
// list-card title/description; v2's are longer narrative versions for
// the detail page. Landed as detail_title/detail_description here.
//
// Run with:
//   node scripts/merge-work-tables.mjs
// Reads POSTGRES_URL from .env.local (gitignored, not committed).

process.loadEnvFile(new URL("../.env.local", import.meta.url));

const { sql } = await import("@vercel/postgres");

console.log("Adding new columns to work_projects (nullable for now)...");
await sql`
  ALTER TABLE work_projects
    ADD COLUMN IF NOT EXISTS detail_title TEXT,
    ADD COLUMN IF NOT EXISTS detail_description TEXT,
    ADD COLUMN IF NOT EXISTS curved_image JSONB,
    ADD COLUMN IF NOT EXISTS testimonial_image JSONB,
    ADD COLUMN IF NOT EXISTS testimonial JSONB,
    ADD COLUMN IF NOT EXISTS rich_text TEXT[],
    ADD COLUMN IF NOT EXISTS full_width_image JSONB,
    ADD COLUMN IF NOT EXISTS split_images JSONB;
`;

console.log("Backfilling from work_project_details_v2...");
await sql`
  UPDATE work_projects p SET
    detail_title = v2.title,
    detail_description = v2.description,
    curved_image = v2.curved_image,
    testimonial_image = v2.testimonial_image,
    testimonial = v2.testimonial,
    rich_text = v2.rich_text,
    full_width_image = v2.full_width_image,
    split_images = v2.split_images
  FROM work_project_details_v2 v2
  WHERE v2.slug = p.slug;
`;

console.log("Verifying every row was backfilled before dropping anything...");
const { rows: missing } = await sql`
  SELECT slug FROM work_projects WHERE detail_title IS NULL
`;
if (missing.length > 0) {
  console.error(
    `Aborting — ${missing.length} row(s) have no v2 content and would lose data: ${missing.map((r) => r.slug).join(", ")}`,
  );
  process.exit(1);
}
console.log("All rows backfilled. Locking in NOT NULL constraints (testimonial stays nullable, as it was in v2)...");

await sql`
  ALTER TABLE work_projects
    ALTER COLUMN detail_title SET NOT NULL,
    ALTER COLUMN detail_description SET NOT NULL,
    ALTER COLUMN curved_image SET NOT NULL,
    ALTER COLUMN testimonial_image SET NOT NULL,
    ALTER COLUMN rich_text SET NOT NULL,
    ALTER COLUMN full_width_image SET NOT NULL,
    ALTER COLUMN split_images SET NOT NULL;
`;

console.log("Dropping work_project_details_v2 and work_project_details (v1, dead)...");
await sql`DROP TABLE work_project_details_v2;`;
await sql`DROP TABLE work_project_details;`;

console.log("Done. work_projects is now the single table for /work.");
process.exit(0);
