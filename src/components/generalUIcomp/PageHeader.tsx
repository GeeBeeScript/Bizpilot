import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: React.ReactNode;
  /** e.g. a count badge next to the title */
  titleAddon?: React.ReactNode;
  description?: React.ReactNode;
  /** Primary action goes last */
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export const PageHeader = ({ title, titleAddon, description, actions, className, children }: PageHeaderProps) => (
  <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
    <div className="min-w-0 space-y-1">
      <div className="flex items-center gap-2">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-heading md:text-[1.4rem]">{title}</h1>
        {titleAddon}
      </div>
      {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const CountBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="tabular rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{children}</span>
);

/** Standard page padding inside the scrolling content region */
export const PageContainer = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("mx-auto w-full max-w-[1680px] px-4 py-5 md:px-7 md:py-7", className)}>{children}</div>
);
