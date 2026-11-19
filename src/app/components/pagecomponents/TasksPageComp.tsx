"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardCheck,
  KanbanSquare,
  List,
  Plus,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  SegmentedList,
  SegmentedTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
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
import {
  EmptyState,
  ErrorState,
  NoResults,
} from "@/app/components/generalUIcomp/States";
import { SkeletonRows } from "@/app/components/loaders/Loaders";
import { TaskTable } from "@/app/components/elements/tasks/TaskTable";
import { TaskBoard } from "@/app/components/elements/tasks/TaskBoard";
import { TaskCalendar } from "@/app/components/elements/tasks/TaskCalendar";
import { TaskDetailPanel } from "@/app/components/elements/tasks/TaskDetailPanel";
import { taskStatusMap } from "@/app/components/generalUIcomp/Chips";
import { TASK_STATUSES } from "@/app/components/elements/tasks/TaskMenus";
import { useQuickCreate } from "@/context/quickCreateContext";
import { deadlineBucket } from "@/lib/date";
import type { Person, Task } from "@/types";
import type { DemoState } from "./DashboardPageComp";

type Scope = "mine" | "team" | "all";
type View = "list" | "board" | "calendar";

const uniq = <T,>(items: T[], key: (t: T) => string) =>
  Array.from(new Map(items.map((i) => [key(i), i])).values());

/** Tasks (§16.1): My / Team / All, filters, list · board · calendar */
const TasksPageComp = ({
  tasks: initial,
  me,
  myProjectIds,
  demo,
}: {
  tasks: Task[];
  me: Person;
  myProjectIds: string[];
  demo?: DemoState;
}) => {
  const router = useRouter();
  const { openCreate } = useQuickCreate();
  const [tasks, setTasks] = useState(demo === "empty" ? [] : initial);
  const [scope, setScope] = useState<Scope>("mine");
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [open, setOpen] = useState<Task | null>(null);

  const inScope = (t: Task) =>
    scope === "mine"
      ? t.assignee.id === me.id
      : scope === "team"
        ? myProjectIds.includes(t.projectId) && t.assignee.id !== me.id
        : true;

  const rows = useMemo(
    () =>
      applyFilters(
        tasks.filter(
          (t) =>
            inScope(t) &&
            (!search ||
              `${t.title} ${t.key}`
                .toLowerCase()
                .includes(search.toLowerCase())),
        ),
        filters,
        {
          client: (t) => t.clientName,
          project: (t) => t.projectId,
          assignee: (t) => t.assignee.id,
          status: (t) => t.status,
          priority: (t) => t.priority,
          due: (t) => deadlineBucket(t.dueDate),
        },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, scope, search, filters],
  );

  // Merge edits from a filtered view back into the full list
  const merge = (next: Task[]) => {
    const byId = new Map(next.map((t) => [t.id, t]));
    setTasks((all) => all.map((t) => byId.get(t.id) ?? t));
  };

  const counts: Record<Scope, number> = {
    mine: tasks.filter((t) => t.assignee.id === me.id).length,
    team: tasks.filter(
      (t) => myProjectIds.includes(t.projectId) && t.assignee.id !== me.id,
    ).length,
    all: tasks.length,
  };

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
            onRetry={() => router.replace("/u/tasks")}
            reference="ERR-TSK-500"
          />
        </div>
      );
    if (tasks.length === 0)
      return (
        <div className="surface rounded-lg">
          <EmptyState
            icon={ClipboardCheck}
            title="No tasks yet"
            description="Create tasks inside projects, or add one here and assign it to a teammate."
            action={
              <Button onClick={() => openCreate("task")}>
                <Plus /> New task
              </Button>
            }
          />
        </div>
      );
    if (rows.length === 0) {
      return search || Object.values(filters).some((v) => v.length) ? (
        <div className="surface rounded-lg">
          <NoResults
            query={search}
            onClear={() => {
              setSearch("");
              setFilters({});
            }}
          />
        </div>
      ) : (
        <div className="surface rounded-lg">
          <EmptyState
            icon={ClipboardCheck}
            title={
              scope === "mine" ? "Nothing assigned to you" : "No tasks here"
            }
            description={
              scope === "mine"
                ? "Tasks assigned to you will appear here."
                : "Tasks on projects you're part of will appear here."
            }
          />
        </div>
      );
    }
    if (view === "board")
      return <TaskBoard key={scope} tasks={rows} onTasksChange={merge} />;
    if (view === "calendar")
      return <TaskCalendar tasks={rows} onOpen={setOpen} />;
    return (
      <TaskTable
        key={`${scope}-${rows.length}`}
        tasks={rows}
        onTasksChange={merge}
      />
    );
  };

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Tasks"
        titleAddon={<CountBadge>{counts[scope]}</CountBadge>}
        description="Everything that needs doing, across every client and project."
        actions={
          <Button onClick={() => openCreate("task")}>
            <Plus /> New task
          </Button>
        }
      />

      <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
        <TabsList>
          <TabsTrigger value="mine">
            My Tasks{" "}
            <span className="tabular text-xs text-subtle">{counts.mine}</span>
          </TabsTrigger>
          <TabsTrigger value="team">
            Team Tasks{" "}
            <span className="tabular text-xs text-subtle">{counts.team}</span>
          </TabsTrigger>
          <TabsTrigger value="all">
            All Tasks{" "}
            <span className="tabular text-xs text-subtle">{counts.all}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tasks.length > 0 && (
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search tasks or keys…"
          values={filters}
          onValuesChange={setFilters}
          filters={[
            {
              id: "client",
              label: "Client",
              options: uniq(tasks, (t) => t.clientName).map((t) => ({
                value: t.clientName,
                label: t.clientName,
              })),
            },
            {
              id: "project",
              label: "Project",
              options: uniq(tasks, (t) => t.projectId).map((t) => ({
                value: t.projectId,
                label: t.projectName,
              })),
            },
            {
              id: "assignee",
              label: "Assignee",
              options: uniq(tasks, (t) => t.assignee.id).map((t) => ({
                value: t.assignee.id,
                label: t.assignee.name,
              })),
            },
            {
              id: "status",
              label: "Status",
              options: TASK_STATUSES.map((s) => ({
                value: s,
                label: taskStatusMap[s].label,
              })),
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
              id: "due",
              label: "Due date",
              options: [
                { value: "overdue", label: "Overdue" },
                { value: "soon", label: "Next 14 days" },
                { value: "later", label: "Later" },
              ],
            },
          ]}
          right={
            <Tabs value={view} onValueChange={(v) => setView(v as View)}>
              <SegmentedList aria-label="View">
                <SegmentedTrigger value="list">
                  <List /> List
                </SegmentedTrigger>
                <SegmentedTrigger value="board">
                  <KanbanSquare /> Board
                </SegmentedTrigger>
                <SegmentedTrigger value="calendar">
                  <CalendarDays /> Calendar
                </SegmentedTrigger>
              </SegmentedList>
            </Tabs>
          }
        />
      )}

      {content()}

      <TaskDetailPanel
        task={open}
        onOpenChange={(o) => !o && setOpen(null)}
        onChange={(t) => {
          merge([t]);
          setOpen(t);
        }}
      />
    </PageContainer>
  );
};

export default TasksPageComp;
