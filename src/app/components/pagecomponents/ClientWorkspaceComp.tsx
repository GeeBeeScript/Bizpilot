"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  BrainCircuit,
  CalendarClock,
  CircleAlert,
  CircleCheckBig,
  FileUp,
  ClipboardCheck,
  FileStack,
  FolderCheck,
  FolderOpen,
  Handshake,
  Hourglass,
  Lock,
  Plus,
  Upload,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { PageContainer } from "@/app/components/generalUIcomp/PageHeader";
import { MetricCard } from "@/app/components/generalUIcomp/MetricCard";
import { SectionCard } from "@/app/components/generalUIcomp/SectionCard";
import { ActivityFeed } from "@/app/components/generalUIcomp/ActivityFeed";
import { Chip } from "@/app/components/generalUIcomp/Chips";
import { ClientHeader } from "@/app/components/elements/clients/ClientHeader";
import { ContactsList } from "@/app/components/elements/clients/ContactsList";
import { InternalNotes } from "@/app/components/elements/clients/InternalNotes";
import { ClientFormDrawer } from "@/app/components/elements/create/ClientFormDrawer";
import { ProjectHealthRow } from "@/app/components/elements/dashboard/ProjectHealthSection";
import { DeadlineList } from "@/app/components/elements/dashboard/UpcomingDeadlines";
import { DocumentRow } from "@/app/components/elements/documents/DocumentRow";
import { DocumentTable } from "@/app/components/elements/documents/DocumentTable";
import { ProjectTable } from "@/app/components/elements/projects/ProjectTable";
import { TaskTable } from "@/app/components/elements/tasks/TaskTable";
import { ScopedAIChat } from "@/app/components/elements/ai/ScopedAIChat";
import { AIGeneratedLabel } from "@/app/components/elements/ai/AIMark";
import { PageCrumbs } from "@/context/breadcrumbContext";
import { useQuickCreate } from "@/context/quickCreateContext";
import { useTabParam } from "@/lib/useTabParam";
import { formatLongDate } from "@/lib/date";
import { notify } from "@/lib/notify";
import { clientSuggestions } from "@/lib/mock/ai";
import type {
  ActivityItem,
  AttentionItem,
  Client,
  Deadline,
  DocumentItem,
  Project,
  Task,
} from "@/types";

export type ClientWorkspaceData = {
  client: Client;
  projects: Project[];
  tasks: Task[];
  documents: DocumentItem[];
  activity: ActivityItem[];
  issues: AttentionItem[];
  deadlines: Deadline[];
};

const TABS = [
  "overview",
  "projects",
  "contacts",
  "tasks",
  "documents",
  "activity",
  "notes",
  "ai",
] as const;
type Tab = (typeof TABS)[number];

/** Client workspace (§14.3) — makes Client → Projects → Tasks → Documents → Activity → AI obvious */
const ClientWorkspaceComp = ({
  data,
  initialTab,
}: {
  data: ClientWorkspaceData;
  initialTab?: string;
}) => {
  const {
    client: c,
    projects,
    tasks,
    documents,
    activity,
    issues,
    deadlines,
  } = data;
  const { openCreate } = useQuickCreate();
  const [tab, setTab] = useTabParam<Tab>(
    TABS.includes(initialTab as Tab) ? (initialTab as Tab) : "overview",
  );
  const [editing, setEditing] = useState(false);

  const active = projects.filter((p) => p.status !== "completed");

  return (
    <PageContainer className="space-y-6">
      <PageCrumbs
        items={[{ label: "Clients", href: "/u/clients" }, { label: c.name }]}
      />
      <ClientHeader
        client={c}
        onEdit={() => setEditing(true)}
        onNewProject={() => openCreate("project", { clientId: c.id })}
        onInvite={() => setTab("contacts")}
        onAskAI={() => setTab("ai")}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Active projects"
          value={String(c.activeProjects)}
          icon={FolderOpen}
          tone="info"
        />
        <MetricCard
          label="Completed projects"
          value={String(c.completedProjects)}
          icon={FolderCheck}
          tone="success"
        />
        <MetricCard
          label="Open tasks"
          value={String(c.openTasks)}
          icon={ClipboardCheck}
          tone="warning"
        />
        <MetricCard
          label="Pending approvals"
          value={String(c.pendingApprovals)}
          icon={Hourglass}
          tone="ai"
          delta={c.pendingApprovals ? "Waiting on client" : undefined}
          sentiment="negative"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">
            Projects{" "}
            <span className="tabular text-xs text-subtle">
              {projects.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts{" "}
            <span className="tabular text-xs text-subtle">
              {c.contacts.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks{" "}
            <span className="tabular text-xs text-subtle">{tasks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents{" "}
            <span className="tabular text-xs text-subtle">
              {documents.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">
            <Lock className="text-warning" /> Notes
          </TabsTrigger>
          <TabsTrigger value="ai">
            <BrainCircuit className="text-ai" /> AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <SectionCard
                variant="ai"
                title="Relationship summary"
                icon={Handshake}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setTab("ai")}
                  >
                    Ask a follow-up
                  </Button>
                }
              >
                <AIGeneratedLabel className="mb-1" />
                <p className="text-[0.9rem] leading-relaxed">{c.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <Chip key={t} tone="sapphire">
                      {t}
                    </Chip>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Active engagements"
                icon={FolderOpen}
                bodyClassName="px-0 pb-1"
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => openCreate("project", { clientId: c.id })}
                  >
                    <Plus /> New project
                  </Button>
                }
              >
                {active.length ? (
                  active.map((p) => <ProjectHealthRow key={p.id} project={p} />)
                ) : (
                  <EmptyState
                    compact
                    icon={FolderOpen}
                    title="No active engagements"
                    description={`Start a project to begin tracking work for ${c.name}.`}
                    action={
                      <Button
                        size="sm"
                        onClick={() =>
                          openCreate("project", { clientId: c.id })
                        }
                      >
                        <Plus /> New project
                      </Button>
                    }
                  />
                )}
              </SectionCard>

              <SectionCard
                title="Recent activity"
                icon={Activity}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => setTab("activity")}
                  >
                    Full timeline
                  </Button>
                }
                bodyClassName="px-2 pb-2"
              >
                <ActivityFeed
                  items={activity.slice(0, 5)}
                  emptyDescription={`Activity from ${c.name} and your team will appear here.`}
                />
              </SectionCard>
            </div>

            <div className="space-y-4 xl:col-span-4">
              <SectionCard title="Outstanding issues" icon={CircleAlert}>
                {issues.length ? (
                  <ul className="space-y-2">
                    {issues.map((i) => (
                      <li key={i.id}>
                        <Link
                          href={i.action.href}
                          className="block rounded-md bg-danger/5 px-3 py-2 ring-1 ring-danger/15 hover:bg-danger/10"
                        >
                          <p className="text-sm font-medium text-heading">
                            {i.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {i.context} ·{" "}
                            <span className="text-danger">
                              {i.deadlineLabel}
                            </span>
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    compact
                    icon={CircleCheckBig}
                    title="No outstanding issues"
                    description="Blockers, overdue work and waiting approvals for this client will show here."
                  />
                )}
              </SectionCard>

              <SectionCard
                title="Upcoming deadlines"
                icon={CalendarClock}
                bodyClassName="px-3"
              >
                <DeadlineList items={deadlines} />
              </SectionCard>

              <SectionCard
                title="Recent documents"
                icon={FileStack}
                bodyClassName="px-0 pb-1"
                actions={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Upload document"
                    onClick={() => openCreate("document", { clientId: c.id })}
                  >
                    <Upload />
                  </Button>
                }
              >
                {documents.length === 0 && (
                  <EmptyState
                    compact
                    icon={FileUp}
                    title="No documents yet"
                    description="Contracts and deliverables shared with this client will appear here."
                  />
                )}
                <ul>
                  {documents.slice(0, 3).map((d) => (
                    <li key={d.id} className="border-t border-border/70">
                      <DocumentRow doc={d} compact />
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard title="Commercial" icon={Handshake}>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Contract value
                    </dt>
                    <dd className="tabular font-semibold text-heading">
                      ${c.contractValue.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Renewal</dt>
                    <dd className="tabular font-semibold text-heading">
                      {formatLongDate(c.renewalDate)}
                    </dd>
                  </div>
                </dl>
              </SectionCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <ProjectTable projects={projects} hideClient />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsList contacts={c.contacts} company={c.name} />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskTable tasks={tasks} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={() => openCreate("document", { clientId: c.id })}>
              <Upload /> Upload document
            </Button>
          </div>
          <DocumentTable
            documents={documents}
            onUpload={() => openCreate("document", { clientId: c.id })}
          />
        </TabsContent>

        <TabsContent value="activity">
          <div className="surface rounded-lg p-2">
            <ActivityFeed items={activity} variant="timeline" />
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="max-w-3xl">
            <InternalNotes initial={c.id === "globex" ? undefined : []} />
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <ScopedAIChat
            scope={{ kind: "client", label: c.name }}
            suggestions={clientSuggestions}
          />
        </TabsContent>
      </Tabs>

      <ClientFormDrawer
        open={editing}
        onOpenChange={setEditing}
        client={c}
        onSave={() =>
          notify.info("Changes will appear once saved to the server")
        }
      />
    </PageContainer>
  );
};

export default ClientWorkspaceComp;
