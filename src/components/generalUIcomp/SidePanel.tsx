"use client";

import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type SidePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Slot above the title (breadcrumb/context) */
  eyebrow?: React.ReactNode;
  /** Header-right controls, e.g. a More menu */
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
  children: React.ReactNode;
};

/**
 * Right-side drawer for contextual work (§5.5). Sticky header/footer, scrollable body.
 * Near-full width on tablet, full-screen sheet on mobile (§32).
 */
export const SidePanel = ({
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  headerActions,
  footer,
  size = "md",
  children,
}: SidePanelProps) => (
  <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
    <DrawerContent
      className={cn(
        "border-l-0 bg-card font-sans elev-4 data-[swipe-direction=right]:rounded-l-none [--drawer-content-width:100%] sm:[--drawer-content-width:92%] sm:data-[swipe-direction=right]:rounded-l-xl",
        size === "md" ? "md:[--drawer-content-width:30rem]" : "md:[--drawer-content-width:min(46rem,92%)]",
      )}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 space-y-1">
            {eyebrow && <div className="text-xs text-muted-foreground">{eyebrow}</div>}
            <DrawerTitle className="font-heading text-base font-semibold text-heading">{title}</DrawerTitle>
            {description && <DrawerDescription className="text-sm text-muted-foreground">{description}</DrawerDescription>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {headerActions}
            <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} aria-label="Close panel">
              <X />
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 scrollbar-thin">{children}</div>
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-card/95 px-5 py-3">{footer}</div>
        )}
      </div>
    </DrawerContent>
  </Drawer>
);

/** Labelled form section inside panels */
export const PanelSection = ({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) => (
  <fieldset className={cn("space-y-3 border-b border-border pb-5 mb-5 last:mb-0 last:border-0 last:pb-0", className)}>
    <legend className="mb-3 font-heading text-[0.8rem] font-semibold tracking-wide text-heading uppercase">{title}</legend>
    {description && <p className="-mt-2 text-xs text-muted-foreground">{description}</p>}
    {children}
  </fieldset>
);

export const Field = ({ label, htmlFor, hint, error, children, className }: { label: string; htmlFor?: string; hint?: string; error?: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-1.5", className)}>
    <label htmlFor={htmlFor} className="block text-xs font-medium text-foreground">{label}</label>
    {children}
    {error ? <p className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
  </div>
);
