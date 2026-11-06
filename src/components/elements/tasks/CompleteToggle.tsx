"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Completion checkbox with a restrained check animation (§35) */
export const CompleteToggle = ({ done, onToggle, label }: { done: boolean; onToggle: () => void; label: string }) => (
  <button
    onClick={onToggle}
    role="checkbox"
    aria-checked={done}
    aria-label={done ? `Mark “${label}” as not done` : `Complete “${label}”`}
    className={cn(
      "grid size-5 shrink-0 place-items-center rounded-full ring-[1.5px] transition-all duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
      done ? "bg-success ring-success" : "ring-muted-foreground/50 hover:bg-success/10 hover:ring-success",
    )}
  >
    <AnimatePresence>
      {done && (
        <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 28 }}>
          <Check className="size-3 text-white" strokeWidth={3.5} />
        </motion.span>
      )}
    </AnimatePresence>
  </button>
);

