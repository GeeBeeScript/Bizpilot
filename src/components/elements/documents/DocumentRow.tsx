import { FileImage, FileSpreadsheet, FileText, File as FileIcon, Sparkles } from "lucide-react";
import { DocumentStatusChip } from "@/components/generalUIcomp/Chips";
import { UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { timeAgo } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types";

const kind = {
  pdf: { icon: FileText, tint: "bg-danger/10 text-danger" },
  docx: { icon: FileText, tint: "bg-info/12 text-info" },
  xlsx: { icon: FileSpreadsheet, tint: "bg-success/12 text-success" },
  image: { icon: FileImage, tint: "bg-ai/15 text-ai" },
  other: { icon: FileIcon, tint: "bg-muted text-muted-foreground" },
};

export const FileTypeIcon = ({ type, className }: { type: DocumentItem["kind"]; className?: string }) => {
  const k = kind[type];
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-md", k.tint, className)}>
      <k.icon className="size-4" aria-hidden />
    </span>
  );
};

/** Compact document row (§12.11, §17.1) */
export const DocumentRow = ({ doc, showContext = true, compact }: { doc: DocumentItem; showContext?: boolean; compact?: boolean }) =>
  compact ? (
  <div className="flex items-center gap-3 px-4 py-2.5">
    <FileTypeIcon type={doc.kind} />
    <div className="min-w-0 flex-1 space-y-1">
      <p className="truncate text-sm text-heading" title={doc.name}>{doc.name}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <DocumentStatusChip status={doc.status} /> {timeAgo(doc.uploadedAt)}
      </div>
    </div>
  </div>
  ) : (
  <div className="flex items-center gap-3 px-4 py-2.5">
    <FileTypeIcon type={doc.kind} />
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-1.5 truncate text-sm text-heading">
        <span className="truncate">{doc.name}</span>
        {doc.indexed && <Sparkles className="size-3 shrink-0 text-ai" aria-label="Indexed for AI" />}
      </p>
      <p className="truncate text-xs text-muted-foreground">
        {showContext && <>{[doc.clientName, doc.projectName].filter(Boolean).join(" / ")} · </>}
        {doc.size}
      </p>
    </div>
    <span className="max-sm:hidden"><DocumentStatusChip status={doc.status} /></span>
    <span className="flex w-28 shrink-0 items-center justify-end gap-2 text-xs text-muted-foreground max-md:hidden">
      <UserAvatar person={doc.uploadedBy} className="size-5" /> {timeAgo(doc.uploadedAt)}
    </span>
  </div>
);
