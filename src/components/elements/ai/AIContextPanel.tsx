"use client";

import Link from "next/link";
import { CircleCheck, ClipboardCheck, FileText, FolderOpen, ListClock, ShieldAlert, Sparkles, UserGroup, X, type LucideIcon } from "lucide-react";
import { Chip } from "@/components/generalUIcomp/Chips";
import { cn } from "@/lib/utils";
import type { AICitation, AIMessage, AIScope } from "@/types";
import { ContextIndicator } from "./AIChat";

const citeIcon: Record<AICitation["kind"], LucideIcon> = { document: FileText, client: UserGroup, project: FolderOpen, task: ClipboardCheck, activity: ListClock };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h3 className="text-[0.65rem] font-semibold tracking-wider text-subtle uppercase">{title}</h3>
    {children}
  </section>
);

/** Right column of the AI Assistant: scope, sources used and actions awaiting approval (§13.1, §34) */
export const AIContextPanel = ({ scope, messages, suggestions, onAsk }: { scope: AIScope; messages: AIMessage[]; suggestions: string[]; onAsk: (q: string) => void }) => {
  const citations = Array.from(new Map(messages.flatMap((m) => m.citations ?? []).map((c) => [c.id, c])).values());
  const actions = messages.flatMap((m) => (m.blocks ?? []).flatMap((b) => (b.type === "action" ? [b.action] : [])));

  return (
    <div className="space-y-6 p-4">
      <Section title="Context">
        <ContextIndicator scope={scope} />
        <p className="text-xs text-muted-foreground">
          {scope.kind === "workspace" ? "Answers draw on all clients, projects, tasks and indexed documents you can access." : `Answers are limited to ${scope.label} and its related records.`}
        </p>
      </Section>

      <Section title={`Sources used · ${citations.length}`}>
        {citations.length ? (
          <ul className="space-y-1">
            {citations.map((c) => {
              const Icon = citeIcon[c.kind];
              return (
                <li key={c.id}>
                  <Link href={c.href} className="flex items-start gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-card/70">
                    <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-foreground">{c.label}</span>
                      {c.detail && <span className="block text-muted-foreground">{c.detail}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Records the AI references will appear here.</p>
        )}
      </Section>

      <Section title="Proposed actions">
        {actions.length ? (
          <ul className="space-y-1.5">
            {actions.map((a) => (
              <li key={a.id} className={cn("flex items-start gap-2 rounded-md bg-card/70 px-2.5 py-2 text-xs ring-1", a.state === "pending" ? "ring-ai/40" : "ring-border")}>
                {a.state === "pending" ? <ShieldAlert className="size-3.5 shrink-0 text-ai" /> : a.state === "approved" ? <CircleCheck className="size-3.5 shrink-0 text-success" /> : <X className="size-3.5 shrink-0 text-muted-foreground" />}
                <span className="min-w-0 flex-1">
                  <span className="block text-foreground">{a.title}</span>
                  <Chip tone={a.state === "pending" ? "ai" : a.state === "approved" ? "success" : "neutral"} className="mt-1">
                    {a.state === "pending" ? "Awaiting approval" : a.state === "approved" ? "Executed" : "Dismissed"}
                  </Chip>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Nothing is changed without your approval. Suggested actions will collect here.</p>
        )}
      </Section>

      <Section title="Try asking">
        <ul className="space-y-1">
          {suggestions.map((s) => (
            <li key={s}>
              <button onClick={() => onAsk(s)} className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs text-foreground hover:bg-card/70">
                <Sparkles className="mt-0.5 size-3 shrink-0 text-ai" aria-hidden /> {s}
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
};
