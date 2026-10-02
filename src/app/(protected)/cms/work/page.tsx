import Link from "next/link";
import { BriefcaseIcon, PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { getAllWorkProjectsForCms } from "@/lib/data/cms-work-projects";
import { DeleteProjectButton } from "@/components/cms/DeleteProjectButton";

export const revalidate = 0;

export default async function CmsWorkPage() {
  const projects = await getAllWorkProjectsForCms();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Work CMS</h1>
          <p className="mt-1 text-sm text-muted">
            {projects.length === 0 ? "No projects yet" : `${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
          </p>
        </div>
        <Link
          href="/cms/work/new"
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90"
        >
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 py-16 text-center">
          <BriefcaseIcon size={32} weight="thin" className="text-muted" />
          <p className="text-sm text-muted">No projects yet — create the first one.</p>
          <Link
            href="/cms/work/new"
            className="mt-1 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            New Project
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-paper p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(3,105,161,0.06)] transition hover:shadow-[0_2px_6px_rgba(0,0,0,0.1),0_8px_24px_rgba(3,105,161,0.08)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-cream">
                  {project.cover_image && (
                    // eslint-disable-next-line @next/next/no-img-element -- list thumbnail, same arbitrary-path pattern as the CMS form's previews
                    <img src={project.cover_image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-text">{project.title}</p>
                  <p className="text-sm text-muted">
                    {project.badge ? `${project.badge} · ` : ""}
                    {project.tags.join(", ")} · #{project.sort_order}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                <Link
                  href={`/cms/work/${project.slug}/edit`}
                  aria-label={`Edit ${project.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-text"
                >
                  <PencilSimpleIcon size={16} />
                </Link>
                <DeleteProjectButton slug={project.slug} title={project.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
