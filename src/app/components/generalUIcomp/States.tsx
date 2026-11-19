import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CloudAlert,
  Lock,
  RotateCw,
  SearchX,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "gap-2 py-8" : "gap-3 py-16",
      className,
    )}
  >
    <div className="relative">
      <div
        className="absolute inset-0 -z-10 scale-150 rounded-full bg-primary-blue/10 blur-xl"
        aria-hidden
      />
      <span
        className={cn(
          "grid place-items-center rounded-lg glass",
          compact ? "size-10" : "size-14",
        )}
      >
        <Icon
          className={cn(
            "text-primary-blue dark:text-info",
            compact ? "size-5" : "size-6",
          )}
          aria-hidden
        />
      </span>
    </div>
    <div className="max-w-sm space-y-1">
      <h3 className="font-heading text-base font-semibold text-heading">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {(action || secondaryAction) && (
      <div className="mt-1 flex items-center gap-2">
        {action}
        {secondaryAction}
      </div>
    )}
  </div>
);

type ErrorStateProps = {
  title?: string;
  description?: string;
  /** Reassure users their data is intact */
  dataSafe?: boolean;
  reference?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
};

/** Error state for a page or a single module (partial failure, spec §7) */
export const ErrorState = ({
  title = "We couldn't load this",
  description = "Something went wrong while fetching the latest data.",
  dataSafe = true,
  reference,
  onRetry,
  compact,
  className,
}: ErrorStateProps) => (
  <div
    role="alert"
    className={cn(
      "flex flex-col items-center justify-center gap-3 text-center",
      compact ? "py-6" : "py-16",
      className,
    )}
  >
    <span
      className={cn(
        "grid place-items-center rounded-lg bg-danger/10",
        compact ? "size-9" : "size-12",
      )}
    >
      <CloudAlert className="size-5 text-danger" aria-hidden />
    </span>
    <div className="max-w-sm space-y-1">
      <h3 className="font-heading text-sm font-semibold text-heading">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {dataSafe && (
        <p className="flex items-center justify-center gap-1 text-xs text-success">
          <ShieldCheck className="size-3.5" aria-hidden /> Your data is safe.
          Nothing was changed.
        </p>
      )}
    </div>
    <div className="flex items-center gap-3">
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw /> Retry
        </Button>
      )}
      {reference && (
        <span className="font-mono text-[0.7rem] text-subtle">
          Ref {reference}
        </span>
      )}
    </div>
  </div>
);

export const NoResults = ({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) => (
  <EmptyState
    compact
    icon={SearchX}
    title="No matching results"
    description={
      query
        ? `Nothing matches “${query}” with the current filters.`
        : "Nothing matches the current filters."
    }
    action={
      onClear && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )
    }
  />
);

export const PermissionDenied = ({ what = "this page" }: { what?: string }) => (
  <EmptyState
    icon={Lock}
    title="You don't have access"
    description={`Your role doesn't include permission to view ${what}. Ask an organization admin to update your access.`}
    action={
      <Button variant="outline" size="sm">
        Request access
      </Button>
    }
  />
);
