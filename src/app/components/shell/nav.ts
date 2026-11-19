import {
  ArrowLeftRight,
  Brain,
  Building2,
  ChartColumnIncreasing,
  ClipboardCheck,
  CreditCardCheck,
  FileChartColumnIncreasing,
  FileText,
  FolderOpen,
  Settings,
  UserGroup,
  UserPlus,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon; badge?: string };
export type NavGroup = { label: string; items: NavItem[] };

/** Primary navigation (spec §4.1). Icons kept from the original sidebar where they existed. */
export const navGroups: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/u/dashboard", icon: ChartColumnIncreasing }] },
  {
    label: "Work",
    items: [
      { label: "AI Assistant", href: "/u/ai", icon: Brain },
      { label: "Clients", href: "/u/clients", icon: UserGroup },
      { label: "Projects", href: "/u/projects", icon: FolderOpen },
      { label: "Tasks", href: "/u/tasks", icon: ClipboardCheck, badge: "5" },
      { label: "Documents", href: "/u/documents", icon: FileText },
      { label: "Automations", href: "/u/automations", icon: Workflow },
    ],
  },
  { label: "Insights", items: [{ label: "Reports", href: "/u/reports", icon: FileChartColumnIncreasing }] },
  {
    label: "Organization",
    items: [
      { label: "Team", href: "/u/team", icon: UserPlus },
      { label: "Billing", href: "/u/billing", icon: CreditCardCheck },
      { label: "Settings", href: "/u/settings", icon: Settings },
    ],
  },
];

/** Most important destinations for the mobile bottom bar (§32) */
export const mobilePrimary = ["/u/dashboard", "/u/clients", "/u/projects", "/u/ai"];

export const allNavItems = navGroups.flatMap((g) => g.items);

/** Root hrefs like "/admin" only match exactly; others also match their sub-pages */
export const isActivePath = (pathname: string, href: string) =>
  pathname === href || (href.split("/").length > 2 && pathname.startsWith(`${href}/`));

/* ---------- Platform admin (§27) ---------- */
export const adminNavGroups: NavGroup[] = [
  { label: "Platform", items: [
    { label: "Overview", href: "/admin", icon: ChartColumnIncreasing },
    { label: "Organizations", href: "/admin/organizations", icon: Building2 },
    { label: "AI Quality", href: "/admin/ai-quality", icon: Brain },
  ] },
  { label: "Switch", items: [{ label: "Back to workspace", href: "/u/dashboard", icon: ArrowLeftRight }] },
];
export const adminMobilePrimary = ["/admin", "/admin/organizations", "/admin/ai-quality", "/u/dashboard"];

export type ShellVariant = "app" | "admin";
export const shellNav = (variant: ShellVariant) =>
  variant === "admin"
    ? { groups: adminNavGroups, mobilePrimary: adminMobilePrimary, items: adminNavGroups.flatMap((g) => g.items) }
    : { groups: navGroups, mobilePrimary, items: allNavItems };
