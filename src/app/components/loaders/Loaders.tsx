import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/** Regular UI/data loader (§6.1). Never used for AI work. */
export const Spinner = ({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) => (
  <Loader2
    className={cn("size-4 animate-spin text-muted-foreground", className)}
    aria-label={label}
    role="status"
  />
);

export const SkeletonCard = ({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) => (
  <div
    className={cn("surface space-y-3 rounded-lg p-4", className)}
    aria-hidden
  >
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="size-7 rounded-full" />
    </div>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-3" style={{ width: `${90 - i * 14}%` }} />
    ))}
  </div>
);

export const SkeletonRows = ({
  rows = 6,
  className,
}: {
  rows?: number;
  className?: string;
}) => (
  <div className={cn("divide-y divide-border", className)} aria-hidden>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-3 py-3">
        <Skeleton className="size-4 rounded" />
        <Skeleton className="size-8 rounded-md" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2.5 w-1/5" />
        </div>
        <Skeleton className="hidden h-5 w-16 rounded-full md:block" />
        <Skeleton className="hidden h-3 w-20 md:block" />
      </div>
    ))}
  </div>
);

export const SkeletonMetricRow = ({ count = 5 }: { count?: number }) => (
  <div
    className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
    aria-hidden
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass space-y-2 rounded-lg px-4 py-3.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    ))}
  </div>
);

/** Generic page skeleton used by route-level loading.tsx */
export const PageSkeleton = () => (
  <div className="space-y-6" role="status" aria-label="Loading page">
    <div className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-3.5 w-72" />
    </div>
    <SkeletonMetricRow count={4} />
    <div className="surface rounded-lg">
      <SkeletonRows rows={7} />
    </div>
  </div>
);

/** Thin top progress bar for route transitions (§6.5) */
export const RouteProgress = () => (
  <div
    className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden"
    aria-hidden
  >
    <div className="h-full w-1/2 origin-left animate-route rounded-full bg-linear-to-r from-primary-blue via-primary-gold to-primary-blue" />
  </div>
);
