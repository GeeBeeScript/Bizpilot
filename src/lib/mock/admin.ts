import { daysFromNow, hoursAgo, minutesAgo } from "@/lib/date";
import type { ActivityItem } from "@/types";

export type AdminOrg = {
  id: string;
  name: string;
  initials: string;
  tone: "blue" | "gold" | "emerald" | "sapphire" | "amber" | "crimson";
  owner: string;
  ownerEmail: string;
  plan: "Starter" | "Growth" | "Scale";
  users: number;
  createdAt: string;
  status: "active" | "trial" | "past-due" | "cancelled";
  aiUsedPct: number;
  storageGb: number;
  mrr: number;
};

export const adminOrgs: AdminOrg[] = [
  { id: "cornucopia", name: "The Cornucopia", initials: "TC", tone: "gold", owner: "Sarah Chen", ownerEmail: "sarah@cornucopia.studio", plan: "Growth", users: 8, createdAt: daysFromNow(-210), status: "active", aiUsedPct: 68, storageGb: 41, mrr: 99 },
  { id: "northwind", name: "Northwind Digital", initials: "ND", tone: "blue", owner: "Lena Ford", ownerEmail: "lena@northwind.dev", plan: "Scale", users: 46, createdAt: daysFromNow(-400), status: "active", aiUsedPct: 81, storageGb: 512, mrr: 249 },
  { id: "brightpath", name: "Brightpath Consulting", initials: "BC", tone: "emerald", owner: "Omar Haddad", ownerEmail: "omar@brightpath.co", plan: "Growth", users: 14, createdAt: daysFromNow(-90), status: "past-due", aiUsedPct: 42, storageGb: 22, mrr: 99 },
  { id: "kite", name: "Kite & Co Recruiting", initials: "KC", tone: "amber", owner: "Ama Mensah", ownerEmail: "ama@kiteco.io", plan: "Starter", users: 4, createdAt: daysFromNow(-12), status: "trial", aiUsedPct: 15, storageGb: 2, mrr: 0 },
  { id: "orbit", name: "Orbit IT Services", initials: "OI", tone: "sapphire", owner: "Hiro Tanaka", ownerEmail: "hiro@orbit-it.com", plan: "Growth", users: 19, createdAt: daysFromNow(-160), status: "active", aiUsedPct: 97, storageGb: 88, mrr: 99 },
  { id: "loom", name: "Loom & Loft Studio", initials: "LL", tone: "crimson", owner: "Iris Dahl", ownerEmail: "iris@loomloft.design", plan: "Starter", users: 3, createdAt: daysFromNow(-320), status: "cancelled", aiUsedPct: 0, storageGb: 4, mrr: 0 },
];

export const platformKpis = { organizations: 1284, activeUsers: 9420, mrr: 118400, aiGenerations: 412300, estimatedAiCost: 3184, storageTb: 18.6 };

export const mrrTrend = [
  { month: "Nov", mrr: 71200 }, { month: "Dec", mrr: 75900 }, { month: "Jan", mrr: 79400 }, { month: "Feb", mrr: 83100 },
  { month: "Mar", mrr: 88600 }, { month: "Apr", mrr: 92200 }, { month: "May", mrr: 96800 }, { month: "Jun", mrr: 101500 },
  { month: "Jul", mrr: 104900 }, { month: "Aug", mrr: 109300 }, { month: "Sep", mrr: 113800 }, { month: "Oct", mrr: 118400 },
];

export const aiDaily = [
  { day: "Oct 1", generations: 12100 }, { day: "Oct 2", generations: 13400 }, { day: "Oct 3", generations: 12900 }, { day: "Oct 4", generations: 9800 },
  { day: "Oct 5", generations: 9200 }, { day: "Oct 6", generations: 14100 }, { day: "Oct 7", generations: 15200 }, { day: "Oct 8", generations: 14800 },
  { day: "Oct 9", generations: 15900 }, { day: "Oct 10", generations: 16300 }, { day: "Oct 11", generations: 11200 }, { day: "Oct 12", generations: 10400 },
];

export const orgActivity: ActivityItem[] = [
  { id: "oa1", actor: null, verb: "flagged high AI usage for", target: "Orbit IT Services", timestamp: minutesAgo(18), context: "97% of monthly credits", kind: "alert", href: "/admin/organizations/orbit" },
  { id: "oa2", actor: { id: "x-lena", name: "Lena Ford", initials: "LF" }, verb: "upgraded to", target: "Scale", timestamp: hoursAgo(3), context: "Northwind Digital", kind: "update", href: "/admin/organizations/northwind" },
  { id: "oa3", actor: { id: "x-ama", name: "Ama Mensah", initials: "AM" }, verb: "started a trial for", target: "Kite & Co Recruiting", timestamp: daysFromNow(-1), kind: "create", href: "/admin/organizations/kite" },
];

export const recentSignups = adminOrgs.filter((o) => (Date.now() - new Date(o.createdAt).getTime()) / 86_400_000 < 100).slice(0, 4);

export const subscriptionEvents = [
  { id: "se1", org: "Northwind Digital", event: "Upgraded Growth → Scale", at: hoursAgo(3), tone: "success" as const },
  { id: "se2", org: "Brightpath Consulting", event: "Payment failed (card declined)", at: hoursAgo(9), tone: "danger" as const },
  { id: "se3", org: "Loom & Loft Studio", event: "Cancelled subscription", at: daysFromNow(-4), tone: "neutral" as const },
  { id: "se4", org: "Kite & Co Recruiting", event: "Trial started", at: daysFromNow(-1), tone: "info" as const },
];

export const aiHealth = [
  { id: "h1", label: "Answer latency (p95)", value: "3.4s", status: "ok" as const },
  { id: "h2", label: "Document processing queue", value: "214 jobs", status: "warn" as const },
  { id: "h3", label: "Indexing error rate", value: "0.8%", status: "ok" as const },
  { id: "h4", label: "Model provider status", value: "Operational", status: "ok" as const },
];

export const failedOps = [
  { id: "fo1", op: "Webhook delivery · Slack", org: "The Cornucopia", error: "429 rate limited", at: hoursAgo(7) },
  { id: "fo2", op: "Document OCR", org: "Orbit IT Services", error: "Timeout after 120s (scanned PDF, 312 pages)", at: hoursAgo(2) },
  { id: "fo3", op: "Invoice sync · Stripe", org: "Brightpath Consulting", error: "card_declined", at: hoursAgo(9) },
];

export type Generation = {
  id: string;
  feature: "Chat" | "Document summary" | "Business brief" | "Email draft" | "Classification";
  model: string;
  org: string;
  user: string;
  at: string;
  latencyMs: number;
  tokens: number;
  cost: number;
  outcome: "accepted" | "edited" | "rejected" | "failed";
  request: string;
  context: string[];
  response: string;
  feedback?: string;
};

export const generations: Generation[] = [
  { id: "g1", feature: "Chat", model: "claude-sonnet-5-5", org: "The Cornucopia", user: "Sarah Chen", at: minutesAgo(14), latencyMs: 2840, tokens: 6120, cost: 0.031, outcome: "accepted", request: "What is blocking the Customer Portal?", context: ["Task BP-101", "Security Requirements.pdf §2.3", "Project activity (7 days)"], response: "The main blocker is the Globex API authentication dependency…", feedback: "👍 Helpful" },
  { id: "g2", feature: "Business brief", model: "claude-sonnet-5-5", org: "Northwind Digital", user: "Scheduled", at: hoursAgo(1), latencyMs: 7420, tokens: 18400, cost: 0.094, outcome: "edited", request: "Daily business brief", context: ["42 projects", "118 tasks changed", "6 client signals"], response: "Delivery is healthy across 38 of 42 projects…", feedback: "Edited risks section" },
  { id: "g3", feature: "Document summary", model: "claude-haiku-5-5", org: "Orbit IT Services", user: "Hiro Tanaka", at: hoursAgo(2), latencyMs: 120000, tokens: 0, cost: 0, outcome: "failed", request: "Summarize Network Audit 2026.pdf", context: ["Network Audit 2026.pdf (312 pages)"], response: "—" },
  { id: "g4", feature: "Email draft", model: "claude-sonnet-5-5", org: "The Cornucopia", user: "Priya Nair", at: hoursAgo(5), latencyMs: 3100, tokens: 4200, cost: 0.021, outcome: "rejected", request: "Draft a client-ready status update", context: ["Customer Portal milestones", "Recent activity"], response: "Hi John — the claims flow beta is ready…", feedback: "👎 Tone too formal" },
  { id: "g5", feature: "Classification", model: "claude-haiku-5-5", org: "Brightpath Consulting", user: "Automation", at: hoursAgo(6), latencyMs: 640, tokens: 900, cost: 0.001, outcome: "accepted", request: "Classify uploaded document", context: ["SOW - Q4.pdf"], response: "Contract (confidence 0.94)" },
  { id: "g6", feature: "Chat", model: "claude-opus-5-5", org: "Northwind Digital", user: "Lena Ford", at: hoursAgo(8), latencyMs: 5200, tokens: 9800, cost: 0.12, outcome: "accepted", request: "Which clients are at risk of churn this quarter?", context: ["CRM health scores", "Activity (90 days)"], response: "Three clients show declining engagement…" },
];

export const aiQualityKpis = { total: 412300, accepted: 71, edited: 18, rejected: 7, avgLatency: "2.9s", estimatedCost: 3184 };

export const getAdminOrg = (id: string) => adminOrgs.find((o) => o.id === id);
