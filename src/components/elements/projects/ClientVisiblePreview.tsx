import { Diamond, Eye, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/generalUIcomp/ProgressBar";
import { Chip } from "@/components/generalUIcomp/Chips";
import { formatLongDate, formatShortDate } from "@/lib/date";
import type { DocumentItem, Person, Project } from "@/types";

const msTone = { done: "success", upcoming: "neutral", late: "danger", "awaiting-approval": "ai" } as const;
const msLabel = { done: "Approved", upcoming: "Upcoming", late: "Delayed", "awaiting-approval": "Awaiting your approval" };

/**
 * Client-visible preview (§15.5 Client tab, §26). Rendered in a framed "portal" so internal
 * users can see exactly what an invited contact sees — and nothing internal leaks in.
 */
export const ClientVisiblePreview = ({ project: p, documents, viewer }: { project: Project; documents: DocumentItem[]; viewer?: Person }) => {
  const shared = documents.filter((d) => d.clientVisible);
  const hidden = documents.length - shared.length;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-info/8 px-3.5 py-2.5 text-sm ring-1 ring-info/20">
        <Eye className="size-4 text-info" aria-hidden />
        <span>
          Previewing as <span className="font-medium text-heading">{viewer?.name ?? "a client contact"}</span>
          {viewer?.external && <span className="text-muted-foreground"> ({viewer.external.company})</span>}. Internal notes, tasks, budget and {hidden} internal document{hidden === 1 ? "" : "s"} are hidden.
        </span>
      </div>

      {/* Portal frame */}
      <div className="overflow-hidden rounded-xl ring-1 ring-border">
        <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2">
          <span className="flex gap-1" aria-hidden>
            <span className="size-2.5 rounded-full bg-danger/50" /><span className="size-2.5 rounded-full bg-warning/60" /><span className="size-2.5 rounded-full bg-success/60" />
          </span>
          <span className="mx-auto flex items-center gap-1.5 rounded-md bg-card px-3 py-0.5 text-[0.7rem] text-muted-foreground ring-1 ring-border">
            <Lock className="size-3" /> portal.bizpilot.app/{p.clientId}/{p.id}
          </span>
        </div>
        <div className="app-canvas space-y-4 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{p.clientName} · delivered by The Cornucopia</p>
              <h3 className="font-heading text-lg font-semibold text-heading">{p.name}</h3>
            </div>
            <Chip tone="info" dot>On schedule for {formatShortDate(p.deadline)}</Chip>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass space-y-2 rounded-lg p-4 md:col-span-2">
              <p className="text-xs font-semibold text-heading">Progress</p>
              <ProgressBar value={p.progress} size="md" />
              <p className="text-sm text-muted-foreground">Claims flow beta is ready for your review. API integration is in progress.</p>
            </div>
            <div className="glass space-y-2 rounded-lg p-4">
              <p className="text-xs font-semibold text-heading">Pending approvals</p>
              {!p.milestones.some((m) => m.status === "awaiting-approval") && <p className="text-sm text-muted-foreground">Nothing waiting for your approval.</p>}
              {p.milestones.filter((m) => m.status === "awaiting-approval").map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm">{m.name}</span>
                  <Button size="xs" tabIndex={-1}>Review</Button>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface rounded-lg p-4">
              <p className="mb-2 text-xs font-semibold text-heading">Milestones</p>
              {p.milestones.length === 0 && <p className="text-sm text-muted-foreground">Milestones will appear once they&apos;re planned.</p>}
              <ul className="space-y-1.5">
                {p.milestones.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-sm">
                    <Diamond className="size-3 fill-ai text-ai" aria-hidden /> <span className="flex-1">{m.name}</span>
                    <span className="tabular text-xs text-muted-foreground">{formatLongDate(m.date)}</span>
                    <Chip tone={msTone[m.status]}>{msLabel[m.status]}</Chip>
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface rounded-lg p-4">
              <p className="mb-2 text-xs font-semibold text-heading">Shared documents</p>
              {shared.length === 0 && <p className="text-sm text-muted-foreground">No documents have been shared yet.</p>}
              <ul className="space-y-1.5">
                {shared.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 text-sm"><FileText className="size-3.5 text-muted-foreground" /> {d.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
