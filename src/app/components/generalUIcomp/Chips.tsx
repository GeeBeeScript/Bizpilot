import { cn } from "@/lib/utils";
import type {
  ClientStatus,
  DocumentStatus,
  Health,
  Priority,
  ProjectStatus,
  TaskStatus,
} from "@/types";
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleX,
  Clock,
  Loader,
  OctagonAlert,
  PauseCircle,
  type LucideIcon,
} from "lucide-react";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "ai" | "sapphire";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info/12 text-info",
  success: "bg-success/12 text-success",
  warning: "bg-warning/14 text-warning",
  danger: "bg-danger/12 text-danger",
  ai: "bg-ai/16 text-[color-mix(in_oklab,var(--ai)_70%,var(--foreground))]",
  sapphire: "bg-deep-sapphire/10 text-deep-sapphire dark:bg-primary/15 dark:text-info",
};

type ChipProps = {
  tone?: Tone;
  icon?: LucideIcon;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
  title?: string;
};

/** Compact status/metadata chip. Re-keys on content so status changes fade in. */
export const Chip = ({ tone = "neutral", icon: Icon, dot, children, className, title }: ChipProps) => (
  <span
    key={String(children)}
    title={title}
    className={cn(
      "inline-flex h-5.5 shrink-0 items-center gap-1 rounded-full px-2 text-[0.7rem] font-medium whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200",
      toneStyles[tone],
      className,
    )}
  >
    {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
    {Icon && <Icon className="size-3" aria-hidden />}
    {children}
  </span>
);

const healthMap: Record<Health, { label: string; tone: Tone; icon: LucideIcon }> = {
  "on-track": { label: "On track", tone: "success", icon: CircleCheck },
  "at-risk": { label: "At risk", tone: "warning", icon: CircleAlert },
  "off-track": { label: "Off track", tone: "danger", icon: OctagonAlert },
};
export const HealthChip = ({ health, className }: { health: Health; className?: string }) => {
  const h = healthMap[health];
  return <Chip tone={h.tone} icon={h.icon} className={className}>{h.label}</Chip>;
};

const priorityMap: Record<Priority, { label: string; tone: Tone; bars: number }> = {
  low: { label: "Low", tone: "neutral", bars: 1 },
  medium: { label: "Medium", tone: "info", bars: 2 },
  high: { label: "High", tone: "warning", bars: 3 },
  urgent: { label: "Urgent", tone: "danger", bars: 4 },
};

/** Signal-bar priority indicator (kept from the original Today's Work design) */
export const PriorityBars = ({ priority, showLabel = false }: { priority: Priority; showLabel?: boolean }) => {
  const p = priorityMap[priority];
  const color = { neutral: "bg-muted-foreground/60", info: "bg-info", warning: "bg-warning", danger: "bg-danger" }[p.tone as "neutral" | "info" | "warning" | "danger"];
  return (
    <span className="inline-flex items-center gap-1.5" title={`${p.label} priority`}>
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1.5, 2, 3, 4].map((h, i) => (
          <span
            key={i}
            className={cn("w-1 rounded-sm", i < p.bars ? color : "bg-muted-foreground/20")}
            style={{ height: `${h * 0.25}rem` }}
          />
        ))}
      </span>
      {showLabel ? <span className="text-xs text-muted-foreground">{p.label}</span> : <span className="sr-only">{p.label} priority</span>}
    </span>
  );
};

export const PriorityChip = ({ priority }: { priority: Priority }) => {
  const p = priorityMap[priority];
  return <Chip tone={p.tone} dot>{p.label}</Chip>;
};

export const taskStatusMap: Record<TaskStatus, { label: string; tone: Tone; icon: LucideIcon }> = {
  backlog: { label: "Backlog", tone: "neutral", icon: CircleDashed },
  todo: { label: "To Do", tone: "neutral", icon: CircleDot },
  "in-progress": { label: "In Progress", tone: "info", icon: Loader },
  review: { label: "Review", tone: "sapphire", icon: Clock },
  blocked: { label: "Blocked", tone: "danger", icon: CircleX },
  done: { label: "Done", tone: "success", icon: CircleCheck },
};
export const TaskStatusChip = ({ status }: { status: TaskStatus }) => {
  const s = taskStatusMap[status];
  return <Chip tone={s.tone} icon={s.icon}>{s.label}</Chip>;
};

const projectStatusMap: Record<ProjectStatus, { label: string; tone: Tone; icon: LucideIcon }> = {
  planning: { label: "Planning", tone: "neutral", icon: CircleDashed },
  active: { label: "Active", tone: "info", icon: CircleDot },
  "on-hold": { label: "On hold", tone: "warning", icon: PauseCircle },
  completed: { label: "Completed", tone: "success", icon: CircleCheck },
};
export const ProjectStatusChip = ({ status }: { status: ProjectStatus }) => {
  const s = projectStatusMap[status];
  return <Chip tone={s.tone} icon={s.icon}>{s.label}</Chip>;
};

const clientStatusMap: Record<ClientStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  onboarding: { label: "Onboarding", tone: "info" },
  paused: { label: "Paused", tone: "warning" },
  inactive: { label: "Inactive", tone: "neutral" },
};
export const ClientStatusChip = ({ status }: { status: ClientStatus }) => {
  const s = clientStatusMap[status];
  return <Chip tone={s.tone} dot>{s.label}</Chip>;
};

const docStatusMap: Record<DocumentStatus, { label: string; tone: Tone; icon: LucideIcon }> = {
  uploading: { label: "Uploading", tone: "info", icon: Loader },
  processing: { label: "Processing", tone: "info", icon: Loader },
  indexing: { label: "Indexing", tone: "ai", icon: Loader },
  ready: { label: "Ready", tone: "success", icon: CircleCheck },
  failed: { label: "Failed", tone: "danger", icon: CircleX },
};
export const DocumentStatusChip = ({ status }: { status: DocumentStatus }) => {
  const s = docStatusMap[status];
  return (
    <Chip tone={s.tone} icon={s.icon} className={cn(["uploading", "processing", "indexing"].includes(status) && "[&_svg]:animate-spin [&_svg]:[animation-duration:2s]")}>
      {s.label}
    </Chip>
  );
};

export const ExternalBadge = ({ company }: { company?: string }) => (
  <Chip tone="ai" title={company ? `${company} — External collaborator` : "External collaborator"}>
    External
  </Chip>
);
