"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CircleCheck,
  CircleDashed,
  CircleDot,
  FolderOpen,
  KanbanSquare,
  List,
  PauseCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  SegmentedList,
  SegmentedTrigger,
  Tabs,
} from "@/app/components/ui/tabs";
import {
  CountBadge,
  PageContainer,
  PageHeader,
} from "@/app/components/generalUIcomp/PageHeader";
import {
  FilterToolbar,
  applyFilters,
  type FilterValues,
} from "@/app/components/generalUIcomp/FilterToolbar";
import { HealthChip } from "@/app/components/generalUIcomp/Chips";
import { ProgressBar } from "@/app/components/generalUIcomp/ProgressBar";
import { AvatarStack } from "@/app/components/generalUIcomp/UserAvatar";
import {
  EmptyState,
  ErrorState,
  NoResults,
} from "@/app/components/generalUIcomp/States";
import { SkeletonRows } from "@/app/components/loaders/Loaders";
import { ProjectTable } from "@/app/components/elements/projects/ProjectTable";
import {
  KanbanBoard,
  type BoardColumn,
} from "@/app/components/elements/board/KanbanBoard";
import { useQuickCreate } from "@/context/quickCreateContext";
import { deadlineBucket, dueLabel, isOverdue } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types";
import type { DemoState } from "./DashboardPageComp";

const boardColumns: BoardColumn[] = [
  {
    id: "planning",
    label: "Planning",
    icon: CircleDashed,
    accent: "var(--subtle)",
  },
  { id: "active", label: "Active", icon: CircleDot, accent: "var(--info)" },
  {
    id: "on-hold",
    label: "On hold",
    icon: PauseCircle,
    accent: "var(--warning)",
  },
  {
    id: "completed",
    label: "Completed",
    icon: CircleCheck,
    accent: "var(--success)",
  },
];

const ProjectCard = ({
  p,
  overlay,
  justDropped,
}: {
  p: Project;
  overlay?: boolean;
  justDropped?: boolean;
}) => (
  <article
    className={cn(
      "surface elev-1 rounded-lg p-3 transition-all duration-150",
      overlay ? "elev-4 ring-2 ring-primary/40" : "hover:lift",
      justDropped && "ring-2 ring-success/60",
    )}
  >
    <p className="text-[0.7rem] text-muted-foreground">{p.clientName}</p>
    <Link
      href={`/u/projects/${p.id}`}
      className="block text-sm font-semibold text-heading hover:text-primary"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {p.name}
    </Link>
    <ProgressBar
      value={p.progress}
      health={p.health}
      className="mt-2.5"
      label={`${p.name} progress`}
    />
    <div className="mt-2.5 flex items-center gap-2">
      <HealthChip health={p.health} />
      <span
        className={cn(
          "flex items-center gap-1 text-[0.7rem]",
          isOverdue(p.deadline) && p.status !== "completed"
            ? "text-danger"
            : "text-muted-foreground",
        )}
      >
        <CalendarDays className="size-3" /> {dueLabel(p.deadline)}
      </span>
      <span className="ml-auto">
        <AvatarStack people={p.team} max={2} />
      </span>
    </div>
  </article>
);

/** Projects list (§15.1–15.3) */
const ProjectsPageComp = ({
  projects: initial,
  demo,
}: {
  projects: Project[];
  demo?: DemoState | "empty";
}) => {
  const { openCreate } = useQuickCreate();
  const router = useRouter();
  const [projects, setProjects] = useState(demo === "empty" ? [] : initial);
  const [view, setView] = useState<"list" | "board">("list");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});

  const clientsOpts = Array.from(
    new Map(initial.map((p) => [p.clientId, p.clientName])).entries(),
  ).map(([value, label]) => ({ value, label }));
  const managerOpts = Array.from(
    new Map(initial.map((p) => [p.manager.id, p.manager.name])).entries(),
  ).map(([value, label]) => ({ value, label }));

  const rows = useMemo(
    () =>
      applyFilters(
        projects.filter(
          (p) =>
            !search ||
            `${p.name} ${p.clientName}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        ),
        filters,
        {
          client: (p) => p.clientId,
          manager: (p) => p.manager.id,
          status: (p) => p.status,
          health: (p) => p.health,
          priority: (p) => p.priority,
          deadline: (p) => deadlineBucket(p.deadline),
        },
      ),
    [projects, search, filters],
  );

  const content = () => {
    if (demo === "loading")
      return (
        <div className="surface rounded-lg">
          <SkeletonRows rows={8} />
        </div>
      );
    if (demo === "error")
      return (
        <div className="surface rounded-lg">
          <ErrorState
            onRetry={() => router.replace("/u/projects")}
            reference="ERR-PRJ-500"
          />
        </div>
      );
    if (projects.length === 0)
      return (
        <div className="surface rounded-lg">
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Create a project for a client to start planning work, tasks and milestones."
            action={
              <Button onClick={() => openCreate("project")}>
                <Plus /> New project
              </Button>
            }
          />
        </div>
      );
    if (rows.length === 0)
      return (
        <div className="surface rounded-lg">
          <NoResults
            query={search}
            onClear={() => {
              setSearch("");
              setFilters({});
            }}
          />
        </div>
      );
    if (view === "board")
      return (
        <div className="dot-grid -mx-4 px-4 py-3 md:-mx-7 md:px-7">
          <KanbanBoard
            columns={boardColumns}
            items={rows}
            getId={(p) => p.id}
            getColumn={(p) => p.status}
            setColumn={(p, c) => ({ ...p, status: c as ProjectStatus })}
            itemLabel={(p) => p.name}
            onItemsChange={(next) => {
              const ids = new Set(next.map((p) => p.id));
              setProjects([...next, ...projects.filter((p) => !ids.has(p.id))]);
            }}
            invalidReason={(p, col) =>
              col === "completed" && p.progress < 100
                ? "Finish remaining work first"
                : null
            }
            renderCard={(p, s) => (
              <ProjectCard
                p={p}
                overlay={s.overlay}
                justDropped={s.justDropped}
              />
            )}
          />
        </div>
      );
    return <ProjectTable projects={rows} />;
  };

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Projects"
        titleAddon={<CountBadge>{projects.length}</CountBadge>}
        description="All client engagements and internal work, by health and deadline."
        actions={
          <Button onClick={() => openCreate("project")}>
            <Plus /> New project
          </Button>
        }
      />
      {projects.length > 0 && (
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search projects…"
          values={filters}
          onValuesChange={setFilters}
          filters={[
            { id: "client", label: "Client", options: clientsOpts },
            { id: "manager", label: "Manager", options: managerOpts },
            {
              id: "status",
              label: "Status",
              options: boardColumns.map((c) => ({
                value: c.id,
                label: c.label,
              })),
            },
            {
              id: "health",
              label: "Health",
              options: [
                { value: "on-track", label: "On track" },
                { value: "at-risk", label: "At risk" },
                { value: "off-track", label: "Off track" },
              ],
            },
            {
              id: "priority",
              label: "Priority",
              options: ["urgent", "high", "medium", "low"].map((v) => ({
                value: v,
                label: v[0].toUpperCase() + v.slice(1),
              })),
            },
            {
              id: "deadline",
              label: "Deadline",
              options: [
                { value: "overdue", label: "Overdue" },
                { value: "soon", label: "Next 14 days" },
                { value: "later", label: "Later" },
              ],
            },
          ]}
          right={
            <Tabs
              value={view}
              onValueChange={(v) => setView(v as "list" | "board")}
            >
              <SegmentedList aria-label="View">
                <SegmentedTrigger value="list">
                  <List /> List
                </SegmentedTrigger>
                <SegmentedTrigger value="board">
                  <KanbanSquare /> Board
                </SegmentedTrigger>
              </SegmentedList>
            </Tabs>
          }
        />
      )}
      {content()}
    </PageContainer>
  );
};

export default ProjectsPageComp;
