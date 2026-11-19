import type { Invite } from "@/types";
import { daysFromNow, hoursAgo } from "@/lib/date";
import { currentOrg, people as p } from "./people";

/** Shareable invitation links, one per kind. Demo other states with `?state=expired|accepted|revoked`. */
export const invites: Invite[] = [
  {
    token: "team-7f3k2",
    kind: "team",
    state: "pending",
    email: "nia@cornucopia.studio",
    inviter: p.sarah,
    organization: currentOrg,
    role: "manager",
    sentAt: hoursAgo(5),
    expiresAt: daysFromNow(6),
    message: "Welcome aboard, Nia! You'll be running the Umbrella Health and Nipe accounts with Maya.",
  },
  {
    token: "client-globex",
    kind: "client",
    state: "pending",
    email: "linda.park@globex.com",
    inviter: p.maya,
    organization: currentOrg,
    client: { id: "globex", name: "Globex Corporation", initials: "GC", tone: "blue" },
    sentAt: hoursAgo(26),
    expiresAt: daysFromNow(13),
    message: "Your portal is ready. You'll find the Customer Portal plan, shared documents and anything waiting for your sign-off.",
  },
  {
    token: "contact-umbrella",
    kind: "contact",
    state: "pending",
    email: "r.adeyemi@umbrellahealth.org",
    inviter: p.priya,
    organization: currentOrg,
    client: { id: "umbrella", name: "Umbrella Health", initials: "UH", tone: "gold" },
    projects: [{ id: "patient-intake", name: "Patient Intake Redesign" }],
    permissions: ["View the project and its milestones", "View shared documents", "Comment on tasks and documents", "Upload documents", "Approve deliverables"],
    sentAt: hoursAgo(3),
    expiresAt: daysFromNow(7),
  },
];

export const getInvite = (token: string) => invites.find((i) => i.token === token);
