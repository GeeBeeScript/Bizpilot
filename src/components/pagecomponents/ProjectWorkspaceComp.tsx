"use client";

import { useState } from "react";
import {
  Activity,
  BrainCircuit,
  CalendarClock,
  ClipboardList,
  Diamond,
  CalendarCheck,
  ShieldCheck,
  Eye,
  FileText,
  Flag,
  GanttChart,
  KanbanSquare,
  LayoutDashboard,
  OctagonX,
  Upload,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/generalUIcomp/States";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/generalUIcomp/PageHeader";
import { SectionCard } from "@/components/generalUIcomp/SectionCard";
import { ActivityFeed } from "@/components/generalUIcomp/ActivityFeed";
import { Chip, taskStatusMap } from "@/components/generalUIcomp/Chips";
import { UsageMeter } from "@/components/generalUIcomp/ProgressBar";
import { UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { ProjectHeader } from "@/components/elements/projects/ProjectHeader";
import { ProjectTimeline } from "@/components/elements/projects/ProjectTimeline";
import { ProjectTeam } from "@/components/elements/projects/ProjectTeam";
import { ClientVisiblePreview } from "@/components/elements/projects/ClientVisiblePreview";
import { TaskBoard } from "@/components/elements/tasks/TaskBoard";
import { TaskTable } from "@/components/elements/tasks/TaskTable";
import { TASK_STATUSES } from "@/components/elements/tasks/TaskMenus";
import { DocumentTable } from "@/components/elements/documents/DocumentTable";
import { ScopedAIChat } from "@/components/elements/ai/ScopedAIChat";
import { AIGeneratedLabel } from "@/components/elements/ai/AIMark";
import { AIQuickActions } from "@/components/elements/ai/AIQuickActions";
import { PageCrumbs } from "@/context/breadcrumbContext";
import { useQuickCreate } from "@/context/quickCreateContext";
import { useTabParam } from "@/lib/useTabParam";
import { dueLabel, formatLongDate, isOverdue } from "@/lib/date";
import { projectSuggestions } from "@/lib/mock/ai";
import { cn } from "@/lib/utils";
import type { ActivityItem, Client, DocumentItem, Milestone, Project, Task } from "@/types";

export type ProjectWorkspaceData = {
  project: Project;
  client?: Client;
  tasks: Task[];
  documents: DocumentItem[];
  activity: ActivityItem[];
};

const TABS = ["overview", "board", "tasks", "timeline", "documents", "team", "client", "activity", "ai"] as const;
type Tab = (typeof TABS)[number];

const msMeta: Record<Milestone["status"], { label: string; tone: "success" | "neutral" | "danger" | "ai" }> = {
  done: { label: "Approved", tone: "success" },
  upcoming: { label: "Upcoming", tone: "neutral" },
  late: { label: "Late", tone: "danger" },
  "awaiting-approval": { label: "Awaiting client approval", tone: "ai" },
};

const MilestoneList = ({ milestones }: { milestones: Milestone[] }) => (
  <ol className="relative space-y-3 pl-5">
    <span className="absolute top-1 bottom-1 left-[0.4rem] w-px bg-border" aria-hidden />
    {milestones.map((m) => (
      <li key={m.id} className="relative flex flex-wrap items-center gap-x-3 gap-y-1">
        <Diamond className={cn("absolute top-1 -left-5 size-3.5 bg-card", m.status === "done" ? "fill-success text-success" : m.status === "late" ? "fill-danger text-danger" : "fill-ai text-ai")} aria-hidden />
        <span className="flex-1 text-sm text-heading">{m.name}</span>
        <span className="tabular text-xs text-muted-foreground">{formatLongDate(m.date)}</span>
        <Chip tone={msMeta[m.status].tone}>{msMeta[m.status].label}</Chip>
      </li>
    ))}
  </ol>
);

/** Project workspace (§15.5) */
const ProjectWorkspaceComp = ({ data, initialTab }: { data: ProjectWorkspaceData; initialTab?: string }) => {
  const { project: p, client, documents, activity } = data;
  const { openCreate } = useQuickCreate();
  const [tasks, setTasks] = useState(data.tasks);
  const [tab, setTab] = useTabParam<Tab>(TABS.includes(initialTab as Tab) ? (initialTab as Tab) : "overview");

  const blocked = tasks.filter((t) => t.status === "blocked");
  const upcoming = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
    .slice(0, 5);

  return (
    <PageContainer className="space-y-6">
      <PageCrumbs
        items={[
          { label: "Clients", href: "/u/clients" },
          { label: p.clientName, href: `/u/clients/${p.clientId}` },
          { label: "Projects", href: "/u/projects" },
          { label: p.name },
        ]}
      />
      <ProjectHeader
        project={p}
        client={client}
        onAddTask={() => openCreate("task", { projectId: p.id })}
        onUpload={() => openCreate("document", { projectId: p.id })}
        onInvite={() => setTab("team")}
        onAskAI={() => setTab("ai")}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="sticky top-(--topbar-h) z-10 -mx-4 bg-background/80 px-4 backdrop-blur-md md:-mx-7 md:px-7">
          <TabsTrigger value="overview"><LayoutDashboard /> Overview</TabsTrigger>
          <TabsTrigger value="board"><KanbanSquare /> Board</TabsTrigger>
          <TabsTrigger value="tasks"><ClipboardList /> Tasks <span className="tabular text-xs text-subtle">{tasks.length}</span></TabsTrigger>
          <TabsTrigger value="timeline"><GanttChart /> Timeline</TabsTrigger>
          <TabsTrigger value="documents"><FileText /> Documents <span className="tabular text-xs text-subtle">{documents.length}</span></TabsTrigger>
          <TabsTrigger value="team"><UsersRound /> Team</TabsTrigger>
          <TabsTrigger value="client"><Eye /> Client view</TabsTrigger>
          <TabsTrigger value="activity"><Activity /> Activity</TabsTrigger>
          <TabsTrigger value="ai"><BrainCircuit className="text-ai" /> AI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <SectionCard variant="ai" title="AI project summary" icon={BrainCircuit} actions={<Button variant="ghost" size="sm" className="text-xs" onClick={() => setTab("ai")}>Ask a follow-up</Button>}>
                <AIGeneratedLabel className="mb-1" />
                <p className="text-[0.9rem] leading-relaxed">
                  {p.name} is {p.progress}% complete with {p.openTasks} open tasks and {formatLongDate(p.deadline)} as the deadline.{" "}
                  {p.blocker ? <>The main risk is <span className="font-medium text-danger">{p.blocker}</span>, which blocks {blocked.length} task{blocked.length === 1 ? "" : "s"}.</> : "No blockers are currently reported."}
                </p>
              </SectionCard>

              <div className="grid gap-4 md:grid-cols-2">
                <SectionCard title="Progress & health" icon={Flag}>
                  <div className="space-y-3">
                    <UsageMeter label="Budget used" used={p.spent} limit={p.budget} />
                    <div className="flex flex-wrap gap-1.5">
                      {TASK_STATUSES.map((s) => {
                        const n = tasks.filter((t) => t.status === s).length;
                        const m = taskStatusMap[s];
                        return <Chip key={s} tone={m.tone} icon={m.icon}>{m.label} <span className="tabular opacity-70">{n}</span></Chip>;
                      })}
                    </div>
                  </div>
                </SectionCard>
                <SectionCard title="Current blockers" icon={OctagonX}>
                  {blocked.length ? (
                    <ul className="space-y-2">
                      {blocked.map((t) => (
                        <li key={t.id} className="rounded-md bg-danger/5 px-3 py-2 ring-1 ring-danger/15">
                          <p className="text-sm font-medium text-heading">{t.title}</p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><UserAvatar person={t.assignee} className="size-4" /> {t.assignee.name} · <span className="text-danger">{dueLabel(t.dueDate)}</span></p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState compact icon={ShieldCheck} title="No blockers" description="Blocked tasks and external dependencies will be flagged here." />
                  )}
                </SectionCard>
              </div>

              <SectionCard title="Milestones" icon={Diamond}>
                {p.milestones.length ? (
                  <MilestoneList milestones={p.milestones} />
                ) : (
                  <EmptyState compact icon={Diamond} title="No milestones yet" description="Add milestones to track key deliverables and client approvals." />
                )}
              </SectionCard>

              <AIQuickActions
                scope={{ kind: "project", label: p.name }}
                actions={[
                  { id: "risk", label: "Which tasks threaten the deadline?", icon: CalendarClock, result: [{ type: "found", items: ["BP-101 is blocked and 1 day overdue", "SSO login flow QA and Policy API contract tests depend on BP-101"] }, { type: "recommended", items: ["Unblock QA with a mocked auth service this week"] }] },
                  { id: "update", label: "Draft client status update", icon: FileText, result: [{ type: "paragraph", text: `Hi John — ${p.name} is ${p.progress}% complete. The claims flow beta is ready for your sign-off; API integration is waiting on credentials from your IT team.` }] },
                ]}
              />
            </div>

            <div className="space-y-4 xl:col-span-4">
              <SectionCard title="Upcoming deadlines" icon={CalendarClock} bodyClassName="px-2 pb-2">
                {upcoming.length === 0 && <EmptyState compact icon={CalendarCheck} title="Nothing due soon" description="Open tasks with due dates will be listed here." />}
                <ul>
                  {upcoming.map((t) => (
                    <li key={t.id} className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-muted/40">
                      <UserAvatar person={t.assignee} />
                      <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                      <span className={cn("tabular text-xs", isOverdue(t.dueDate) ? "font-medium text-danger" : "text-muted-foreground")}>{dueLabel(t.dueDate)}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
              <SectionCard title="Recent activity" icon={Activity} bodyClassName="px-2 pb-2">
                <ActivityFeed items={activity.slice(0, 5)} emptyDescription="Task updates, uploads and approvals on this project will appear here." />
              </SectionCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="board">
          <TaskBoard tasks={tasks} onTasksChange={setTasks} projectId={p.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskTable tasks={tasks} onTasksChange={setTasks} hideProject />
        </TabsContent>

        <TabsContent value="timeline">
          {tasks.length ? (
            <ProjectTimeline tasks={tasks} milestones={p.milestones} start={p.startDate} end={p.deadline} onTasksChange={setTasks} />
          ) : (
            <div className="surface rounded-lg">
              <EmptyState icon={GanttChart} title="Nothing to schedule yet" description="Add tasks with start and due dates to see them on the timeline." action={<Button size="sm" onClick={() => openCreate("task", { projectId: p.id })}>Add task</Button>} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={() => openCreate("document", { projectId: p.id })}><Upload /> Upload document</Button>
          </div>
          <DocumentTable documents={documents} hideContext onUpload={() => openCreate("document", { projectId: p.id })} />
        </TabsContent>

        <TabsContent value="team">
          <ProjectTeam team={p.team} manager={p.manager} collaborators={p.collaborators} onInviteMember={() => openCreate("invite")} onInviteClient={() => openCreate("invite")} />
        </TabsContent>

        <TabsContent value="client">
          <ClientVisiblePreview project={p} documents={documents} viewer={p.collaborators[0]} />
        </TabsContent>

        <TabsContent value="activity">
          <div className="surface rounded-lg p-2">
            <ActivityFeed items={activity} variant="timeline" />
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <ScopedAIChat scope={{ kind: "project", label: `${p.clientName} / ${p.name}` }} suggestions={projectSuggestions} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default ProjectWorkspaceComp;
