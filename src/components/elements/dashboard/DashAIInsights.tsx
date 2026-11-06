"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BrainCircuit, CircleAlert, MessageSquareText, RotateCw, Sparkles, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/generalUIcomp/States";
import { Button, buttonVariants } from "@/components/ui/button";
import { SectionCard } from "@/components/generalUIcomp/SectionCard";
import { AILoader } from "@/components/loaders/AILoader";
import { AIGeneratedLabel } from "@/components/elements/ai/AIMark";
import { timeAgo } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { businessBrief as Brief } from "@/lib/mock/ai";

type Props = { brief: typeof Brief | null; loading?: boolean };

const List = ({ icon: Icon, title, tone, items }: { icon: typeof CircleAlert; title: string; tone: string; items: { text: string; href: string }[] }) => (
  <div>
    <p className={cn("mb-1 flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-wider uppercase", tone)}>
      <Icon className="size-3.5" aria-hidden /> {title}
    </p>
    <ul className="space-y-0.5">
      {items.map((r) => (
        <li key={r.text}>
          <Link href={r.href} className="group/item -mx-1.5 flex items-start gap-2 rounded-md px-1.5 py-1 text-[0.82rem] leading-snug text-foreground hover:bg-card/70">
            <span className="flex-1">{r.text}</span>
            <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

/** AI Business Brief (§12.9) — prominent but controlled; uses the dedicated AI loader */
const DashAIInsights = ({ brief, loading: initialLoading }: Props) => {
  const [loading, setLoading] = useState(!!initialLoading);

  const regenerate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2800);
  };

  return (
    <SectionCard
      variant="ai"
      title="AI Business Brief"
      icon={BrainCircuit}
      description={loading ? "Generating…" : brief ? <>Updated {timeAgo(brief.generatedAt)} · based on clients, projects, tasks and documents</> : "Daily summary of risks and opportunities"}
      actions={
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={regenerate} disabled={loading} aria-label="Regenerate brief">
          <RotateCw className={cn(loading && "animate-spin")} />
        </Button>
      }
      className="h-full"
      footer={
        <>
          <Link href="/u/ai" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}>
            View analysis
          </Link>
          <Link href={`/u/ai?q=${encodeURIComponent("Follow up on today's business brief")}`} className={cn(buttonVariants({ size: "sm" }))}>
            <MessageSquareText /> Ask AI follow-up
          </Link>
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {!loading && !brief ? (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState compact icon={Sparkles} title="Not enough activity yet" description="Your brief appears once there are clients, projects and tasks for BizPilot AI to analyze." />
          </motion.div>
        ) : loading || !brief ? (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-2">
            <AILoader variant="block" stages={["Reviewing project activity…", "Checking client signals…", "Weighing risks and opportunities…", "Writing your brief…"]} />
          </motion.div>
        ) : (
          <motion.div key="c" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div>
              <AIGeneratedLabel className="mb-1" />
              <p className="text-[0.88rem] leading-relaxed text-foreground">{brief.summary}</p>
            </div>
            <List icon={CircleAlert} title="Key risks" tone="text-danger" items={brief.risks} />
            <List icon={TrendingUp} title="Opportunities" tone="text-success" items={brief.opportunities} />
            <div className="rounded-md bg-ai/8 p-2.5 ring-1 ring-ai/20">
              <p className="mb-1 text-[0.68rem] font-semibold tracking-wider text-ai uppercase">Recommended actions</p>
              <ol className="list-inside list-decimal space-y-0.5 text-[0.82rem] marker:text-ai">
                {brief.actions.map((a) => <li key={a}>{a}</li>)}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionCard>
  );
};

export default DashAIInsights;
