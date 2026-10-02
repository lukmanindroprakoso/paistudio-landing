import { getNextSortOrder } from "@/lib/data/cms-work-projects";
import { ProjectForm } from "@/components/cms/ProjectForm";

export default async function NewWorkProjectPage() {
  const nextSortOrder = await getNextSortOrder();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-ink">New Project</h1>
      <ProjectForm defaultSortOrder={nextSortOrder} />
    </div>
  );
}
