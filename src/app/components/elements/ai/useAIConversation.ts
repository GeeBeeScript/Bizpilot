"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blocksToText, mockRespond } from "@/lib/mock/ai";
import type { AIMessage, AIProposedAction, AIScope } from "@/types";

const THINK_MS = 2200;
const CHARS_PER_TICK = 7;
const TICK_MS = 28;

/**
 * Conversation state with simulated thinking → streaming → done/error/stopped.
 * Replace `mockRespond` + the reveal ticks with your streaming endpoint;
 * the message statuses map 1:1 to the UI states in §39 (generating, streaming, failed…).
 */
export function useAIConversation(scope: AIScope, initial: AIMessage[] = []) {
  const [messages, setMessages] = useState<AIMessage[]>(initial);
  const [reveal, setReveal] = useState<Record<string, number>>({});
  const prompts = useRef<Record<string, string>>({});
  const ticks = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scopeRef = useRef(scope);
  useEffect(() => {
    scopeRef.current = scope;
  });

  const patch = (id: string, p: Partial<AIMessage>) => setMessages((l) => l.map((m) => (m.id === id ? { ...m, ...p } : m)));

  const clearTicks = () => {
    ticks.current.forEach(clearTimeout);
    ticks.current = [];
  };

  // Stop streaming when the conversation unmounts
  useEffect(() => clearTicks, []);

  // Any message in "thinking" gets a response scheduled. Driven by state (not by the send call)
  // so it's resilient to effect re-runs; the cleanup only cancels pending "thinking" timers.
  const thinkingKey = messages.filter((m) => m.status === "thinking").map((m) => m.id).join(",");
  useEffect(() => {
    if (!thinkingKey) return;
    const timers = thinkingKey.split(",").map((id) =>
      setTimeout(() => {
        try {
          const res = mockRespond(prompts.current[id] ?? "", scopeRef.current);
          const total = blocksToText(res.blocks).length;
          patch(id, { status: "streaming", blocks: res.blocks, citations: res.citations });
          let n = 0;
          const tick = () => {
            n += CHARS_PER_TICK;
            setReveal((r) => ({ ...r, [id]: n }));
            if (n < total) ticks.current.push(setTimeout(tick, TICK_MS));
            else patch(id, { status: "done" });
          };
          tick();
        } catch {
          patch(id, { status: "error" });
        }
      }, THINK_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [thinkingKey]);

  const send = useCallback((text: string) => {
    const prompt = text.trim();
    if (!prompt) return;
    const now = new Date().toISOString();
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const aid = `a-${stamp}`;
    prompts.current[aid] = prompt;
    setMessages((l) => [
      ...l,
      { id: `u-${stamp}`, role: "user", text: prompt, createdAt: now },
      { id: aid, role: "assistant", status: "thinking", createdAt: now },
    ]);
  }, []);

  /** Retry keeps the original prompt and earlier messages (§13.8) */
  const retry = useCallback(
    (assistantId: string) => {
      const idx = messages.findIndex((m) => m.id === assistantId);
      const prompt = prompts.current[assistantId] ?? messages.slice(0, idx).reverse().find((m) => m.role === "user")?.text;
      if (!prompt) return;
      // The demo failure trigger ("fail" in the prompt) succeeds on retry
      prompts.current[assistantId] = prompt.replace(/fail/gi, "");
      setReveal((r) => ({ ...r, [assistantId]: 0 }));
      patch(assistantId, { status: "thinking", blocks: undefined, citations: undefined });
    },
    [messages],
  );

  const stop = useCallback(() => {
    clearTicks();
    setMessages((l) =>
      l.map((m) =>
        m.status === "thinking" ? { ...m, status: "stopped", blocks: [] } : m.status === "streaming" ? { ...m, status: "stopped" } : m,
      ),
    );
  }, []);

  const updateAction = useCallback((messageId: string, action: AIProposedAction) => {
    setMessages((l) =>
      l.map((m) =>
        m.id === messageId
          ? { ...m, blocks: m.blocks?.map((b) => (b.type === "action" && b.action.id === action.id ? { ...b, action } : b)) }
          : m,
      ),
    );
  }, []);

  const busy = messages.some((m) => m.status === "thinking" || m.status === "streaming");

  return { messages, setMessages, reveal, send, retry, stop, busy, updateAction };
}
