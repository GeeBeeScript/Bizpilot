"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  CalendarClock,
  FileSearch,
  ListChecks,
  ScrollText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { AILoader } from "@/app/components/loaders/AILoader";
import {
  AIQuickActions,
  type AIQuickAction,
} from "@/app/components/elements/ai/AIQuickActions";
import { AIBlocks } from "@/app/components/elements/ai/AIBlocks";
import { AIGeneratedLabel } from "@/app/components/elements/ai/AIMark";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import type { AIBlock, AICitation, DocumentItem } from "@/types";

const pageCite = (n: number, label: string): AICitation => ({
  id: `p${n}`,
  label,
  kind: "document",
  href: `#page-${n}`,
  detail: `p. ${n}`,
});

/** AI controls scoped to one document (§17.4 AI panel). Answers link back to pages. */
export const DocumentAIPanel = ({ doc }: { doc: DocumentItem }) => {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<
    { q: string; blocks: AIBlock[]; citations: AICitation[] } | "loading" | null
  >(null);

  if (!doc.indexed)
    return (
      <EmptyState
        compact
        icon={FileSearch}
        title={
          doc.status === "failed" ? "Processing failed" : "Not indexed yet"
        }
        description={
          doc.status === "failed"
            ? "Retry processing to make this document available to BizPilot AI."
            : "AI tools unlock once processing and indexing finish."
        }
      />
    );

  const specific = doc.id === "d2";
  const cites = specific
    ? [
        pageCite(2, "Identity and access"),
        pageCite(3, "Data protection"),
        pageCite(5, "Testing and acceptance"),
      ]
    : [pageCite(1, "Summary"), pageCite(2, "Details"), pageCite(3, "Appendix")];
  const generic: AIQuickAction[] = [
    {
      id: "sum",
      label: "Summarize",
      icon: ScrollText,
      citations: cites,
      result: [
        {
          type: "paragraph",
          text: `${doc.name} sets out the context [1], scope and responsibilities of each party [2], and lists contacts and change history [3].`,
        },
      ],
    },
    {
      id: "req",
      label: "Extract key requirements",
      icon: ListChecks,
      citations: cites,
      result: [
        {
          type: "found",
          items: [
            "Scope and assumptions are agreed by both parties [2]",
            "Acceptance criteria are listed in the appendix [3]",
          ],
        },
      ],
    },
    {
      id: "dates",
      label: "Identify dates",
      icon: CalendarClock,
      citations: cites,
      result: [
        {
          type: "found",
          items: ["Key dates are referenced in the appendix [3]"],
        },
      ],
    },
    {
      id: "obl",
      label: "Identify obligations",
      icon: ShieldAlert,
      citations: cites,
      result: [
        {
          type: "found",
          items: ["Each party's responsibilities are defined in Details [2]"],
        },
      ],
    },
    {
      id: "risk",
      label: "Identify risks",
      icon: Sparkles,
      citations: cites,
      result: [
        {
          type: "recommended",
          items: [
            "Confirm acceptance criteria with the client before sign-off [3]",
          ],
        },
      ],
    },
  ];
  const actions: AIQuickAction[] = !specific
    ? generic
    : [
        {
          id: "sum",
          label: "Summarize",
          icon: ScrollText,
          citations: cites,
          result: [
            {
              type: "paragraph",
              text: "Security baseline for the Globex portal: SSO for users [1], encrypted data that stays in the EU [2], and an independent penetration test before go-live [3].",
            },
          ],
        },
        {
          id: "req",
          label: "Extract key requirements",
          icon: ListChecks,
          citations: cites,
          result: [
            {
              type: "found",
              items: [
                "OAuth 2.0 client credentials from Globex IT; 60-minute tokens [1]",
                "TLS 1.2+ in transit, AES-256 at rest [2]",
                "Pen test ≥10 working days before go-live [3]",
              ],
            },
          ],
        },
        {
          id: "dates",
          label: "Identify dates",
          icon: CalendarClock,
          citations: cites,
          result: [
            {
              type: "found",
              items: [
                "Pen test due 10 working days before launch → by Oct 16 [3]",
                "Session timeout: 30 minutes [1]",
              ],
            },
          ],
        },
        {
          id: "obl",
          label: "Identify obligations",
          icon: ShieldAlert,
          citations: cites,
          result: [
            {
              type: "found",
              items: [
                "Vendor must not store tokens client-side [1]",
                "Vendor resolves critical/high findings before UAT [3]",
              ],
            },
          ],
        },
        {
          id: "risk",
          label: "Identify risks",
          icon: Sparkles,
          citations: cites,
          result: [
            {
              type: "recommended",
              items: [
                "Credentials dependency on Globex IT may delay integration [1]",
                "Pen test timing leaves little room before UAT [3]",
              ],
            },
          ],
        },
      ];

  const ask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    const question = q;
    setQ("");
    setAnswer("loading");
    setTimeout(
      () =>
        setAnswer({
          q: question,
          citations: [specific ? cites[0] : cites[1]],
          blocks: [
            {
              type: "paragraph",
              text: specific
                ? "Service-to-service calls must use OAuth 2.0 client credentials issued by Globex IT, with tokens expiring after 60 minutes [1]."
                : `The answer is on page 2 of ${doc.name}, which covers scope and responsibilities [1].`,
            },
          ],
        }),
      2200,
    );
  };

  return (
    <div className="space-y-4">
      <AIQuickActions
        actions={actions}
        scope={{ kind: "document", label: doc.name }}
      />
      <form
        onSubmit={ask}
        className="glass-strong flex items-center gap-2 rounded-lg p-1.5 pl-3"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask about this document…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Ask about this document"
        />
        <Button
          size="icon-sm"
          type="submit"
          disabled={!q.trim() || answer === "loading"}
          aria-label="Ask"
        >
          <ArrowUp />
        </Button>
      </form>
      <AnimatePresence mode="wait">
        {answer === "loading" && (
          <motion.div
            key="l"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AILoader
              stages={[
                "Reading the document…",
                "Finding relevant sections…",
                "Writing answer…",
              ]}
            />
          </motion.div>
        )}
        {answer && answer !== "loading" && (
          <motion.div
            key="a"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 rounded-lg bg-card p-3 ring-1 ring-border"
          >
            <p className="text-xs text-muted-foreground">“{answer.q}”</p>
            <AIGeneratedLabel />
            <AIBlocks
              blocks={answer.blocks}
              citations={answer.citations}
              className="text-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
