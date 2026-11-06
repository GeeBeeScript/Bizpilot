import type { Automation, AutomationRun } from "@/types";
import { daysFromNow, hoursAgo, minutesAgo } from "@/lib/date";
import { people as p } from "./people";

export const automations: Automation[] = [
  {
    id: "client-onboarding",
    name: "New client onboarding",
    description: "Sets up the standard onboarding checklist and welcomes the client.",
    active: true,
    triggerLabel: "Client created",
    triggerType: "client",
    actionsSummary: ["Create tasks", "Send welcome email", "Notify manager"],
    createdBy: p.sarah,
    lastRun: minutesAgo(12),
    successCount: 41,
    failureCount: 1,
    nodes: [
      { id: "t1", kind: "trigger", type: "client.created", label: "Client created", detail: "Any new client", position: { x: 0, y: 140 } },
      { id: "c1", kind: "condition", type: "client.status", label: "Status is Onboarding", detail: "client.status = onboarding", position: { x: 300, y: 140 } },
      { id: "a1", kind: "action", type: "task.create", label: "Create onboarding tasks", detail: "Template: Standard onboarding (6 tasks)", position: { x: 600, y: 20 } },
      { id: "a2", kind: "action", type: "email.send", label: "Send welcome email", detail: "To primary contact · Template: Welcome", position: { x: 600, y: 160 } },
      { id: "a3", kind: "action", type: "notify.user", label: "Notify account manager", detail: "In-app + email", position: { x: 600, y: 300 } },
    ],
    edges: [
      { id: "e1", source: "t1", target: "c1" },
      { id: "e2", source: "c1", target: "a1", label: "yes" },
      { id: "e3", source: "c1", target: "a2", label: "yes" },
      { id: "e4", source: "c1", target: "a3", label: "yes" },
    ],
  },
  {
    id: "weekly-status",
    name: "Weekly client status email",
    description: "Every Friday, AI drafts a status update per active project for PM review.",
    active: true,
    triggerLabel: "Every Friday 9:00",
    triggerType: "project",
    actionsSummary: ["AI summary", "Send email"],
    createdBy: p.priya,
    lastRun: hoursAgo(6),
    successCount: 18,
    failureCount: 2,
    nodes: [
      { id: "t1", kind: "trigger", type: "schedule.weekly", label: "Every Friday 9:00", detail: "Weekly schedule", position: { x: 0, y: 120 } },
      { id: "c1", kind: "condition", type: "project.status", label: "Project is Active", detail: "project.status = active", position: { x: 300, y: 120 } },
      { id: "ai1", kind: "ai", type: "ai.summary", label: "Generate AI status summary", detail: "Uses tasks, milestones and activity from the last 7 days", position: { x: 600, y: 120 } },
      { id: "a1", kind: "action", type: "email.send", label: "Send to client contact", detail: "Requires PM approval", position: { x: 900, y: 120 } },
    ],
    edges: [
      { id: "e1", source: "t1", target: "c1" },
      { id: "e2", source: "c1", target: "ai1", label: "yes" },
      { id: "e3", source: "ai1", target: "a1" },
    ],
  },
  {
    id: "overdue-escalation",
    name: "Overdue task escalation",
    description: "Escalates urgent tasks that are more than a day overdue.",
    active: true,
    triggerLabel: "Task overdue",
    triggerType: "task",
    actionsSummary: ["Notify manager", "Update priority"],
    createdBy: p.sarah,
    lastRun: hoursAgo(7),
    successCount: 63,
    failureCount: 4,
    nodes: [
      { id: "t1", kind: "trigger", type: "task.overdue", label: "Task overdue", detail: "Checked hourly", position: { x: 0, y: 100 } },
      { id: "c1", kind: "condition", type: "task.priority", label: "Priority is High or Urgent", detail: "priority in (high, urgent)", position: { x: 300, y: 100 } },
      { id: "a1", kind: "action", type: "notify.user", label: "Notify project manager", detail: "Slack + in-app", position: { x: 600, y: 30 } },
      { id: "a2", kind: "action", type: "task.update", label: "Set priority to Urgent", detail: "task.priority = urgent", position: { x: 600, y: 180 } },
    ],
    edges: [
      { id: "e1", source: "t1", target: "c1" },
      { id: "e2", source: "c1", target: "a1", label: "yes" },
      { id: "e3", source: "c1", target: "a2", label: "yes" },
    ],
  },
  {
    id: "doc-summary",
    name: "Document → AI summary",
    description: "Summarizes and classifies every processed client document.",
    active: true,
    triggerLabel: "Document processed",
    triggerType: "document",
    actionsSummary: ["AI classify", "AI summary", "Notify uploader"],
    createdBy: p.james,
    lastRun: minutesAgo(1),
    successCount: 112,
    failureCount: 3,
    nodes: [
      { id: "t1", kind: "trigger", type: "document.processed", label: "Document processed", detail: "Any client document", position: { x: 0, y: 100 } },
      { id: "ai1", kind: "ai", type: "ai.classify", label: "AI classify", detail: "Contract · Requirements · Invoice · Other", position: { x: 300, y: 100 } },
      { id: "ai2", kind: "ai", type: "ai.summary", label: "AI summary", detail: "Key dates, obligations and risks", position: { x: 600, y: 100 } },
      { id: "a1", kind: "action", type: "notify.user", label: "Notify uploader", detail: "In-app", position: { x: 900, y: 100 } },
    ],
    edges: [
      { id: "e1", source: "t1", target: "ai1" },
      { id: "e2", source: "ai1", target: "ai2" },
      { id: "e3", source: "ai2", target: "a1" },
    ],
  },
  {
    id: "payment-failed",
    name: "Payment failed follow-up",
    description: "Alerts finance and pauses non-essential work when a payment fails.",
    active: false,
    triggerLabel: "Payment failed",
    triggerType: "billing",
    actionsSummary: ["Notify finance", "Create task"],
    createdBy: p.maya,
    lastRun: daysFromNow(-24),
    successCount: 3,
    failureCount: 0,
    nodes: [
      { id: "t1", kind: "trigger", type: "payment.failed", label: "Payment failed", detail: "Stripe", position: { x: 0, y: 100 } },
      { id: "a1", kind: "action", type: "notify.user", label: "Notify finance", detail: "Email", position: { x: 300, y: 30 } },
      { id: "a2", kind: "action", type: "task.create", label: "Create follow-up task", detail: "Assigned to account manager", position: { x: 300, y: 180 } },
    ],
    edges: [
      { id: "e1", source: "t1", target: "a1" },
      { id: "e2", source: "t1", target: "a2" },
    ],
  },
];

export const automationRuns: AutomationRun[] = [
  { id: "r101", automationId: "weekly-status", startedAt: hoursAgo(6), durationMs: 4200, status: "failed", trigger: "Schedule · Fri 09:00", steps: [
    { label: "Trigger", state: "done" }, { label: "Condition", state: "done", detail: "6 active projects" }, { label: "AI analysis", state: "done" }, { label: "Send email", state: "failed", detail: "SMTP: mailbox unavailable for 1 recipient" },
  ] },
  { id: "r100", automationId: "weekly-status", startedAt: daysFromNow(-7), durationMs: 3900, status: "success", trigger: "Schedule · Fri 09:00", steps: [
    { label: "Trigger", state: "done" }, { label: "Condition", state: "done" }, { label: "AI analysis", state: "done" }, { label: "Send email", state: "done" },
  ] },
  { id: "r099", automationId: "weekly-status", startedAt: daysFromNow(-14), durationMs: 5100, status: "success", trigger: "Schedule · Fri 09:00", steps: [
    { label: "Trigger", state: "done" }, { label: "Condition", state: "done" }, { label: "AI analysis", state: "done" }, { label: "Send email", state: "failed", detail: "Timeout" }, { label: "Retry → Success", state: "done" },
  ] },
  { id: "r201", automationId: "client-onboarding", startedAt: minutesAgo(12), durationMs: 1800, status: "success", trigger: "Gale Logistics created", steps: [
    { label: "Trigger", state: "done" }, { label: "Condition", state: "done" }, { label: "Create tasks", state: "done", detail: "6 tasks" }, { label: "Send welcome email", state: "done" }, { label: "Notify manager", state: "done" },
  ] },
  { id: "r301", automationId: "overdue-escalation", startedAt: hoursAgo(7), durationMs: 900, status: "retrying", trigger: "BP-101 overdue", steps: [
    { label: "Trigger", state: "done" }, { label: "Condition", state: "done" }, { label: "Notify manager", state: "failed", detail: "Slack rate limited" }, { label: "Retry", state: "active" },
  ] },
  { id: "r401", automationId: "doc-summary", startedAt: minutesAgo(1), durationMs: 0, status: "running", trigger: "Invoice templates.xlsx processed", steps: [
    { label: "Trigger", state: "done" }, { label: "AI classify", state: "done", detail: "Invoice" }, { label: "AI summary", state: "active" }, { label: "Notify uploader", state: "pending" },
  ] },
];

export const getAutomation = (id: string) => automations.find((a) => a.id === id);
export const runsFor = (id: string) => automationRuns.filter((r) => r.automationId === id);

/** Palette for the builder (§18.2) */
export const nodeLibrary = {
  trigger: [
    { type: "client.created", label: "Client created" },
    { type: "project.created", label: "Project created" },
    { type: "task.completed", label: "Task completed" },
    { type: "task.overdue", label: "Task overdue" },
    { type: "document.uploaded", label: "Document uploaded" },
    { type: "document.processed", label: "Document processed" },
    { type: "milestone.approved", label: "Milestone approved" },
    { type: "payment.failed", label: "Payment failed" },
  ],
  condition: [
    { type: "client.equals", label: "Client equals…" },
    { type: "status.equals", label: "Status equals…" },
    { type: "priority.equals", label: "Priority equals…" },
    { type: "project.overdue", label: "Project is overdue" },
    { type: "document.type", label: "Document type is…" },
  ],
  action: [
    { type: "task.create", label: "Create task" },
    { type: "email.send", label: "Send email" },
    { type: "notify.user", label: "Notify user" },
    { type: "status.update", label: "Update status" },
    { type: "api.call", label: "Call external API" },
  ],
  ai: [
    { type: "ai.summary", label: "Generate AI summary" },
    { type: "ai.classify", label: "AI classify" },
  ],
} as const;
