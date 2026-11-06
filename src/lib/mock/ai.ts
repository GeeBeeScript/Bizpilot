import type { AIBlock, AICitation, AIConversation, AIScope } from "@/types";
import { daysFromNow, hoursAgo, minutesAgo } from "@/lib/date";

export const conversations: AIConversation[] = [
  { id: "cv1", title: "What is blocking the Customer Portal?", updatedAt: minutesAgo(14), scope: { kind: "project", label: "Customer Portal" } },
  { id: "cv2", title: "Prioritize my day", updatedAt: hoursAgo(3) },
  { id: "cv3", title: "Prep for Acme escalation call", updatedAt: hoursAgo(26), scope: { kind: "client", label: "Acme Retail" } },
  { id: "cv4", title: "Summarize Security Requirements.pdf", updatedAt: daysFromNow(-3), scope: { kind: "document", label: "Security Requirements.pdf" } },
  { id: "cv5", title: "Q3 renewal risks", updatedAt: daysFromNow(-6) },
  { id: "cv6", title: "Draft Globex status update", updatedAt: daysFromNow(-12), scope: { kind: "client", label: "Globex Corporation" } },
];

export const workspaceSuggestions = [
  "What should I prioritize today?",
  "Which projects are at risk?",
  "Summarize my client relationships.",
  "Prepare me for my next client meeting.",
  "What changed in our latest documents?",
];

export const clientSuggestions = [
  "Summarize our relationship with this client.",
  "What are the current risks?",
  "Prepare me for our next meeting.",
  "What does the contract require?",
  "What changed recently?",
];

export const projectSuggestions = [
  "What is blocking this project?",
  "Summarize recent activity.",
  "Which tasks threaten the deadline?",
  "Analyze the project requirements.",
  "Draft a client-ready status update.",
];

export const aiStages = [
  "Analyzing project activity…",
  "Retrieving relevant documents…",
  "Preparing recommendations…",
];

export const businessBrief = {
  generatedAt: minutesAgo(32),
  summary:
    "Delivery is broadly healthy, but two client engagements need attention this week. Globex's Customer Portal is blocked on an external dependency and Acme's Storefront is past its checkout milestone.",
  risks: [
    { text: "Customer Portal API milestone likely to slip 4–6 days", href: "/u/projects/customer-portal" },
    { text: "Storefront Platform is 3 days overdue; budget 82% spent", href: "/u/projects/storefront" },
    { text: "Umbrella Health: no contact in 9 days, renewal in 30", href: "/u/clients/umbrella" },
  ],
  opportunities: [
    { text: "Globex CR#4 adds ~$18k in scope if approved this week", href: "/u/clients/globex" },
    { text: "Initech migration finishing early — propose phase 2", href: "/u/projects/data-migration" },
  ],
  actions: [
    "Escalate API credentials with Raj Patel (Globex IT)",
    "Schedule Umbrella check-in before Friday",
    "Re-plan Storefront checkout with Elena",
  ],
};

const citations: Record<string, AICitation> = {
  task: { id: "ci1", label: "Resolve Globex API authentication", kind: "task", href: "/u/projects/customer-portal?tab=tasks", detail: "BP-101 · Blocked" },
  doc: { id: "ci2", label: "Security Requirements.pdf", kind: "document", href: "/u/documents/d2#page-2", detail: "p. 4 · §2.3 Auth" },
  activity: { id: "ci3", label: "Priya changed health to At risk", kind: "activity", href: "/u/projects/customer-portal?tab=activity", detail: "Yesterday" },
  project: { id: "ci4", label: "Customer Portal", kind: "project", href: "/u/projects/customer-portal" },
  client: { id: "ci5", label: "Globex Corporation", kind: "client", href: "/u/clients/globex" },
};

export type MockAIResponse = { blocks: AIBlock[]; citations: AICitation[] };

/** Canned responses keyed loosely on the prompt. Replace with your streaming endpoint. */
export function mockRespond(prompt: string, scope?: AIScope): MockAIResponse {
  const q = prompt.toLowerCase();
  const where = !scope || scope.kind === "workspace" ? "the Customer Portal" : scope.label;

  if (q.includes("fail")) throw new Error("Generation failed");

  if (q.includes("block") || q.includes("threaten") || q.includes("risk")) {
    return {
      citations: [citations.task, citations.doc, citations.activity],
      blocks: [
        { type: "paragraph", text: `The main blocker in ${where} is the Globex API authentication dependency. Three downstream tasks cannot start until OAuth credentials are issued by Globex IT.` },
        {
          type: "status-cards",
          items: [
            { label: "Blocked tasks", value: "3", tone: "danger" },
            { label: "Days to deadline", value: "18", tone: "warning" },
            { label: "Progress", value: "62%", tone: "info" },
          ],
        },
        { type: "found", title: "Found in your data", items: [
          "BP-101 “Resolve Globex API authentication” has been blocked for 8 days [1]",
          "Security Requirements §2.3 requires client-credential OAuth, which only Globex IT can provision [2]",
          "Project health was changed to At risk yesterday for the same reason [3]",
        ] },
        { type: "recommended", title: "Recommended next step", items: [
          "Escalate directly to Raj Patel (IT Security Lead) with a 48h deadline",
          "Re-sequence SSO QA and contract tests behind a mocked auth service so work continues",
        ] },
        {
          type: "action",
          action: {
            id: `act-${Date.now()}`,
            kind: "create-task",
            title: "Create a high-priority task for James",
            description: "Build a mocked auth service so SSO QA and contract tests can proceed while credentials are pending.",
            fields: [
              { label: "Task", value: "Mock policy-API auth service" },
              { label: "Assignee", value: "James Okafor" },
              { label: "Priority", value: "High" },
              { label: "Due", value: "In 2 days" },
              { label: "Project", value: "Customer Portal" },
            ],
            state: "pending",
          },
        },
      ],
    };
  }

  if (q.includes("priorit") || q.includes("today")) {
    return {
      citations: [citations.task, citations.client],
      blocks: [
        { type: "paragraph", text: "You have 5 open items today. Two are client-facing and time-sensitive, so I'd start there." },
        { type: "table", columns: ["Priority", "Item", "Context", "Due"], rows: [
          ["1", "Escalation call with Acme checkout team", "Storefront Platform", "Today"],
          ["2", "Review Globex change request #4", "Customer Portal", "Today"],
          ["3", "Follow up on compliance review", "Umbrella Health", "2d overdue"],
          ["4", "Approve invoice template copy", "Nipe Corporation", "Tomorrow"],
        ] },
        { type: "recommended", title: "Recommended next step", items: ["Block 30 minutes before the Acme call to review the checkout re-plan", "Delegate the Nipe copy review to Alex"] },
      ],
    };
  }

  if (q.includes("status update") || q.includes("draft")) {
    return {
      citations: [citations.project, citations.activity],
      blocks: [
        { type: "paragraph", text: "Here's a client-ready draft. Review before sending; nothing has been sent." },
        { type: "paragraph", text: "Hi John — quick update on the Customer Portal. The claims flow beta is ready for your sign-off, and the team is at 62% overall. We're waiting on API credentials from your IT team; once received we expect to complete integration within 4 working days and still hit launch." },
        {
          type: "action",
          action: {
            id: `act-${Date.now()}`,
            kind: "send-email",
            title: "Send this update to John Smith",
            description: "Email from sarah@cornucopia.studio to john.smith@globex.com",
            fields: [
              { label: "To", value: "John Smith (Globex)" },
              { label: "Subject", value: "Customer Portal — weekly update" },
            ],
            state: "pending",
          },
        },
      ],
    };
  }

  return {
    citations: [citations.client, citations.project],
    blocks: [
      { type: "paragraph", text: `Here's a summary for ${where}. Globex is your largest active relationship ($184k), with two engagements and 18 open tasks. Sentiment is positive, but approvals are taking longer than usual.` },
      { type: "found", title: "Found in your data", items: ["2 approvals pending from Globex for more than 48h", "Renewal is in 64 days", "Last client activity was 20 minutes ago"] },
      { type: "recommended", title: "Recommended next step", items: ["Propose a standing weekly approval slot with John Smith"] },
    ],
  };
}

/** Plain text of a response, used to drive the streaming effect */
export function blocksToText(blocks: AIBlock[]) {
  return blocks
    .map((b) => {
      if (b.type === "paragraph") return b.text;
      if (b.type === "found" || b.type === "recommended") return b.items.join(" ");
      return "";
    })
    .join(" ");
}
