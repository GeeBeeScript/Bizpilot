"use client";

import Link from "next/link";
import { Ellipsis, FolderOpen, SquareArrowOutUpRight } from "lucide-react";
import { Button, buttonVariants } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  DataTable,
  type Column,
} from "@/app/components/generalUIcomp/DataTable";
import {
  HealthChip,
  ProjectStatusChip,
} from "@/app/components/generalUIcomp/Chips";
import { ProgressBar } from "@/app/components/generalUIcomp/ProgressBar";
import { PersonLabel } from "@/app/components/generalUIcomp/UserAvatar";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import { useQuickCreate } from "@/context/quickCreateContext";
import { dueLabel, formatShortDate, isOverdue } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

/** Project list rows (§15.2) */
export const ProjectTable = ({
  projects,
  hideClient,
  empty,
  selected,
  onSelectedChange,
}: {
  projects: Project[];
  hideClient?: boolean;
  empty?: React.ReactNode;
  selected?: Set<string>;
  onSelectedChange?: (s: Set<string>) => void;
}) => {
  const { openCreate } = useQuickCreate();
  const columns: Column<Project>[] = [
    {
      id: "project",
      header: "Project",
      sortValue: (p) => p.name,
      cell: (p) => (
        <Link
          href={`/u/projects/${p.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block min-w-48"
        >
          <span className="block font-medium text-heading hover:text-primary">
            {p.name}
          </span>
          {p.blocker ? (
            <span className="block max-w-64 truncate text-xs text-danger">
              {p.blocker}
            </span>
          ) : (
            <span className="block text-xs text-muted-foreground">
              {p.openTasks} open tasks
            </span>
          )}
        </Link>
      ),
    },
    ...(hideClient
      ? []
      : [
          {
            id: "client",
            header: "Client",
            sortValue: (p: Project) => p.clientName,
            hideBelow: "md" as const,
            cell: (p: Project) => (
              <Link
                href={`/u/clients/${p.clientId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm hover:text-primary hover:underline"
              >
                {p.clientName}
              </Link>
            ),
          },
        ]),
    {
      id: "manager",
      header: "Manager",
      hideBelow: "xl",
      sortValue: (p) => p.manager.name,
      cell: (p) => <PersonLabel person={p.manager} />,
    },
    {
      id: "progress",
      header: "Progress",
      sortValue: (p) => p.progress,
      cell: (p) => (
        <ProgressBar
          value={p.progress}
          health={p.health}
          className="w-32"
          label={`${p.name} progress`}
        />
      ),
    },
    {
      id: "deadline",
      header: "Deadline",
      sortValue: (p) => new Date(p.deadline).getTime(),
      cell: (p) => {
        const late = isOverdue(p.deadline) && p.status !== "completed";
        return (
          <span
            className={cn(
              "tabular text-xs",
              late ? "font-medium text-danger" : "text-foreground",
            )}
          >
            {late ? dueLabel(p.deadline) : formatShortDate(p.deadline)}
          </span>
        );
      },
    },
    {
      id: "health",
      header: "Health",
      sortValue: (p) => p.health,
      cell: (p) => <HealthChip health={p.health} />,
    },
    {
      id: "status",
      header: "Status",
      hideBelow: "lg",
      sortValue: (p) => p.status,
      cell: (p) => <ProjectStatusChip status={p.status} />,
    },
    {
      id: "open",
      header: "Open tasks",
      align: "right",
      hideBelow: "lg",
      sortValue: (p) => p.openTasks,
      cell: (p) => <span className="tabular">{p.openTasks}</span>,
    },
  ];

  return (
    <DataTable
      ariaLabel="Projects"
      rows={projects}
      columns={columns}
      getRowId={(p) => p.id}
      rowHref={(p) => `/u/projects/${p.id}`}
      selectable={!!onSelectedChange}
      selected={selected}
      onSelectedChange={onSelectedChange}
      empty={
        empty ?? (
          <div className="surface rounded-lg">
            <EmptyState
              compact
              icon={FolderOpen}
              title="No projects"
              description="Projects for this client will appear here."
            />
          </div>
        )
      }
      rowActions={(p) => (
        <>
          <Link
            href={`/u/projects/${p.id}`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label={`Open ${p.name}`}
          >
            <SquareArrowOutUpRight />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="More">
                  <Ellipsis />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => openCreate("task", { projectId: p.id })}
              >
                Add task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openCreate("document", { projectId: p.id })}
              >
                Upload document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
      mobileItem={(p) => (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-heading">{p.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {p.clientName} · due {formatShortDate(p.deadline)}
              </p>
            </div>
            <HealthChip health={p.health} />
          </div>
          <ProgressBar value={p.progress} health={p.health} />
        </div>
      )}
    />
  );
};
