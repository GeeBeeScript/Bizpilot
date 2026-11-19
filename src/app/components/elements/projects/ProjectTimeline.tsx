"use client";

import { useRef, useState } from "react";
import {
  addDays,
  differenceInCalendarDays,
  eachWeekOfInterval,
  format,
  max as maxDate,
  min as minDate,
} from "date-fns";
import { Diamond, GitBranch } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import { formatShortDate, isOverdue } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { Milestone, Task } from "@/types";

const statusFill: Record<Task["status"], { bar: string; progress: number }> = {
  backlog: { bar: "bg-muted-foreground/25", progress: 0 },
  todo: { bar: "bg-muted-foreground/35", progress: 0 },
  "in-progress": { bar: "bg-info/35", progress: 50 },
  review: { bar: "bg-deep-sapphire/35 dark:bg-info/30", progress: 85 },
  blocked: { bar: "bg-danger/30", progress: 30 },
  done: { bar: "bg-success/40", progress: 100 },
};
const progressFill: Record<Task["status"], string> = {
  backlog: "bg-muted-foreground/50",
  todo: "bg-muted-foreground/50",
  "in-progress": "bg-info",
  review: "bg-deep-sapphire dark:bg-info",
  blocked: "bg-danger",
  done: "bg-success",
};

type Props = {
  tasks: Task[];
  milestones: Milestone[];
  start: string;
  end: string;
  onTasksChange: (t: Task[]) => void;
};

/** Timeline/Gantt view (§15.5 Timeline tab) with draggable end handles + undo */
export const ProjectTimeline = ({
  tasks,
  milestones,
  start,
  end,
  onTasksChange,
}: Props) => {
  const track = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; days: number } | null>(null);

  const allDates = [
    new Date(start),
    new Date(end),
    ...tasks.flatMap((t) => [new Date(t.startDate), new Date(t.dueDate)]),
  ];
  const from = addDays(minDate(allDates), -3);
  const to = addDays(maxDate(allDates), 5);
  const span = differenceInCalendarDays(to, from);
  const pct = (iso: string | Date) =>
    (differenceInCalendarDays(new Date(iso), from) / span) * 100;
  const weeks = eachWeekOfInterval(
    { start: from, end: to },
    { weekStartsOn: 1 },
  );
  const today = pct(new Date());

  const sorted = [...tasks].sort(
    (a, b) => +new Date(a.startDate) - +new Date(b.startDate),
  );

  const startDrag = (e: React.PointerEvent, t: Task) => {
    e.preventDefault();
    e.stopPropagation();
    const width = track.current?.getBoundingClientRect().width ?? 1;
    const dayPx = width / span;
    const x0 = e.clientX;
    const onMove = (ev: PointerEvent) =>
      setDrag({ id: t.id, days: Math.round((ev.clientX - x0) / dayPx) });
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const days = Math.round((ev.clientX - x0) / dayPx);
      setDrag(null);
      if (!days) return;
      const prev = tasks;
      const due = addDays(new Date(t.dueDate), days);
      if (due <= new Date(t.startDate))
        return notify.warning("Due date must be after the start date");
      onTasksChange(
        tasks.map((x) =>
          x.id === t.id ? { ...x, dueDate: due.toISOString() } : x,
        ),
      );
      notify.success(`Due date changed to ${format(due, "MMM d")}`, {
        description: t.title,
        onUndo: () => onTasksChange(prev),
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const nudge = (t: Task, days: number) => {
    const prev = tasks;
    const due = addDays(new Date(t.dueDate), days);
    onTasksChange(
      tasks.map((x) =>
        x.id === t.id ? { ...x, dueDate: due.toISOString() } : x,
      ),
    );
    notify.success(`Due date changed to ${format(due, "MMM d")}`, {
      description: t.title,
      onUndo: () => onTasksChange(prev),
    });
  };

  return (
    <div className="surface overflow-hidden rounded-lg">
      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-[56rem]">
          {/* Week header */}
          <div className="grid grid-cols-[16rem_1fr] border-b border-border bg-muted/40 text-[0.68rem] text-muted-foreground">
            <div className="px-4 py-2 font-semibold tracking-wider uppercase">
              Item
            </div>
            <div className="relative h-8">
              {weeks.map((w) => (
                <span
                  key={w.toISOString()}
                  className="tabular absolute top-0 flex h-full items-center border-l border-border/70 pl-1.5"
                  style={{ left: `${pct(w)}%` }}
                >
                  {format(w, "MMM d")}
                </span>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-[16rem_1fr] border-b border-border">
            <div className="px-4 py-2 text-xs font-semibold text-heading">
              Milestones
            </div>
            <div className="relative h-10">
              {milestones.map((m) => (
                <Tooltip key={m.id}>
                  <TooltipTrigger
                    render={
                      <span
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${pct(m.date)}%` }}
                      >
                        <Diamond
                          className={cn(
                            "size-4",
                            m.status === "done"
                              ? "fill-success text-success"
                              : m.status === "late"
                                ? "fill-danger text-danger"
                                : "fill-ai text-ai",
                          )}
                          aria-label={m.name}
                        />
                      </span>
                    }
                  />
                  <TooltipContent>
                    {m.name} · {formatShortDate(m.date)} ·{" "}
                    {m.status.replace("-", " ")}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Task rows */}
          <div ref={track} className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 left-64">
              {weeks.map((w) => (
                <span
                  key={w.toISOString()}
                  className="absolute inset-y-0 border-l border-border/40"
                  style={{ left: `${pct(w)}%` }}
                />
              ))}
              <span
                className="absolute inset-y-0 w-px bg-primary-gold"
                style={{ left: `${today}%` }}
              >
                <span className="absolute -top-0 -translate-x-1/2 rounded-b bg-primary-gold px-1 text-[0.6rem] font-semibold text-midnight-navy">
                  Today
                </span>
              </span>
            </div>
            {sorted.map((t) => {
              const days = drag?.id === t.id ? drag.days : 0;
              const due = addDays(new Date(t.dueDate), days).toISOString();
              const left = pct(t.startDate);
              const width = Math.max(1.5, pct(due) - left);
              const late = isOverdue(t.dueDate) && t.status !== "done";
              const fill = statusFill[t.status];
              return (
                <div
                  key={t.id}
                  className="group/tl grid grid-cols-[16rem_1fr] border-b border-border/60 last:border-0 hover:bg-muted/30"
                >
                  <div className="flex min-w-0 items-center gap-2 px-4 py-2">
                    <UserAvatar person={t.assignee} className="size-5" />
                    <span
                      className={cn(
                        "truncate text-xs",
                        late ? "text-danger" : "text-foreground",
                      )}
                    >
                      {t.title}
                    </span>
                    {t.dependencies > 0 && (
                      <GitBranch
                        className="size-3 shrink-0 text-warning"
                        aria-label="Has dependency"
                      />
                    )}
                  </div>
                  <div className="relative h-10">
                    <div
                      className={cn(
                        "absolute top-1/2 h-5 -translate-y-1/2 overflow-hidden rounded-md",
                        fill.bar,
                        late &&
                          "bg-[repeating-linear-gradient(135deg,color-mix(in_oklab,var(--danger)_30%,transparent)_0_6px,color-mix(in_oklab,var(--danger)_15%,transparent)_6px_12px)] ring-1 ring-danger/50",
                        drag?.id === t.id && "ring-2 ring-primary",
                      )}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${t.title}: ${formatShortDate(t.startDate)} → ${formatShortDate(due)}${late ? " (delayed)" : ""}`}
                    >
                      <div
                        className={cn("h-full", progressFill[t.status])}
                        style={{ width: `${fill.progress}%` }}
                      />
                    </div>
                    {t.status !== "done" && (
                      <button
                        onPointerDown={(e) => startDrag(e, t)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowRight") nudge(t, 1);
                          if (e.key === "ArrowLeft") nudge(t, -1);
                        }}
                        aria-label={`Adjust due date for ${t.title}. Use left and right arrow keys.`}
                        className="absolute top-1/2 h-6 w-2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-sm bg-card opacity-0 ring-1 ring-primary/60 transition-opacity group-hover/tl:opacity-100 focus-visible:opacity-100 outline-none focus-visible:ring-2"
                        style={{ left: `${left + width}%` }}
                      />
                    )}
                    {drag?.id === t.id && (
                      <span
                        className="tabular absolute -top-1 rounded bg-primary px-1.5 py-0.5 text-[0.65rem] text-primary-foreground"
                        style={{ left: `${left + width}%` }}
                      >
                        {format(new Date(due), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-border px-4 py-2 text-[0.7rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-info" /> In progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-success" /> Done
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-danger/40 ring-1 ring-danger/50" />{" "}
          Delayed
        </span>
        <span className="flex items-center gap-1.5">
          <Diamond className="size-3 fill-ai text-ai" /> Milestone
        </span>
        <span className="ml-auto">
          Drag a bar&apos;s end to change its due date
        </span>
      </div>
    </div>
  );
};
