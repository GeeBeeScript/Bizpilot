"use client";

import { Download, Ellipsis, Eye, EyeOff, FileText, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable, type Column } from "@/components/generalUIcomp/DataTable";
import { DocumentStatusChip, Chip } from "@/components/generalUIcomp/Chips";
import { PersonLabel } from "@/components/generalUIcomp/UserAvatar";
import { EmptyState } from "@/components/generalUIcomp/States";
import { timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import type { DocumentItem } from "@/types";
import { FileTypeIcon } from "./DocumentRow";

/** Document library rows (§17.1) */
export const DocumentTable = ({ documents, hideContext, onUpload }: { documents: DocumentItem[]; hideContext?: boolean; onUpload?: () => void }) => {
  const columns: Column<DocumentItem>[] = [
    {
      id: "name",
      header: "File",
      sortValue: (d) => d.name,
      cell: (d) => (
        <div className="flex min-w-56 items-center gap-2.5">
          <FileTypeIcon type={d.kind} />
          <span className="min-w-0">
            <span className="block truncate font-medium text-heading">{d.name}</span>
            <span className="block text-xs text-muted-foreground">{d.size}</span>
          </span>
        </div>
      ),
    },
    ...(hideContext
      ? []
      : [{ id: "context", header: "Client / project", hideBelow: "lg" as const, cell: (d: DocumentItem) => <span className="text-sm">{d.clientName}{d.projectName && <span className="text-muted-foreground"> / {d.projectName}</span>}</span> }]),
    { id: "uploader", header: "Uploaded by", hideBelow: "xl", cell: (d) => <PersonLabel person={d.uploadedBy} subtitle={d.uploadedBy.external?.company} /> },
    { id: "date", header: "Date", sortValue: (d) => -new Date(d.uploadedAt).getTime(), cell: (d) => <span className="text-xs text-muted-foreground">{timeAgo(d.uploadedAt)}</span> },
    { id: "status", header: "Processing", sortValue: (d) => d.status, cell: (d) => <DocumentStatusChip status={d.status} /> },
    {
      id: "ai",
      header: "AI index",
      hideBelow: "md",
      cell: (d) => (d.indexed ? <Chip tone="ai" icon={Sparkles}>Indexed</Chip> : <Chip>Not yet</Chip>),
    },
    {
      id: "visibility",
      header: "Client visible",
      hideBelow: "lg",
      align: "center",
      cell: (d) => (d.clientVisible ? <Eye className="mx-auto size-4 text-success" aria-label="Visible to client" /> : <EyeOff className="mx-auto size-4 text-subtle" aria-label="Internal only" />),
    },
  ];

  return (
    <DataTable
      ariaLabel="Documents"
      rows={documents}
      columns={columns}
      getRowId={(d) => d.id}
      rowHref={(d) => `/u/documents/${d.id}`}
      empty={
        <div className="surface rounded-lg">
          <EmptyState compact icon={FileText} title="No documents yet" description="Upload contracts, requirements and deliverables so AI can reference them." action={onUpload && <Button size="sm" onClick={onUpload}>Upload document</Button>} />
        </div>
      }
      rowActions={(d) => (
        <>
          <Button variant="ghost" size="icon-sm" aria-label={`Download ${d.name}`} onClick={() => notify.success("Download started")}><Download /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="More"><Ellipsis /></Button>} />
            <DropdownMenuContent align="end" className="w-48">
              {d.status === "failed" && <DropdownMenuItem onClick={() => notify.info("Reprocessing", { description: d.name })}><RotateCw /> Retry processing</DropdownMenuItem>}
              <DropdownMenuItem onClick={() => notify.success(d.clientVisible ? "Hidden from client" : "Shared with client")}>{d.clientVisible ? <EyeOff /> : <Eye />} {d.clientVisible ? "Hide from client" : "Share with client"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
      mobileItem={(d) => (
        <div className="flex items-center gap-3">
          <FileTypeIcon type={d.kind} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-heading">{d.name}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(d.uploadedAt)} · {d.size}</p>
          </div>
          <DocumentStatusChip status={d.status} />
        </div>
      )}
    />
  );
};
