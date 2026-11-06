import type { Organization, Person } from "@/types";

export const currentUser: Person = {
  id: "u-sarah",
  name: "Sarah Chen",
  initials: "SC",
  email: "sarah@cornucopia.studio",
  role: "Operations Lead",
  online: true,
};

export const currentOrg: Organization = {
  id: "org-cornucopia",
  name: "The Cornucopia",
  initials: "TC",
  plan: "Growth",
};

export const organizations: Organization[] = [
  currentOrg,
  { id: "org-labs", name: "Cornucopia Labs", initials: "CL", plan: "Starter" },
];

export const people: Record<string, Person> = {
  sarah: currentUser,
  james: { id: "u-james", name: "James Okafor", initials: "JO", role: "Lead Engineer", email: "james@cornucopia.studio", online: true },
  priya: { id: "u-priya", name: "Priya Nair", initials: "PN", role: "Project Manager", email: "priya@cornucopia.studio", online: true },
  alex: { id: "u-alex", name: "Alex Morgan", initials: "AM", role: "Product Designer", email: "alex@cornucopia.studio" },
  maya: { id: "u-maya", name: "Maya Lopez", initials: "ML", role: "Account Manager", email: "maya@cornucopia.studio", online: true },
  daniel: { id: "u-daniel", name: "Daniel Pim", initials: "DP", role: "Backend Engineer", email: "daniel@cornucopia.studio" },
  tom: { id: "u-tom", name: "Tom Becker", initials: "TB", role: "QA Engineer", email: "tom@cornucopia.studio" },
  // External collaborators
  john: { id: "x-john", name: "John Smith", initials: "JS", role: "Product Owner", email: "john.smith@globex.com", external: { company: "Globex Corporation" } },
  elena: { id: "x-elena", name: "Elena Rossi", initials: "ER", role: "Head of Digital", email: "elena@acmeretail.com", external: { company: "Acme Retail" } },
  david: { id: "x-david", name: "David Pen", initials: "DP", role: "Finance Director", email: "d.pen@nipe.co", external: { company: "Nipe Corporation" } },
  linda: { id: "x-linda", name: "Linda Park", initials: "LP", role: "VP Operations", email: "l.park@globex.com", external: { company: "Globex Corporation" } },
  raj: { id: "x-raj", name: "Raj Patel", initials: "RP", role: "IT Security Lead", email: "raj.patel@globex.com", external: { company: "Globex Corporation" } },
  marco: { id: "x-marco", name: "Marco Silva", initials: "MS", role: "E-commerce Lead", email: "marco@acmeretail.com", external: { company: "Acme Retail" } },
  ana: { id: "x-ana", name: "Ana Gale", initials: "AG", role: "COO", email: "ana@galelogistics.com", external: { company: "Gale Logistics" } },
  grace: { id: "x-grace", name: "Grace Obi", initials: "GO", role: "Logistics Manager", email: "g.obi@nipe.co", external: { company: "Nipe Corporation" } },
};
