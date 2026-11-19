"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AtSign,
  BellOff,
  Check,
  CheckCheck,
  ClipboardCheck,
  CreditCard,
  FolderOpen,
  Settings,
  Sparkles,
  UserGroup,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  PageContainer,
  PageHeader,
} from "@/app/components/generalUIcomp/PageHeader";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import { timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { NotificationCategory, NotificationItem } from "@/types";

const catMeta: Record<
  NotificationCategory,
  { label: string; icon: LucideIcon }
> = {
  mentions: { label: "Mentions", icon: AtSign },
  tasks: { label: "Tasks", icon: ClipboardCheck },
  projects: { label: "Projects", icon: FolderOpen },
  clients: { label: "Clients", icon: UserGroup },
  ai: { label: "AI", icon: Sparkles },
  billing: { label: "Billing", icon: CreditCard },
};

/** Notification center (§24) */
const NotificationsPageComp = ({
  items: initial,
}: {
  items: NotificationItem[];
}) => {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<"all" | NotificationCategory>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const shown = items.filter(
    (n) => (tab === "all" || n.category === tab) && (!unreadOnly || !n.read),
  );
  const unread = items.filter((n) => !n.read).length;

  const setRead = (id: string, read: boolean) =>
    setItems((l) => l.map((n) => (n.id === id ? { ...n, read } : n)));
  const markAll = () => {
    const prev = items;
    setItems((l) => l.map((n) => ({ ...n, read: true })));
    notify.success("All notifications marked as read", {
      onUndo: () => setItems(prev),
    });
  };

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "You're all caught up."}
        actions={
          <>
            <Link
              href="/u/settings?tab=notifications"
              className={buttonVariants({ variant: "outline" })}
            >
              <Settings /> Preferences
            </Link>
            <Button onClick={markAll} disabled={!unread}>
              <CheckCheck /> Mark all as read
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {(Object.keys(catMeta) as NotificationCategory[]).map((c) => {
              const n = items.filter((i) => i.category === c && !i.read).length;
              return (
                <TabsTrigger key={c} value={c}>
                  {catMeta[c].label}
                  {n > 0 && (
                    <span className="tabular rounded bg-primary px-1 text-[0.6rem] text-primary-foreground">
                      {n}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={unreadOnly}
            onCheckedChange={setUnreadOnly}
            aria-label="Unread only"
          />{" "}
          Unread only
        </label>
      </div>

      <div className="surface overflow-hidden rounded-lg">
        {shown.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title={unreadOnly ? "No unread notifications" : "Nothing here yet"}
            description={
              tab === "all"
                ? "Mentions, assignments, client activity and AI insights will appear here."
                : `No ${catMeta[tab].label.toLowerCase()} notifications.`
            }
          />
        ) : (
          <ul>
            <AnimatePresence initial={false}>
              {shown.map((n) => {
                const m = catMeta[n.category];
                return (
                  <motion.li
                    key={n.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "group/n flex items-start gap-3 border-b border-border/70 px-4 py-3.5 last:border-0",
                      !n.read && "bg-primary/4",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-9 shrink-0 place-items-center rounded-md",
                        n.category === "ai"
                          ? "bg-ai/15 text-ai"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <m.icon className="size-4" aria-hidden />
                    </span>
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setRead(n.id, true);
                        router.push(n.href);
                      }}
                    >
                      <span
                        className={cn(
                          "block text-sm",
                          n.read
                            ? "text-foreground"
                            : "font-medium text-heading",
                        )}
                      >
                        {n.title}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {n.summary}
                      </span>
                      <span className="mt-0.5 block text-xs text-subtle">
                        {m.label} · {n.context} · {timeAgo(n.timestamp)}
                      </span>
                    </button>
                    <div className="flex items-center gap-1">
                      {!n.read && (
                        <span
                          className="size-2 rounded-full bg-primary"
                          aria-label="Unread"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs opacity-0 group-hover/n:opacity-100 focus-visible:opacity-100 max-lg:opacity-100"
                        onClick={() => setRead(n.id, !n.read)}
                      >
                        <Check /> {n.read ? "Mark unread" : "Mark read"}
                      </Button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </PageContainer>
  );
};

export default NotificationsPageComp;
