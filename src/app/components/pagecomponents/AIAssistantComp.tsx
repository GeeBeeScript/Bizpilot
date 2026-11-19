"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, History, PanelRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerTitle } from "@/app/components/ui/drawer";
import { AIChat } from "@/app/components/elements/ai/AIChat";
import { AIContextPanel } from "@/app/components/elements/ai/AIContextPanel";
import { ConversationHistory } from "@/app/components/elements/ai/ConversationHistory";
import { useAIConversation } from "@/app/components/elements/ai/useAIConversation";
import { mockRespond, workspaceSuggestions } from "@/lib/mock/ai";
import { minutesAgo } from "@/lib/date";
import type { AIConversation, AIMessage, AIScope } from "@/types";

const scopes: AIScope[] = [
  { kind: "workspace", label: "All of The Cornucopia" },
  { kind: "client", label: "Globex Corporation" },
  { kind: "client", label: "Acme Retail" },
  { kind: "project", label: "Globex Corporation / Customer Portal" },
  { kind: "document", label: "Security Requirements.pdf" },
];

/** Prebuilt demo thread for the first history item */
const demoThread = (): AIMessage[] => {
  const r = mockRespond("What is blocking this project?", scopes[3]);
  return [
    {
      id: "d-u1",
      role: "user",
      text: "What is blocking the Customer Portal?",
      createdAt: minutesAgo(15),
    },
    {
      id: "d-a1",
      role: "assistant",
      status: "done",
      blocks: r.blocks,
      citations: r.citations,
      createdAt: minutesAgo(14),
    },
  ];
};

type Props = { conversations: AIConversation[]; initialPrompt?: string };

/** AI Assistant (§13): history | chat | context/actions; side columns become drawers on smaller screens */
const AIAssistantComp = ({ conversations: initial, initialPrompt }: Props) => {
  const [conversations, setConversations] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scope, setScope] = useState<AIScope>(scopes[0]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const chat = useAIConversation(scope);
  const sentInitial = useRef(false);

  const select = (id: string) => {
    setActiveId(id);
    setHistoryOpen(false);
    const c = conversations.find((x) => x.id === id);
    setScope(
      c?.scope
        ? (scopes.find((s) => s.label.includes(c.scope!.label)) ?? {
            ...c.scope,
          })
        : scopes[0],
    );
    chat.setMessages(id === "cv1" ? demoThread() : []);
  };

  const newChat = () => {
    setActiveId(null);
    setHistoryOpen(false);
    chat.setMessages([]);
  };

  const send = (text: string) => {
    if (!activeId) {
      const id = `cv-${Date.now()}`;
      setConversations((l) => [
        {
          id,
          title: text.length > 48 ? `${text.slice(0, 48)}…` : text,
          updatedAt: new Date().toISOString(),
          scope: scope.kind === "workspace" ? undefined : scope,
        },
        ...l,
      ]);
      setActiveId(id);
    }
    chat.send(text);
  };

  // ?q= from "Ask AI follow-up" elsewhere in the app
  useEffect(() => {
    if (initialPrompt && !sentInitial.current) {
      sentInitial.current = true;
      send(initialPrompt);
    }
  });

  const title =
    conversations.find((c) => c.id === activeId)?.title ?? "New conversation";
  const history = (
    <ConversationHistory
      conversations={conversations}
      activeId={activeId}
      onSelect={select}
      onNew={newChat}
      onChange={setConversations}
    />
  );
  const context = (
    <AIContextPanel
      scope={scope}
      messages={chat.messages}
      suggestions={workspaceSuggestions.slice(0, 4)}
      onAsk={send}
    />
  );

  return (
    <div className="flex h-[calc(100dvh-var(--topbar-h))] min-h-0 max-md:h-[calc(100dvh-var(--topbar-h)-4rem)]">
      {/* History — solid-ish column */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card/55 backdrop-blur-sm lg:block">
        {history}
      </aside>

      {/* Chat */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-border/70 px-4 py-2.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground lg:hidden"
            onClick={() => setHistoryOpen(true)}
            aria-label="Conversation history"
          >
            <History />
          </Button>
          <h1 className="min-w-0 flex-1 truncate font-heading text-sm font-semibold text-heading">
            {title}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="max-w-64 bg-card/70"
                >
                  <span className="text-muted-foreground">Context:</span>{" "}
                  <span className="truncate">{scope.label}</span>{" "}
                  <ChevronDown className="text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>What should the AI use?</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={scope.label}
                onValueChange={(v) =>
                  setScope(scopes.find((s) => s.label === v) ?? scopes[0])
                }
              >
                {scopes.map((s) => (
                  <DropdownMenuRadioItem key={s.label} value={s.label}>
                    <span className="flex flex-col">
                      <span>{s.label}</span>
                      <span className="text-[0.68rem] text-muted-foreground capitalize">
                        {s.kind}
                      </span>
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground xl:hidden"
            onClick={() => setContextOpen(true)}
            aria-label="Context and actions"
          >
            <PanelRight />
          </Button>
        </header>
        <AIChat
          scope={scope}
          suggestions={workspaceSuggestions}
          messages={chat.messages}
          reveal={chat.reveal}
          busy={chat.busy}
          onSend={send}
          onRetry={chat.retry}
          onStop={chat.stop}
          onAction={chat.updateAction}
          className="min-h-0 flex-1"
        />
      </section>

      {/* Context — glass on a dot-grid canvas */}
      <aside className="glass dot-grid hidden w-80 shrink-0 overflow-y-auto scrollbar-thin xl:block">
        {context}
      </aside>

      <Drawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        swipeDirection="left"
      >
        <DrawerContent className="bg-card elev-4 [--drawer-content-width:20rem] data-[swipe-direction=left]:rounded-r-xl">
          <DrawerTitle className="sr-only">Conversation history</DrawerTitle>
          {history}
        </DrawerContent>
      </Drawer>
      <Drawer
        open={contextOpen}
        onOpenChange={setContextOpen}
        swipeDirection="right"
      >
        <DrawerContent className="glass-strong elev-4 overflow-y-auto [--drawer-content-width:22rem] data-[swipe-direction=right]:rounded-l-xl">
          <DrawerTitle className="sr-only">Context and actions</DrawerTitle>
          {context}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AIAssistantComp;
