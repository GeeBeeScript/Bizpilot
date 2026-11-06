"use client";

import { useState } from "react";
import Link from "next/link";
import { BrainCircuit, Ellipsis, Eye, EyeOff, FileClock, Info, RotateCw, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/generalUIcomp/PageHeader";
import { Chip, DocumentStatusChip } from "@/components/generalUIcomp/Chips";
import { PersonLabel } from "@/components/generalUIcomp/UserAvatar";
import { ActivityFeed } from "@/components/generalUIcomp/ActivityFeed";
import { StepProgress, type Step } from "@/components/loaders/StepProgress";
import { DocumentPreview } from "@/components/elements/documents/DocumentPreview";
import { DocumentAIPanel } from "@/components/elements/documents/DocumentAIPanel";
import { FileTypeIcon } from "@/components/elements/documents/DocumentRow";
import { PageCrumbs } from "@/context/breadcrumbContext";
import { useQuickCreate } from "@/context/quickCreateContext";
import { formatLongDate, timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import type { ActivityItem, DocumentItem, DocumentPage, DocumentVersion } from "@/types";

const STAGES = ["Upload", "Extract text", "Analyze", "Index", "Ready"];
const idx: Record<DocumentItem["status"], number> = { uploading: 0, processing: 2, indexing: 3, ready: 5, failed: 2 };
const steps = (d: DocumentItem): Step[] =>
  STAGES.map((label, i) => ({ label, state: d.status === "failed" && i === 2 ? "failed" : i < idx[d.status] ? "done" : i === idx[d.status] ? "active" : "pending" }));

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3 py-2 text-sm">
    <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-right">{children}</dd>
  </div>
);

type Props = { doc: DocumentItem; pages: DocumentPage[]; versions: DocumentVersion[]; activity: ActivityItem[]; projectId?: string; clientId?: string };

/** Document detail / viewer (§17.4–17.5) */
const DocumentViewerComp = ({ doc: initial, pages, versions, activity, projectId, clientId }: Props) => {
  const { openCreate } = useQuickCreate();
  const [doc, setDoc] = useState(initial);
  const [tab, setTab] = useState(initial.indexed ? "ai" : "details");

  return (
    <PageContainer className="space-y-5">
      <PageCrumbs items={[{ label: "Documents", href: "/u/documents" }, { label: doc.name }]} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <FileTypeIcon type={doc.kind} className="size-11 [&_svg]:size-5" />
          <div className="min-w-0">
            <h1 className="truncate font-heading text-lg font-semibold text-heading md:text-xl">{doc.name}</h1>
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {clientId ? <Link href={`/u/clients/${clientId}`} className="hover:text-primary">{doc.clientName}</Link> : doc.clientName}
              {doc.projectName && <>/ {projectId ? <Link href={`/u/projects/${projectId}`} className="hover:text-primary">{doc.projectName}</Link> : doc.projectName}</>}
              · {doc.size} · v{versions[0]?.version ?? 1}
              <DocumentStatusChip status={doc.status} />
              {doc.indexed && <Chip tone="ai" icon={Sparkles}>AI indexed</Chip>}
              {doc.clientVisible ? <Chip tone="success" icon={Eye}>Client visible</Chip> : <Chip icon={EyeOff}>Internal</Chip>}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {doc.status === "failed" && (
            <Button variant="outline" onClick={() => { setDoc({ ...doc, status: "processing" }); notify.info("Reprocessing started"); }}><RotateCw /> Retry processing</Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              const prev = doc;
              setDoc({ ...doc, clientVisible: !doc.clientVisible });
              notify.success(doc.clientVisible ? "Hidden from client" : "Shared with client", { onUndo: () => setDoc(prev) });
            }}
          >
            {doc.clientVisible ? <EyeOff /> : <Eye />} {doc.clientVisible ? "Hide from client" : "Share with client"}
          </Button>
          <Button onClick={() => openCreate("document", { projectId })}><Upload /> New version</Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More"><Ellipsis /></Button>} />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => notify.success("Link copied")}>Copy link</DropdownMenuItem>
              <DropdownMenuItem onClick={() => notify.info("Rename")}>Rename</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => notify.warning("Deleting requires confirmation")}>Delete…</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="h-[calc(100dvh-var(--topbar-h)-12rem)] min-h-[32rem]">
          <DocumentPreview pages={pages} name={doc.name} />
        </div>

        <aside className="surface flex min-h-0 flex-col rounded-lg xl:h-[calc(100dvh-var(--topbar-h)-12rem)]">
          <Tabs value={tab} onValueChange={(v) => setTab(v as string)} className="flex min-h-0 flex-1 flex-col gap-0">
            <TabsList className="px-3">
              <TabsTrigger value="ai"><BrainCircuit className="text-ai" /> AI</TabsTrigger>
              <TabsTrigger value="details"><Info /> Details</TabsTrigger>
              <TabsTrigger value="versions"><FileClock /> Versions</TabsTrigger>
            </TabsList>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
              <TabsContent value="ai">
                <DocumentAIPanel doc={doc} />
              </TabsContent>
              <TabsContent value="details" className="space-y-5">
                <dl className="divide-y divide-border/70">
                  <Row label="Uploaded by"><PersonLabel person={doc.uploadedBy} subtitle={doc.uploadedBy.external?.company} /></Row>
                  <Row label="Client">{doc.clientName}</Row>
                  <Row label="Project">{doc.projectName ?? "—"}</Row>
                  <Row label="Upload date">{formatLongDate(doc.uploadedAt)}</Row>
                  <Row label="Size">{doc.size}</Row>
                  <Row label="AI indexed">{doc.indexed ? <Chip tone="ai" icon={Sparkles}>Indexed</Chip> : <Chip>Not yet</Chip>}</Row>
                </dl>
                <div>
                  <p className="mb-2 text-xs font-semibold text-heading">Processing</p>
                  <StepProgress steps={steps(doc)} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-heading">Activity</p>
                  <ActivityFeed items={activity} variant="timeline" />
                </div>
              </TabsContent>
              <TabsContent value="versions">
                <ol className="space-y-2">
                  {versions.map((v, i) => (
                    <li key={v.version} className="rounded-lg p-3 ring-1 ring-border">
                      <div className="flex items-center gap-2">
                        <span className="tabular grid size-7 place-items-center rounded-md bg-muted text-xs font-semibold text-heading">v{v.version}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-heading">{v.note}</p>
                          <p className="text-xs text-muted-foreground">{v.uploadedBy.name} · {timeAgo(v.uploadedAt)}</p>
                        </div>
                        <DocumentStatusChip status={v.status} />
                      </div>
                      <div className="mt-2 flex gap-1.5 pl-9">
                        <Button size="xs" variant="outline" disabled={i === 0} onClick={() => notify.info(`Opening v${v.version}`)}>Open</Button>
                        <Button size="xs" variant="ghost" disabled={i === 0} onClick={() => notify.info(`Comparing v${v.version} with current`)}>Compare with current</Button>
                      </div>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </div>
          </Tabs>
        </aside>
      </div>
    </PageContainer>
  );
};

export default DocumentViewerComp;
