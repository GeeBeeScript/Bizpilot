"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  Calendar,
  ChevronDown,
  CircleGauge,
  DollarSign,
  Download,
  FolderCheck,
  Sparkles,
  TrendingUp,
  UserGroup,
  UsersRound,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  PageContainer,
  PageHeader,
} from "@/app/components/generalUIcomp/PageHeader";
import {
  FilterToolbar,
  type FilterValues,
} from "@/app/components/generalUIcomp/FilterToolbar";
import { SectionCard } from "@/app/components/generalUIcomp/SectionCard";
import { MetricCard } from "@/app/components/generalUIcomp/MetricCard";
import { SidePanel } from "@/app/components/generalUIcomp/SidePanel";
import { ProgressBar } from "@/app/components/generalUIcomp/ProgressBar";
import { AILoader } from "@/app/components/loaders/AILoader";
import { AIBlocks } from "@/app/components/elements/ai/AIBlocks";
import { AIGeneratedLabel } from "@/app/components/elements/ai/AIMark";
import {
  ChartFrame,
  ColumnChart,
  RankedBars,
  TrendChart,
  compact,
  money,
} from "@/app/components/elements/reports/Charts";
import { notify } from "@/lib/notify";
import type * as R from "@/lib/mock/reports";

type Props = {
  revenueTrend: typeof R.revenueTrend;
  revenueByClient: typeof R.revenueByClient;
  revenueByProject: typeof R.revenueByProject;
  clientStats: typeof R.clientStats;
  newClientsByMonth: typeof R.newClientsByMonth;
  projectBudgets: typeof R.projectBudgets;
  projectStats: typeof R.projectStats;
  teamWorkload: typeof R.teamWorkload;
  aiGenerationsByWeek: typeof R.aiGenerationsByWeek;
  aiStats: typeof R.aiStats;
};

const ranges = [
  "Last 30 days",
  "This quarter",
  "Last 12 months",
  "Year to date",
];
const sectionLinks = [
  { id: "revenue", label: "Revenue" },
  { id: "clients", label: "Clients" },
  { id: "projects", label: "Projects" },
  { id: "team", label: "Team" },
  { id: "ai", label: "AI usage" },
];

/** Reports (§19). Unlike the Dashboard, charts belong here. Every major value drills down. */
const ReportsPageComp = (d: Props) => {
  const [range, setRange] = useState("Last 12 months");
  const [filters, setFilters] = useState<FilterValues>({});
  const [analysis, setAnalysis] = useState<"closed" | "loading" | "done">(
    "closed",
  );

  const analyze = () => {
    setAnalysis("loading");
    setTimeout(() => setAnalysis("done"), 2800);
  };

  const totalRevenue = d.revenueTrend.reduce((s, r) => s + r.revenue, 0);
  const last = d.revenueTrend[d.revenueTrend.length - 1].revenue;
  const prev = d.revenueTrend[d.revenueTrend.length - 2].revenue;

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Reports"
        description="Revenue, clients, delivery, team and AI usage. Click any figure to see the records behind it."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                notify.success("Export started", {
                  description: `${range} · CSV + PDF`,
                })
              }
            >
              <Download /> Export
            </Button>
            <Button
              onClick={analyze}
              className="bg-linear-to-r from-primary-blue to-deep-sapphire text-white"
            >
              <BrainCircuit className="text-primary-gold" /> Analyze this report
              with AI
            </Button>
          </>
        }
      />

      <FilterToolbar
        values={filters}
        onValuesChange={setFilters}
        filters={[
          {
            id: "client",
            label: "Client",
            options: d.revenueByClient.map((c) => ({
              value: c.id,
              label: c.name,
            })),
          },
          {
            id: "project",
            label: "Project",
            options: d.revenueByProject.map((p) => ({
              value: p.id,
              label: p.name,
            })),
          },
          {
            id: "team",
            label: "Team",
            options: d.teamWorkload.map((m) => ({
              value: m.id,
              label: m.name,
            })),
          },
        ]}
        right={
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="secondary" size="sm" className="h-8">
                  <Calendar /> {range} <ChevronDown className="opacity-60" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuRadioGroup
                value={range}
                onValueChange={(v) => setRange(v as string)}
              >
                {ranges.map((r) => (
                  <DropdownMenuRadioItem key={r} value={r}>
                    {r}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <nav
        aria-label="Report sections"
        className="flex gap-1 overflow-x-auto scrollbar-none"
      >
        {sectionLinks.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 rounded-full px-3 py-1 text-xs text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* Revenue */}
      <section id="revenue" className="scroll-mt-24 space-y-4">
        <h2 className="font-heading text-base font-semibold text-heading">
          Revenue
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Revenue (12 mo)"
            value={money(totalRevenue)}
            icon={DollarSign}
            tone="info"
            variant="solid"
          />
          <MetricCard
            label="This month"
            value={money(last)}
            delta={`${(((last - prev) / prev) * 100).toFixed(1)}% vs last month`}
            trend={last >= prev ? "up" : "down"}
            sentiment={last >= prev ? "positive" : "negative"}
            icon={TrendingUp}
            tone="success"
            variant="solid"
          />
          <MetricCard
            label="Top client"
            value={d.revenueByClient[0].name}
            delta={money(d.revenueByClient[0].value)}
            icon={UserGroup}
            tone="info"
            href={`/u/clients/${d.revenueByClient[0].id}`}
            variant="solid"
          />
          <MetricCard
            label="Avg. project margin"
            value={`${Math.round(d.revenueByProject.reduce((s, p) => s + p.margin, 0) / d.revenueByProject.length)}%`}
            icon={FolderCheck}
            tone="warning"
            variant="solid"
          />
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          <SectionCard
            title="Revenue trend"
            description={`Monthly recognized revenue · ${range}`}
            className="xl:col-span-3"
          >
            <ChartFrame
              rows={d.revenueTrend}
              columns={[
                { key: "month", label: "Month" },
                {
                  key: "revenue",
                  label: "Revenue",
                  format: (n) => `$${n.toLocaleString()}`,
                },
              ]}
            >
              <TrendChart
                data={d.revenueTrend}
                x="month"
                y="revenue"
                label="Revenue"
                format={money}
              />
            </ChartFrame>
          </SectionCard>
          <SectionCard
            title="Revenue by client"
            description="This month · click a bar to open the client"
            className="xl:col-span-2"
          >
            <ChartFrame
              rows={d.revenueByClient}
              columns={[
                { key: "name", label: "Client" },
                {
                  key: "value",
                  label: "Revenue",
                  format: (n) => `$${n.toLocaleString()}`,
                },
              ]}
            >
              <RankedBars
                data={d.revenueByClient}
                label="Revenue"
                format={money}
                hrefFor={(id) => `/u/clients/${id}`}
              />
            </ChartFrame>
          </SectionCard>
        </div>
        <SectionCard title="Revenue by project" bodyClassName="px-0 pb-1">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-4 py-2 text-left font-semibold">Project</th>
                  <th className="px-3 py-2 text-left font-semibold max-md:hidden">
                    Client
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">
                    Revenue
                  </th>
                  <th className="w-48 px-4 py-2 text-left font-semibold">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody>
                {d.revenueByProject.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/u/projects/${p.id}`}
                        className="font-medium text-heading hover:text-primary"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground max-md:hidden">
                      {p.client}
                    </td>
                    <td className="tabular px-3 py-2.5 text-right">
                      ${p.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <ProgressBar
                        value={p.margin}
                        health={
                          p.margin < 15
                            ? "off-track"
                            : p.margin < 25
                              ? "at-risk"
                              : "on-track"
                        }
                        label={`${p.name} margin`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </section>

      {/* Clients */}
      <section id="clients" className="scroll-mt-24 space-y-4">
        <h2 className="font-heading text-base font-semibold text-heading">
          Clients
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Active clients"
            value={String(d.clientStats.active)}
            icon={UserGroup}
            tone="info"
            href="/u/clients?status=active"
            variant="solid"
          />
          <MetricCard
            label="New clients"
            value={String(d.clientStats.new)}
            delta="This month"
            icon={TrendingUp}
            tone="success"
            href="/u/clients?status=onboarding"
            variant="solid"
          />
          <MetricCard
            label="Inactive clients"
            value={String(d.clientStats.inactive)}
            icon={UsersRound}
            tone="warning"
            href="/u/clients?status=paused"
            variant="solid"
          />
          <MetricCard
            label="At-risk clients"
            value={String(d.clientStats.atRisk)}
            delta="Open the list"
            icon={CircleGauge}
            tone="danger"
            sentiment="negative"
            href="/u/clients?health=at-risk"
            variant="solid"
          />
        </div>
        <SectionCard title="New clients per month">
          <ChartFrame
            rows={d.newClientsByMonth}
            columns={[
              { key: "month", label: "Month" },
              { key: "clients", label: "New clients" },
            ]}
          >
            <ColumnChart
              data={d.newClientsByMonth}
              x="month"
              series={[
                {
                  key: "clients",
                  label: "New clients",
                  color: "var(--chart-1)",
                },
              ]}
              className="h-52"
            />
          </ChartFrame>
        </SectionCard>
      </section>

      {/* Projects */}
      <section id="projects" className="scroll-mt-24 space-y-4">
        <h2 className="font-heading text-base font-semibold text-heading">
          Projects
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Completion rate"
            value={`${d.projectStats.completionRate}%`}
            icon={FolderCheck}
            tone="success"
            variant="solid"
          />
          <MetricCard
            label="On time"
            value={String(d.projectStats.onTime)}
            icon={TrendingUp}
            tone="info"
            href="/u/projects"
            variant="solid"
          />
          <MetricCard
            label="Delayed"
            value={String(d.projectStats.delayed)}
            icon={CircleGauge}
            tone="danger"
            href="/u/projects"
            variant="solid"
          />
          <MetricCard
            label="Avg. delay"
            value={`${d.projectStats.avgDelayDays} days`}
            icon={Calendar}
            tone="warning"
            variant="solid"
          />
        </div>
        <SectionCard title="Budget vs spent" description="Active projects">
          <ChartFrame
            rows={d.projectBudgets}
            columns={[
              { key: "name", label: "Project" },
              {
                key: "budget",
                label: "Budget",
                format: (n) => `$${n.toLocaleString()}`,
              },
              {
                key: "spent",
                label: "Spent",
                format: (n) => `$${n.toLocaleString()}`,
              },
            ]}
          >
            <ColumnChart
              data={d.projectBudgets}
              x="name"
              format={money}
              series={[
                { key: "budget", label: "Budget", color: "var(--chart-1)" },
                { key: "spent", label: "Spent", color: "var(--chart-2)" },
              ]}
            />
          </ChartFrame>
        </SectionCard>
      </section>

      {/* Team */}
      <section id="team" className="scroll-mt-24 space-y-4">
        <h2 className="font-heading text-base font-semibold text-heading">
          Team
        </h2>
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="Workload"
            description="% of capacity · line marks 100%"
          >
            <ChartFrame
              rows={d.teamWorkload}
              columns={[
                { key: "name", label: "Member" },
                { key: "workload", label: "Workload %" },
              ]}
            >
              <RankedBars
                data={d.teamWorkload.map((m) => ({
                  id: m.id,
                  name: m.name,
                  value: m.workload,
                }))}
                label="Workload"
                format={(n) => `${n}%`}
                reference={{ value: 100, label: "Capacity" }}
                hrefFor={() => "/u/team"}
              />
            </ChartFrame>
          </SectionCard>
          <SectionCard title="Tasks completed this period">
            <ChartFrame
              rows={d.teamWorkload}
              columns={[
                { key: "name", label: "Member" },
                { key: "completed", label: "Completed" },
                { key: "overdue", label: "Overdue" },
              ]}
            >
              <RankedBars
                data={d.teamWorkload
                  .map((m) => ({ id: m.id, name: m.name, value: m.completed }))
                  .sort((a, b) => b.value - a.value)}
                label="Completed"
                hrefFor={() => "/u/tasks"}
              />
            </ChartFrame>
          </SectionCard>
        </div>
      </section>

      {/* AI usage */}
      <section id="ai" className="scroll-mt-24 space-y-4">
        <h2 className="font-heading text-base font-semibold text-heading">
          AI usage
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Generations"
            value={compact(d.aiStats.generations)}
            icon={Sparkles}
            tone="ai"
            variant="solid"
          />
          <MetricCard
            label="Credits consumed"
            value={compact(d.aiStats.credits)}
            icon={CircleGauge}
            tone="ai"
            href="/u/billing?tab=usage"
            variant="solid"
          />
          <MetricCard
            label="Estimated cost"
            value={`$${d.aiStats.estimatedCost.toFixed(2)}`}
            icon={DollarSign}
            tone="warning"
            variant="solid"
          />
          <MetricCard
            label="Suggestions accepted"
            value={`${d.aiStats.acceptanceRate}%`}
            icon={TrendingUp}
            tone="success"
            variant="solid"
          />
        </div>
        <SectionCard title="AI generations per week">
          <ChartFrame
            rows={d.aiGenerationsByWeek}
            columns={[
              { key: "week", label: "Week" },
              { key: "generations", label: "Generations" },
            ]}
          >
            <TrendChart
              data={d.aiGenerationsByWeek}
              x="week"
              y="generations"
              label="Generations"
              className="h-52"
            />
          </ChartFrame>
        </SectionCard>
      </section>

      <SidePanel
        open={analysis !== "closed"}
        onOpenChange={(o) => !o && setAnalysis("closed")}
        size="lg"
        eyebrow={`BizPilot AI · ${range}`}
        title="Report analysis"
        footer={
          analysis === "done" ? (
            <Button variant="outline" onClick={analyze}>
              Regenerate
            </Button>
          ) : undefined
        }
      >
        {analysis === "loading" ? (
          <AILoader
            variant="block"
            stages={[
              "Reading revenue and margins…",
              "Comparing client trends…",
              "Checking delivery and workload…",
              "Writing analysis…",
            ]}
          />
        ) : (
          <div className="space-y-3">
            <AIGeneratedLabel />
            <AIBlocks
              citations={[
                {
                  id: "r1",
                  label: "Revenue trend",
                  kind: "activity",
                  href: "#revenue",
                },
                {
                  id: "r2",
                  label: "Workload",
                  kind: "activity",
                  href: "#team",
                },
                {
                  id: "r3",
                  label: "Budget vs spent",
                  kind: "project",
                  href: "#projects",
                },
              ]}
              blocks={[
                {
                  type: "paragraph",
                  text: "Revenue grew 41% over 12 months and has plateaued for the last quarter at about $67–69k per month [1]. Globex accounts for 32% of monthly revenue — healthy, but concentrated.",
                },
                {
                  type: "found",
                  items: [
                    "James is at 112% of capacity and owns two blocked tasks [2]",
                    "Storefront has used 82% of budget at 48% progress [3]",
                    "4 clients are at risk; 2 of them renew within 60 days",
                  ],
                },
                {
                  type: "recommended",
                  items: [
                    "Rebalance James's work to Daniel and Tom before the Customer Portal UAT",
                    "Open a scope conversation with Acme on Storefront budget",
                    "Schedule renewal check-ins for Umbrella Health and Globex",
                  ],
                },
              ]}
            />
          </div>
        )}
      </SidePanel>
    </PageContainer>
  );
};

export default ReportsPageComp;
