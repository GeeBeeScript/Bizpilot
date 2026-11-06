"use client";

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRightLeft, Check, UserRoundCog } from "lucide-react";
import { taskStatusMap } from "@/components/generalUIcomp/Chips";
import { UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { people } from "@/lib/mock/people";
import type { Person, Task, TaskStatus } from "@/types";

export const TASK_STATUSES: TaskStatus[] = ["backlog", "todo", "in-progress", "review", "blocked", "done"];
export const internalPeople = Object.values(people).filter((p) => !p.external);

/** "Change status" submenu, shared by task rows, cards and the detail panel */
export const StatusSubmenu = ({ task, onChange, label = "Change status" }: { task: Task; onChange: (s: TaskStatus) => void; label?: string }) => (
  <DropdownMenuSub>
    <DropdownMenuSubTrigger>
      <ArrowRightLeft /> {label}
    </DropdownMenuSubTrigger>
    <DropdownMenuSubContent className="min-w-40">
      {TASK_STATUSES.map((s) => {
        const meta = taskStatusMap[s];
        const Icon = meta.icon;
        return (
          <DropdownMenuItem key={s} onClick={() => onChange(s)} disabled={task.status === s}>
            <Icon /> {meta.label}
            {task.status === s && <Check className="ml-auto" />}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuSubContent>
  </DropdownMenuSub>
);

export const ReassignSubmenu = ({ task, onChange }: { task: Task; onChange: (p: Person) => void }) => (
  <DropdownMenuSub>
    <DropdownMenuSubTrigger>
      <UserRoundCog /> Reassign
    </DropdownMenuSubTrigger>
    <DropdownMenuSubContent className="min-w-48">
      {internalPeople.map((p) => (
        <DropdownMenuItem key={p.id} onClick={() => onChange(p)} disabled={task.assignee.id === p.id}>
          <UserAvatar person={p} className="size-5" /> {p.name}
          {task.assignee.id === p.id && <Check className="ml-auto" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuSubContent>
  </DropdownMenuSub>
);
