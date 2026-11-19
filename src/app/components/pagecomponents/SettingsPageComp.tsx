"use client";

import {
  Bell,
  BrainCircuit,
  Building2,
  Database,
  Plug,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
} from "@/app/components/generalUIcomp/PageHeader";
import {
  AISettings,
  DataSettings,
  GeneralSettings,
  IntegrationSettings,
  NotificationSettings,
  PermissionSettings,
  ProfileSettings,
  SecuritySettings,
} from "@/app/components/elements/settings/SettingsSections";
import { useTabParam } from "@/lib/useTabParam";
import { cn } from "@/lib/utils";
import type { Integration, Session } from "@/types";

const sections: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "General", icon: Building2 },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "team", label: "Team & Permissions", icon: UsersRound },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI", icon: BrainCircuit },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "data", label: "Data", icon: Database },
];

type PermRow = {
  feature: string;
  owner: boolean;
  admin: boolean;
  manager: boolean;
  employee: boolean | "own";
  note?: string;
};
type Props = {
  initialSection?: string;
  permissions: PermRow[];
  sessions: Session[];
  events: { id: string; event: string; detail: string; at: string }[];
  integrations: Integration[];
  credits: { used: number; limit: number; resetsAt?: string };
};

/** Settings with secondary navigation (§23). Section is mirrored to ?tab= */
const SettingsPageComp = ({
  initialSection,
  permissions,
  sessions,
  events,
  integrations,
  credits,
}: Props) => {
  const [section, setSection] = useTabParam(
    sections.some((s) => s.id === initialSection) ? initialSection! : "general",
  );

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Settings"
        description="Organization, account and workspace preferences."
      />
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="lg:sticky lg:top-[calc(var(--topbar-h)+1.5rem)] lg:self-start"
        >
          <ul className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <button
                  onClick={() => setSection(s.id)}
                  aria-current={section === s.id ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left font-nav text-sm whitespace-nowrap transition-colors duration-150",
                    section === s.id
                      ? "bg-primary/10 font-medium text-primary dark:text-info"
                      : "text-foreground hover:bg-muted/60",
                  )}
                >
                  <s.icon className="size-4" aria-hidden /> {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div
          key={section}
          className="max-w-4xl animate-in fade-in-0 duration-200"
        >
          {section === "general" && <GeneralSettings />}
          {section === "profile" && <ProfileSettings />}
          {section === "team" && (
            <PermissionSettings permissions={permissions} />
          )}
          {section === "security" && (
            <SecuritySettings sessions={sessions} events={events} />
          )}
          {section === "notifications" && <NotificationSettings />}
          {section === "ai" && <AISettings credits={credits} />}
          {section === "integrations" && (
            <IntegrationSettings integrations={integrations} />
          )}
          {section === "data" && <DataSettings />}
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPageComp;
