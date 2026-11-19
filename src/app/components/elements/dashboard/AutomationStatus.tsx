import Link from "next/link";
import { CircleCheck, CircleX, Loader, RotateCw, Workflow } from "lucide-react";
import { buttonVariants } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import { SectionCard } from "@/app/components/generalUIcomp/SectionCard";
import { timeAgo } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { AutomationSummary } from "@/types";

const runIcon = {
  success: { icon: CircleCheck, cls: "text-success", label: "Succeeded" },
  failed: { icon: CircleX, cls: "text-danger", label: "Failed" },
  retrying: { icon: RotateCw, cls: "text-warning", label: "Retrying" },
  running: {
    icon: Loader,
    cls: "text-ai animate-spin [animation-duration:2s]",
    label: "Running",
  },
};

const Stat = ({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone?: string;
}) => (
  <div className="rounded-md bg-card/60 px-2.5 py-2 ring-1 ring-border/60">
    <p className={cn("tabular text-lg font-semibold text-heading", tone)}>
      {value}
    </p>
    <p className="text-[0.7rem] leading-tight text-muted-foreground">{label}</p>
  </div>
);

/** Compact automation status block (§12.12) */
const AutomationStatus = ({ summary }: { summary: AutomationSummary }) => (
  <SectionCard
    variant="glass"
    title="Automations"
    icon={Workflow}
    link={{ href: "/u/automations", label: "Manage" }}
    className="h-full"
  >
    {summary.active === 0 && summary.recent.length === 0 ? (
      <EmptyState
        compact
        icon={Workflow}
        title="No automations yet"
        description="Automate onboarding, reminders and status updates across your work."
        action={
          <Link
            href="/u/automations"
            className={buttonVariants({ size: "sm" })}
          >
            Create automation
          </Link>
        }
      />
    ) : (
      <>
        <div className="grid grid-cols-3 gap-2">
          <Stat value={summary.active} label="Active" />
          <Stat
            value={summary.failedRuns}
            label="Failed runs"
            tone={summary.failedRuns ? "text-danger" : undefined}
          />
          <Stat
            value={summary.awaitingRetry}
            label="Awaiting retry"
            tone={summary.awaitingRetry ? "text-warning" : undefined}
          />
        </div>
        <p className="mt-3 mb-1 text-xs text-muted-foreground">
          Last successful run {timeAgo(summary.lastSuccess)}
        </p>
        <ul className="space-y-0.5">
          {summary.recent.map((r) => {
            const s = runIcon[r.status];
            return (
              <li
                key={r.id}
                className="flex items-center gap-2 py-1 text-[0.82rem]"
              >
                <s.icon
                  className={cn("size-3.5 shrink-0", s.cls)}
                  aria-label={s.label}
                />
                <span className="flex-1 truncate">{r.name}</span>
                <span className="tabular text-xs text-muted-foreground">
                  {timeAgo(r.at)}
                </span>
              </li>
            );
          })}
        </ul>
      </>
    )}
  </SectionCard>
);

export default AutomationStatus;
