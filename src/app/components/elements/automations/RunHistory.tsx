"use client";

import { useState } from "react";
import { CircleCheck, CircleX, History, Loader, RotateCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DataTable,
  type Column,
} from "@/app/components/generalUIcomp/DataTable";
import { Chip, type Tone } from "@/app/components/generalUIcomp/Chips";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import { SidePanel } from "@/app/components/generalUIcomp/SidePanel";
import { StepProgress } from "@/app/components/loaders/StepProgress";
import { formatLongDate, timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import type { AutomationRun, AutomationRunStatus } from "@/types";

export const runStatus: Record<
  AutomationRunStatus,
  { label: string; tone: Tone; icon: typeof CircleCheck }
> = {
  success: { label: "Succeeded", tone: "success", icon: CircleCheck },
  failed: { label: "Failed", tone: "danger", icon: CircleX },
  running: { label: "Running", tone: "ai", icon: Loader },
  retrying: { label: "Retrying", tone: "warning", icon: RotateCw },
};

const dot = {
  done: "bg-success",
  active: "bg-ai animate-pulse",
  pending: "bg-muted-foreground/25",
  failed: "bg-danger",
};
/** Compact step summary for table rows */
const RunDots = ({ steps }: { steps: AutomationRun["steps"] }) => (
  <span
    className="flex items-center gap-1"
    aria-label={steps.map((s) => `${s.label}: ${s.state}`).join(", ")}
  >
    {steps.map((s, i) => (
      <span
        key={i}
        title={`${s.label} — ${s.state}`}
        className={`h-1.5 w-4 rounded-full ${dot[s.state]}`}
      />
    ))}
  </span>
);

const duration = (ms: number) => (ms ? `${(ms / 1000).toFixed(1)}s` : "—");

/** Run history (§18.4) with a run-detail drawer using the automation step visual language */
export const RunHistory = ({ runs }: { runs: AutomationRun[] }) => {
  const [open, setOpen] = useState<AutomationRun | null>(null);

  const columns: Column<AutomationRun>[] = [
    {
      id: "time",
      header: "Started",
      sortValue: (r) => -new Date(r.startedAt).getTime(),
      cell: (r) => (
        <span className="text-sm">
          {formatLongDate(r.startedAt)}{" "}
          <span className="text-xs text-muted-foreground">
            · {timeAgo(r.startedAt)}
          </span>
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (r) => r.status,
      cell: (r) => {
        const s = runStatus[r.status];
        return (
          <Chip tone={s.tone} icon={s.icon}>
            {s.label}
          </Chip>
        );
      },
    },
    {
      id: "duration",
      header: "Duration",
      align: "right",
      sortValue: (r) => r.durationMs,
      cell: (r) => (
        <span className="tabular text-xs">{duration(r.durationMs)}</span>
      ),
    },
    {
      id: "trigger",
      header: "Trigger data",
      hideBelow: "md",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">{r.trigger}</span>
      ),
    },
    {
      id: "steps",
      header: "Steps",
      hideBelow: "lg",
      cell: (r) => <RunDots steps={r.steps} />,
    },
  ];

  return (
    <>
      <DataTable
        ariaLabel="Run history"
        rows={runs}
        columns={columns}
        getRowId={(r) => r.id}
        onRowClick={setOpen}
        empty={
          <div className="surface rounded-lg">
            <EmptyState
              icon={History}
              title="No runs yet"
              description="Runs appear here each time the trigger fires. Use Test run to try the workflow."
            />
          </div>
        }
      />
      <SidePanel
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open && formatLongDate(open.startedAt)}
        title={open ? `Run ${open.id.toUpperCase()}` : ""}
        description={open?.trigger}
        footer={
          open?.status === "failed" ? (
            <Button
              onClick={() => {
                notify.success("Retry queued", {
                  description: "We'll notify you when it finishes.",
                });
                setOpen(null);
              }}
            >
              <RotateCw /> Retry run
            </Button>
          ) : undefined
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Chip
                tone={runStatus[open.status].tone}
                icon={runStatus[open.status].icon}
              >
                {runStatus[open.status].label}
              </Chip>
              <span className="tabular text-sm text-muted-foreground">
                Duration {duration(open.durationMs)}
              </span>
            </div>
            <StepProgress steps={open.steps} kind="automation" />
          </div>
        )}
      </SidePanel>
    </>
  );
};
