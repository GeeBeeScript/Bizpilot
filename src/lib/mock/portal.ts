import { daysFromNow, hoursAgo, minutesAgo } from "@/lib/date";
import { people as p } from "./people";
import { documents, projects } from "./workspace";
import type { ActivityItem } from "@/types";

/** The signed-in client contact and what they're allowed to see */
export const portalViewer = { person: p.john, clientId: "globex", clientName: "Globex Corporation", provider: "The Cornucopia" };

export type Deliverable = {
  id: string;
  projectId: string;
  name: string;
  kind: "pdf" | "image" | "docx";
  version: number;
  submittedAt: string;
  submittedBy: string;
  note: string;
  status: "awaiting" | "approved" | "changes-requested";
  dueBy?: string;
};

export const deliverables: Deliverable[] = [
  { id: "dv1", projectId: "customer-portal", name: "Claims flow beta — build v0.9", kind: "pdf", version: 2, submittedAt: daysFromNow(-2), submittedBy: "Priya Nair", note: "Includes the claim status timeline and document upload. Test accounts are in the release notes.", status: "awaiting", dueBy: daysFromNow(1) },
  { id: "dv2", projectId: "customer-portal", name: "Change Request 4 — scope & cost", kind: "pdf", version: 1, submittedAt: hoursAgo(4), submittedBy: "Sarah Chen", note: "Adds the claims appeal flow. +$18,400, +9 working days.", status: "awaiting", dueBy: daysFromNow(3) },
  { id: "dv3", projectId: "customer-portal", name: "Discovery & UX sign-off pack", kind: "pdf", version: 3, submittedAt: daysFromNow(-31), submittedBy: "Alex Morgan", note: "Final journeys and wireframes.", status: "approved" },
  { id: "dv4", projectId: "claims-api", name: "API contract draft", kind: "docx", version: 1, submittedAt: daysFromNow(-6), submittedBy: "James Okafor", note: "Endpoints for claims submission and status.", status: "changes-requested" },
];

export const portalProjects = projects.filter((pr) => pr.clientId === "globex" && pr.clientCollaboration);
export const portalDocuments = documents.filter((d) => d.clientName === "Globex Corporation" && d.clientVisible);

/** Only client-visible activity */
export const portalActivity: ActivityItem[] = [
  { id: "pa1", actor: p.priya, verb: "submitted for your approval", target: "Claims flow beta — build v0.9", timestamp: daysFromNow(-2), context: "Customer Portal", kind: "approval" },
  { id: "pa2", actor: p.sarah, verb: "shared", target: "Change Request 4 — scope & cost", timestamp: hoursAgo(4), context: "Customer Portal", kind: "upload" },
  { id: "pa3", actor: p.john, verb: "uploaded", target: "Security Requirements.pdf", timestamp: hoursAgo(9), context: "Customer Portal", kind: "upload" },
  { id: "pa4", actor: p.priya, verb: "completed milestone", target: "Discovery & UX sign-off", timestamp: daysFromNow(-30), context: "Customer Portal", kind: "complete" },
];

export type PortalMessage = { id: string; author: typeof p.john; text: string; at: string };
export const portalMessages: Record<string, PortalMessage[]> = {
  "customer-portal": [
    { id: "m1", author: p.priya, text: "Hi John — the claims flow beta is ready for review. Test accounts are in the release notes.", at: daysFromNow(-2) },
    { id: "m2", author: p.john, text: "Thanks Priya. I'll get Linda's sign-off on CR4 this week.", at: hoursAgo(20) },
    { id: "m3", author: p.priya, text: "Great. We're still waiting on the API credentials from Raj — any update?", at: minutesAgo(90) },
  ],
  "claims-api": [{ id: "m4", author: p.james, text: "Updated the contract draft per your comments; one open question on pagination.", at: daysFromNow(-1) }],
};
