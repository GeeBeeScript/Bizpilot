import { notFound } from "next/navigation";
import { PortalProject } from "@/app/components/pagecomponents/PortalPages";
import {
  portalDocuments,
  portalMessages,
  portalProjects,
  portalViewer,
} from "@/lib/mock/portal";

export async function generateMetadata({
  params,
}: PageProps<"/portal/projects/[projectId]">) {
  const { projectId } = await params;
  return {
    title: portalProjects.find((p) => p.id === projectId)?.name ?? "Project",
  };
}

/** Only projects shared with this client contact are reachable */
const Page = async ({ params }: PageProps<"/portal/projects/[projectId]">) => {
  const { projectId } = await params;
  const project = portalProjects.find((p) => p.id === projectId);
  if (!project) notFound();
  return (
    <PortalProject
      project={project}
      docs={portalDocuments.filter((d) => d.projectName === project.name)}
      messages={portalMessages[project.id] ?? []}
      viewer={portalViewer.person}
    />
  );
};

export default Page;
