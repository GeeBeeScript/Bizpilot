import Link from "next/link";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/date";
import type { ActivityItem, ActivityKind } from "@/types";
import {
  Bell,
  CheckCheck,
  CircleCheck,
  FilePlus2,
  MessageSquare,
  PencilLine,
  Plus,
  Sparkles,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { AIMark } from "@/components/elements/ai/AIMark";
import { EmptyState } from "./States";
import { History } from "lucide-react";

const kindIcon: Record<ActivityKind, LucideIcon> = {
  upload: FilePlus2,
  approval: CheckCheck,
  comment: MessageSquare,
  complete: CircleCheck,
  assign: UserRoundPlus,
  create: Plus,
  update: PencilLine,
  ai: Sparkles,
  alert: Bell,
};

const kindTone: Partial<Record<ActivityKind, string>> = {
  approval: "text-success",
  complete: "text-success",
  alert: "text-warning",
  ai: "text-ai",
};

type ActivityFeedProps = {
  items: ActivityItem[];
  /** timeline draws a connecting rail between items */
  variant?: "list" | "timeline";
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

/** One reusable activity/timeline component (spec §30) */
export const ActivityFeed = ({
  items,
  variant = "list",
  className,
  emptyTitle = "No activity yet",
  emptyDescription = "Updates, uploads, approvals and comments will show up here as work happens.",
}: ActivityFeedProps) =>
  items.length === 0 ? (
    <EmptyState compact icon={History} title={emptyTitle} description={emptyDescription} className={className} />
  ) : (
  <ol className={cn("flex flex-col", className)}>
    {items.map((a, i) => {
      const KindIcon = kindIcon[a.kind];
      const isAI = a.actor === null;
      const content = (
        <>
          <span className="relative mt-0.5">
            {isAI ? <AIMark /> : <UserAvatar person={a.actor!} />}
            <span
              className={cn(
                "absolute -right-1 -bottom-1 grid size-3.5 place-items-center rounded-full bg-card text-muted-foreground ring-1 ring-border",
                kindTone[a.kind],
              )}
              aria-hidden
            >
              <KindIcon className="size-2.5" />
            </span>
          </span>
          <span className="min-w-0 flex-1 space-y-0.5">
            <span className="block text-[0.82rem] leading-snug text-foreground">
              <span className="font-medium">{isAI ? "BizPilot AI" : a.actor!.name}</span>{" "}
              {a.actor?.external && <span className="text-xs text-ai">({a.actor.external.company}) </span>}
              <span className="text-muted-foreground">{a.verb}</span>{" "}
              <span className={cn(a.href && "group-hover/act:text-primary group-hover/act:underline underline-offset-2")}>{a.target}</span>
            </span>
            <span className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
              <time dateTime={a.timestamp}>{timeAgo(a.timestamp)}</time>
              {a.context && <span className="truncate">· {a.context}</span>}
            </span>
          </span>
        </>
      );
      return (
        <li key={a.id} className="relative">
          {variant === "timeline" && i < items.length - 1 && (
            <span className="absolute top-8 bottom-0 left-[1.15rem] w-px bg-border" aria-hidden />
          )}
          {a.href ? (
            <Link href={a.href} className="group/act flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 hover:bg-muted/60 focus-visible:bg-muted/60 outline-none">
              {content}
            </Link>
          ) : (
            <div className="flex items-start gap-3 px-2 py-2.5">{content}</div>
          )}
        </li>
      );
    })}
  </ol>
);
