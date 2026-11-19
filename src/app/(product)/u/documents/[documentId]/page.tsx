import { notFound } from "next/navigation";
import DocumentViewerComp from "@/app/components/pagecomponents/DocumentViewerComp";
import {
  documentActivity,
  documentPages,
  documentVersions,
  getDocument,
} from "@/lib/mock/documents";
import { clients, projects } from "@/lib/mock/workspace";

export async function generateMetadata({
  params,
}: PageProps<"/u/documents/[documentId]">) {
  const { documentId } = await params;
  return { title: getDocument(documentId)?.name ?? "Document" };
}

const DocumentPage = async ({
  params,
}: PageProps<"/u/documents/[documentId]">) => {
  const { documentId } = await params;
  const doc = getDocument(documentId);
  if (!doc) notFound();
  return (
    <DocumentViewerComp
      doc={doc}
      pages={documentPages(doc.id)}
      versions={documentVersions(doc.id)}
      activity={documentActivity(doc.id)}
      projectId={projects.find((p) => p.name === doc.projectName)?.id}
      clientId={clients.find((c) => c.name === doc.clientName)?.id}
    />
  );
};

export default DocumentPage;
