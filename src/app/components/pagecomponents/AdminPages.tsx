"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Building2,
  CircleAlert,
  CircleCheck,
  Clock,
  Coins,
  DollarSign,
  HardDrive,
  RotateCw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  UsersRound,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import {
  PageContainer,
  PageHeader,
  CountBadge,
} from "@/app/components/generalUIcomp/PageHeader";
import { MetricCard } from "@/app/components/generalUIcomp/MetricCard";
import { SectionCard } from "@/app/components/generalUIcomp/SectionCard";
import { ActivityFeed } from "@/app/components/generalUIcomp/ActivityFeed";
import { Chip, type Tone } from "@/app/components/generalUIcomp/Chips";
import {
  DataTable,
  type Column,
} from "@/app/components/generalUIcomp/DataTable";
import {
  FilterToolbar,
  applyFilters,
  type FilterValues,
} from "@/app/components/generalUIcomp/FilterToolbar";
import { ClientLogo } from "@/app/components/generalUIcomp/ClientLogo";
import {
  ProgressBar,
  UsageMeter,
} from "@/app/components/generalUIcomp/ProgressBar";
import { EmptyState, NoResults } from "@/app/components/generalUIcomp/States";
import { SidePanel } from "@/app/components/generalUIcomp/SidePanel";
import {
  ChartFrame,
  TrendChart,
  compact,
  money,
} from "@/app/components/elements/reports/Charts";
import { PageCrumbs } from "@/context/breadcrumbContext";
import { daysFromNow, formatLongDate, timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import type { ActivityItem } from "@/types";
import type { AdminOrg, Generation } from "@/lib/mock/admin";

export const orgStatus: Record<
  AdminOrg["status"],
  { label: string; tone: Tone }
> = {
  active: { label: "Active", tone: "success" },
  trial: { label: "Trial", tone: "info" },
  "past-due": { label: "Past due", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
const outcome: Record<Generation["outcome"], { label: string; tone: Tone }> = {
  accepted: { label: "Accepted", tone: "success" },
  edited: { label: "Edited", tone: "info" },
  rejected: { label: "Rejected", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
};

type OverviewProps = {
  kpis: {
    organizations: number;
    activeUsers: number;
    mrr: number;
    aiGenerations: number;
    estimatedAiCost: number;
    storageTb: number;
  };
  mrrTrend: { month: string; mrr: number }[];
  aiDaily: { day: string; generations: number }[];
  activity: ActivityItem[];
  signups: AdminOrg[];
  subscriptions: {
    id: string;
    org: string;
    event: string;
    at: string;
    tone: Tone;
  }[];
  health: { id: string; label: string; value: string; status: "ok" | "warn" }[];
  failed: { id: string; op: string; org: string; error: string; at: string }[];
};

/** Platform overview (§27.1) — charts are allowed on this admin surface */
export const AdminOverview = (d: OverviewProps) => {
  const [failed, setFailed] = useState(d.failed);
  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Platform overview"
        description="Health, growth and usage across every BizPilot organization."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Organizations"
          value={compact(d.kpis.organizations)}
          icon={Building2}
          tone="info"
          href="/admin/organizations"
          variant="solid"
        />
        <MetricCard
          label="Active users"
          value={compact(d.kpis.activeUsers)}
          icon={UsersRound}
          tone="success"
          variant="solid"
        />
        <MetricCard
          label="MRR"
          value={money(d.kpis.mrr)}
          icon={DollarSign}
          tone="success"
          delta="+4.0% vs last month"
          trend="up"
          sentiment="positive"
          variant="solid"
        />
        <MetricCard
          label="AI generations"
          value={compact(d.kpis.aiGenerations)}
          icon={Sparkles}
          tone="ai"
          href="/admin/ai-quality"
          variant="solid"
        />
        <MetricCard
          label="Est. AI cost"
          value={money(d.kpis.estimatedAiCost)}
          icon={Coins}
          tone="warning"
          variant="solid"
        />
        <MetricCard
          label="Storage"
          value={`${d.kpis.storageTb} TB`}
          icon={HardDrive}
          tone="info"
          variant="solid"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Monthly recurring revenue">
          <ChartFrame
            rows={d.mrrTrend}
            columns={[
              { key: "month", label: "Month" },
              {
                key: "mrr",
                label: "MRR",
                format: (n) => `$${n.toLocaleString()}`,
              },
            ]}
          >
            <TrendChart
              data={d.mrrTrend}
              x="month"
              y="mrr"
              label="MRR"
              format={money}
              className="h-56"
            />
          </ChartFrame>
        </SectionCard>
        <SectionCard title="AI generations per day">
          <ChartFrame
            rows={d.aiDaily}
            columns={[
              { key: "day", label: "Day" },
              { key: "generations", label: "Generations" },
            ]}
          >
            <TrendChart
              data={d.aiDaily}
              x="day"
              y="generations"
              label="Generations"
              className="h-56"
            />
          </ChartFrame>
        </SectionCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Organization activity"
          icon={Activity}
          bodyClassName="px-2 pb-2"
        >
          <ActivityFeed items={d.activity} />
        </SectionCard>
        <SectionCard
          title="Recent signups"
          icon={Building2}
          bodyClassName="px-0 pb-1"
        >
          {d.signups.length ? (
            <ul className="divide-y divide-border/70 border-t border-border/70">
              {d.signups.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/organizations/${o.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40"
                  >
                    <ClientLogo client={o} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-heading">
                        {o.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {o.plan} · {timeAgo(o.createdAt)}
                      </span>
                    </span>
                    <Chip tone={orgStatus[o.status].tone} dot>
                      {orgStatus[o.status].label}
                    </Chip>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              icon={Building2}
              title="No new signups"
              description="New organizations will appear here."
            />
          )}
        </SectionCard>
        <SectionCard
          title="Subscription events"
          icon={DollarSign}
          bodyClassName="px-0 pb-1"
        >
          <ul className="divide-y divide-border/70 border-t border-border/70">
            {d.subscriptions.map((e) => (
              <li
                key={e.id}
                className="flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <Chip tone={e.tone} dot className="max-w-[55%] truncate">
                  {e.event}
                </Chip>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {e.org}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(e.at)}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="AI processing health" icon={Sparkles}>
          <ul className="space-y-2">
            {d.health.map((h) => (
              <li
                key={h.id}
                className="flex items-center gap-3 rounded-md bg-muted/40 px-3 py-2 text-sm"
              >
                {h.status === "ok" ? (
                  <CircleCheck
                    className="size-4 text-success"
                    aria-label="Healthy"
                  />
                ) : (
                  <CircleAlert
                    className="size-4 text-warning"
                    aria-label="Degraded"
                  />
                )}
                <span className="flex-1">{h.label}</span>
                <span className="tabular font-medium text-heading">
                  {h.value}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard
          title={`Failed system operations · ${failed.length}`}
          icon={CircleAlert}
          bodyClassName="px-0 pb-1"
        >
          {failed.length ? (
            <ul className="divide-y divide-border/70 border-t border-border/70">
              {failed.map((f) => (
                <li key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-heading">
                      {f.op}{" "}
                      <span className="text-muted-foreground">· {f.org}</span>
                    </span>
                    <span className="block truncate font-mono text-xs text-danger">
                      {f.error}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(f.at)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFailed((l) => l.filter((x) => x.id !== f.id));
                      notify.success("Retry queued", { description: f.op });
                    }}
                  >
                    <RotateCw /> Retry
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              icon={CircleCheck}
              title="All operations healthy"
              description="Failed jobs, webhooks and syncs will appear here."
            />
          )}
        </SectionCard>
      </div>
    </PageContainer>
  );
};

/** Organizations table (§27.2) */
export const AdminOrganizations = ({ orgs }: { orgs: AdminOrg[] }) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const rows = useMemo(
    () =>
      applyFilters(
        orgs.filter(
          (o) =>
            !search ||
            `${o.name} ${o.owner} ${o.ownerEmail}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        ),
        filters,
        { plan: (o) => o.plan, status: (o) => o.status },
      ),
    [orgs, search, filters],
  );
  const columns: Column<AdminOrg>[] = [
    {
      id: "org",
      header: "Organization",
      sortValue: (o) => o.name,
      cell: (o) => (
        <span className="flex items-center gap-2.5">
          <ClientLogo client={o} />
          <span className="font-medium text-heading">{o.name}</span>
        </span>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      hideBelow: "lg",
      sortValue: (o) => o.owner,
      cell: (o) => (
        <span className="block">
          <span className="block text-sm">{o.owner}</span>
          <span className="block text-xs text-muted-foreground">
            {o.ownerEmail}
          </span>
        </span>
      ),
    },
    {
      id: "plan",
      header: "Plan",
      sortValue: (o) => o.plan,
      cell: (o) => (
        <Chip
          tone={
            o.plan === "Scale" ? "ai" : o.plan === "Growth" ? "info" : "neutral"
          }
        >
          {o.plan}
        </Chip>
      ),
    },
    {
      id: "users",
      header: "Users",
      align: "right",
      sortValue: (o) => o.users,
      cell: (o) => <span className="tabular">{o.users}</span>,
    },
    {
      id: "created",
      header: "Created",
      hideBelow: "md",
      sortValue: (o) => -new Date(o.createdAt).getTime(),
      cell: (o) => (
        <span className="text-xs text-muted-foreground">
          {formatLongDate(o.createdAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (o) => o.status,
      cell: (o) => (
        <Chip tone={orgStatus[o.status].tone} dot>
          {orgStatus[o.status].label}
        </Chip>
      ),
    },
    {
      id: "usage",
      header: "AI usage",
      hideBelow: "md",
      sortValue: (o) => o.aiUsedPct,
      cell: (o) => (
        <ProgressBar
          value={o.aiUsedPct}
          health={
            o.aiUsedPct > 90
              ? "off-track"
              : o.aiUsedPct > 75
                ? "at-risk"
                : "on-track"
          }
          className="w-28"
        />
      ),
    },
  ];
  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Organizations"
        titleAddon={<CountBadge>{orgs.length}</CountBadge>}
        description="Every workspace on the platform."
      />
      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search organizations or owners…"
        values={filters}
        onValuesChange={setFilters}
        filters={[
          {
            id: "plan",
            label: "Plan",
            options: ["Starter", "Growth", "Scale"].map((v) => ({
              value: v,
              label: v,
            })),
          },
          {
            id: "status",
            label: "Status",
            options: (Object.keys(orgStatus) as AdminOrg["status"][]).map(
              (s) => ({ value: s, label: orgStatus[s].label }),
            ),
          },
        ]}
      />
      {rows.length === 0 ? (
        <div className="surface rounded-lg">
          {orgs.length ? (
            <NoResults
              query={search}
              onClear={() => {
                setSearch("");
                setFilters({});
              }}
            />
          ) : (
            <EmptyState
              icon={Building2}
              title="No organizations yet"
              description="Organizations appear here when customers sign up."
            />
          )}
        </div>
      ) : (
        <DataTable
          ariaLabel="Organizations"
          rows={rows}
          columns={columns}
          getRowId={(o) => o.id}
          rowHref={(o) => `/admin/organizations/${o.id}`}
          mobileItem={(o) => (
            <div className="flex items-center gap-3">
              <ClientLogo client={o} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-heading">{o.name}</p>
                <p className="text-xs text-muted-foreground">
                  {o.plan} · {o.users} users
                </p>
              </div>
              <Chip tone={orgStatus[o.status].tone} dot>
                {orgStatus[o.status].label}
              </Chip>
            </div>
          )}
        />
      )}
    </PageContainer>
  );
};

/** Organization detail (§27.3) */
export const AdminOrgDetail = ({
  org,
  events,
}: {
  org: AdminOrg;
  events: ActivityItem[];
}) => {
  const [notes, setNotes] = useState([
    {
      id: "n1",
      text: "Asked about SSO on the Growth plan — pointed to Scale.",
      at: daysFromNow(-6),
      by: "Ops · Dana",
    },
  ]);
  const [draft, setDraft] = useState("");
  const router = useRouter();
  return (
    <PageContainer className="space-y-5">
      <PageCrumbs
        items={[
          { label: "Overview", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: org.name },
        ]}
      />
      <div className="flex flex-wrap items-center gap-3">
        <ClientLogo client={org} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-xl font-semibold text-heading md:text-2xl">
            {org.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Owner {org.owner} · {org.ownerEmail} · since{" "}
            {formatLongDate(org.createdAt)}
          </p>
        </div>
        <Chip tone={orgStatus[org.status].tone} dot>
          {orgStatus[org.status].label}
        </Chip>
        <Button
          variant="outline"
          onClick={() =>
            notify.info("Impersonation requires a reason and is logged")
          }
        >
          View as owner…
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Overview">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Users</dt>
              <dd className="tabular text-heading">{org.users}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="text-heading">{formatLongDate(org.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Region</dt>
              <dd className="text-heading">EU (Frankfurt)</dd>
            </div>
          </dl>
        </SectionCard>
        <SectionCard title="Subscription">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="text-heading">{org.plan}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">MRR</dt>
              <dd className="tabular text-heading">${org.mrr}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payment</dt>
              <dd>
                <Chip
                  tone={org.status === "past-due" ? "danger" : "success"}
                  dot
                >
                  {org.status === "past-due" ? "Failing" : "OK"}
                </Chip>
              </dd>
            </div>
          </dl>
        </SectionCard>
        <SectionCard title="Usage">
          <div className="space-y-3">
            <UsageMeter
              label="AI credits"
              used={org.aiUsedPct * 100}
              limit={10000}
            />
            <UsageMeter
              label="Storage (GB)"
              used={org.storageGb}
              limit={
                org.plan === "Scale" ? 1000 : org.plan === "Growth" ? 100 : 10
              }
            />
          </div>
        </SectionCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Recent events" bodyClassName="px-2 pb-2">
          <ActivityFeed
            items={events}
            emptyDescription="Signups, plan changes and alerts for this organization appear here."
          />
        </SectionCard>
        <SectionCard
          title="Support notes"
          description="Visible to the BizPilot team only"
        >
          <form
            className="mb-3 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              setNotes((l) => [
                {
                  id: `n${Date.now()}`,
                  text: draft,
                  at: new Date().toISOString(),
                  by: "You",
                },
                ...l,
              ]);
              setDraft("");
            }}
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="Add a support note…"
              aria-label="Support note"
            />
            <Button type="submit" disabled={!draft.trim()}>
              Add
            </Button>
          </form>
          <ul className="space-y-2">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-md bg-muted/50 px-3 py-2 text-sm"
              >
                <p>{n.text}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {n.by} · {timeAgo(n.at)}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/organizations")}
      >
        ← All organizations
      </Button>
    </PageContainer>
  );
};

/** AI quality (§27.4) */
export const AIQuality = ({
  kpis,
  rows: all,
}: {
  kpis: {
    total: number;
    accepted: number;
    edited: number;
    rejected: number;
    avgLatency: string;
    estimatedCost: number;
  };
  rows: Generation[];
}) => {
  const [filters, setFilters] = useState<FilterValues>({});
  const [open, setOpen] = useState<Generation | null>(null);
  const rows = applyFilters(all, filters, {
    feature: (g) => g.feature,
    model: (g) => g.model,
    org: (g) => g.org,
    outcome: (g) => g.outcome,
  });
  const uniq = (k: keyof Generation) =>
    Array.from(new Set(all.map((g) => String(g[k])))).map((v) => ({
      value: v,
      label: v,
    }));
  const columns: Column<Generation>[] = [
    {
      id: "at",
      header: "Time",
      sortValue: (g) => -new Date(g.at).getTime(),
      cell: (g) => (
        <span className="text-xs text-muted-foreground">{timeAgo(g.at)}</span>
      ),
    },
    {
      id: "feature",
      header: "Feature",
      sortValue: (g) => g.feature,
      cell: (g) => <span className="text-sm">{g.feature}</span>,
    },
    {
      id: "request",
      header: "Request",
      cell: (g) => (
        <span className="block max-w-72 truncate text-sm text-heading">
          {g.request}
        </span>
      ),
    },
    {
      id: "org",
      header: "Organization",
      hideBelow: "lg",
      sortValue: (g) => g.org,
      cell: (g) => (
        <span className="text-sm text-muted-foreground">{g.org}</span>
      ),
    },
    {
      id: "model",
      header: "Model",
      hideBelow: "xl",
      sortValue: (g) => g.model,
      cell: (g) => <span className="font-mono text-xs">{g.model}</span>,
    },
    {
      id: "latency",
      header: "Latency",
      align: "right",
      sortValue: (g) => g.latencyMs,
      cell: (g) => (
        <span className="tabular text-xs">
          {(g.latencyMs / 1000).toFixed(1)}s
        </span>
      ),
    },
    {
      id: "outcome",
      header: "Outcome",
      sortValue: (g) => g.outcome,
      cell: (g) => (
        <Chip tone={outcome[g.outcome].tone} dot>
          {outcome[g.outcome].label}
        </Chip>
      ),
    },
  ];
  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="AI quality"
        description="How AI output is received across the platform."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Total generations"
          value={compact(kpis.total)}
          icon={Sparkles}
          tone="ai"
          variant="solid"
        />
        <MetricCard
          label="Accepted"
          value={`${kpis.accepted}%`}
          icon={ThumbsUp}
          tone="success"
          variant="solid"
        />
        <MetricCard
          label="Edited"
          value={`${kpis.edited}%`}
          icon={Activity}
          tone="info"
          variant="solid"
        />
        <MetricCard
          label="Rejected"
          value={`${kpis.rejected}%`}
          icon={ThumbsDown}
          tone="warning"
          variant="solid"
        />
        <MetricCard
          label="Avg. response time"
          value={kpis.avgLatency}
          icon={Clock}
          tone="info"
          variant="solid"
        />
        <MetricCard
          label="Est. cost (mo)"
          value={money(kpis.estimatedCost)}
          icon={Coins}
          tone="warning"
          variant="solid"
        />
      </div>
      <FilterToolbar
        values={filters}
        onValuesChange={setFilters}
        filters={[
          { id: "feature", label: "AI feature", options: uniq("feature") },
          { id: "model", label: "Model", options: uniq("model") },
          { id: "org", label: "Organization", options: uniq("org") },
          {
            id: "outcome",
            label: "Outcome",
            options: (Object.keys(outcome) as Generation["outcome"][]).map(
              (o) => ({ value: o, label: outcome[o].label }),
            ),
          },
        ]}
      />
      {rows.length ? (
        <DataTable
          ariaLabel="AI generations"
          rows={rows}
          columns={columns}
          getRowId={(g) => g.id}
          onRowClick={setOpen}
        />
      ) : (
        <div className="surface rounded-lg">
          <NoResults onClear={() => setFilters({})} />
        </div>
      )}
      <SidePanel
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        size="lg"
        eyebrow={
          open && `${open.org} · ${open.user} · ${formatLongDate(open.at)}`
        }
        title={open?.feature ?? ""}
      >
        {open && (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <Chip tone={outcome[open.outcome].tone} dot>
                {outcome[open.outcome].label}
              </Chip>
              <Chip className="font-mono">{open.model}</Chip>
              <Chip>{(open.latencyMs / 1000).toFixed(1)}s</Chip>
              <Chip>
                {open.tokens.toLocaleString()} tokens · ${open.cost.toFixed(3)}
              </Chip>
            </div>
            <section>
              <h3 className="mb-1 text-xs font-semibold text-heading uppercase">
                User request
              </h3>
              <p className="rounded-md bg-primary/8 p-3">{open.request}</p>
            </section>
            <section>
              <h3 className="mb-1 text-xs font-semibold text-heading uppercase">
                Context used
              </h3>
              <ul className="space-y-1">
                {open.context.map((c) => (
                  <li
                    key={c}
                    className="rounded-md bg-muted/50 px-3 py-1.5 text-xs"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="mb-1 text-xs font-semibold text-heading uppercase">
                Response
              </h3>
              <p className="rounded-md bg-ai/8 p-3 ring-1 ring-ai/20">
                {open.response}
              </p>
            </section>
            <section>
              <h3 className="mb-1 text-xs font-semibold text-heading uppercase">
                Feedback
              </h3>
              <p className="text-muted-foreground">
                {open.feedback ?? "No feedback given."}
              </p>
            </section>
          </div>
        )}
      </SidePanel>
    </PageContainer>
  );
};
