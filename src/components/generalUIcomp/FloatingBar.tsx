"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FloatingBarProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Floating glass pill, sticky to the bottom of the content region (Miro-style toolbar) */
export const FloatingBar = ({ open, children, className }: FloatingBarProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={cn("pointer-events-none sticky bottom-5 z-40 mt-4 flex justify-center", className)}
      >
        <div className="glass-strong elev-3 pointer-events-auto flex items-center gap-1 rounded-xl p-1.5">{children}</div>
      </motion.div>
    )}
  </AnimatePresence>
);

/** Bulk action bar for selected rows (§5.3, §14.1) */
export const BulkActionBar = ({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: React.ReactNode;
}) => (
  <FloatingBar open={count > 0}>
    <span className="tabular px-2.5 text-sm font-medium text-heading">{count} selected</span>
    <span className="mx-1 h-5 w-px bg-border" aria-hidden />
    {children}
    <span className="mx-1 h-5 w-px bg-border" aria-hidden />
    <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label="Clear selection">
      <X />
    </Button>
  </FloatingBar>
);
