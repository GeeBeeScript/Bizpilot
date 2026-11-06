import { cn } from "@/lib/utils";

export const Kbd = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <kbd
    data-slot="kbd"
    className={cn(
      "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted/70 px-1 font-mono text-[0.65rem] font-medium text-muted-foreground",
      className,
    )}
  >
    {children}
  </kbd>
);
