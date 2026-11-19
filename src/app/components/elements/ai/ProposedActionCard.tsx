"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CircleCheck,
  ClipboardPlus,
  Mail,
  PencilLine,
  ShieldAlert,
  Undo2,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Field, SidePanel } from "@/app/components/generalUIcomp/SidePanel";
import {
  LoadingButton,
  useSubmit,
} from "@/app/components/generalUIcomp/LoadingButton";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { AIProposedAction } from "@/types";

const kindIcon: Record<AIProposedAction["kind"], LucideIcon> = {
  "create-task": ClipboardPlus,
  "send-email": Mail,
  "update-status": PencilLine,
  "update-client": PencilLine,
};
const doneLabel: Record<AIProposedAction["kind"], string> = {
  "create-task": "Task created",
  "send-email": "Email sent",
  "update-status": "Status updated",
  "update-client": "Client updated",
};

/**
 * AI proposed action (§13.6, §34). Always requires explicit approval; the card's
 * appearance changes clearly between "recommendation" and "executed".
 */
export const ProposedActionCard = ({
  action,
  onChange,
}: {
  action: AIProposedAction;
  onChange?: (a: AIProposedAction) => void;
}) => {
  const [state, setState] = useState(action.state);
  const [fields, setFields] = useState(action.fields);
  const [reviewOpen, setReviewOpen] = useState(false);
  const { submitting, submit } = useSubmit();
  const Icon = kindIcon[action.kind];

  const set = (s: AIProposedAction["state"]) => {
    setState(s);
    onChange?.({ ...action, fields, state: s });
  };

  const approve = () =>
    submit(() => {
      set("approved");
      setReviewOpen(false);
      notify.success(doneLabel[action.kind], {
        description: fields[0]?.value,
        onUndo: () => set("pending"),
      });
    }, 600);

  return (
    <>
      <motion.div
        layout
        className={cn(
          "overflow-hidden rounded-lg ring-1 transition-colors duration-300",
          state === "pending" &&
            "bg-card ring-ai/40 shadow-[0_0_0_4px_color-mix(in_oklab,var(--ai)_10%,transparent)]",
          state === "approved" && "bg-success/6 ring-success/35",
          state === "dismissed" && "bg-muted/40 ring-border opacity-75",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-[0.7rem] font-semibold tracking-wide uppercase",
            state === "pending" && "bg-ai/10 text-ai",
            state === "approved" && "bg-success/10 text-success",
            state === "dismissed" && "bg-muted text-muted-foreground",
          )}
        >
          {state === "pending" && (
            <>
              <ShieldAlert className="size-3.5" /> Proposed action · needs your
              approval
            </>
          )}
          {state === "approved" && (
            <>
              <CircleCheck className="size-3.5" /> Executed ·{" "}
              {doneLabel[action.kind]}
            </>
          )}
          {state === "dismissed" && (
            <>
              <X className="size-3.5" /> Dismissed · nothing was changed
            </>
          )}
        </div>
        <div className="flex gap-3 p-3">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-md",
              state === "approved"
                ? "bg-success/15 text-success"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p
                className={cn(
                  "text-sm font-medium text-heading",
                  state === "dismissed" &&
                    "line-through decoration-muted-foreground/50",
                )}
              >
                {action.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-xs">
              {fields.map((f) => (
                <div key={f.label} className="contents">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="truncate text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
            <AnimatePresence mode="wait" initial={false}>
              {state === "pending" ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap gap-1.5 pt-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReviewOpen(true)}
                  >
                    Review
                  </Button>
                  <LoadingButton
                    size="sm"
                    loading={submitting}
                    onClick={approve}
                  >
                    Approve
                  </LoadingButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => set("dismissed")}
                  >
                    Dismiss
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pt-1"
                >
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground"
                    onClick={() => set("pending")}
                  >
                    <Undo2 /> {state === "approved" ? "Undo" : "Restore"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <SidePanel
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        eyebrow="Proposed by BizPilot AI"
        title={action.title}
        description="Review and edit before approving. Nothing happens until you approve."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                set("dismissed");
                setReviewOpen(false);
              }}
            >
              Dismiss
            </Button>
            <LoadingButton loading={submitting} onClick={approve}>
              Approve & run
            </LoadingButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="rounded-lg bg-ai/8 p-3 text-sm ring-1 ring-ai/25">
            {action.description}
          </p>
          {fields.map((f, i) => (
            <Field key={f.label} label={f.label} htmlFor={`f-${i}`}>
              <Input
                id={`f-${i}`}
                value={f.value}
                onChange={(e) =>
                  setFields((fs) =>
                    fs.map((x, j) =>
                      j === i ? { ...x, value: e.target.value } : x,
                    ),
                  )
                }
                className="h-9"
              />
            </Field>
          ))}
        </div>
      </SidePanel>
    </>
  );
};
