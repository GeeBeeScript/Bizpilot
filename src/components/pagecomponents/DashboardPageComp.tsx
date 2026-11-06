"use client";

import React, { useMemo, useState } from "react";
import DashboardHeader from "../elements/dashboard/DashboardHeader";
import DashboardGrid, { type GridModule } from "../elements/dashboard/DashboardGrid";
import DashKpiRow from "../elements/dashboard/DashKpiRow";
import QuickActions from "../elements/dashboard/QuickActions";
import NeedsAttentionSection from "../elements/dashboard/NeedsAttentionSection";
import DashAIInsights from "../elements/dashboard/DashAIInsights";
import ProjectHealthSection from "../elements/dashboard/ProjectHealthSection";
import TodaysWorkSection from "../elements/dashboard/TodaysWorkSection";
import UpcomingDeadlines from "../elements/dashboard/UpcomingDeadlines";
import DashClientActivity, { type ClientRef } from "../elements/dashboard/DashClientActivity";
import TeamActivity from "../elements/dashboard/TeamActivity";
import RecentDocuments from "../elements/dashboard/RecentDocuments";
import AutomationStatus from "../elements/dashboard/AutomationStatus";
import { PageContainer } from "../generalUIcomp/PageHeader";
import { SectionCard } from "../generalUIcomp/SectionCard";
import { ErrorState } from "../generalUIcomp/States";
import { SkeletonCard, SkeletonMetricRow } from "../loaders/Loaders";
import { Workflow } from "lucide-react";
import { notify } from "@/lib/notify";
import { useLocalStorage } from "@/lib/hooks";
import type { businessBrief } from "@/lib/mock/ai";
import type {
  ActivityItem,
  AttentionItem,
  AutomationSummary,
  Deadline,
  DocumentItem,
  Kpi,
  Person,
  Project,
  Task,
} from "@/types";

export type DashboardData = {
  user: Person;
  kpis: Kpi[];
  attention: AttentionItem[];
  brief: typeof businessBrief | null;
  projects: Project[];
  myTasks: Task[];
  deadlines: Deadline[];
  clientActivity: ActivityItem[];
  clients: ClientRef[];
  teamActivity: ActivityItem[];
  documents: DocumentItem[];
  automation: AutomationSummary;
};

/** ?state=loading | error demonstrates page loading and partial module failure */
export type DemoState = "loading" | "error" | "empty" | undefined;

const DEFAULT_ORDER = [
  "kpis",
  "quick-actions",
  "attention",
  "ai-brief",
  "project-health",
  "todays-work",
  "deadlines",
  "client-activity",
  "team-activity",
  "documents",
  "automation",
];

const DashboardPageComp = ({ data, demo }: { data: DashboardData; demo?: DemoState }) => {
  // Per-user layout, persisted locally (swap for a user-preferences API when available)
  const [saved, save] = useLocalStorage(`bp.dashboard.layout.${data.user.id}`);
  const { order, hidden } = useMemo(() => {
    try {
      const parsed = JSON.parse(saved ?? "null");
      if (parsed?.order) {
        // Keep any modules added since the layout was saved
        return { order: [...parsed.order, ...DEFAULT_ORDER.filter((m) => !parsed.order.includes(m))] as string[], hidden: (parsed.hidden ?? []) as string[] };
      }
    } catch {}
    return { order: DEFAULT_ORDER, hidden: [] as string[] };
  }, [saved]);
  const [customizing, setCustomizing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const loading = demo === "loading";

  const persist = (o: string[], h: string[]) => save(JSON.stringify({ order: o, hidden: h }));

  const skeleton = (lines = 4) => <SkeletonCard lines={lines} className="h-full" />;

  const modules: GridModule[] = [
    { id: "kpis", title: "Business overview", span: "md:col-span-6 xl:col-span-12", content: loading ? <SkeletonMetricRow /> : <DashKpiRow kpis={data.kpis} /> },
    { id: "quick-actions", title: "Quick actions", span: "md:col-span-6 xl:col-span-12", content: <QuickActions /> },
    { id: "attention", title: "Needs attention", span: "md:col-span-6 xl:col-span-8", content: loading ? skeleton(6) : <NeedsAttentionSection items={data.attention} /> },
    { id: "ai-brief", title: "AI business brief", span: "md:col-span-6 xl:col-span-4", content: <DashAIInsights brief={data.brief} loading={loading} /> },
    { id: "project-health", title: "Project health", span: "md:col-span-6 xl:col-span-8", content: loading ? skeleton(6) : <ProjectHealthSection projects={data.projects} /> },
    { id: "todays-work", title: "Today's work", span: "md:col-span-6 xl:col-span-4", content: loading ? skeleton(5) : <TodaysWorkSection tasks={data.myTasks} /> },
    { id: "deadlines", title: "Upcoming deadlines", span: "md:col-span-6 xl:col-span-4", content: loading ? skeleton() : <UpcomingDeadlines items={data.deadlines} /> },
    { id: "client-activity", title: "Client activity", span: "md:col-span-3 xl:col-span-4", content: loading ? skeleton() : <DashClientActivity items={data.clientActivity} clients={data.clients} /> },
    { id: "team-activity", title: "Team activity", span: "md:col-span-3 xl:col-span-4", content: loading ? skeleton() : <TeamActivity items={data.teamActivity} /> },
    { id: "documents", title: "Recent documents", span: "md:col-span-6 xl:col-span-8", content: loading ? skeleton() : <RecentDocuments items={data.documents} /> },
    {
      id: "automation",
      title: "Automations",
      span: "md:col-span-6 xl:col-span-4",
      content: loading ? (
        skeleton()
      ) : demo === "error" && !retrying ? (
        // Partial failure: only this module fails (§7)
        <SectionCard title="Automations" icon={Workflow} className="h-full">
          <ErrorState compact title="Automation status unavailable" description="We couldn&apos;t reach the automation service." reference="ERR-AUT-503" onRetry={() => setRetrying(true)} />
        </SectionCard>
      ) : (
        <AutomationStatus summary={data.automation} />
      ),
    },
  ];

  const overdue = data.myTasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const atRisk = data.projects.filter((p) => p.health !== "on-track").length;

  return (
    <PageContainer className="space-y-5 font-open-sans">
      <DashboardHeader
        firstName={data.user.name.split(" ")[0]}
        summary={
          data.attention.length + data.projects.length + data.myTasks.length === 0 ? (
            <>Welcome to BizPilot. Start by adding your first client, then create a project.</>
          ) : (
          <>
            <span className="font-medium text-foreground">{data.attention.length} items</span> need attention ·{" "}
            <span className="font-medium text-warning">{atRisk} projects</span> at risk ·{" "}
            <span className="font-medium text-danger">{overdue} of your tasks</span> overdue
          </>
          )
        }
        customizing={customizing}
        onCustomize={() => setCustomizing((c) => !c)}
      />
      <DashboardGrid
        modules={modules}
        order={order}
        hidden={hidden}
        customizing={customizing}
        onOrderChange={(o) => {
          const prev = order;
          persist(o, hidden);
          notify.success("Layout updated", { onUndo: () => persist(prev, hidden) });
        }}
        onHiddenChange={(h) => persist(order, h)}
        onReset={() => {
          persist(DEFAULT_ORDER, []);
          notify.info("Dashboard restored to the default layout");
        }}
        onDone={() => setCustomizing(false)}
      />
    </PageContainer>
  );
};

export default DashboardPageComp;
