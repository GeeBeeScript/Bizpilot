"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  FileText,
  LayoutGrid,
  List,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  SegmentedList,
  SegmentedTrigger,
  Tabs,
} from "@/app/components/ui/tabs";
import {
  CountBadge,
  PageContainer,
  PageHeader,
} from "@/app/components/generalUIcomp/PageHeader";
import {
  FilterToolbar,
  applyFilters,
  type FilterValues,
} from "@/app/components/generalUIcomp/FilterToolbar";
import { DocumentStatusChip } from "@/app/components/generalUIcomp/Chips";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import {
  EmptyState,
  ErrorState,
  NoResults,
} from "@/app/components/generalUIcomp/States";
import { SkeletonRows } from "@/app/components/loaders/Loaders";
import { StepProgress, type Step } from "@/app/components/loaders/StepProgress";
import { DocumentTable } from "@/app/components/elements/documents/DocumentTable";
import { FileTypeIcon } from "@/app/components/elements/documents/DocumentRow";
import { UploadDropzone } from "@/app/components/elements/documents/UploadDropzone";
import {
  UploadQueue,
  useUploadQueue,
} from "@/app/components/elements/documents/UploadQueue";
import { useQuickCreate } from "@/context/quickCreateContext";
import { ageBucket, timeAgo } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types";
import type { DemoState } from "./DashboardPageComp";

const STAGES = ["Upload", "Extract text", "Analyze", "Index", "Ready"];
const stageIndex: Record<DocumentItem["status"], number> = {
  uploading: 0,
  processing: 2,
  indexing: 3,
  ready: 4,
  failed: 2,
};
const stepsFor = (d: DocumentItem): Step[] =>
  STAGES.map((label, i) => ({
    label,
    state:
      d.status === "failed" && i === stageIndex.failed
        ? "failed"
        : i < stageIndex[d.status]
          ? "done"
          : i === stageIndex[d.status]
            ? d.status === "ready"
              ? "done"
              : "active"
            : "pending",
  }));

const uniq = (v: string[]) => Array.from(new Set(v)).filter(Boolean);

/** Grid card (§17.1 compact grid) */
const DocumentCard = ({ d }: { d: DocumentItem }) => (
  <Link
    href={`/u/documents/${d.id}`}
    className="group/doc surface flex flex-col gap-3 rounded-lg p-3 transition-all duration-150 hover:-translate-y-0.5 hover:lift"
  >
    <div className="dot-grid grid h-28 place-items-center rounded-md bg-muted/40">
      <FileTypeIcon type={d.kind} className="size-12 [&_svg]:size-6" />
    </div>
    <div className="min-w-0">
      <p
        className="truncate text-sm font-medium text-heading group-hover/doc:text-primary"
        title={d.name}
      >
        {d.name}
      </p>
      <p className="truncate text-xs text-muted-foreground">
        {d.clientName}
        {d.projectName && ` / ${d.projectName}`}
      </p>
    </div>
    <div className="mt-auto flex items-center gap-2">
      <DocumentStatusChip status={d.status} />
      {d.indexed && (
        <Sparkles className="size-3.5 text-ai" aria-label="Indexed for AI" />
      )}
      {d.clientVisible ? (
        <Eye className="size-3.5 text-success" aria-label="Visible to client" />
      ) : (
        <EyeOff className="size-3.5 text-subtle" aria-label="Internal only" />
      )}
      <span className="ml-auto flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
        <UserAvatar person={d.uploadedBy} className="size-5" />{" "}
        {timeAgo(d.uploadedAt)}
      </span>
    </div>
  </Link>
);

/** Document library (§17.1–17.3) */
const DocumentsPageComp = ({
  documents: initial,
  demo,
}: {
  documents: DocumentItem[];
  demo?: DemoState;
}) => {
  const router = useRouter();
  const { openCreate } = useQuickCreate();
  const documents = useMemo(
    () => (demo === "empty" ? [] : initial),
    [demo, initial],
  );
  const [view, setView] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const queue = useUploadQueue();

  const rows = useMemo(
    () =>
      applyFilters(
        documents.filter(
          (d) => !search || d.name.toLowerCase().includes(search.toLowerCase()),
        ),
        filters,
        {
          client: (d) => d.clientName,
          project: (d) => d.projectName ?? "",
          type: (d) => d.kind,
          state: (d) => d.status,
          uploader: (d) => d.uploadedBy.id,
          date: (d) => ageBucket(d.uploadedAt),
        },
      ),
    [documents, search, filters],
  );
  const inFlight = documents.filter(
    (d) =>
      d.status === "processing" ||
      d.status === "indexing" ||
      d.status === "failed",
  );

  const content = () => {
    if (demo === "loading")
      return (
        <div className="surface rounded-lg">
          <SkeletonRows rows={8} />
        </div>
      );
    if (demo === "error")
      return (
        <div className="surface rounded-lg">
          <ErrorState
            onRetry={() => router.replace("/u/documents")}
            reference="ERR-DOC-500"
          />
        </div>
      );
    if (documents.length === 0)
      return (
        <div className="surface space-y-6 rounded-lg p-6">
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload contracts, requirements and deliverables. BizPilot processes and indexes them so AI can answer questions about them."
          />
          <div className="mx-auto max-w-2xl space-y-3">
            <UploadDropzone onFiles={queue.add} />
            {queue.items.length > 0 && (
              <UploadQueue
                items={queue.items}
                onCancel={queue.cancel}
                onRetry={queue.retry}
              />
            )}
          </div>
        </div>
      );
    if (rows.length === 0)
      return (
        <div className="surface rounded-lg">
          <NoResults
            query={search}
            onClear={() => {
              setSearch("");
              setFilters({});
            }}
          />
        </div>
      );
    if (view === "grid")
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rows.map((d) => (
            <DocumentCard key={d.id} d={d} />
          ))}
        </div>
      );
    return (
      <DocumentTable documents={rows} onUpload={() => openCreate("document")} />
    );
  };

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Documents"
        titleAddon={<CountBadge>{documents.length}</CountBadge>}
        description="Every client and project file, processed and indexed for BizPilot AI."
        actions={
          <Button onClick={() => openCreate("document")}>
            <Upload /> Upload document
          </Button>
        }
      />

      {/* Processing state persists across visits (§17.3) */}
      {inFlight.length > 0 && demo !== "loading" && (
        <section
          aria-label="Processing"
          className="glass space-y-2 rounded-lg p-3"
        >
          <p className="px-1 text-xs font-semibold text-heading">
            Processing · {inFlight.length}
          </p>
          <ul className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
            {inFlight.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/u/documents/${d.id}`}
                  className={cn(
                    "flex flex-col gap-2 rounded-md bg-card/80 p-3 ring-1 ring-border hover:ring-primary/30",
                    d.status === "failed" && "ring-danger/30",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <FileTypeIcon type={d.kind} className="size-7" />
                    <span className="min-w-0 flex-1 truncate text-sm text-heading">
                      {d.name}
                    </span>
                    <DocumentStatusChip status={d.status} />
                  </span>
                  <StepProgress steps={stepsFor(d)} orientation="horizontal" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {documents.length > 0 && (
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search file names…"
          values={filters}
          onValuesChange={setFilters}
          filters={[
            {
              id: "client",
              label: "Client",
              options: uniq(documents.map((d) => d.clientName)).map((v) => ({
                value: v,
                label: v,
              })),
            },
            {
              id: "project",
              label: "Project",
              options: uniq(documents.map((d) => d.projectName ?? "")).map(
                (v) => ({ value: v, label: v }),
              ),
            },
            {
              id: "type",
              label: "Type",
              options: [
                { value: "pdf", label: "PDF" },
                { value: "docx", label: "Word" },
                { value: "xlsx", label: "Excel" },
                { value: "image", label: "Image" },
              ],
            },
            {
              id: "state",
              label: "Processing",
              options: [
                { value: "ready", label: "Ready" },
                { value: "processing", label: "Processing" },
                { value: "indexing", label: "Indexing" },
                { value: "failed", label: "Failed" },
              ],
            },
            {
              id: "uploader",
              label: "Uploader",
              options: Array.from(
                new Map(
                  documents.map((d) => [d.uploadedBy.id, d.uploadedBy.name]),
                ),
              ).map(([value, label]) => ({ value, label })),
            },
            {
              id: "date",
              label: "Date",
              options: [
                { value: "week", label: "Past 7 days" },
                { value: "older", label: "Older" },
              ],
            },
          ]}
          right={
            <Tabs
              value={view}
              onValueChange={(v) => setView(v as "list" | "grid")}
            >
              <SegmentedList aria-label="View">
                <SegmentedTrigger value="list">
                  <List /> List
                </SegmentedTrigger>
                <SegmentedTrigger value="grid">
                  <LayoutGrid /> Grid
                </SegmentedTrigger>
              </SegmentedList>
            </Tabs>
          }
        />
      )}

      {content()}
    </PageContainer>
  );
};

export default DocumentsPageComp;
