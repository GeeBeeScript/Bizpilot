"use client";

import { useState } from "react";
import { CalendarDays, Ellipsis, GitBranch, KanbanSquare, MessageSquare, Paperclip, Search } from "lucide-react";
import { EmptyState } from "@/components/generalUIcomp/States";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { KanbanBoard, type BoardColumn } from "@/components/elements/board/KanbanBoard";
import { PriorityChip, taskStatusMap } from "@/components/generalUIcomp/Chips";
import { UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { useQuickCreate } from "@/context/quickCreateContext";
import { dueLabel, isOverdue } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { Priority, Task, TaskStatus } from "@/types";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { StatusSubmenu, TASK_STATUSES } from "./TaskMenus";

const accents: Record<TaskStatus, string> = {
  backlog: "var(--subtle)",
  todo: "var(--muted-foreground)",
  "in-progress": "var(--info)",
  review: "var(--color-deep-sapphire)",
  blocked: "var(--danger)",
  done: "var(--success)",
};

const columns: BoardColumn[] = TASK_STATUSES.map((s) => ({ id: s, label: taskStatusMap[s].label, icon: taskStatusMap[s].icon, accent: accents[s] }));

/** Sticky-note colour edge by priority (Miro-inspired) */
const edge: Record<Priority, string> = {
  low: "before:bg-muted-foreground/30",
  medium: "before:bg-info",
  high: "before:bg-warning",
  urgent: "before:bg-danger",
};

const TaskCard = ({ task: t, overlay, justDropped, onOpen, onMove }: { task: Task; overlay?: boolean; justDropped?: boolean; onOpen: () => void; onMove: (s: TaskStatus) => void }) => {
  const overdue = isOverdue(t.dueDate) && t.status !== "done";
  return (
    <article
      onClick={onOpen}
      className={cn(
        "group/card relative cursor-pointer overflow-hidden rounded-lg surface elev-1 p-3 pl-3.5 text-left transition-all duration-150 select-none",
        "before:absolute before:inset-y-0 before:left-0 before:w-[3px]",
        edge[t.priority],
        !overlay && "hover:-translate-y-px hover:lift",
        overlay && "elev-4 ring-2 ring-primary/40",
        justDropped && "animate-in zoom-in-[0.97] ring-2 ring-success/60 duration-300",
        t.status === "done" && "opacity-75",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[0.65rem] text-subtle">{t.key}</span>
        <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" className="-mt-1 -mr-1 text-muted-foreground opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100" aria-label={`Actions for ${t.title}`}><Ellipsis /></Button>} />
            <DropdownMenuContent align="end" className="w-44">
              <StatusSubmenu task={t} onChange={onMove} label="Move to…" />
              <DropdownMenuItem onClick={onOpen}>Open detail</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <h4 className={cn("mt-0.5 text-[0.84rem] leading-snug font-medium text-heading", t.status === "done" && "line-through decoration-muted-foreground/50")}>{t.title}</h4>
      <div className="mt-2.5 flex items-center gap-2">
        <PriorityChip priority={t.priority} />
        <span className={cn("flex items-center gap-1 text-[0.7rem]", overdue ? "font-medium text-danger" : "text-muted-foreground")}>
          <CalendarDays className="size-3" aria-hidden /> {dueLabel(t.dueDate)}
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5 border-t border-border/70 pt-2 text-[0.7rem] text-muted-foreground">
        {t.comments > 0 && <span className="flex items-center gap-0.5" title={`${t.comments} comments`}><MessageSquare className="size-3" />{t.comments}</span>}
        {t.attachments > 0 && <span className="flex items-center gap-0.5" title={`${t.attachments} attachments`}><Paperclip className="size-3" />{t.attachments}</span>}
        {t.dependencies > 0 && <span className="flex items-center gap-0.5 text-warning" title="Depends on another task"><GitBranch className="size-3" />{t.dependencies}</span>}
        <UserAvatar person={t.assignee} className="ml-auto size-5" />
      </div>
    </article>
  );
};

/** Project board (§15.3) on a Miro-style dot-grid canvas with a floating glass toolbar */
export const TaskBoard = ({ tasks, onTasksChange, projectId }: { tasks: Task[]; onTasksChange: (t: Task[]) => void; projectId?: string }) => {
  const { openCreate } = useQuickCreate();
  const [open, setOpen] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const [assignee, setAssignee] = useState<string | null>(null);

  const people = Array.from(new Map(tasks.map((t) => [t.assignee.id, t.assignee])).values());
  const visible = tasks.filter(
    (t) => (!query || t.title.toLowerCase().includes(query.toLowerCase())) && (!assignee || t.assignee.id === assignee),
  );

  // Board edits apply to the full list so filtered-out cards keep their place
  const apply = (next: Task[]) => {
    const ids = new Set(next.map((t) => t.id));
    onTasksChange([...next, ...tasks.filter((t) => !ids.has(t.id))]);
  };

  const move = (t: Task, s: TaskStatus) => {
    if (s === "done" && t.dependencies > 0) {
      notify.warning("Can't move to Done", { description: "Resolve its dependency first." });
      return;
    }
    const prev = tasks;
    onTasksChange(tasks.map((x) => (x.id === t.id ? { ...x, status: s } : x)));
    notify.success(`Moved to ${taskStatusMap[s].label}`, { description: t.title, onUndo: () => onTasksChange(prev) });
  };

  if (tasks.length === 0)
    return (
      <div className="dot-grid surface rounded-lg">
        <EmptyState icon={KanbanSquare} title="The board is empty" description="Add the first task to start planning work across Backlog, To Do, In Progress, Review and Done." action={<Button size="sm" onClick={() => openCreate("task", { projectId })}>Add task</Button>} />
      </div>
    );

  return (
    <div className="dot-grid relative -mx-4 rounded-none px-4 pt-14 pb-2 md:-mx-7 md:px-7">
      {/* Floating toolbar */}
      <div className="glass absolute top-2 left-4 z-10 flex items-center gap-1.5 rounded-lg p-1 md:left-7">
        <label className="flex h-7 items-center gap-1.5 rounded-md bg-card/70 px-2 ring-1 ring-border">
          <Search className="size-3.5 text-muted-foreground" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter cards" className="w-28 bg-transparent text-xs outline-none placeholder:text-muted-foreground" aria-label="Filter cards" />
        </label>
        <span className="mx-0.5 h-4 w-px bg-border" aria-hidden />
        <div className="flex -space-x-1" role="group" aria-label="Filter by assignee">
          {people.map((p) => (
            <button
              key={p.id}
              onClick={() => setAssignee((a) => (a === p.id ? null : p.id))}
              aria-pressed={assignee === p.id}
              className={cn("rounded-full transition-all", assignee && assignee !== p.id && "opacity-40", assignee === p.id && "z-10 ring-2 ring-primary")}
              title={p.name}
            >
              <UserAvatar person={p} />
            </button>
          ))}
        </div>
        <span className="mx-0.5 h-4 w-px bg-border max-sm:hidden" aria-hidden />
        <span className="px-1 text-[0.7rem] text-muted-foreground max-sm:hidden">Drag cards · or focus + Space</span>
      </div>

      <KanbanBoard
        columns={columns}
        items={visible}
        getId={(t) => t.id}
        getColumn={(t) => t.status}
        setColumn={(t, c) => ({ ...t, status: c as TaskStatus })}
        onItemsChange={apply}
        itemLabel={(t) => t.title}
        invalidReason={(t, col) => (col === "done" && t.dependencies > 0 ? "Resolve dependencies first" : null)}
        onAdd={() => openCreate("task", { projectId })}
        renderCard={(t, s) => <TaskCard task={t} overlay={s.overlay} justDropped={s.justDropped} onOpen={() => setOpen(t)} onMove={(st) => move(t, st)} />}
      />
      <TaskDetailPanel
        task={open}
        onOpenChange={(o) => !o && setOpen(null)}
        onChange={(t) => {
          onTasksChange(tasks.map((x) => (x.id === t.id ? t : x)));
          setOpen(t);
        }}
      />
    </div>
  );
};
