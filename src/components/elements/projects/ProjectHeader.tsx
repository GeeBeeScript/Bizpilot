"use client";

import Link from "next/link";
import { Brain, CalendarClock, ClipboardPlus, Ellipsis, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HealthChip, ProjectStatusChip, PriorityChip } from "@/components/generalUIcomp/Chips";
import { ProgressBar } from "@/components/generalUIcomp/ProgressBar";
import { ClientLogo } from "@/components/generalUIcomp/ClientLogo";
import { AvatarStack } from "@/components/generalUIcomp/UserAvatar";
import { dueLabel, formatLongDate, isOverdue } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { Client, Project } from "@/types";

type Props = {
  project: Project;
  client?: Client;
  onAddTask: () => void;
  onUpload: () => void;
  onInvite: () => void;
  onAskAI: () => void;
};

/** Project detail header (§15.5) */
export const ProjectHeader = ({ project: p, client, onAddTask, onUpload, onInvite, onAskAI }: Props) => {
  const late = isOverdue(p.deadline) && p.status !== "completed";
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <Link href={`/u/clients/${p.clientId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            {client && <ClientLogo client={client} size="sm" />} {p.clientName}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-heading md:text-[1.45rem]">{p.name}</h1>
            <ProjectStatusChip status={p.status} />
            <HealthChip health={p.health} />
            <PriorityChip priority={p.priority} />
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">{p.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onUpload}><Upload /> Upload</Button>
          <Button variant="outline" onClick={onInvite}><UserPlus /> Invite client</Button>
          <Button variant="outline" onClick={onAskAI} className="border-ai/40 hover:bg-ai/10"><Brain className="text-ai" /> Ask AI</Button>
          <Button onClick={onAddTask}><ClipboardPlus /> Add task</Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More project actions"><Ellipsis /></Button>} />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => notify.info("Edit project")}>Edit project</DropdownMenuItem>
              <DropdownMenuItem onClick={() => notify.success("Project duplicated")}>Duplicate as template</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => notify.warning("Archiving requires confirmation")}>Archive project…</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key facts strip */}
      <div className="glass grid gap-4 rounded-lg px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <p className="text-[0.7rem] font-medium text-muted-foreground">Progress</p>
          <ProgressBar value={p.progress} health={p.health} size="md" label="Project progress" />
        </div>
        <div>
          <p className="text-[0.7rem] font-medium text-muted-foreground">Deadline</p>
          <p className={cn("tabular flex items-center gap-1.5 text-sm font-semibold", late ? "text-danger" : "text-heading")}>
            <CalendarClock className="size-3.5" aria-hidden /> {formatLongDate(p.deadline)} <span className="font-normal text-muted-foreground">· {dueLabel(p.deadline)}</span>
          </p>
        </div>
        <div>
          <p className="text-[0.7rem] font-medium text-muted-foreground">Budget</p>
          <p className="tabular text-sm font-semibold text-heading">
            ${p.spent.toLocaleString()} <span className="font-normal text-muted-foreground">of ${p.budget.toLocaleString()} ({Math.round((p.spent / p.budget) * 100)}%)</span>
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[0.7rem] font-medium text-muted-foreground">Team</p>
            <p className="text-sm text-heading">{p.manager.name} <span className="text-muted-foreground">· PM</span></p>
          </div>
          <AvatarStack people={[...p.team, ...p.collaborators]} max={4} />
        </div>
      </div>
    </div>
  );
};
