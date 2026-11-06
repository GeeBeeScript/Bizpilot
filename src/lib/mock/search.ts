import { clients, documents, projects, tasks } from "./workspace";
import { people } from "./people";
import { clientActivity, teamActivity } from "./activity";

export type SearchGroup = "Clients" | "People" | "Projects" | "Tasks" | "Documents" | "Notes" | "Activity";

export type SearchResult = {
  id: string;
  group: SearchGroup;
  title: string;
  parent: string;
  meta?: string;
  status?: string;
  href: string;
};

const index: SearchResult[] = [
  ...clients.map((c) => ({ id: `c-${c.id}`, group: "Clients" as const, title: c.name, parent: c.industry, meta: `${c.activeProjects} active projects`, status: c.status, href: `/u/clients/${c.id}` })),
  ...Object.values(people).map((p) => ({ id: `p-${p.id}`, group: "People" as const, title: p.name, parent: p.external ? `${p.external.company} · External` : "Internal team", meta: p.role, href: "/u/team" })),
  ...projects.map((p) => ({ id: `pr-${p.id}`, group: "Projects" as const, title: p.name, parent: p.clientName, meta: `${p.progress}% complete`, status: p.status, href: `/u/projects/${p.id}` })),
  ...tasks.map((t) => ({ id: `t-${t.id}`, group: "Tasks" as const, title: t.title, parent: `${t.clientName} / ${t.projectName}`, meta: t.key, status: t.status, href: `/u/projects/${t.projectId}?tab=tasks` })),
  ...documents.map((d) => ({ id: `d-${d.id}`, group: "Documents" as const, title: d.name, parent: [d.clientName, d.projectName].filter(Boolean).join(" / "), meta: d.size, status: d.status, href: `/u/documents/${d.id}` })),
  { id: "n-1", group: "Notes", title: "Globex: approvals are slow — agree weekly slot", parent: "Globex Corporation · Internal note", href: "/u/clients/globex?tab=notes" },
  ...[...clientActivity, ...teamActivity].map((a) => ({ id: `a-${a.id}`, group: "Activity" as const, title: `${a.actor?.name ?? "BizPilot AI"} ${a.verb} ${a.target}`, parent: a.context ?? "", href: a.href ?? "/u/dashboard" })),
];

export const recentSearches = ["Globex", "Security Requirements", "Storefront"];

export function searchAll(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .filter((r) => `${r.title} ${r.parent} ${r.meta ?? ""}`.toLowerCase().includes(q))
    .slice(0, 30);
}
