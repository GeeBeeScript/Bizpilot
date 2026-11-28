import type { Integration, Invoice, Plan, Session, TeamMember, UsageMeterData } from "@/types";
import { daysFromNow, hoursAgo, minutesAgo } from "@/lib/date";
import { people as p } from "./people";

/* ---------- Team ---------- */
export const teamMembers: TeamMember[] = [
  { ...p.sarah, memberRole: "owner", status: "active", activeProjects: 3, openTasks: 5, overdueTasks: 1, workload: 82, lastActive: minutesAgo(2) },
  { ...p.priya, memberRole: "manager", status: "active", activeProjects: 4, openTasks: 7, overdueTasks: 1, workload: 96, lastActive: minutesAgo(15) },
  { ...p.james, memberRole: "admin", status: "active", activeProjects: 3, openTasks: 6, overdueTasks: 1, workload: 112, lastActive: minutesAgo(5) },
  { ...p.alex, memberRole: "employee", status: "active", activeProjects: 3, openTasks: 4, overdueTasks: 0, workload: 74, lastActive: hoursAgo(1) },
  { ...p.maya, memberRole: "manager", status: "active", activeProjects: 2, openTasks: 3, overdueTasks: 0, workload: 58, lastActive: hoursAgo(3) },
  { ...p.daniel, memberRole: "employee", status: "active", activeProjects: 3, openTasks: 5, overdueTasks: 1, workload: 88, lastActive: hoursAgo(2) },
  { ...p.tom, memberRole: "employee", status: "active", activeProjects: 2, openTasks: 3, overdueTasks: 0, workload: 46, lastActive: daysFromNow(-1) },
  { id: "u-nia", name: "Nia Brooks", initials: "NB", email: "nia@cornucopia.studio", role: "Designer", memberRole: "employee", status: "invited", activeProjects: 0, openTasks: 0, overdueTasks: 0, workload: 0, lastActive: daysFromNow(-2) },
];

export const rolePermissions: { feature: string; owner: boolean; admin: boolean; manager: boolean; member: boolean | "own"; note?: string }[] = [
  { feature: "View dashboard", owner: true, admin: true, manager: true, member: true },
  { feature: "Create clients & projects", owner: true, admin: true, manager: true, member: false },
  { feature: "Edit tasks", owner: true, admin: true, manager: true, member: "own", note: "Employees can edit tasks assigned to them" },
  { feature: "Upload documents", owner: true, admin: true, manager: true, member: true },
  { feature: "Invite client collaborators", owner: true, admin: true, manager: true, member: false },
  { feature: "Create automations", owner: true, admin: true, manager: true, member: false },
  { feature: "View reports", owner: true, admin: true, manager: true, member: false },
  { feature: "Approve AI actions", owner: true, admin: true, manager: true, member: "own", note: "Only for actions on their own work" },
  { feature: "Manage members & roles", owner: true, admin: true, manager: false, member: false },
  { feature: "Billing & subscription", owner: true, admin: false, manager: false, member: false },
  { feature: "Delete organization", owner: true, admin: false, manager: false, member: false },
];

/* ---------- Billing ---------- */
export const plans: Plan[] = [
  { id: "starter", name: "Starter", monthly: 29, annual: 24, summary: "For small teams getting organized", features: ["5 team members", "10 active projects", "1,000 AI credits / mo", "10 GB storage"] },
  { id: "growth", name: "Growth", monthly: 99, annual: 82, summary: "For growing service businesses", features: ["20 team members", "Unlimited projects", "10,000 AI credits / mo", "100 GB storage", "Automations", "Client portal"] },
  { id: "scale", name: "Scale", monthly: 249, annual: 207, summary: "For agencies running at scale", features: ["Unlimited members", "50,000 AI credits / mo", "1 TB storage", "Advanced reports", "Priority support", "SSO"] },
];

export const currentPlan = { planId: "growth" as const, billing: "monthly" as const, renewsAt: daysFromNow(12), paymentStatus: "ok" as "ok" | "failing", card: "Visa •••• 4242" };

export const usage: UsageMeterData[] = [
  { id: "ai", label: "AI credits", used: 6800, limit: 10000, unit: "credits", resetsAt: daysFromNow(12), explanation: "Each AI answer, summary or classification uses credits based on the amount of context read." },
  { id: "storage", label: "Storage", used: 41, limit: 100, unit: "GB", explanation: "Documents and attachments across all clients and projects." },
  { id: "members", label: "Team members", used: 8, limit: 20, unit: "seats", explanation: "Active and invited internal members. Client collaborators are free." },
  { id: "projects", label: "Active projects", used: 12, limit: 0, unit: "projects", explanation: "Unlimited on Growth." },
];

export const aiUsageBreakdown = [
  { feature: "Document analysis", credits: 2650 },
  { feature: "Summaries", credits: 1720 },
  { feature: "Questions (RAG)", credits: 1490 },
  { feature: "Email drafting", credits: 610 },
  { feature: "Other", credits: 330 },
];

export const invoices: Invoice[] = [
  { id: "in1", number: "INV-2026-010", date: daysFromNow(-18), amount: 99, status: "paid" },
  { id: "in2", number: "INV-2026-009", date: daysFromNow(-48), amount: 99, status: "paid" },
  { id: "in3", number: "INV-2026-008", date: daysFromNow(-79), amount: 99, status: "paid" },
  { id: "in4", number: "INV-2026-007", date: daysFromNow(-109), amount: 29, status: "paid" },
];

/* ---------- Settings ---------- */
export const integrations: Integration[] = [
  { id: "google", name: "Google Workspace", description: "Sign-in, Calendar and Drive files", category: "Productivity", status: "connected", connectedAt: daysFromNow(-120) },
  { id: "slack", name: "Slack", description: "Notifications and automation messages", category: "Communication", status: "error", connectedAt: daysFromNow(-60) },
  { id: "stripe", name: "Stripe", description: "Payments and failed-payment triggers", category: "Finance", status: "connected", connectedAt: daysFromNow(-200) },
  { id: "email", name: "Email (SMTP)", description: "Send emails from automations", category: "Communication", status: "available" },
  { id: "calendar", name: "Outlook Calendar", description: "Sync milestones and meetings", category: "Productivity", status: "available" },
  { id: "hubspot", name: "HubSpot", description: "Import clients and contacts", category: "Sales", status: "available" },
];

export const sessions: Session[] = [
  { id: "s1", device: "Chrome on Windows", location: "Lagos, NG", lastActive: minutesAgo(1), current: true },
  { id: "s2", device: "Safari on iPhone", location: "Lagos, NG", lastActive: hoursAgo(5) },
  { id: "s3", device: "Edge on Windows", location: "London, UK", lastActive: daysFromNow(-6) },
];

export const securityEvents = [
  { id: "se1", event: "Signed in", detail: "Chrome on Windows · Lagos, NG", at: minutesAgo(40) },
  { id: "se2", event: "Password changed", detail: "From account settings", at: daysFromNow(-21) },
  { id: "se3", event: "2FA enabled", detail: "Authenticator app", at: daysFromNow(-90) },
  { id: "se4", event: "Failed sign-in attempt", detail: "Unknown device · Berlin, DE", at: daysFromNow(-3) },
];
