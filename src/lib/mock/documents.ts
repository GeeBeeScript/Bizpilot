import type { DocumentPage, DocumentVersion } from "@/types";
import { daysFromNow, hoursAgo } from "@/lib/date";
import { documents } from "./workspace";
import { people as p } from "./people";

export const getDocument = (id: string) => documents.find((d) => d.id === id);

const securityPages: DocumentPage[] = [
  { number: 1, heading: "1. Purpose and scope", paragraphs: [
    "This document defines the security requirements for the Globex Customer Portal, a self-service web application giving policyholders access to claims and policy documents.",
    "The requirements apply to all components delivered by the vendor, including the web front end, the integration middleware and any supporting infrastructure.",
  ] },
  { number: 2, heading: "2. Identity and access", paragraphs: [
    "2.1 End users authenticate through Globex SSO (OpenID Connect). Sessions expire after 30 minutes of inactivity.",
    "2.2 Administrative access requires multi-factor authentication and is restricted to named individuals.",
    "2.3 Service-to-service calls to the Policy API must use OAuth 2.0 client credentials issued by Globex IT. Tokens expire after 60 minutes and must not be stored in client-side code.",
  ] },
  { number: 3, heading: "3. Data protection", paragraphs: [
    "3.1 Personal data is encrypted in transit (TLS 1.2+) and at rest (AES-256).",
    "3.2 Policy documents are served through time-limited signed URLs valid for no more than 15 minutes.",
    "3.3 Data must remain within the EU region.",
  ] },
  { number: 4, heading: "4. Logging and monitoring", paragraphs: [
    "4.1 All requests carry a correlation ID propagated to downstream services.",
    "4.2 Security events are retained for 12 months and forwarded to the Globex SIEM within 5 minutes.",
  ] },
  { number: 5, heading: "5. Testing and acceptance", paragraphs: [
    "5.1 An independent penetration test must be completed no later than 10 working days before go-live.",
    "5.2 All critical and high findings must be resolved before UAT sign-off. Medium findings require a remediation plan.",
  ] },
];

const genericPages = (name: string): DocumentPage[] => [
  { number: 1, heading: name.replace(/\.\w+$/, ""), paragraphs: ["Summary and context for this document.", "Prepared for internal and client review."] },
  { number: 2, heading: "Details", paragraphs: ["Scope, assumptions and responsibilities of each party.", "Key dates and acceptance criteria are listed in the appendix."] },
  { number: 3, heading: "Appendix", paragraphs: ["Contacts, references and change history."] },
];

export const documentPages = (id: string): DocumentPage[] => {
  const d = getDocument(id);
  if (!d) return [];
  return id === "d2" ? securityPages : genericPages(d.name);
};

export const documentVersions = (id: string): DocumentVersion[] => {
  const d = getDocument(id);
  if (!d) return [];
  return [
    { version: 3, uploadedBy: d.uploadedBy, uploadedAt: d.uploadedAt, status: d.status, note: "Current version" },
    { version: 2, uploadedBy: p.priya, uploadedAt: daysFromNow(-6), status: "ready", note: "Updated auth section" },
    { version: 1, uploadedBy: p.john, uploadedAt: daysFromNow(-20), status: "ready", note: "Initial upload" },
  ];
};

export const documentActivity = (id: string) => [
  { id: `${id}-a1`, actor: p.john, verb: "uploaded", target: "a new version", timestamp: hoursAgo(9), kind: "upload" as const },
  { id: `${id}-a2`, actor: null, verb: "indexed", target: "this document for AI", timestamp: hoursAgo(8), kind: "ai" as const },
  { id: `${id}-a3`, actor: p.james, verb: "commented on", target: "§2.3 Service-to-service auth", timestamp: hoursAgo(6), kind: "comment" as const },
];
