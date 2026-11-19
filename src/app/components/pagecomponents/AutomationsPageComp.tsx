"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Plus,
  Workflow,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import {
  CountBadge,
  PageContainer,
  PageHeader,
} from "@/app/components/generalUIcomp/PageHeader";
import {
  FilterToolbar,
  applyFilters,
  type FilterValues,
} from "@/app/components/generalUIcomp/FilterToolbar";
import { Chip } from "@/app/components/generalUIcomp/Chips";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import { EmptyState, NoResults } from "@/app/components/generalUIcomp/States";
import { StepProgress } from "@/app/components/loaders/StepProgress";
import { runStatus } from "@/app/components/elements/automations/RunHistory";
import { timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { Automation, AutomationRun } from "@/types";
import type { DemoState } from "./DashboardPageComp";

const AutomationCard = ({
  a,
  latest,
  onToggle,
}: {
  a: Automation;
  latest?: AutomationRun;
  onToggle: (v: boolean) => void;
}) => (
  <article
    className={cn(
      "surface group/auto flex flex-col gap-3 rounded-lg p-4",
      !a.active && "opacity-80",
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Link
          href={`/u/automations/${a.id}`}
          className="font-heading text-[0.95rem] font-semibold text-heading hover:text-primary"
        >
          {a.name}
        </Link>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {a.description}
        </p>
      </div>
      <Switch
        checked={a.active}
        onCheckedChange={onToggle}
        aria-label={`${a.name} ${a.active ? "active" : "paused"}`}
      />
    </div>

    {/* When → Then chain (§18.1) */}
    <div className="dot-grid space-y-1.5 rounded-md bg-muted/40 p-2.5 text-xs">
      <p className="flex items-center gap-1.5">
        <span className="w-9 shrink-0 font-semibold text-muted-foreground">
          When
        </span>
        <Chip tone="info" icon={Zap}>
          {a.triggerLabel}
        </Chip>
      </p>
      <p className="flex flex-wrap items-center gap-1">
        <span className="w-9 shrink-0 font-semibold text-muted-foreground">
          Then
        </span>
        {a.actionsSummary.map((s, i) => (
          <span key={s} className="flex items-center gap-1">
            {i > 0 && <ArrowRight className="size-3 text-subtle" aria-hidden />}
            <Chip tone={s.startsWith("AI") ? "ai" : "neutral"}>{s}</Chip>
          </span>
        ))}
      </p>
    </div>

    {latest && latest.status === "running" ? (
      <StepProgress
        steps={latest.steps}
        kind="automation"
        orientation="horizontal"
      />
    ) : null}

    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
      <Chip tone={a.active ? "success" : "neutral"} dot>
        {a.active ? "Active" : "Paused"}
      </Chip>
      {latest && (
        <Chip
          tone={runStatus[latest.status].tone}
          icon={runStatus[latest.status].icon}
        >
          {runStatus[latest.status].label}
        </Chip>
      )}
      <span>{a.lastRun ? `Last run ${timeAgo(a.lastRun)}` : "Never run"}</span>
      <span className="ml-auto flex items-center gap-2">
        <span className="tabular flex items-center gap-0.5 text-success">
          <CircleCheck className="size-3" />
          {a.successCount}
        </span>
        <span
          className={cn(
            "tabular flex items-center gap-0.5",
            a.failureCount ? "text-danger" : "",
          )}
        >
          <CircleX className="size-3" />
          {a.failureCount}
        </span>
        <UserAvatar person={a.createdBy} className="size-5" />
      </span>
    </div>
  </article>
);

/** Automations list (§18.1) */
const AutomationsPageComp = ({
  automations: initial,
  runs,
  demo,
}: {
  automations: Automation[];
  runs: AutomationRun[];
  demo?: DemoState;
}) => {
  const [items, setItems] = useState(demo === "empty" ? [] : initial);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});

  const latestFor = (id: string) =>
    runs
      .filter((r) => r.automationId === id)
      .sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt))[0];

  const rows = useMemo(
    () =>
      applyFilters(
        items.filter(
          (a) => !search || a.name.toLowerCase().includes(search.toLowerCase()),
        ),
        filters,
        {
          state: (a) => (a.active ? "active" : "inactive"),
          trigger: (a) => a.triggerType,
          creator: (a) => a.createdBy.id,
          failures: (a) =>
            runs.some(
              (r) =>
                r.automationId === a.id &&
                (r.status === "failed" || r.status === "retrying"),
            )
              ? "yes"
              : "no",
        },
      ),
    [items, search, filters, runs],
  );

  const toggle = (a: Automation, v: boolean) => {
    const prev = items;
    setItems((l) => l.map((x) => (x.id === a.id ? { ...x, active: v } : x)));
    notify.success(v ? "Automation activated" : "Automation paused", {
      description: a.name,
      onUndo: () => setItems(prev),
    });
  };

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Automations"
        titleAddon={<CountBadge>{items.length}</CountBadge>}
        description="Workflows that react to clients, projects, tasks and documents, so routine work happens on its own."
        actions={
          <Link href="/u/automations/new" className={buttonVariants()}>
            <Plus /> Create automation
          </Link>
        }
      />
      {items.length === 0 ? (
        <div className="surface rounded-lg">
          <EmptyState
            icon={Workflow}
            title="No automations yet"
            description="Start from a trigger — like “Client created” — and chain conditions, actions and AI steps on a visual canvas."
            action={
              <Link href="/u/automations/new" className={buttonVariants()}>
                <Plus /> Create automation
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <FilterToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search automations…"
            values={filters}
            onValuesChange={setFilters}
            filters={[
              {
                id: "state",
                label: "Status",
                options: [
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Paused" },
                ],
              },
              {
                id: "trigger",
                label: "Trigger type",
                options: [
                  "client",
                  "project",
                  "task",
                  "document",
                  "billing",
                ].map((v) => ({
                  value: v,
                  label: v[0].toUpperCase() + v.slice(1),
                })),
              },
              {
                id: "creator",
                label: "Creator",
                options: Array.from(
                  new Map(items.map((a) => [a.createdBy.id, a.createdBy.name])),
                ).map(([value, label]) => ({ value, label })),
              },
              {
                id: "failures",
                label: "Recent failures",
                options: [
                  { value: "yes", label: "Has recent failures" },
                  { value: "no", label: "No failures" },
                ],
              },
            ]}
          />
          {rows.length === 0 ? (
            <div className="surface rounded-lg">
              <NoResults
                query={search}
                onClear={() => {
                  setSearch("");
                  setFilters({});
                }}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {rows.map((a) => (
                <AutomationCard
                  key={a.id}
                  a={a}
                  latest={latestFor(a.id)}
                  onToggle={(v) => toggle(a, v)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default AutomationsPageComp;
