"use client";

import { useState } from "react";
import { ClipboardCheck, Ellipsis, GitBranch, MessageSquare, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable, type Column } from "@/components/generalUIcomp/DataTable";
import { PriorityChip, TaskStatusChip } from "@/components/generalUIcomp/Chips";
import { PersonLabel, UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { EmptyState } from "@/components/generalUIcomp/States";
import { dueLabel, isOverdue } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { CompleteToggle } from "./CompleteToggle";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { ReassignSubmenu, StatusSubmenu } from "./TaskMenus";

const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 };

/** Detailed task list (§16.1 columns) with the task drawer */
export const TaskTable = ({ tasks: incoming, hideProject, onTasksChange }: { tasks: Task[]; hideProject?: boolean; onTasksChange?: (t: Task[]) => void }) => {
  // Controlled when onTasksChange is provided (e.g. shared with a board), otherwise local
  const [local, setLocal] = useState(incoming);
  const tasks = onTasksChange ? incoming : local;
  const [open, setOpen] = useState<Task | null>(null);

  const update = (t: Task) => {
    const next = tasks.map((x) => (x.id === t.id ? t : x));
    if (onTasksChange) onTasksChange(next);
    else setLocal(next);
    if (open?.id === t.id) setOpen(t);
  };
  const patch = (t: Task, p: Partial<Task>, msg: string) => {
    update({ ...t, ...p });
    notify.success(msg, { description: t.title, onUndo: () => update(t) });
  };

  const columns: Column<Task>[] = [
    {
      id: "task",
      header: "Task",
      sortValue: (t) => t.title,
      cell: (t) => (
        <div className="flex min-w-64 items-center gap-3">
          <span onClick={(e) => e.stopPropagation()}>
            <CompleteToggle done={t.status === "done"} label={t.title} onToggle={() => patch(t, { status: t.status === "done" ? "todo" : "done" }, t.status === "done" ? "Task reopened" : "Task completed")} />
          </span>
          <span className="min-w-0">
            <span className={cn("block truncate font-medium text-heading", t.status === "done" && "text-muted-foreground line-through")}>{t.title}</span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{t.key}</span>
              {t.comments > 0 && <span className="flex items-center gap-0.5"><MessageSquare className="size-3" />{t.comments}</span>}
              {t.attachments > 0 && <span className="flex items-center gap-0.5"><Paperclip className="size-3" />{t.attachments}</span>}
            </span>
          </span>
        </div>
      ),
    },
    ...(hideProject
      ? []
      : [
          { id: "project", header: "Project", hideBelow: "lg" as const, sortValue: (t: Task) => t.projectName, cell: (t: Task) => <span className="text-sm">{t.projectName}</span> },
          { id: "client", header: "Client", hideBelow: "2xl" as const, sortValue: (t: Task) => t.clientName, cell: (t: Task) => <span className="text-sm text-muted-foreground">{t.clientName}</span> },
        ]),
    { id: "assignee", header: "Assignee", hideBelow: "md", sortValue: (t) => t.assignee.name, cell: (t) => <PersonLabel person={t.assignee} /> },
    { id: "status", header: "Status", sortValue: (t) => t.status, cell: (t) => <TaskStatusChip status={t.status} /> },
    { id: "priority", header: "Priority", hideBelow: "md", sortValue: (t) => priorityRank[t.priority], cell: (t) => <PriorityChip priority={t.priority} /> },
    {
      id: "due",
      header: "Due",
      sortValue: (t) => new Date(t.dueDate).getTime(),
      cell: (t) => <span className={cn("tabular text-xs", isOverdue(t.dueDate) && t.status !== "done" ? "font-medium text-danger" : "text-muted-foreground")}>{dueLabel(t.dueDate)}</span>,
    },
    {
      id: "deps",
      header: "Deps",
      hideBelow: "lg",
      align: "center",
      sortValue: (t) => t.dependencies,
      cell: (t) => (t.dependencies ? <span className="inline-flex items-center gap-1 text-xs text-warning" title="Waiting on another task"><GitBranch className="size-3.5" />{t.dependencies}</span> : <span className="text-subtle">—</span>),
    },
  ];

  return (
    <>
      <DataTable
        ariaLabel="Tasks"
        rows={tasks}
        columns={columns}
        getRowId={(t) => t.id}
        onRowClick={setOpen}
        pageSize={12}
        empty={<div className="surface rounded-lg"><EmptyState compact icon={ClipboardCheck} title="No tasks" description="Tasks will appear here once they're created." /></div>}
        rowActions={(t) => (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Task actions"><Ellipsis /></Button>} />
            <DropdownMenuContent align="end" className="w-48">
              <StatusSubmenu task={t} onChange={(s) => patch(t, { status: s }, "Status updated")} />
              <ReassignSubmenu task={t} onChange={(p) => patch(t, { assignee: p }, `Reassigned to ${p.name}`)} />
              <DropdownMenuItem onClick={() => setOpen(t)}>Open detail</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        mobileItem={(t) => (
          <div className="flex items-center gap-3">
            <UserAvatar person={t.assignee} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-heading">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.projectName} · {dueLabel(t.dueDate)}</p>
            </div>
            <TaskStatusChip status={t.status} />
          </div>
        )}
      />
      <TaskDetailPanel task={open} onOpenChange={(o) => !o && setOpen(null)} onChange={update} />
    </>
  );
};
