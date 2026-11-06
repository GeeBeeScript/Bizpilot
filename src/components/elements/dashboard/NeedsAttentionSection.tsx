"use client"

import { useState } from "react";
import Link from "next/link";
import {
  CircleAlert,
  CircleCheckBig,
  FileWarning,
  FolderClock,
  MessageCircleWarning,
  OctagonX,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionCard } from "@/components/generalUIcomp/SectionCard";
import { Chip, type Tone } from "@/components/generalUIcomp/Chips";
import { PersonLabel, UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { EmptyState } from "@/components/generalUIcomp/States";
import { cn } from "@/lib/utils";
import type { AttentionItem, AttentionType } from "@/types";

const typeMeta: Record<AttentionType, { label: string; icon: LucideIcon; tint: string; filter: string }> = {
  "overdue-project": { label: "Overdue project", icon: FolderClock, tint: "bg-danger/12 text-danger", filter: "Overdue" },
  "blocked-task": { label: "Blocked task", icon: OctagonX, tint: "bg-danger/12 text-danger", filter: "Blocked" },
  approval: { label: "Approval waiting", icon: CircleCheckBig, tint: "bg-info/12 text-info", filter: "Approvals" },
  "follow-up": { label: "Follow-up overdue", icon: MessageCircleWarning, tint: "bg-warning/14 text-warning", filter: "Follow-ups" },
  automation: { label: "Failed automation", icon: Workflow, tint: "bg-warning/14 text-warning", filter: "Automations" },
  document: { label: "Document review", icon: FileWarning, tint: "bg-ai/16 text-ai", filter: "Documents" },
};

const urgencyTone: Record<AttentionItem["urgency"], Tone> = { critical: "danger", high: "warning", medium: "neutral" };
const filters = ["All", "Blocked", "Overdue", "Approvals", "Follow-ups", "Automations", "Documents"];

const TypeIcon = ({ type }: { type: AttentionType }) => {
  const m = typeMeta[type];
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-md", m.tint)}>
      <m.icon className="size-4" strokeWidth={2.25} aria-hidden />
    </span>
  );
};

/** High-priority operational queue (§12.4) */
const NeedsAttentionSection = ({ items }: { items: AttentionItem[] }) => {
  const [filter, setFilter] = useState("All");
  const count = (f: string) => (f === "All" ? items.length : items.filter((i) => typeMeta[i.type].filter === f).length);
  const shown = filter === "All" ? items : items.filter((i) => typeMeta[i.type].filter === filter);

  return (
    <SectionCard
      title="Needs Attention"
      icon={CircleAlert}
      description="What's late, blocked or waiting on someone"
      className="h-full"
      bodyClassName="px-0 pb-1"
    >
      <div role="tablist" aria-label="Filter attention items" className="flex gap-1 overflow-x-auto scrollbar-none px-4 pb-2">
        {filters.map((f) => {
          const n = count(f);
          if (f !== "All" && n === 0) return null;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs transition-colors duration-150",
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {f} <span className={cn("tabular text-[0.65rem]", filter === f ? "opacity-80" : "text-subtle")}>{n}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <EmptyState compact icon={CircleCheckBig} title={filter === "All" ? "You're all caught up" : "Nothing here"} description={filter === "All" ? "Overdue work, blockers, approvals and failed runs will surface here." : "Nothing needs attention in this category."} />
      ) : (
        // Rows respond to the module's own width (container queries), not the viewport,
        // so they never overflow whatever column the dashboard layout puts them in.
        <ul className="@container">
          {shown.map((it) => {
            const m = typeMeta[it.type];
            const late = it.deadlineLabel.includes("overdue");
            return (
              <li key={it.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/40 @xl:flex-nowrap">
                <div className="flex min-w-0 flex-1 basis-60 items-center gap-3">
                  <TypeIcon type={it.type} />
                  <div className="min-w-0">
                    <div className="truncate text-[0.65rem] font-bold tracking-wide text-muted-foreground uppercase">{m.label}</div>
                    <div className="truncate font-semibold text-heading">{it.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{it.context}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 @max-xl:w-full @max-xl:pl-12">
                  <span className="hidden w-40 @3xl:block"><PersonLabel person={it.owner} subtitle={it.owner.external ? it.owner.external.company : it.owner.role} /></span>
                  <span className="@3xl:hidden"><UserAvatar person={it.owner} /></span>
                  <Chip tone={urgencyTone[it.urgency]} dot className="capitalize">{it.urgency}</Chip>
                  <span className={cn("tabular w-16 text-xs whitespace-nowrap", late ? "font-medium text-danger" : "text-muted-foreground")}>{it.deadlineLabel}</span>
                  <Link href={it.action.href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "ml-auto bg-card")}>
                    {it.action.label}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
};

export default NeedsAttentionSection;
