"use client"

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ClipboardCheck, Ellipsis, PanelRightOpen, PartyPopper } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/generalUIcomp/SectionCard";
import { PriorityBars } from "@/components/generalUIcomp/Chips";
import { EmptyState } from "@/components/generalUIcomp/States";
import { TaskDetailPanel } from "@/components/elements/tasks/TaskDetailPanel";
import { ReassignSubmenu, StatusSubmenu } from "@/components/elements/tasks/TaskMenus";
import { CompleteToggle } from "@/components/elements/tasks/CompleteToggle";
import { differenceInCalendarDays } from "date-fns";
import { dueLabel } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

const tabs = ["Due Today", "Overdue", "Upcoming", "Review"] as const;
type Tab = (typeof tabs)[number];

const inTab = (t: Task, tab: Tab) => {
  const d = differenceInCalendarDays(new Date(t.dueDate), new Date());
  if (tab === "Review") return t.status === "review";
  if (tab === "Overdue") return d < 0 && t.status !== "done";
  if (tab === "Due Today") return d === 0;
  return d > 0;
};

/** The logged-in user's work (§12.6) */
const TodaysWorkSection = ({ tasks: initial }: { tasks: Task[] }) => {
  const [tasks, setTasks] = useState(initial);
  const [tab, setTab] = useState<Tab>("Due Today");
  const [open, setOpen] = useState<Task | null>(null);
  const shown = tasks.filter((t) => inTab(t, tab));

  const update = (next: Task) => {
    setTasks((l) => l.map((t) => (t.id === next.id ? next : t)));
    if (open?.id === next.id) setOpen(next);
  };
  const patch = (t: Task, p: Partial<Task>, msg: string) => {
    update({ ...t, ...p });
    notify.success(msg, { description: t.title, onUndo: () => update(t) });
  };

  return (
    <SectionCard title="Today's Work" icon={ClipboardCheck} link={{ href: "/u/tasks", label: "My tasks" }} className="h-full" bodyClassName="px-0 pb-1 flex flex-col">
      <div role="tablist" aria-label="Filter my tasks" className="flex gap-1 overflow-x-auto scrollbar-none px-4 pb-2">
        {tabs.map((t) => {
          const n = tasks.filter((x) => inTab(x, t)).length;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs transition-colors duration-150",
                tab === t ? "bg-secondary font-medium text-heading ring-1 ring-border" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t} <span className="tabular text-[0.65rem] text-subtle">{n}</span>
            </button>
          );
        })}
      </div>

      <ul className="max-h-80 min-h-40 flex-1 overflow-y-auto scrollbar-thin">
        {shown.length === 0 && (
          <li>
            <EmptyState compact icon={PartyPopper} title="All clear" description={`Nothing ${tab.toLowerCase()} right now.`} />
          </li>
        )}
        <AnimatePresence initial={false}>
          {shown.map((t) => {
            const done = t.status === "done";
            const label = dueLabel(t.dueDate);
            return (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="group/task flex items-center gap-3 border-t border-border/70 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/40"
              >
                <CompleteToggle done={done} label={t.title} onToggle={() => patch(t, { status: done ? "todo" : "done" }, done ? "Task reopened" : "Task completed")} />
                <button onClick={() => setOpen(t)} className="min-w-0 flex-1 text-left">
                  <span className={cn("line-clamp-2 block text-sm leading-snug text-heading transition-colors", done && "text-muted-foreground line-through")}>{t.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.clientName} · {t.projectName}</span>
                </button>
                <PriorityBars priority={t.priority} />
                <span className={cn("tabular w-16 shrink-0 text-right text-xs", label.includes("overdue") ? "font-medium text-danger" : "text-muted-foreground")}>{label}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label={`Actions for ${t.title}`}><Ellipsis /></Button>} />
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => patch(t, { status: done ? "todo" : "done" }, done ? "Task reopened" : "Task completed")}>
                      <Check /> {done ? "Reopen" : "Complete"}
                    </DropdownMenuItem>
                    <StatusSubmenu task={t} onChange={(s) => patch(t, { status: s }, "Status updated")} />
                    <ReassignSubmenu task={t} onChange={(p) => patch(t, { assignee: p }, `Reassigned to ${p.name}`)} />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setOpen(t)}><PanelRightOpen /> Open detail</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <TaskDetailPanel task={open} onOpenChange={(o) => !o && setOpen(null)} onChange={update} />
    </SectionCard>
  );
};

export default TodaysWorkSection;
