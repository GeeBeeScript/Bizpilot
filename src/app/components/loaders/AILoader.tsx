"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { AIMark } from "@/app/components/elements/ai/AIMark";

type AILoaderProps = {
  /** Rotating contextual stages, e.g. "Retrieving relevant documents…" */
  stages?: string[];
  /** Fixed message instead of rotating stages */
  message?: string;
  interval?: number;
  variant?: "inline" | "block";
  /** Hide the mark + label when the surrounding UI already shows them */
  bare?: boolean;
  className?: string;
};

/**
 * AI-specific loader (spec §6.2). Deliberately different from the regular spinner:
 * pulsing AI mark + rotating stage text with a gold shimmer + shimmer lines.
 */
export const AILoader = ({
  stages = ["Thinking…"],
  message,
  interval = 1400,
  variant = "inline",
  bare,
  className,
}: AILoaderProps) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (message || stages.length < 2) return;
    const id = setInterval(
      () => setI((v) => Math.min(v + 1, stages.length - 1)),
      interval,
    );
    return () => clearInterval(id);
  }, [message, stages.length, interval]);

  const text = message ?? stages[i];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex gap-3",
        variant === "block" ? "flex-col" : "items-start",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        {!bare && <AIMark pulsing />}
        <div className="min-w-0">
          {!bare && (
            <p className="text-[0.7rem] font-semibold tracking-wide text-ai uppercase">
              BizPilot AI
            </p>
          )}
          <div className="relative h-5 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={text}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="ai-text-shimmer text-sm font-medium"
              >
                {text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
      {variant === "block" && (
        <div className="space-y-2 pl-0.5" aria-hidden>
          {[92, 78, 64].map((w) => (
            <div
              key={w}
              className="h-2.5 overflow-hidden rounded-full bg-ai/10"
              style={{ width: `${w}%` }}
            >
              <div className="h-full w-full animate-shimmer bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--ai)_35%,transparent),transparent)] bg-size-[200%_100%]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/** Blinking caret appended to streaming text */
export const StreamingCaret = () => (
  <span
    className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] animate-caret bg-ai"
    aria-hidden
  />
);
