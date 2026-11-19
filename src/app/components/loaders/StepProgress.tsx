import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export type StepState = "done" | "active" | "pending" | "failed";
export type Step = { label: string; state: StepState; detail?: string };

type StepProgressProps = {
  steps: Step[];
  /** document = processing pipeline; automation = workflow execution */
  kind?: "document" | "automation";
  orientation?: "vertical" | "horizontal";
  className?: string;
};

const marker = (state: StepState, kind: "document" | "automation") => {
  switch (state) {
    case "done":
      return (
        <span className="grid size-4.5 place-items-center rounded-full bg-success text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
      );
    case "failed":
      return (
        <span className="grid size-4.5 place-items-center rounded-full bg-danger text-white">
          <X className="size-3" strokeWidth={3} />
        </span>
      );
    case "active":
      return (
        <span className={cn("relative grid size-4.5 place-items-center rounded-full", kind === "automation" ? "bg-ai/20" : "bg-info/15")}>
          <span className={cn("absolute inset-0 animate-ping rounded-full [animation-duration:1.6s]", kind === "automation" ? "bg-ai/30" : "bg-info/25")} />
          <span className={cn("size-2 rounded-full", kind === "automation" ? "bg-ai" : "bg-info")} />
        </span>
      );
    default:
      return <span className="block size-4.5 rounded-full border-2 border-dashed border-muted-foreground/35" />;
  }
};

/**
 * Step-based progress for document processing (§6.3) and automation runs (§6.4).
 * ✓ done · • active · ○ pending · ✕ failed — always paired with text.
 */
export const StepProgress = ({ steps, kind = "document", orientation = "vertical", className }: StepProgressProps) => (
  <ol
    className={cn(orientation === "vertical" ? "flex flex-col" : "flex items-start gap-1 overflow-x-auto scrollbar-none", className)}
    aria-label={kind === "document" ? "Processing steps" : "Workflow steps"}
  >
    {steps.map((s, i) => (
      <li
        key={s.label}
        className={cn(
          "relative flex gap-2.5",
          orientation === "vertical" ? "pb-3 last:pb-0" : "min-w-24 flex-1 flex-col items-start",
        )}
      >
        {orientation === "vertical" && i < steps.length - 1 && (
          <span className={cn("absolute top-5 bottom-0 left-[0.55rem] w-px", s.state === "done" ? "bg-success/50" : "bg-border")} aria-hidden />
        )}
        {orientation === "horizontal" && i < steps.length - 1 && (
          <span className={cn("absolute top-2 right-1 left-6 h-px", s.state === "done" ? "bg-success/50" : "bg-border")} aria-hidden />
        )}
        <span className="relative z-10 bg-inherit">{marker(s.state, kind)}</span>
        <span className="min-w-0">
          <span
            className={cn(
              "block text-[0.8rem]",
              s.state === "pending" && "text-muted-foreground",
              s.state === "active" && "font-medium text-heading",
              s.state === "failed" && "font-medium text-danger",
              s.state === "done" && "text-foreground",
            )}
          >
            {s.label}
            <span className="sr-only"> — {s.state}</span>
          </span>
          {s.detail && <span className="block text-xs text-muted-foreground">{s.detail}</span>}
        </span>
      </li>
    ))}
  </ol>
);
