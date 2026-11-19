"use client";

import Link from "next/link";
import { ClipboardCheck, Database, FileText, FolderOpen, ListClock, Sparkles, UserGroup, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIBlock, AICitation, AIProposedAction } from "@/types";
import { ProposedActionCard } from "./ProposedActionCard";

const citeIcon: Record<AICitation["kind"], LucideIcon> = {
  document: FileText,
  client: UserGroup,
  project: FolderOpen,
  task: ClipboardCheck,
  activity: ListClock,
};

/** Renders text with clickable [n] citation markers (§13.5) */
export const CitedText = ({ text, citations = [] }: { text: string; citations?: AICitation[] }) => {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        const c = m ? citations[Number(m[1]) - 1] : undefined;
        if (!c) return <span key={i}>{part}</span>;
        return (
          <Link
            key={i}
            href={c.href}
            title={`${c.label}${c.detail ? ` — ${c.detail}` : ""}`}
            className="mx-0.5 inline-grid h-4 min-w-4 -translate-y-0.5 place-items-center rounded bg-primary/12 px-1 align-middle text-[0.6rem] font-semibold text-primary no-underline hover:bg-primary hover:text-primary-foreground dark:text-info"
          >
            {m![1]}
          </Link>
        );
      })}
    </>
  );
};

export const CitationList = ({ citations }: { citations: AICitation[] }) =>
  citations.length ? (
    <div className="space-y-1.5">
      <p className="text-[0.68rem] font-semibold tracking-wider text-subtle uppercase">Sources</p>
      <div className="flex flex-wrap gap-1.5">
        {citations.map((c, i) => {
          const Icon = citeIcon[c.kind];
          return (
            <Link
              key={c.id}
              href={c.href}
              className="group/cite inline-flex max-w-full items-center gap-1.5 rounded-md bg-card py-1 pr-2 pl-1 text-xs ring-1 ring-border transition-colors hover:bg-muted hover:ring-primary/30"
            >
              <span className="tabular grid size-4 place-items-center rounded bg-primary/12 text-[0.6rem] font-semibold text-primary dark:text-info">{i + 1}</span>
              <Icon className="size-3.5 text-muted-foreground" aria-hidden />
              <span className="truncate text-foreground group-hover/cite:text-primary">{c.label}</span>
              {c.detail && <span className="shrink-0 text-muted-foreground">· {c.detail}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  ) : null;

const toneCard = {
  success: "text-success bg-success/8",
  warning: "text-warning bg-warning/10",
  danger: "text-danger bg-danger/8",
  info: "text-info bg-info/8",
};

type AIBlocksProps = {
  blocks: AIBlock[];
  citations?: AICitation[];
  onActionChange?: (a: AIProposedAction) => void;
  /** While streaming, only the first N characters of paragraph text are shown */
  revealChars?: number;
  className?: string;
};

/**
 * Structured AI response (§13.4). Generated prose, "Found in your data" (facts from records)
 * and "Recommended next step" (suggestions) are styled distinctly (§34).
 */
/** Truncate blocks to the first `n` characters of text (streaming reveal). Pure. */
function revealBlocks(blocks: AIBlock[], n?: number): AIBlock[] {
  if (n === undefined) return blocks;
  let budget = n;
  const take = (str: string) => {
    const out = str.slice(0, Math.max(0, budget));
    budget -= str.length;
    return out;
  };
  const out: AIBlock[] = [];
  for (const b of blocks) {
    if (budget <= 0) break;
    if (b.type === "paragraph") out.push({ ...b, text: take(b.text) });
    else if (b.type === "found" || b.type === "recommended") out.push({ ...b, items: b.items.map(take).filter(Boolean) });
    else out.push(b);
  }
  return out;
}

export const AIBlocks = ({ blocks: all, citations, onActionChange, revealChars, className }: AIBlocksProps) => {
  const blocks = revealBlocks(all, revealChars);

  return (
    <div className={cn("space-y-3 text-[0.9rem] leading-relaxed text-foreground", className)}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "paragraph":
            return (
              <p key={i}>
                <CitedText text={b.text} citations={citations} />
              </p>
            );
          case "found":
            return (
              <div key={i} className="rounded-lg bg-muted/60 p-3 ring-1 ring-border">
                <p className="mb-1.5 flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  <Database className="size-3.5" aria-hidden /> {b.title ?? "Found in your data"}
                </p>
                <ul className="space-y-1 text-sm">
                  {b.items.map((it, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
                      <span><CitedText text={it} citations={citations} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          case "recommended":
            return (
              <div key={i} className="rounded-lg bg-ai/8 p-3 ring-1 ring-ai/25">
                <p className="mb-1.5 flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wide text-ai uppercase">
                  <Sparkles className="size-3.5" aria-hidden /> {b.title ?? "Recommended next step"}
                </p>
                <ol className="list-inside list-decimal space-y-1 text-sm marker:text-ai">
                  {b.items.map((it, j) => (
                    <li key={j}><CitedText text={it} citations={citations} /></li>
                  ))}
                </ol>
              </div>
            );
          case "status-cards":
            return (
              <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {b.items.map((s) => (
                  <div key={s.label} className={cn("rounded-lg px-3 py-2", toneCard[s.tone])}>
                    <p className="tabular text-lg font-semibold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-lg ring-1 ring-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>{b.columns.map((c) => <th key={c} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-t border-border">
                        {r.map((cell, k) => <td key={k} className={cn("px-3 py-2", k === 0 && "tabular text-muted-foreground")}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "action":
            return <ProposedActionCard key={i} action={b.action} onChange={onActionChange} />;
        }
      })}
    </div>
  );
};
