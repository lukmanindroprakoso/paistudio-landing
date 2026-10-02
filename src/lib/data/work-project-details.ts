import type { ProjectDetail } from "@/types/work";
import { rowToProjectDetail, sql, type WorkProjectRow } from "./work-db";

export async function getWorkProjectDetail(slug: string): Promise<ProjectDetail | null> {
  const { rows } = await sql<WorkProjectRow>`SELECT * FROM work_projects WHERE slug = ${slug}`;
  return rows[0] ? rowToProjectDetail(rows[0]) : null;
}

/** All slugs, for `generateStaticParams` — was `Object.keys(WORK_PROJECT_DETAILS)`
 * over the static object; same idea, now a query. Every row in
 * `work_projects` has detail content (enforced by NOT NULL columns since
 * scripts/merge-work-tables.mjs), so this is simply every project. */
export async function getAllWorkSlugs(): Promise<string[]> {
  const { rows } = await sql<{ slug: string }>`SELECT slug FROM work_projects`;
  return rows.map((row) => row.slug);
}
