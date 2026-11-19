"use client";

import type { AIScope } from "@/types";
import { AIChat } from "./AIChat";
import { useAIConversation } from "./useAIConversation";

/** AI tab inside a client / project / document workspace — inherits that context (§14.3 AI tab, §36) */
export const ScopedAIChat = ({ scope, suggestions }: { scope: AIScope; suggestions: string[] }) => {
  const c = useAIConversation(scope);
  return (
    <div className="glass dot-grid flex h-[calc(100dvh-var(--topbar-h)-14rem)] min-h-[32rem] flex-col overflow-hidden rounded-lg">
      <AIChat
        variant="embedded"
        scope={scope}
        suggestions={suggestions}
        messages={c.messages}
        reveal={c.reveal}
        busy={c.busy}
        onSend={c.send}
        onRetry={c.retry}
        onStop={c.stop}
        onAction={c.updateAction}
        className="h-full"
      />
    </div>
  );
};
