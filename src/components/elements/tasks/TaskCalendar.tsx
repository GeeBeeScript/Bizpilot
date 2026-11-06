"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarX2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/generalUIcomp/States";
import { UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { isOverdue } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Priority, Task } from "@/types";

const edge: Record<Priority, string> = {
  low: "border-l-muted-foreground/40",
  medium: "border-l-info",
  high: "border-l-warning",
  urgent: "border-l-danger",
};

const TaskPill = ({ t, onOpen }: { t: Task; onOpen: (t: Task) => void }) => (
  <button
    onClick={() => onOpen(t)}
    title={`${t.title} · ${t.assignee.name}`}
    className={cn(
      "flex w-full items-center gap-1 truncate rounded-sm border-l-2 surface px-1.5 py-0.5 text-left text-[0.7rem] transition-colors hover:bg-muted",
      edge[t.priority],
      t.status === "done" && "text-muted-foreground line-through",
      isOverdue(t.dueDate) && t.status !== "done" && "text-danger",
    )}
  >
    <span className="truncate">{t.title}</span>
  </button>
);

/** Month calendar of due dates (§16.1 calendar view); becomes an agenda list on small screens */
export const TaskCalendar = ({ tasks, onOpen }: { tasks: Task[]; onOpen: (t: Task) => void }) => {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const days = eachDayOfInterval({ start: startOfWeek(month, { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) });
  const onDay = (d: Date) => tasks.filter((t) => isSameDay(new Date(t.dueDate), d));
  const monthTasks = tasks
    .filter((t) => isSameMonth(new Date(t.dueDate), month))
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));

  return (
    <div className="surface overflow-hidden rounded-lg">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <h3 className="font-heading text-sm font-semibold text-heading">{format(month, "MMMM yyyy")}</h3>
        <span className="text-xs text-muted-foreground">· {monthTasks.length} due</span>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Previous month"><ChevronLeft /></Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(startOfMonth(new Date()))}>Today</Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month"><ChevronRight /></Button>
        </div>
      </div>

      {/* Month grid */}
      <div className="max-md:hidden">
        <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-[0.68rem] font-semibold tracking-wider text-muted-foreground uppercase">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="px-2 py-1.5">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const list = onDay(d);
            return (
              <div key={d.toISOString()} className={cn("min-h-28 border-r border-b border-border/60 p-1.5 [&:nth-child(7n)]:border-r-0", !isSameMonth(d, month) && "bg-muted/25")}>
                <span className={cn("tabular mb-1 inline-grid size-6 place-items-center rounded-full text-xs", isToday(d) ? "bg-primary font-semibold text-primary-foreground" : isSameMonth(d, month) ? "text-foreground" : "text-subtle")}>
                  {format(d, "d")}
                </span>
                <div className="space-y-1">
                  {list.slice(0, 3).map((t) => <TaskPill key={t.id} t={t} onOpen={onOpen} />)}
                  {list.length > 3 && <p className="px-1 text-[0.65rem] text-muted-foreground">+{list.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda on mobile */}
      <div className="md:hidden">
        {monthTasks.length === 0 ? (
          <EmptyState compact icon={CalendarX2} title="Nothing due this month" description="Tasks with due dates in this month will appear here." />
        ) : (
          <ul className="divide-y divide-border">
            {monthTasks.map((t) => (
              <li key={t.id}>
                <button onClick={() => onOpen(t)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left">
                  <span className="tabular w-10 text-center text-xs text-muted-foreground">{format(new Date(t.dueDate), "MMM d")}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                  <UserAvatar person={t.assignee} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
