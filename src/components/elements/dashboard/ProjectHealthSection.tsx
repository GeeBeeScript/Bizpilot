import Link from "next/link";
import { FolderOpen, HeartPulse, OctagonX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/generalUIcomp/States";
import { SectionCard } from "@/components/generalUIcomp/SectionCard";
import { HealthChip, ProjectStatusChip } from "@/components/generalUIcomp/Chips";
import { ProgressBar } from "@/components/generalUIcomp/ProgressBar";
import { dueLabel, formatShortDate, isOverdue } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

/** One project row — shared by the dashboard and client workspace (§12.5) */
export const ProjectHealthRow = ({ project: p }: { project: Project }) => {
  const overdue = isOverdue(p.deadline) && p.status !== "completed";
  return (
    <Link
      href={`/u/projects/${p.id}`}
      className="group/ph grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t border-border/70 px-4 py-3 transition-colors duration-150 hover:bg-muted/40 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_5.5rem_auto]"
    >
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{p.clientName}</p>
        <p className="truncate font-semibold text-heading group-hover/ph:text-primary">{p.name}</p>
        {p.blocker && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-danger">
            <OctagonX className="size-3 shrink-0" aria-hidden /> <span className="truncate">{p.blocker}</span>
          </p>
        )}
      </div>
      <div className="flex justify-end gap-1.5 md:order-last">
        <HealthChip health={p.health} />
        <span className="max-xl:hidden"><ProjectStatusChip status={p.status} /></span>
      </div>
      <ProgressBar value={p.progress} health={p.health} className="max-md:col-span-2" label={`${p.name} progress`} />
      <div className="text-xs max-md:hidden">
        <p className={cn("tabular", overdue ? "font-medium text-danger" : "text-foreground")}>{overdue ? dueLabel(p.deadline) : formatShortDate(p.deadline)}</p>
        <p className="tabular text-muted-foreground">{p.openTasks} open tasks</p>
      </div>
    </Link>
  );
};

/** Major projects as a scannable list — never a chart (§12.1, §12.5) */
const ProjectHealthSection = ({ projects }: { projects: Project[] }) => (
  <SectionCard title="Project Health" icon={HeartPulse} link={{ href: "/u/projects", label: "All projects" }} className="h-full" bodyClassName="px-0 pb-1">
    {projects.length === 0 ? (
      <EmptyState
        compact
        icon={FolderOpen}
        title="No active projects"
        description="Active client projects and their health will be listed here."
        action={<Link href="/u/projects" className={buttonVariants({ size: "sm" })}>Go to projects</Link>}
      />
    ) : (
    <>
    <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_5.5rem_auto] gap-x-4 px-4 pb-1.5 text-[0.65rem] font-semibold tracking-wider text-subtle uppercase md:grid">
      <span>Project</span>
      <span>Progress</span>
      <span>Deadline</span>
      <span className="text-right">Health</span>
    </div>
    {projects.map((p) => (
      <ProjectHealthRow key={p.id} project={p} />
    ))}
    </>
    )}
  </SectionCard>
);

export default ProjectHealthSection;
