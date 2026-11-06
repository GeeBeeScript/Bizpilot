"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCheck, Download, MessageSquareWarning, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Chip, type Tone } from "@/components/generalUIcomp/Chips";
import { ProgressBar } from "@/components/generalUIcomp/ProgressBar";
import { Field, SidePanel } from "@/components/generalUIcomp/SidePanel";
import { LoadingButton, useSubmit } from "@/components/generalUIcomp/LoadingButton";
import { FileTypeIcon } from "@/components/elements/documents/DocumentRow";
import { formatLongDate, timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { Deliverable } from "@/lib/mock/portal";
import type { Project } from "@/types";

/* ---------- Shared approval state across portal pages ---------- */
type Ctx = { deliverables: Deliverable[]; decide: (id: string, status: Deliverable["status"], note?: string) => void; review: (d: Deliverable) => void };
const PortalContext = createContext<Ctx | undefined>(undefined);
export const usePortal = () => {
  const c = useContext(PortalContext);
  if (!c) throw new Error("usePortal must be used inside PortalProvider");
  return c;
};

export const deliverableStatus: Record<Deliverable["status"], { label: string; tone: Tone }> = {
  awaiting: { label: "Awaiting your approval", tone: "ai" },
  approved: { label: "Approved", tone: "success" },
  "changes-requested": { label: "Changes requested", tone: "warning" },
};

/** Approval review drawer (§25.3 Approvals: Review · Approve · Request changes) */
const ApprovalPanel = ({ d, onClose, decide }: { d: Deliverable | null; onClose: () => void; decide: Ctx["decide"] }) => {
  const [mode, setMode] = useState<"view" | "changes">("view");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const { submitting, submit } = useSubmit();

  const close = () => {
    setMode("view");
    setNote("");
    setTouched(false);
    onClose();
  };

  return (
    <SidePanel
      open={!!d}
      onOpenChange={(o) => !o && close()}
      size="lg"
      eyebrow={d && `Version ${d.version} · submitted ${formatLongDate(d.submittedAt)} by ${d.submittedBy}`}
      title={d?.name ?? ""}
      footer={
        d?.status === "awaiting" ? (
          mode === "view" ? (
            <>
              <Button variant="outline" onClick={() => setMode("changes")}><PencilLine /> Request changes</Button>
              <LoadingButton loading={submitting} onClick={() => submit(() => { decide(d.id, "approved"); close(); })}><CheckCheck /> Approve</LoadingButton>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setMode("view")}>Cancel</Button>
              <LoadingButton
                loading={submitting}
                onClick={() => {
                  setTouched(true);
                  if (!note.trim()) return;
                  submit(() => { decide(d.id, "changes-requested", note); close(); });
                }}
              >
                Send request
              </LoadingButton>
            </>
          )
        ) : undefined
      }
    >
      {d && (
        <div className="space-y-5">
          <Chip tone={deliverableStatus[d.status].tone} dot>{deliverableStatus[d.status].label}</Chip>
          <div className="dot-grid grid h-56 place-items-center rounded-lg bg-muted/40 ring-1 ring-border">
            <div className="flex flex-col items-center gap-3 text-center">
              <FileTypeIcon type={d.kind} className="size-14 [&_svg]:size-7" />
              <p className="text-sm text-heading">{d.name}</p>
              <Button variant="outline" size="sm" onClick={() => notify.success("Download started")}><Download /> Download v{d.version}</Button>
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-heading">Notes from {d.submittedBy}</p>
            <p className="rounded-lg bg-muted/50 p-3 text-sm">{d.note}</p>
          </div>
          {d.dueBy && d.status === "awaiting" && <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarDays className="size-4" /> Approval requested by {formatLongDate(d.dueBy)}</p>}
          {mode === "changes" && (
            <Field label="What should change? *" htmlFor="chg" error={touched && !note.trim() ? "Describe the changes you need" : undefined}>
              <Textarea id="chg" autoFocus rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Be as specific as you can — the team will see this." />
            </Field>
          )}
        </div>
      )}
    </SidePanel>
  );
};

export const PortalProvider = ({ initial, children }: { initial: Deliverable[]; children: React.ReactNode }) => {
  const [deliverables, setDeliverables] = useState(initial);
  const [reviewing, setReviewing] = useState<Deliverable | null>(null);
  const decide: Ctx["decide"] = (id, status) => {
    const prev = deliverables;
    setDeliverables((l) => l.map((d) => (d.id === id ? { ...d, status } : d)));
    notify.success(status === "approved" ? "Approved — the team has been notified" : "Change request sent", { onUndo: () => setDeliverables(prev) });
  };
  return (
    <PortalContext.Provider value={{ deliverables, decide, review: setReviewing }}>
      {children}
      <ApprovalPanel d={reviewing ? deliverables.find((x) => x.id === reviewing.id) ?? null : null} onClose={() => setReviewing(null)} decide={decide} />
    </PortalContext.Provider>
  );
};

export const DeliverableRow = ({ d }: { d: Deliverable }) => {
  const { review } = usePortal();
  const s = deliverableStatus[d.status];
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <FileTypeIcon type={d.kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-heading">{d.name}</p>
        <p className="text-xs text-muted-foreground">v{d.version} · submitted {timeAgo(d.submittedAt)}{d.dueBy && d.status === "awaiting" && <> · due {formatLongDate(d.dueBy)}</>}</p>
      </div>
      <Chip tone={s.tone} dot>{s.label}</Chip>
      <Button size="sm" variant={d.status === "awaiting" ? "default" : "outline"} onClick={() => review(d)}>{d.status === "awaiting" ? "Review" : "View"}</Button>
    </li>
  );
};

export const PortalProjectCard = ({ p, pending }: { p: Project; pending: number }) => (
  <Link href={`/portal/projects/${p.id}`} className="surface group/pp flex flex-col gap-3 rounded-lg p-4 transition-all duration-150 hover:lift">
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-heading font-semibold text-heading group-hover/pp:text-primary">{p.name}</h3>
      <Chip tone={p.status === "on-hold" ? "warning" : "info"} dot className="capitalize">{p.status.replace("-", " ")}</Chip>
    </div>
    <ProgressBar value={p.progress} size="md" label={`${p.name} progress`} />
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1"><CalendarDays className="size-3.5" /> Due {formatLongDate(p.deadline)}</span>
      {pending > 0 ? (
        <span className={cn("flex items-center gap-1 font-medium text-heading")}><MessageSquareWarning className="size-3.5 text-ai" /> {pending} awaiting your approval</span>
      ) : (
        <span>No action needed</span>
      )}
    </div>
  </Link>
);
