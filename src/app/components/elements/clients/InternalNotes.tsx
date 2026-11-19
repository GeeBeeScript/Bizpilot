"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lock, NotebookPen, Pin } from "lucide-react";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import { currentUser, people } from "@/lib/mock/people";
import { daysFromNow, hoursAgo, timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import type { Person } from "@/types";

type Note = {
  id: string;
  author: Person;
  text: string;
  at: string;
  pinned?: boolean;
};

const seed: Note[] = [
  {
    id: "n1",
    author: people.maya,
    text: "Approvals are slow — John needs sign-off from Linda for anything over $10k. Propose a standing weekly approval slot.",
    at: hoursAgo(20),
    pinned: true,
  },
  {
    id: "n2",
    author: people.sarah,
    text: "Renewal conversation should start after the portal launch, not before. Budget for next year is being set in November.",
    at: daysFromNow(-6),
  },
];

/**
 * Internal notes (§14.3 Notes tab). Visually distinct from anything client-visible:
 * amber "internal only" banner, lock iconography and a warm-tinted surface.
 */
export const InternalNotes = ({ initial = seed }: { initial?: Note[] }) => {
  const [notes, setNotes] = useState(initial);
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 rounded-lg bg-warning/10 px-3.5 py-2.5 text-sm ring-1 ring-warning/30">
        <Lock className="size-4 shrink-0 text-warning" aria-hidden />
        <p>
          <span className="font-semibold text-heading">Internal only.</span>{" "}
          <span className="text-muted-foreground">
            Notes are never visible to client contacts or external
            collaborators.
          </span>
        </p>
      </div>

      <form
        className="surface rounded-lg p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setNotes((l) => [
            {
              id: `n${Date.now()}`,
              author: currentUser,
              text: draft,
              at: new Date().toISOString(),
            },
            ...l,
          ]);
          setDraft("");
          notify.success("Note saved");
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Write an internal note…"
          className="border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
          aria-label="New internal note"
        />
        <div className="flex items-center justify-between pt-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" /> Visible to your team
          </span>
          <Button size="sm" type="submit" disabled={!draft.trim()}>
            Save note
          </Button>
        </div>
      </form>

      {notes.length === 0 && (
        <EmptyState
          compact
          icon={NotebookPen}
          title="No internal notes"
          description="Capture context your team should know — preferences, history, sensitivities."
        />
      )}
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {notes.map((n) => (
            <motion.li
              key={n.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border-l-2 border-warning/60 bg-warning/4 px-4 py-3 ring-1 ring-border"
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <UserAvatar person={n.author} className="size-5" />
                <span className="font-medium text-heading">
                  {n.author.name}
                </span>{" "}
                · {timeAgo(n.at)}
                {n.pinned && (
                  <span className="ml-auto flex items-center gap-1 text-warning">
                    <Pin className="size-3" /> Pinned
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{n.text}</p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};
