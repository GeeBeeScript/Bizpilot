"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Copy,
  RotateCw,
  ThumbsDown,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { AILoader } from "@/app/components/loaders/AILoader";
import { AIGeneratedLabel, AIMark } from "./AIMark";
import { AIBlocks } from "./AIBlocks";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import type { AIBlock, AICitation, AIScope } from "@/types";

export type AIQuickAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  stages?: string[];
  result: AIBlock[];
  citations?: AICitation[];
};

/** Contextual, scoped AI controls with inline generation (§16.2 AI controls, §34) */
export const AIQuickActions = ({
  actions,
  scope,
  className,
}: {
  actions: AIQuickAction[];
  scope: AIScope;
  className?: string;
}) => {
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<AIQuickAction | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = (a: AIQuickAction) => {
    if (timer.current) clearTimeout(timer.current);
    setResult(null);
    setRunning(a.id);
    timer.current = setTimeout(() => {
      setRunning(null);
      setResult(a);
    }, 2400);
  };

  const current = actions.find((a) => a.id === running);

  return (
    <div className={cn("glass-ai rounded-lg p-3.5", className)}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-heading">
          <AIMark size="xs" /> BizPilot AI
        </span>
        <span className="truncate text-[0.7rem] text-muted-foreground">
          Context: {scope.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {actions.map((a) => (
          <Button
            key={a.id}
            variant="outline"
            size="sm"
            disabled={!!running}
            onClick={() => run(a)}
            className={cn(
              "bg-card/70 text-xs",
              result?.id === a.id && "ring-1 ring-ai/50",
            )}
          >
            <a.icon className="text-ai" /> {a.label}
          </Button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {current && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0 }}
            className="overflow-hidden pt-3"
          >
            <AILoader
              stages={
                current.stages ?? ["Reading context…", "Analyzing…", "Writing…"]
              }
              variant="block"
            />
          </motion.div>
        )}
        {result && !running && (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-md bg-card/80 p-3 ring-1 ring-border"
          >
            <div className="mb-2 flex items-center justify-between">
              <AIGeneratedLabel>{result.label}</AIGeneratedLabel>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Helpful"
                  onClick={() => notify.info("Thanks for the feedback")}
                >
                  <ThumbsUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Not helpful"
                  onClick={() => notify.info("Thanks — we'll improve this")}
                >
                  <ThumbsDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Copy"
                  onClick={() => notify.success("Copied")}
                >
                  <Copy />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Regenerate"
                  onClick={() => run(result)}
                >
                  <RotateCw />
                </Button>
              </div>
            </div>
            <AIBlocks
              blocks={result.result}
              citations={result.citations}
              className="text-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
