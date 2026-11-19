"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileText, RotateCw, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ProgressBar } from "@/app/components/generalUIcomp/ProgressBar";
import { StepProgress, type Step } from "@/app/components/loaders/StepProgress";
import { cn } from "@/lib/utils";

const STAGES = ["Upload", "Extract text", "Analyze", "Index", "Ready"];

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  progress: number;
  /** index into STAGES; 0 = uploading */
  stage: number;
  failedAt?: number;
  cancelled?: boolean;
};

const fmtSize = (b: number) =>
  b > 1e6
    ? `${(b / 1e6).toFixed(1)} MB`
    : `${Math.max(1, Math.round(b / 1e3))} KB`;

/**
 * Simulated upload + processing pipeline. Replace the interval with real upload
 * progress events and processing status polling/websocket updates.
 */
export function useUploadQueue() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setItems((list) =>
        list.map((it) => {
          if (
            it.cancelled ||
            it.failedAt !== undefined ||
            it.stage >= STAGES.length - 1
          )
            return it;
          if (it.stage === 0) {
            const progress = Math.min(
              100,
              it.progress + 6 + Math.random() * 14,
            );
            return progress >= 100
              ? { ...it, progress: 100, stage: 1 }
              : { ...it, progress };
          }
          if (Math.random() < 0.35) {
            // Files with "fail" in the name demonstrate the failure + retry state
            if (it.stage === 2 && it.name.toLowerCase().includes("fail"))
              return { ...it, failedAt: 2 };
            return { ...it, stage: it.stage + 1 };
          }
          return it;
        }),
      );
    }, 220);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const add = useCallback((files: File[]) => {
    setItems((l) => [
      ...files.map((f) => ({
        id: `${f.name}-${f.size}-${Math.random()}`,
        name: f.name,
        size: f.size,
        progress: 0,
        stage: 0,
      })),
      ...l,
    ]);
  }, []);
  const cancel = useCallback(
    (id: string) => setItems((l) => l.filter((i) => i.id !== id)),
    [],
  );
  const retry = useCallback(
    (id: string) =>
      setItems((l) =>
        l.map((i) =>
          i.id === id
            ? { ...i, failedAt: undefined, name: i.name.replace(/fail/gi, "") }
            : i,
        ),
      ),
    [],
  );
  return { items, add, cancel, retry };
}

const stepsFor = (it: UploadItem): Step[] =>
  STAGES.map((label, i) => ({
    label,
    state:
      it.failedAt === i
        ? "failed"
        : i < it.stage || (i === STAGES.length - 1 && it.stage === i)
          ? "done"
          : i === it.stage
            ? "active"
            : "pending",
  }));

export const UploadQueue = ({
  items,
  onCancel,
  onRetry,
}: {
  items: UploadItem[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}) => (
  <ul className="space-y-2" aria-label="Upload queue">
    <AnimatePresence initial={false}>
      {items.map((it) => {
        const uploading = it.stage === 0;
        const failed = it.failedAt !== undefined;
        return (
          <motion.li
            key={it.id}
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "rounded-lg bg-muted/40 p-3 ring-1 ring-border",
              failed && "bg-danger/5 ring-danger/30",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-card text-primary-blue ring-1 ring-border dark:text-info">
                <FileText className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-heading">{it.name}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtSize(it.size)} ·{" "}
                  {failed ? (
                    <span className="text-danger">
                      Processing failed at “{STAGES[it.failedAt!]}”
                    </span>
                  ) : uploading ? (
                    `Uploading ${Math.round(it.progress)}%`
                  ) : it.stage >= STAGES.length - 1 ? (
                    "Ready for AI"
                  ) : (
                    "Processing — you can leave this page"
                  )}
                </p>
              </div>
              {uploading && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onCancel(it.id)}
                  aria-label={`Cancel upload of ${it.name}`}
                >
                  <X />
                </Button>
              )}
              {failed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(it.id)}
                >
                  <RotateCw /> Retry
                </Button>
              )}
            </div>
            <div className="mt-2.5 pl-11">
              {uploading ? (
                <ProgressBar
                  value={Math.round(it.progress)}
                  showValue={false}
                  label={`Upload progress for ${it.name}`}
                />
              ) : (
                <StepProgress steps={stepsFor(it)} orientation="horizontal" />
              )}
            </div>
          </motion.li>
        );
      })}
    </AnimatePresence>
  </ul>
);
