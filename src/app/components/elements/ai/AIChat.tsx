"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  Copy,
  OctagonX,
  Paperclip,
  RotateCw,
  Square,
  ThumbsDown,
  ThumbsUp,
  Target,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { AILoader, StreamingCaret } from "@/app/components/loaders/AILoader";
import { Kbd } from "@/app/components/generalUIcomp/Kbd";
import { currentUser } from "@/lib/mock/people";
import { aiStages } from "@/lib/mock/ai";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { AIMessage, AIProposedAction, AIScope } from "@/types";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import { AIGeneratedLabel, AIMark } from "./AIMark";
import { AIBlocks, CitationList } from "./AIBlocks";

export const ContextIndicator = ({
  scope,
  className,
}: {
  scope: AIScope;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex max-w-full items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 text-xs text-foreground ring-1 ring-primary/15",
      className,
    )}
  >
    <Target
      className="size-3.5 shrink-0 text-primary dark:text-info"
      aria-hidden
    />
    <span className="text-muted-foreground">Context:</span>
    <span className="truncate font-medium">{scope.label}</span>
  </span>
);

const AssistantMessage = ({
  m,
  reveal,
  onRetry,
  onAction,
}: {
  m: AIMessage;
  reveal?: number;
  onRetry: () => void;
  onAction: (a: AIProposedAction) => void;
}) => (
  <div className="flex gap-3">
    <AIMark
      pulsing={m.status === "thinking" || m.status === "streaming"}
      className="mt-0.5"
    />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-heading">BizPilot AI</span>
        {m.status === "done" && <AIGeneratedLabel />}
      </div>

      {m.status === "thinking" && <AILoader stages={aiStages} bare />}

      {m.status === "error" && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-lg bg-danger/6 px-3 py-2.5 ring-1 ring-danger/25"
        >
          <OctagonX className="size-4 text-danger" aria-hidden />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-heading">Generation failed</p>
            <p className="text-xs text-muted-foreground">
              Your question and the conversation are saved. Nothing was changed.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RotateCw /> Retry
          </Button>
        </div>
      )}

      {m.blocks &&
        (m.status === "streaming" ||
          m.status === "done" ||
          m.status === "stopped") && (
          <div className="relative">
            <AIBlocks
              blocks={m.blocks}
              citations={m.citations}
              revealChars={
                m.status === "streaming"
                  ? reveal
                  : m.status === "stopped"
                    ? reveal
                    : undefined
              }
              onActionChange={onAction}
            />
            {m.status === "streaming" && <StreamingCaret />}
          </div>
        )}

      {m.status === "stopped" && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          Generation stopped.
          <button className="text-primary hover:underline" onClick={onRetry}>
            Regenerate
          </button>
        </p>
      )}

      {m.status === "done" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3 pt-1"
        >
          {m.citations && <CitationList citations={m.citations} />}
          <div className="flex items-center gap-0.5 text-muted-foreground">
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
              onClick={() => notify.info("Thanks — we'll use this to improve")}
            >
              <ThumbsDown />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Copy answer"
              onClick={() => notify.success("Copied")}
            >
              <Copy />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Regenerate"
              onClick={onRetry}
            >
              <RotateCw />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  </div>
);

type AIChatProps = {
  scope: AIScope;
  suggestions: string[];
  messages: AIMessage[];
  reveal: Record<string, number>;
  busy: boolean;
  onSend: (text: string) => void;
  onRetry: (assistantId: string) => void;
  onStop: () => void;
  onAction: (messageId: string, a: AIProposedAction) => void;
  /** embedded = inside a client/project tab */
  variant?: "full" | "embedded";
  className?: string;
};

/** AI conversation surface (§13.3–13.8) */
export const AIChat = ({
  scope,
  suggestions,
  messages,
  reveal,
  busy,
  onSend,
  onRetry,
  onStop,
  onAction,
  variant = "full",
  className,
}: AIChatProps) => {
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, reveal]);

  const submit = (text = input) => {
    if (!text.trim() || busy) return;
    onSend(text);
    setInput("");
    textarea.current?.focus();
  };

  const empty = messages.length === 0;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div
        ref={scroller}
        className="min-h-0 flex-1 overflow-y-auto scrollbar-thin"
        aria-live="polite"
      >
        <div
          className={cn(
            "mx-auto w-full max-w-3xl px-4 md:px-6",
            variant === "full" ? "py-6" : "py-4",
          )}
        >
          {empty ? (
            <div
              className={cn(
                "flex flex-col items-center text-center",
                variant === "full" ? "pt-[8vh]" : "pt-6",
              )}
            >
              <div className="relative mb-4">
                <div
                  className="absolute inset-0 -z-10 scale-[2.2] rounded-full bg-primary-gold/15 blur-2xl"
                  aria-hidden
                />
                <AIMark size="md" className="size-12 [&_svg]:size-6" />
              </div>
              <h2 className="font-heading text-lg font-semibold text-heading">
                What can I help you with?
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                I can answer questions, summarize and recommend actions using{" "}
                {scope.kind === "workspace" ? (
                  "your clients, projects, tasks and documents"
                ) : (
                  <span className="font-medium text-foreground">
                    {scope.label}
                  </span>
                )}
                . I&apos;ll always ask before changing anything.
              </p>
              <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="glass group/sug rounded-lg px-3.5 py-3 text-left text-sm text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:lift"
                  >
                    {s}
                    <span className="mt-1 block text-xs text-muted-foreground group-hover/sug:text-primary">
                      Ask →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    {m.role === "user" ? (
                      <div className="flex justify-end gap-3">
                        <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-primary/10 px-3.5 py-2 text-sm text-heading ring-1 ring-primary/10">
                          {m.text}
                        </div>
                        <UserAvatar person={currentUser} className="mt-0.5" />
                      </div>
                    ) : (
                      <AssistantMessage
                        m={m}
                        reveal={reveal[m.id]}
                        onRetry={() => onRetry(m.id)}
                        onAction={(a) => onAction(m.id, a)}
                      />
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          )}
        </div>
      </div>

      {/* Composer */}
      <div
        className={cn(
          "shrink-0 px-4 pb-4 md:px-6",
          variant === "full" && "pb-5",
        )}
      >
        <div className="mx-auto w-full max-w-3xl">
          {!empty && suggestions.length > 0 && !busy && (
            <div className="mb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
              {suggestions.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="shrink-0 rounded-full bg-card/80 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border hover:bg-card hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="glass-strong elev-2 rounded-xl p-2 transition-shadow focus-within:ring-3 focus-within:ring-ring/25"
          >
            <textarea
              ref={textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder={`Ask about ${scope.kind === "workspace" ? "your business" : scope.label}…`}
              aria-label="Message BizPilot AI"
              className="field-sizing-content max-h-40 min-h-10 w-full resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                aria-label="Attach file"
                onClick={() => notify.info("Attach a document for context")}
              >
                <Paperclip />
              </Button>
              <ContextIndicator scope={scope} className="max-sm:hidden" />
              <span className="ml-auto flex items-center gap-1 text-[0.7rem] whitespace-nowrap text-subtle max-xl:hidden">
                <Kbd>Enter</Kbd> send · <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> new
                line
              </span>
              {busy ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onStop}
                  aria-label="Stop generating"
                >
                  <Square className="size-3 fill-current" /> Stop
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon-sm"
                  disabled={!input.trim()}
                  aria-label="Send message"
                >
                  <ArrowUp />
                </Button>
              )}
            </div>
          </form>
          <p className="mt-1.5 text-center text-[0.68rem] text-subtle">
            AI can make mistakes. Proposed actions always need your approval.
          </p>
        </div>
      </div>
    </div>
  );
};
