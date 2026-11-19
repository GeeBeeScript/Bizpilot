"use client";

import { useState } from "react";
import { CheckCheck, Download, FileText, FolderOpen, Send } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { SectionCard } from "@/app/components/generalUIcomp/SectionCard";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import { ActivityFeed } from "@/app/components/generalUIcomp/ActivityFeed";
import { Chip } from "@/app/components/generalUIcomp/Chips";
import { ProgressBar } from "@/app/components/generalUIcomp/ProgressBar";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import { Field } from "@/app/components/generalUIcomp/SidePanel";
import {
  LoadingButton,
  useSubmit,
} from "@/app/components/generalUIcomp/LoadingButton";
import { FileTypeIcon } from "@/app/components/elements/documents/DocumentRow";
import {
  DeliverableRow,
  PortalProjectCard,
  usePortal,
} from "@/app/components/portal/PortalParts";
import { formatLongDate, timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import type {
  ActivityItem,
  DocumentItem,
  Milestone,
  Person,
  Project,
} from "@/types";
import type { PortalMessage } from "@/lib/mock/portal";

const SharedDocs = ({ docs }: { docs: DocumentItem[] }) =>
  docs.length === 0 ? (
    <EmptyState
      compact
      icon={FileText}
      title="No shared documents yet"
      description="Files the team shares with you will appear here."
    />
  ) : (
    <ul className="divide-y divide-border/70">
      {docs.map((d) => (
        <li key={d.id} className="flex items-center gap-3 px-4 py-2.5">
          <FileTypeIcon type={d.kind} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-heading">{d.name}</p>
            <p className="text-xs text-muted-foreground">
              {d.projectName} · {d.size} · {timeAgo(d.uploadedAt)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              notify.success("Download started", { description: d.name })
            }
            aria-label={`Download ${d.name}`}
          >
            <Download />
          </Button>
        </li>
      ))}
    </ul>
  );

/** Client portal home (§25.2) */
export const PortalHome = ({
  viewer,
  projects,
  activity,
  docs,
}: {
  viewer: Person;
  projects: Project[];
  activity: ActivityItem[];
  docs: DocumentItem[];
}) => {
  const { deliverables } = usePortal();
  const pending = deliverables.filter((d) => d.status === "awaiting");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-heading md:text-2xl">
          Welcome back, {viewer.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          {pending.length
            ? `${pending.length} item${pending.length > 1 ? "s" : ""} waiting for your approval.`
            : "Nothing needs your attention right now."}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold text-heading">
          Active projects
        </h2>
        {projects.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <PortalProjectCard
                key={p.id}
                p={p}
                pending={pending.filter((d) => d.projectId === p.id).length}
              />
            ))}
          </div>
        ) : (
          <div className="surface rounded-lg">
            <EmptyState
              compact
              icon={FolderOpen}
              title="No active projects"
              description="Projects shared with you will appear here."
            />
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Pending approvals"
          variant={pending.length ? "ai" : "solid"}
          bodyClassName="px-0 pb-1"
        >
          {pending.length ? (
            <ul className="divide-y divide-border/70 border-t border-border/70">
              {pending.map((d) => (
                <DeliverableRow key={d.id} d={d} />
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              icon={CheckCheck}
              title="You're all caught up"
              description="Deliverables that need your approval will appear here."
            />
          )}
        </SectionCard>
        <SectionCard title="Recent activity" bodyClassName="px-2 pb-2">
          <ActivityFeed
            items={activity}
            emptyDescription="Updates the team shares with you will appear here."
          />
        </SectionCard>
      </div>

      <SectionCard title="Shared documents" bodyClassName="px-0 pb-1">
        <SharedDocs docs={docs} />
      </SectionCard>
    </div>
  );
};

export const PortalApprovals = () => {
  const { deliverables } = usePortal();
  const awaiting = deliverables.filter((d) => d.status === "awaiting");
  const decided = deliverables.filter((d) => d.status !== "awaiting");
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-semibold text-heading">
        Approvals
      </h1>
      <SectionCard
        title={`Waiting for you · ${awaiting.length}`}
        bodyClassName="px-0 pb-1"
      >
        {awaiting.length ? (
          <ul className="divide-y divide-border/70 border-t border-border/70">
            {awaiting.map((d) => (
              <DeliverableRow key={d.id} d={d} />
            ))}
          </ul>
        ) : (
          <EmptyState
            compact
            icon={CheckCheck}
            title="Nothing to approve"
            description="When the team submits a deliverable, it will appear here."
          />
        )}
      </SectionCard>
      <SectionCard title="History" bodyClassName="px-0 pb-1">
        {decided.length ? (
          <ul className="divide-y divide-border/70 border-t border-border/70">
            {decided.map((d) => (
              <DeliverableRow key={d.id} d={d} />
            ))}
          </ul>
        ) : (
          <EmptyState
            compact
            icon={CheckCheck}
            title="No decisions yet"
            description="Approved and returned deliverables will be listed here."
          />
        )}
      </SectionCard>
    </div>
  );
};

export const PortalDocuments = ({ docs }: { docs: DocumentItem[] }) => (
  <div className="space-y-6">
    <h1 className="font-heading text-xl font-semibold text-heading">
      Shared documents
    </h1>
    <SectionCard title={`${docs.length} files`} bodyClassName="px-0 pb-1">
      <SharedDocs docs={docs} />
    </SectionCard>
  </div>
);

const msTone = {
  done: "success",
  upcoming: "neutral",
  late: "danger",
  "awaiting-approval": "ai",
} as const;
const msLabel = {
  done: "Approved",
  upcoming: "Upcoming",
  late: "Delayed",
  "awaiting-approval": "Needs your approval",
};

const MilestoneList = ({ items }: { items: Milestone[] }) =>
  items.length ? (
    <ul className="divide-y divide-border/70">
      {items.map((m) => (
        <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="flex-1 text-sm text-heading">{m.name}</span>
          <span className="tabular text-xs text-muted-foreground">
            {formatLongDate(m.date)}
          </span>
          <Chip tone={msTone[m.status]} dot>
            {msLabel[m.status]}
          </Chip>
        </li>
      ))}
    </ul>
  ) : (
    <EmptyState
      compact
      icon={FolderOpen}
      title="No milestones yet"
      description="Planned milestones will appear here."
    />
  );

/** Client project page (§25.3) */
export const PortalProject = ({
  project: p,
  docs,
  messages: initialMessages,
  viewer,
}: {
  project: Project;
  docs: DocumentItem[];
  messages: PortalMessage[];
  viewer: Person;
}) => {
  const { deliverables } = usePortal();
  const mine = deliverables.filter((d) => d.projectId === p.id);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-xl font-semibold text-heading md:text-2xl">
            {p.name}
          </h1>
          <Chip
            tone={p.status === "on-hold" ? "warning" : "info"}
            dot
            className="capitalize"
          >
            {p.status.replace("-", " ")}
          </Chip>
        </div>
        <div className="glass grid gap-4 rounded-lg px-4 py-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="mb-1 text-xs text-muted-foreground">Progress</p>
            <ProgressBar value={p.progress} size="md" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className="text-sm font-semibold text-heading">
              {formatLongDate(p.deadline)}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals{" "}
            {mine.filter((d) => d.status === "awaiting").length > 0 && (
              <span className="tabular rounded bg-ai/25 px-1 text-[0.6rem] font-semibold text-heading">
                {mine.filter((d) => d.status === "awaiting").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Summary">
            <p className="text-sm leading-relaxed">{p.description}</p>
          </SectionCard>
          <SectionCard title="Milestones" bodyClassName="px-0 pb-1">
            <MilestoneList items={p.milestones} />
          </SectionCard>
        </TabsContent>
        <TabsContent value="milestones">
          <div className="surface rounded-lg">
            <MilestoneList items={p.milestones} />
          </div>
        </TabsContent>
        <TabsContent value="deliverables">
          <div className="surface rounded-lg">
            {mine.length ? (
              <ul className="divide-y divide-border/70">
                {mine.map((d) => (
                  <DeliverableRow key={d.id} d={d} />
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={FileText}
                title="No deliverables yet"
                description="Work submitted for your review will appear here."
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="documents">
          <div className="surface rounded-lg">
            <SharedDocs docs={docs} />
          </div>
        </TabsContent>
        <TabsContent value="messages">
          <div className="surface flex flex-col rounded-lg">
            <ul className="space-y-4 p-4">
              {messages.length === 0 && (
                <li>
                  <EmptyState
                    compact
                    icon={Send}
                    title="No messages yet"
                    description="Start a conversation with the project team."
                  />
                </li>
              )}
              {messages.map((m) => {
                const me = m.author.id === viewer.id;
                return (
                  <li
                    key={m.id}
                    className={
                      me ? "flex flex-row-reverse gap-2.5" : "flex gap-2.5"
                    }
                  >
                    <UserAvatar person={m.author} />
                    <div
                      className={
                        me
                          ? "max-w-[75%] rounded-xl rounded-tr-sm bg-primary/10 px-3 py-2"
                          : "max-w-[75%] rounded-xl rounded-tl-sm bg-muted/60 px-3 py-2"
                      }
                    >
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-heading">
                          {me ? "You" : m.author.name}
                        </span>{" "}
                        · {timeAgo(m.at)}
                      </p>
                      <p className="text-sm">{m.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <form
              className="flex items-end gap-2 border-t border-border/70 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                setMessages((l) => [
                  ...l,
                  {
                    id: `m${Date.now()}`,
                    author: viewer,
                    text: draft,
                    at: new Date().toISOString(),
                  },
                ]);
                setDraft("");
              }}
            >
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={1}
                placeholder="Message the project team…"
                aria-label="Message the project team"
                className="min-h-9"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!draft.trim()}
                aria-label="Send"
              >
                <Send />
              </Button>
            </form>
          </div>
        </TabsContent>
        <TabsContent value="approvals">
          <div className="surface rounded-lg">
            {mine.length ? (
              <ul className="divide-y divide-border/70">
                {mine.map((d) => (
                  <DeliverableRow key={d.id} d={d} />
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={CheckCheck}
                title="Nothing to approve"
                description="Approval requests for this project will appear here."
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/** Client portal profile (§25.4) */
export const PortalProfile = ({
  viewer,
  company,
}: {
  viewer: Person;
  company: string;
}) => {
  const { submitting, submit } = useSubmit();
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-heading text-xl font-semibold text-heading">
        Profile & security
      </h1>
      <SectionCard title="Your details">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" htmlFor="pp-name">
            <Input id="pp-name" defaultValue={viewer.name} className="h-9" />
          </Field>
          <Field label="Email" htmlFor="pp-email">
            <Input id="pp-email" defaultValue={viewer.email} className="h-9" />
          </Field>
          <Field
            label="Company"
            htmlFor="pp-co"
            hint="Managed by your service provider"
          >
            <Input id="pp-co" defaultValue={company} disabled className="h-9" />
          </Field>
          <Field label="Title" htmlFor="pp-title">
            <Input id="pp-title" defaultValue={viewer.role} className="h-9" />
          </Field>
        </div>
      </SectionCard>
      <SectionCard title="Password">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Current password" htmlFor="pp-cur">
            <Input id="pp-cur" type="password" className="h-9" />
          </Field>
          <Field
            label="New password"
            htmlFor="pp-new"
            hint="At least 12 characters"
          >
            <Input id="pp-new" type="password" className="h-9" />
          </Field>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <LoadingButton
          loading={submitting}
          onClick={() =>
            submit(() => {
              notify.success("Profile saved");
            })
          }
        >
          Save changes
        </LoadingButton>
      </div>
    </div>
  );
};
