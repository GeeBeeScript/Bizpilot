"use client";

import { useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Archive, Ellipsis, MessagesSquare, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/generalUIcomp/States";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { AIConversation } from "@/types";

const bucket = (iso: string) => {
  const d = differenceInCalendarDays(new Date(), new Date(iso));
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : d <= 7 ? "Previous 7 days" : "Older";
};
const BUCKETS = ["Today", "Yesterday", "Previous 7 days", "Older"];

type Props = {
  conversations: AIConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onChange: (list: AIConversation[]) => void;
};

/** Conversation history (§13.2) */
export const ConversationHistory = ({ conversations, activeId, onSelect, onNew, onChange }: Props) => {
  const [q, setQ] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AIConversation | null>(null);
  const list = conversations.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));

  const remove = (c: AIConversation, verb: "Archived" | "Deleted") => {
    const prev = conversations;
    onChange(conversations.filter((x) => x.id !== c.id));
    notify.success(`${verb} “${c.title}”`, verb === "Archived" ? { onUndo: () => onChange(prev) } : undefined);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2 p-3">
        <Button onClick={onNew} className="w-full justify-start"><Plus /> New conversation</Button>
        <label className="flex h-8 items-center gap-2 rounded-md bg-card/70 px-2.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring/40">
          <Search className="size-3.5 text-muted-foreground" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground" aria-label="Search conversations" />
        </label>
      </div>
      <nav aria-label="Conversations" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 scrollbar-thin">
        {BUCKETS.map((b) => {
          const items = list.filter((c) => bucket(c.updatedAt) === b);
          if (!items.length) return null;
          return (
            <div key={b} className="mb-3">
              <p className="px-2 pb-1 text-[0.65rem] font-semibold tracking-wider text-subtle uppercase">{b}</p>
              <ul className="space-y-0.5">
                {items.map((c) => (
                  <li key={c.id} className="group/conv relative">
                    {renaming === c.id ? (
                      <input
                        autoFocus
                        defaultValue={c.title}
                        className="w-full rounded-md bg-card px-2 py-1.5 text-sm ring-2 ring-ring/50 outline-none"
                        onBlur={(e) => {
                          onChange(conversations.map((x) => (x.id === c.id ? { ...x, title: e.target.value || c.title } : x)));
                          setRenaming(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                          if (e.key === "Escape") setRenaming(null);
                        }}
                        aria-label="Conversation title"
                      />
                    ) : (
                      <button
                        onClick={() => onSelect(c.id)}
                        aria-current={activeId === c.id ? "true" : undefined}
                        className={cn(
                          "w-full rounded-md px-2 py-1.5 pr-8 text-left transition-colors duration-150",
                          activeId === c.id ? "bg-primary/10 text-heading" : "hover:bg-muted/60",
                        )}
                      >
                        <span className="block truncate text-[0.82rem]">{c.title}</span>
                        <span className="flex items-center gap-1.5 truncate text-[0.68rem] text-muted-foreground">
                          {timeAgo(c.updatedAt)}
                          {c.scope && <span className="truncate rounded bg-muted px-1">{c.scope.label}</span>}
                        </span>
                      </button>
                    )}
                    {renaming !== c.id && (
                      <div className="absolute top-1.5 right-1 opacity-0 transition-opacity group-hover/conv:opacity-100 focus-within:opacity-100">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`Actions for ${c.title}`}><Ellipsis /></Button>} />
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setRenaming(c.id)}><PencilLine /> Rename</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => remove(c, "Archived")}><Archive /> Archive</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setToDelete(c)}><Trash2 /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {list.length === 0 && (q ? <p className="px-2 py-6 text-center text-xs text-muted-foreground">No conversations match “{q}”.</p> : <EmptyState compact icon={MessagesSquare} title="No conversations yet" description="Your questions to BizPilot AI are saved here." />)}
      </nav>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>“{toDelete?.title}” will be permanently deleted. Records it referenced are not affected.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) remove(toDelete, "Deleted");
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
