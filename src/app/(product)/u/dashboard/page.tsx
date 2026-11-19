import DashboardPageComp, {
  type DemoState,
} from "@/app/components/pagecomponents/DashboardPageComp";
import { currentUser } from "@/lib/mock/people";
import {
  clients,
  projects,
  documents,
  tasksForUser,
} from "@/lib/mock/workspace";
import {
  attentionItems,
  automationSummary,
  clientActivity,
  deadlines,
  kpis,
  teamActivity,
} from "@/lib/mock/activity";
import { businessBrief } from "@/lib/mock/ai";
import React from "react";

export const metadata = { title: "Dashboard" };

const DashboardPage = async ({ searchParams }: PageProps<"/u/dashboard">) => {
  const { state } = await searchParams;
  // Replace the mock imports with your data fetching; shapes are defined in src/types
  const data = {
    user: currentUser,
    kpis,
    attention: attentionItems,
    brief: businessBrief,
    projects: projects.filter((p) => p.status !== "completed").slice(0, 6),
    myTasks: tasksForUser(currentUser.id),
    deadlines,
    clientActivity,
    clients: clients.map(({ id, name, initials, tone }) => ({
      id,
      name,
      initials,
      tone,
    })),
    teamActivity,
    documents: documents.slice(0, 5),
    automation: automationSummary,
  };
  // ?state=empty previews a brand-new workspace
  const empty =
    state === "empty"
      ? {
          ...data,
          kpis: kpis.map((k) => ({
            ...k,
            value: k.id === "revenue" ? "$0" : k.id === "ai" ? "0%" : "0",
            delta: "No data yet",
            trend: "flat" as const,
            sentiment: "neutral" as const,
          })),
          attention: [],
          brief: null,
          projects: [],
          myTasks: [],
          deadlines: [],
          clientActivity: [],
          teamActivity: [],
          documents: [],
          automation: {
            active: 0,
            failedRuns: 0,
            awaitingRetry: 0,
            lastSuccess: new Date().toISOString(),
            recent: [],
          },
        }
      : data;
  return <DashboardPageComp data={empty} demo={state as DemoState} />;
};

export default DashboardPage;
