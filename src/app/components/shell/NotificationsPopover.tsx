"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AtSign,
  Bell,
  BellOff,
  CheckCheck,
  ClipboardCheck,
  CreditCard,
  FolderOpen,
  Sparkles,
  UserGroup,
  type LucideIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/date";
import { notifications as initial } from "@/lib/mock/activity";
import type { NotificationCategory, NotificationItem } from "@/types";

const catIcon: Record<NotificationCategory, LucideIcon> = {
  mentions: AtSign,
  tasks: ClipboardCheck,
  projects: FolderOpen,
  clients: UserGroup,
  ai: Sparkles,
  billing: CreditCard,
};
const filters: { id: "all" | NotificationCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions" },
  { id: "tasks", label: "Tasks" },
  { id: "projects", label: "Projects" },
  { id: "clients", label: "Clients" },
  { id: "ai", label: "AI" },
  { id: "billing", label: "Billing" },
];

/** Notification dropdown (§4.2, §24) */
export const NotificationsPopover = () => {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>(initial);
  const [filter, setFilter] = useState<"all" | NotificationCategory>("all");
  const unread = items.filter((n) => !n.read).length;
  const shown = items.filter((n) => filter === "all" || n.category === filter);

  const markRead = (id: string) =>
    setItems((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
            aria-label={`Notifications, ${unread} unread`}
          >
            <Bell className="size-[1.15rem]" />
            <AnimatePresence>
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="tabular absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[0.6rem] font-semibold text-white ring-2 ring-background"
                >
                  {unread}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        }
      />
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-1.5rem))] gap-0 p-0 font-sans"
      >
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <p className="font-heading text-sm font-semibold text-heading">
            Notifications
          </p>
          <Button
            variant="ghost"
            size="xs"
            className="text-xs text-muted-foreground"
            disabled={!unread}
            onClick={() =>
              setItems((l) => l.map((n) => ({ ...n, read: true })))
            }
          >
            <CheckCheck /> Mark all as read
          </Button>
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-none px-3 pb-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-6 shrink-0 rounded-full px-2.5 text-xs transition-colors duration-150",
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <ul className="max-h-[22rem] overflow-y-auto border-t border-border scrollbar-thin">
          {shown.length === 0 && (
            <li>
              <EmptyState
                compact
                icon={BellOff}
                title="You're all caught up"
                description={
                  filter === "all"
                    ? "New mentions, assignments and alerts will appear here."
                    : "No notifications in this category."
                }
              />
            </li>
          )}
          {shown.map((n) => {
            const Icon = catIcon[n.category];
            return (
              <li
                key={n.id}
                className="border-b border-border/60 last:border-0"
              >
                <button
                  onClick={() => {
                    markRead(n.id);
                    router.push(n.href);
                  }}
                  className={cn(
                    "group/n flex w-full gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-muted/50",
                    !n.read && "bg-primary/4",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-7 shrink-0 place-items-center rounded-md",
                      n.category === "ai"
                        ? "bg-ai/15 text-ai"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span
                      className={cn(
                        "block text-[0.82rem]",
                        n.read ? "text-foreground" : "font-medium text-heading",
                      )}
                    >
                      {n.title}
                    </span>
                    <span className="line-clamp-2 block text-xs text-muted-foreground">
                      {n.summary}
                    </span>
                    <span className="block text-[0.7rem] text-subtle">
                      {n.context} · {timeAgo(n.timestamp)}
                    </span>
                  </span>
                  {!n.read && (
                    <span
                      className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                      aria-label="Unread"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-border p-1.5">
          <Link
            href="/u/notifications"
            className="block rounded-md py-1.5 text-center text-xs font-medium text-primary hover:bg-muted/60"
          >
            Open notification center
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
