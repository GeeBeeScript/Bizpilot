"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Archive,
  CalendarClock,
  CircleCheck,
  Copy,
  Ellipsis,
  Flag,
  GitBranch,
  ListChecks,
  Lightbulb,
  Paperclip,
  Route,
  Search,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { SidePanel } from "@/app/components/generalUIcomp/SidePanel";
import {
  PriorityChip,
  TaskStatusChip,
} from "@/app/components/generalUIcomp/Chips";
import {
  PersonLabel,
  UserAvatar,
} from "@/app/components/generalUIcomp/UserAvatar";
import { ActivityFeed } from "@/app/components/generalUIcomp/ActivityFeed";
import {
  AIQuickActions,
  type AIQuickAction,
} from "@/app/components/elements/ai/AIQuickActions";
import {
  dueLabel,
  formatLongDate,
  hoursAgo,
  isOverdue,
  minutesAgo,
} from "@/lib/date";
import { notify } from "@/lib/notify";
import { currentUser, people } from "@/lib/mock/people";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { ReassignSubmenu, StatusSubmenu } from "./TaskMenus";

const aiActions: AIQuickAction[] = [
  {
    id: "plan",
    label: "Draft implementation plan",
    icon: Route,
    result: [
      {
        type: "recommended",
        title: "Implementation plan",
        items: [
          "Confirm required OAuth scopes with Globex IT",
          "Stub the auth client behind an interface",
          "Add contract tests against the sandbox",
          "Swap in real credentials and run smoke tests",
        ],
      },
    ],
  },
  {
    id: "req",
    label: "Summarize requirements",
    icon: ListChecks,
    result: [
      {
        type: "found",
        items: [
          "Client-credential OAuth 2.0 with 60-minute token expiry (Security Requirements §2.3)",
          "All traffic must be logged with a correlation ID (§4.1)",
        ],
      },
    ],
  },
  {
    id: "block",
    label: "Identify blockers",
    icon: Search,
    result: [
      {
        type: "paragraph",
        text: "One blocker found: credentials have not been issued. Two downstream tasks (SSO QA, contract tests) depend on this task.",
      },
    ],
  },
  {
    id: "next",
    label: "Suggest next steps",
    icon: Lightbulb,
    result: [
      {
        type: "recommended",
        items: [
          "Escalate to Raj Patel with a 48h deadline",
          "Unblock QA with a mocked auth service",
        ],
      },
    ],
  },
];

const Prop = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="contents">
    <dt className="py-1.5 text-xs text-muted-foreground">{label}</dt>
    <dd className="min-w-0 py-1 text-sm">{children}</dd>
  </div>
);

type Props = {
  task: Task | null;
  onOpenChange: (o: boolean) => void;
  onChange?: (t: Task) => void;
};

/** Task detail drawer (§16.2) */
export const TaskDetailPanel = ({
  task: incoming,
  onOpenChange,
  onChange,
}: Props) => {
  // Keep showing the last task while the drawer animates closed
  const [task, setTask] = useState(incoming);
  if (incoming && incoming !== task) setTask(incoming);
  const open = !!incoming;
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: "c1",
      who: people.priya,
      text: "Raj said credentials should be ready by Thursday.",
      at: hoursAgo(5),
    },
    {
      id: "c2",
      who: people.james,
      text: "I'll keep the contract tests going against a stub until then.",
      at: minutesAgo(50),
    },
  ]);

  if (!task)
    return (
      <SidePanel open={false} onOpenChange={onOpenChange} title="">
        {null}
      </SidePanel>
    );

  const update = (patch: Partial<Task>, message: string) => {
    const prev = task;
    onChange?.({ ...task, ...patch });
    notify.success(message, { onUndo: () => onChange?.(prev) });
  };

  const done = task.status === "done";

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      eyebrow={
        <span className="flex items-center gap-1.5">
          <span className="font-mono">{task.key}</span> ·
          <Link
            href={`/u/projects/${task.projectId}`}
            className="hover:text-foreground hover:underline"
          >
            {task.clientName} / {task.projectName}
          </Link>
        </span>
      }
      title={
        <span className={cn(done && "text-muted-foreground line-through")}>
          {task.title}
        </span>
      }
      headerActions={
        <>
          <Button
            variant={done ? "outline" : "default"}
            size="sm"
            onClick={() =>
              update(
                { status: done ? "todo" : "done" },
                done ? "Task reopened" : "Task completed",
              )
            }
          >
            <CircleCheck /> {done ? "Reopen" : "Complete"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More task actions"
                >
                  <Ellipsis />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <StatusSubmenu
                task={task}
                onChange={(s) => update({ status: s }, "Status updated")}
              />
              <ReassignSubmenu
                task={task}
                onChange={(p) =>
                  update({ assignee: p }, `Reassigned to ${p.name}`)
                }
              />
              <DropdownMenuItem
                onClick={() => notify.info("Pick a new due date")}
              >
                <CalendarClock /> Change due date
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  update({ priority: "urgent" }, "Priority set to Urgent")
                }
              >
                <Flag /> Change priority
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => notify.info("Select a task to depend on")}
              >
                <GitBranch /> Add dependency
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => notify.success("Task duplicated")}
              >
                <Copy /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  onOpenChange(false);
                  notify.success("Task archived", { onUndo: () => {} });
                }}
              >
                <Archive /> Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      <div className="space-y-6">
        <dl className="grid grid-cols-[7rem_1fr] items-center gap-x-3 rounded-lg bg-muted/40 px-3 py-1.5">
          <Prop label="Status">
            <TaskStatusChip status={task.status} />
          </Prop>
          <Prop label="Priority">
            <PriorityChip priority={task.priority} />
          </Prop>
          <Prop label="Assignee">
            <PersonLabel person={task.assignee} />
          </Prop>
          <Prop label="Due date">
            <span
              className={cn(
                "tabular",
                isOverdue(task.dueDate) && !done && "font-medium text-danger",
              )}
            >
              {formatLongDate(task.dueDate)} · {dueLabel(task.dueDate)}
            </span>
          </Prop>
          <Prop label="Project">
            <Link
              className="text-primary hover:underline dark:text-info"
              href={`/u/projects/${task.projectId}`}
            >
              {task.projectName}
            </Link>
          </Prop>
          <Prop label="Client">{task.clientName}</Prop>
          <Prop label="Dependencies">
            {task.dependencies ? (
              <span className="inline-flex items-center gap-1.5 text-warning">
                <GitBranch className="size-3.5" /> Waiting on{" "}
                {task.dependencies} task
              </span>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </Prop>
        </dl>

        <section>
          <h3 className="mb-1.5 font-heading text-xs font-semibold tracking-wide text-heading uppercase">
            Description
          </h3>
          <p className="text-sm leading-relaxed text-foreground">
            {task.description ?? (
              <span className="text-muted-foreground">No description yet.</span>
            )}
          </p>
        </section>

        <AIQuickActions
          actions={aiActions}
          scope={{
            kind: "project",
            label: `${task.key} · ${task.projectName}`,
          }}
        />

        <section>
          <h3 className="mb-2 flex items-center gap-1.5 font-heading text-xs font-semibold tracking-wide text-heading uppercase">
            <Paperclip className="size-3.5" /> Attachments{" "}
            <span className="tabular text-muted-foreground">
              {task.attachments}
            </span>
          </h3>
          {task.attachments ? (
            <ul className="space-y-1">
              {Array.from({ length: task.attachments }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <Paperclip className="size-3.5 text-muted-foreground" />{" "}
                  {i === 0
                    ? "Security Requirements.pdf"
                    : `screenshot-${i}.png`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No attachments.</p>
          )}
        </section>

        <section>
          <h3 className="mb-2 font-heading text-xs font-semibold tracking-wide text-heading uppercase">
            Comments
          </h3>
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-2.5">
                <UserAvatar person={c.who} />
                <div className="min-w-0 rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs">
                    <span className="font-medium text-heading">
                      {c.who.name}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      ·{" "}
                      {dueLabel(c.at) === "Today"
                        ? "today"
                        : formatLongDate(c.at)}
                    </span>
                  </p>
                  <p className="text-sm">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              setComments((l) => [
                ...l,
                {
                  id: `c${l.length + 1}`,
                  who: currentUser,
                  text: comment,
                  at: new Date().toISOString(),
                },
              ]);
              setComment("");
            }}
          >
            <UserAvatar person={currentUser} />
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={1}
              placeholder="Add a comment… use @ to mention"
              className="min-h-9"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Post comment"
              disabled={!comment.trim()}
            >
              <Send />
            </Button>
          </form>
        </section>

        <section>
          <h3 className="mb-1 font-heading text-xs font-semibold tracking-wide text-heading uppercase">
            Activity
          </h3>
          <ActivityFeed
            variant="timeline"
            items={[
              {
                id: "x1",
                actor: people.priya,
                verb: "changed status to",
                target: "Blocked",
                timestamp: hoursAgo(30),
                kind: "update",
              },
              {
                id: "x2",
                actor: people.priya,
                verb: "assigned",
                target: `this task to ${task.assignee.name}`,
                timestamp: hoursAgo(80),
                kind: "assign",
              },
            ]}
          />
        </section>
      </div>
    </SidePanel>
  );
};
