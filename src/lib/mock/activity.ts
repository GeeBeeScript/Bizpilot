import type {
  ActivityItem,
  AttentionItem,
  AutomationSummary,
  Deadline,
  Kpi,
  NotificationItem,
} from "@/types";
import { daysFromNow, hoursAgo, minutesAgo } from "@/lib/date";
import { people as p } from "./people";

export const kpis: Kpi[] = [
  { id: "clients", label: "Active Clients", value: "24", delta: "+2 this month", trend: "up", sentiment: "positive", href: "/u/clients" },
  { id: "projects", label: "Active Projects", value: "12", delta: "3 at risk", trend: "flat", sentiment: "neutral", href: "/u/projects" },
  { id: "overdue", label: "Overdue Tasks", value: "15", delta: "+4 since last week", trend: "up", sentiment: "negative", href: "/u/tasks" },
  { id: "revenue", label: "Revenue (MTD)", value: "$67,858", delta: "1.3% vs last month", trend: "down", sentiment: "negative", href: "/u/reports" },
  { id: "ai", label: "AI Usage", value: "68%", delta: "6,800 / 10,000 credits", trend: "up", sentiment: "neutral", href: "/u/billing" },
];

export const attentionItems: AttentionItem[] = [
  { id: "a1", type: "overdue-project", title: "Storefront Platform", context: "Acme Retail", owner: p.priya, urgency: "critical", deadline: daysFromNow(-3), deadlineLabel: "3d overdue", action: { label: "Open project", href: "/u/projects/storefront" } },
  { id: "a2", type: "blocked-task", title: "Resolve Globex API authentication", context: "Globex Corporation · Customer Portal", owner: p.james, urgency: "critical", deadline: daysFromNow(-1), deadlineLabel: "1d overdue", action: { label: "Unblock", href: "/u/projects/customer-portal?tab=board" } },
  { id: "a3", type: "approval", title: "Claims flow beta sign-off", context: "Globex Corporation · Customer Portal", owner: p.john, urgency: "high", deadline: daysFromNow(-2), deadlineLabel: "Waiting 2d", action: { label: "Nudge client", href: "/u/projects/customer-portal" } },
  { id: "a4", type: "follow-up", title: "No contact in 9 days", context: "Umbrella Health · renewal in 30d", owner: p.maya, urgency: "high", deadline: daysFromNow(0), deadlineLabel: "Due today", action: { label: "Log follow-up", href: "/u/clients/umbrella" } },
  { id: "a5", type: "automation", title: "Weekly status email failed", context: "Automation · Client reporting", owner: p.sarah, urgency: "medium", deadline: hoursAgo(6), deadlineLabel: "6h ago", action: { label: "Retry run", href: "/u/automations" } },
  { id: "a6", type: "document", title: "HIPAA checklist.pdf failed processing", context: "Umbrella Health · Patient Intake", owner: p.alex, urgency: "medium", deadline: daysFromNow(-2), deadlineLabel: "2d ago", action: { label: "Review", href: "/u/documents" } },
  { id: "a7", type: "approval", title: "Invoice templates", context: "Nipe Corporation · Tracking & Invoicing", owner: p.david, urgency: "medium", deadline: daysFromNow(4), deadlineLabel: "In 4d", action: { label: "Open", href: "/u/projects/tracking-invoicing" } },
];

export const clientActivity: ActivityItem[] = [
  // Globex Corporation
  { id: "ca1", clientId: "globex", actor: p.raj, verb: "commented on", target: "SSO configuration checklist", href: "/u/projects/customer-portal", timestamp: minutesAgo(35), context: "Customer Portal", kind: "comment" },
  { id: "ca2", clientId: "globex", actor: p.linda, verb: "approved budget for", target: "Change Request 4", href: "/u/projects/customer-portal", timestamp: hoursAgo(5), context: "Customer Portal", kind: "approval" },
  { id: "ca3", clientId: "globex", actor: p.john, verb: "uploaded", target: "Security Requirements.pdf", href: "/u/documents/d2", timestamp: hoursAgo(9), context: "Customer Portal", kind: "upload" },
  // Nipe Corporation
  { id: "ca4", clientId: "nipe", actor: p.david, verb: "commented on", target: "Invoice templates", href: "/u/projects/tracking-invoicing", timestamp: hoursAgo(1), context: "Tracking & Invoicing", kind: "comment" },
  { id: "ca5", clientId: "nipe", actor: p.david, verb: "uploaded", target: "Invoice templates.xlsx", href: "/u/documents/d5", timestamp: hoursAgo(2), context: "Tracking & Invoicing", kind: "upload" },
  { id: "ca6", clientId: "nipe", actor: p.grace, verb: "accepted the portal invitation for", target: "Tracking & Invoicing", href: "/u/projects/tracking-invoicing", timestamp: hoursAgo(7), kind: "create" },
  // Acme Retail
  { id: "ca7", clientId: "acme", actor: p.elena, verb: "approved", target: "Catalog migration milestone", href: "/u/projects/storefront", timestamp: hoursAgo(3), context: "Storefront Platform", kind: "approval" },
  { id: "ca8", clientId: "acme", actor: p.marco, verb: "commented on", target: "Checkout wireframes v3.pdf", href: "/u/projects/storefront", timestamp: hoursAgo(20), context: "Storefront Platform", kind: "comment" },
  // Umbrella Health
  { id: "ca9", clientId: "umbrella", actor: null, verb: "flagged inactivity for", target: "Umbrella Health", href: "/u/clients/umbrella", timestamp: hoursAgo(5), context: "No client contact in 9 days", kind: "alert" },
  // Gale Logistics
  { id: "ca10", clientId: "gale", actor: p.ana, verb: "signed", target: "Fleet Dashboard statement of work", href: "/u/projects/fleet-dashboard", timestamp: daysFromNow(-1), context: "New engagement", kind: "create" },
];

export const teamActivity: ActivityItem[] = [
  { id: "ta1", actor: p.alex, verb: "completed", target: "Review Globex change request #4 (scope + cost)", timestamp: minutesAgo(20), context: "Globex Corporation · Customer Portal", kind: "complete", href: "/u/projects/customer-portal" },
  { id: "ta2", actor: p.priya, verb: "assigned", target: "SSO login flow QA to Tom", timestamp: minutesAgo(48), context: "Globex Corporation · Customer Portal", kind: "assign", href: "/u/projects/customer-portal" },
  { id: "ta3", actor: null, verb: "generated", target: "a project summary", timestamp: hoursAgo(2), context: "Customer Portal", kind: "ai", href: "/u/projects/customer-portal?tab=ai" },
  { id: "ta4", actor: p.sarah, verb: "uploaded", target: "Change Request 4 — Claims scope.pdf", timestamp: hoursAgo(4), context: "Globex Corporation · Customer Portal", kind: "upload", href: "/u/documents/d1" },
  { id: "ta5", actor: p.james, verb: "moved", target: "Cutover runbook to In Progress", timestamp: hoursAgo(6), context: "Initech · Data Warehouse Migration", kind: "update", href: "/u/projects/data-migration" },
  { id: "ta6", actor: p.tom, verb: "completed", target: "Regression suite for policy search", timestamp: daysFromNow(-1), context: "Globex Corporation · Customer Portal", kind: "complete" },
];

export const projectActivity: ActivityItem[] = [
  ...teamActivity.filter((a) => a.context?.includes("Customer Portal")),
  { id: "pa1", actor: p.john, verb: "uploaded", target: "Security Requirements.pdf", timestamp: hoursAgo(9), context: "Shared with client", kind: "upload", href: "/u/documents" },
  { id: "pa2", actor: p.priya, verb: "changed health to", target: "At risk", timestamp: daysFromNow(-1), context: "Reason: API credential dependency", kind: "update" },
  { id: "pa3", actor: p.john, verb: "approved", target: "Discovery & UX sign-off", timestamp: daysFromNow(-30), context: "Milestone 1", kind: "approval" },
];

export const deadlines: Deadline[] = [
  { id: "dl1", date: daysFromNow(0), clientName: "Globex Corporation", projectName: "Customer Portal", item: "Change request #4 decision", kind: "task", owner: p.sarah, status: "at-risk" },
  { id: "dl2", date: daysFromNow(2), clientName: "Umbrella Health", projectName: "Patient Intake Redesign", item: "Compliance review", kind: "milestone", owner: p.alex, status: "at-risk" },
  { id: "dl3", date: daysFromNow(4), clientName: "Nipe Corporation", projectName: "Tracking & Invoicing", item: "Invoice templates approved", kind: "milestone", owner: p.sarah, status: "on-track" },
  { id: "dl4", date: daysFromNow(6), clientName: "Globex Corporation", projectName: "Customer Portal", item: "API integration complete", kind: "milestone", owner: p.james, status: "late" },
  { id: "dl5", date: daysFromNow(12), clientName: "Initech", projectName: "Data Warehouse Migration", item: "Cutover", kind: "milestone", owner: p.james, status: "on-track" },
];

export const automationSummary: AutomationSummary = {
  active: 9,
  failedRuns: 2,
  awaitingRetry: 1,
  lastSuccess: minutesAgo(12),
  recent: [
    { id: "r1", name: "New client onboarding", status: "success", at: minutesAgo(12) },
    { id: "r2", name: "Weekly client status email", status: "failed", at: hoursAgo(6) },
    { id: "r3", name: "Overdue task escalation", status: "retrying", at: hoursAgo(7) },
    { id: "r4", name: "Document → AI summary", status: "running", at: minutesAgo(1) },
  ],
};

export const notifications: NotificationItem[] = [
  { id: "n1", category: "mentions", title: "Priya mentioned you", summary: "“@Sarah can you confirm the CR#4 budget before the Globex call?”", context: "Customer Portal", timestamp: minutesAgo(8), read: false, href: "/u/projects/customer-portal" },
  { id: "n2", category: "ai", title: "AI flagged a deadline risk", summary: "API integration milestone is likely to slip by 4–6 days.", context: "Customer Portal", timestamp: minutesAgo(35), read: false, href: "/u/projects/customer-portal?tab=ai" },
  { id: "n3", category: "tasks", title: "Task assigned to you", summary: "Escalation call with Acme checkout team", context: "Storefront Platform", timestamp: hoursAgo(2), read: false, href: "/u/projects/storefront" },
  { id: "n4", category: "clients", title: "Elena Rossi approved a milestone", summary: "Catalog migration", context: "Acme Retail", timestamp: hoursAgo(3), read: true, href: "/u/clients/acme" },
  { id: "n5", category: "projects", title: "Project health changed", summary: "Customer Portal moved to At risk", context: "Globex Corporation", timestamp: daysFromNow(-1), read: true, href: "/u/projects/customer-portal" },
  { id: "n6", category: "billing", title: "AI credits at 68%", summary: "Resets in 12 days.", context: "Billing", timestamp: daysFromNow(-2), read: true, href: "/u/billing" },
];
