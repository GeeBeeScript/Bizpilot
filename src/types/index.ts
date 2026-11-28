// Domain types shared by the UI. Backend responses should map onto these shapes.

import type { Kind, Roles } from "@/app/generated/prisma/enums";

export type ViewerOrg = { id: string, name: string, initials: string, role: Roles, kind: Kind }

export type Viewer = { 
  user: { id: string; name: string; email: string; initials: string; avatarUrl?: string },
  activeOrg: ViewerOrg,
  orgs: ViewerOrg[]
 }

export type ID = string;

export type Person = {
  id: ID;
  name: string;
  initials: string;
  avatarUrl?: string;
  email?: string;
  role?: string;
  online?: boolean;
  /** Set when the person belongs to a client organization */
  external?: { company: string };
};

export type Health = "on-track" | "at-risk" | "off-track";
export type ClientStatus = "active" | "onboarding" | "paused" | "inactive";
export type ProjectStatus = "planning" | "active" | "on-hold" | "completed";
export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus =
  | "backlog"
  | "todo"
  | "in-progress"
  | "review"
  | "blocked"
  | "done";
export type DocumentStatus =
  | "uploading"
  | "processing"
  | "indexing"
  | "ready"
  | "failed";

export type Contact = {
  id: ID;
  name: string;
  initials: string;
  title: string;
  email: string;
  phone?: string;
  isCollaborator: boolean;
  active: boolean;
};

export type Client = {
  id: ID;
  name: string;
  initials: string;
  /** Hue for the client's logo tile */
  tone: "blue" | "gold" | "emerald" | "sapphire" | "amber" | "crimson";
  industry: string;
  website: string;
  size: string;
  phone: string;
  address: string;
  status: ClientStatus;
  health: Health;
  primaryContact: Contact;
  contacts: Contact[];
  accountManager: Person;
  activeProjects: number;
  completedProjects: number;
  openTasks: number;
  pendingApprovals: number;
  lastActivity: string;
  tags: string[];
  contractValue: number;
  renewalDate: string;
  summary: string;
};

export type Milestone = {
  id: ID;
  name: string;
  date: string;
  status: "done" | "upcoming" | "late" | "awaiting-approval";
};

export type Project = {
  id: ID;
  name: string;
  clientId: ID;
  clientName: string;
  description: string;
  manager: Person;
  progress: number;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  health: Health;
  priority: Priority;
  openTasks: number;
  blocker?: string;
  budget: number;
  spent: number;
  team: Person[];
  collaborators: Person[];
  milestones: Milestone[];
  clientCollaboration: boolean;
};

export type Task = {
  id: ID;
  key: string;
  title: string;
  description?: string;
  projectId: ID;
  projectName: string;
  clientName: string;
  assignee: Person;
  status: TaskStatus;
  priority: Priority;
  startDate: string;
  dueDate: string;
  comments: number;
  attachments: number;
  dependencies: number;
};

export type DocumentItem = {
  id: ID;
  name: string;
  kind: "pdf" | "docx" | "xlsx" | "image" | "other";
  size: string;
  clientName: string;
  projectName?: string;
  uploadedBy: Person;
  uploadedAt: string;
  status: DocumentStatus;
  indexed: boolean;
  clientVisible: boolean;
};

export type ActivityKind =
  | "upload"
  | "approval"
  | "comment"
  | "complete"
  | "assign"
  | "create"
  | "update"
  | "ai"
  | "alert";

export type ActivityItem = {
  id: ID;
  /** null actor = BizPilot AI */
  actor: Person | null;
  verb: string;
  target: string;
  href?: string;
  timestamp: string;
  context?: string;
  kind: ActivityKind;
  /** Client organization the activity belongs to (used to group client activity) */
  clientId?: ID;
};

export type AttentionType =
  | "overdue-project"
  | "blocked-task"
  | "approval"
  | "follow-up"
  | "automation"
  | "document";

export type AttentionItem = {
  id: ID;
  type: AttentionType;
  title: string;
  context: string;
  owner: Person;
  urgency: "critical" | "high" | "medium";
  deadline: string;
  deadlineLabel: string;
  action: { label: string; href: string };
};

export type Deadline = {
  id: ID;
  date: string;
  clientName: string;
  projectName: string;
  item: string;
  kind: "milestone" | "task";
  owner: Person;
  status: "on-track" | "at-risk" | "late";
};

export type AutomationSummary = {
  active: number;
  failedRuns: number;
  awaitingRetry: number;
  lastSuccess: string;
  recent: { id: ID; name: string; status: "success" | "failed" | "retrying" | "running"; at: string }[];
};

export type NotificationCategory =
  | "mentions"
  | "tasks"
  | "projects"
  | "clients"
  | "ai"
  | "billing";

export type NotificationItem = {
  id: ID;
  category: NotificationCategory;
  title: string;
  summary: string;
  context: string;
  timestamp: string;
  read: boolean;
  href: string;
};

export type Kpi = {
  id: "clients" | "projects" | "overdue" | "revenue" | "ai";
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  /** whether the trend direction is good news */
  sentiment: "positive" | "negative" | "neutral";
  href: string;
};

export type Organization = {
  id: ID;
  name: string;
  initials: string;
  plan: string;
};

/* ---------- AI ---------- */

export type AIScope = { kind: "workspace" | "client" | "project" | "document"; label: string };

export type AICitation = {
  id: ID;
  label: string;
  kind: "document" | "client" | "project" | "task" | "activity";
  href: string;
  detail?: string;
};

export type AIProposedAction = {
  id: ID;
  title: string;
  description: string;
  kind: "create-task" | "send-email" | "update-status" | "update-client";
  fields: { label: string; value: string }[];
  state: "pending" | "approved" | "dismissed";
};

export type AIBlock =
  | { type: "paragraph"; text: string }
  | { type: "found"; title?: string; items: string[] }
  | { type: "recommended"; title?: string; items: string[] }
  | {
      type: "status-cards";
      items: { label: string; value: string; tone: "success" | "warning" | "danger" | "info" }[];
    }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "action"; action: AIProposedAction };

export type AIMessage = {
  id: ID;
  role: "user" | "assistant";
  /** user text, or assistant plain-text fallback */
  text?: string;
  blocks?: AIBlock[];
  citations?: AICitation[];
  status?: "thinking" | "streaming" | "done" | "error" | "stopped";
  createdAt: string;
};

export type AIConversation = {
  id: ID;
  title: string;
  updatedAt: string;
  scope?: AIScope;
};

/* ---------- Documents (detail) ---------- */

export type DocumentVersion = {
  version: number;
  uploadedBy: Person;
  uploadedAt: string;
  status: DocumentStatus;
  note?: string;
};

export type DocumentPage = { number: number; heading: string; paragraphs: string[] };

/* ---------- Automations ---------- */

export type AutomationNodeKind = "trigger" | "condition" | "action" | "ai";

export type AutomationNode = {
  id: string;
  kind: AutomationNodeKind;
  /** e.g. "client.created", "task.create" */
  type: string;
  label: string;
  detail: string;
  position: { x: number; y: number };
};

export type AutomationEdge = { id: string; source: string; target: string; label?: string };

export type AutomationRunStatus = "success" | "failed" | "running" | "retrying";

export type AutomationRun = {
  id: string;
  automationId: string;
  startedAt: string;
  durationMs: number;
  status: AutomationRunStatus;
  trigger: string;
  steps: { label: string; state: "done" | "active" | "pending" | "failed"; detail?: string }[];
};

export type Automation = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  triggerLabel: string;
  triggerType: "client" | "project" | "task" | "document" | "billing";
  actionsSummary: string[];
  createdBy: Person;
  lastRun?: string;
  successCount: number;
  failureCount: number;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
};

/* ---------- Team ---------- */

export type Role = "owner" | "admin" | "manager" | "employee";

export type TeamMember = Person & {
  memberRole: Role;
  status: "active" | "invited" | "deactivated";
  activeProjects: number;
  openTasks: number;
  overdueTasks: number;
  /** 0–100+ percentage of capacity */
  workload: number;
  lastActive: string;
};

/* ---------- Billing & usage ---------- */

export type Invoice = { id: string; number: string; date: string; amount: number; status: "paid" | "open" | "failed" };

export type UsageMeterData = { id: string; label: string; used: number; limit: number; unit: string; resetsAt?: string; explanation: string };

export type Plan = {
  id: "starter" | "growth" | "scale";
  name: string;
  monthly: number;
  annual: number;
  summary: string;
  features: string[];
};

/* ---------- Settings ---------- */

export type Integration = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "error" | "available";
  connectedAt?: string;
};

export type Session = { id: string; device: string; location: string; lastActive: string; current?: boolean };

/* ---------- Invitations (shareable links) ---------- */

/** team: internal member · client: a client company's portal owner · contact: external collaborator on specific projects */
export type InviteKind = "team" | "client" | "contact";

export type InviteState = "pending" | "expired" | "accepted" | "revoked";

export type Invite = {
  token: string;
  kind: InviteKind;
  state: InviteState;
  /** The address the link was sent to; signing in with another address shows a mismatch notice */
  email: string;
  inviter: Person;
  organization: Organization;
  sentAt: string;
  expiresAt: string;
  /** team invites */
  role?: Role;
  /** client + contact invites */
  client?: Pick<Client, "id" | "name" | "initials" | "tone">;
  /** contact invites: the projects this person can see */
  projects?: { id: string; name: string }[];
  /** contact invites: what the collaborator may do */
  permissions?: string[];
  /** Optional note the inviter added */
  message?: string;
};
