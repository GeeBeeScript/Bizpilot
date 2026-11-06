// Public-site content. Copy lives here so pages stay compositional.

export const capabilities = [
  { id: "clients", title: "Client management", body: "Every client, contact, contract and conversation in one place — with relationship health you can see at a glance.", icon: "UserGroup" },
  { id: "projects", title: "Project execution", body: "Boards, timelines and milestones that keep delivery on track, with blockers surfaced before they become escalations.", icon: "FolderKanban" },
  { id: "ai", title: "AI assistant", body: "Ask about any client or project. Answers cite your own records, and nothing changes until you approve it.", icon: "Brain" },
  { id: "documents", title: "Document intelligence", body: "Upload contracts and requirements. BizPilot extracts dates, obligations and risks and links them to the work.", icon: "FileSearch" },
  { id: "automations", title: "Automations", body: "Visual workflows for onboarding, reminders and status updates — with AI steps that still ask before acting.", icon: "Workflow" },
  { id: "reports", title: "Reports", body: "Revenue, delivery and workload in one view. Click any number to see the records behind it.", icon: "ChartColumnIncreasing" },
] as const;

export const workflowSteps = [
  { title: "Your business information", body: "Clients, projects, tasks, documents and activity." },
  { title: "Organize the work", body: "Boards, owners, deadlines and client collaboration." },
  { title: "BizPilot AI understands context", body: "Indexed records and documents, scoped by permission." },
  { title: "Insights", body: "Risks, priorities and briefs — with sources." },
  { title: "Human-approved actions", body: "Proposed tasks and emails you review before they run." },
];

export type PlanCell = string | boolean;
export const comparisonRows: { feature: string; values: [PlanCell, PlanCell, PlanCell] }[] = [
  { feature: "Team members", values: ["5", "20", "Unlimited"] },
  { feature: "Clients", values: ["25", "Unlimited", "Unlimited"] },
  { feature: "Active projects", values: ["10", "Unlimited", "Unlimited"] },
  { feature: "Storage", values: ["10 GB", "100 GB", "1 TB"] },
  { feature: "AI credits / month", values: ["1,000", "10,000", "50,000"] },
  { feature: "Document processing", values: ["100 docs / mo", "1,000 docs / mo", "Unlimited"] },
  { feature: "Automations", values: [false, "25 active", "Unlimited"] },
  { feature: "Reports", values: ["Basic", "Full", "Full + exports API"] },
  { feature: "Client portal", values: [false, true, true] },
  { feature: "Integrations", values: ["Google", "Google, Slack, Stripe", "All + custom API"] },
  { feature: "Support", values: ["Email", "Priority email", "Dedicated manager"] },
];

export const faqs = [
  { q: "Is there a free trial?", a: "Yes. Every plan starts with a 14-day trial with all Growth features. No card required." },
  { q: "What counts as an AI credit?", a: "Each AI answer, summary, classification or document analysis uses credits based on how much context it reads. Typical questions use 1–3 credits." },
  { q: "Can clients see my internal notes?", a: "Never. Client contacts only see what you explicitly share through the client portal, and every project has a client-visible preview so you can check." },
  { q: "Does the AI change things on its own?", a: "No. AI can propose tasks, emails and status changes, but every action waits for a person to approve it." },
  { q: "Can I change plans later?", a: "Anytime. Upgrades apply immediately with prorated billing; downgrades apply at your next renewal." },
  { q: "Where is my data stored?", a: "In encrypted storage in the region you choose at signup (EU or US). You can export everything at any time from Settings → Data." },
];
