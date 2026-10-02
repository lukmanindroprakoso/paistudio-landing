import { notFound } from "next/navigation";
import { getWorkProjectForEditing } from "@/lib/data/cms-work-projects";
import { ProjectForm } from "@/components/cms/ProjectForm";

export default async function EditWorkProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getWorkProjectForEditing(slug);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-ink">Edit Project</h1>
      <ProjectForm initialProject={project} />
    </div>
  );
}
