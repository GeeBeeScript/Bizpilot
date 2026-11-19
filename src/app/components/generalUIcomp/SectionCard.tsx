import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import CardNavLink from "./CardNavLink";

type SectionCardProps = {
  title: React.ReactNode;
  icon?: LucideIcon;
  description?: React.ReactNode;
  /** Header link, e.g. "Clients >" */
  link?: { href: string; label: string };
  /** Extra header controls (filters, menus) */
  actions?: React.ReactNode;
  /** solid = dense content; glass = summary/floating modules; ai = AI surfaces */
  variant?: "solid" | "glass" | "ai";
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
  as?: "section" | "div";
};

const variants = {
  solid: "surface",
  glass: "glass",
  ai: "glass-ai",
};

/** Module container used across Dashboard, Client and Project workspaces */
export const SectionCard = ({
  title,
  icon: Icon,
  description,
  link,
  actions,
  variant = "solid",
  footer,
  className,
  bodyClassName,
  children,
  as: Tag = "section",
}: SectionCardProps) => (
  <Tag className={cn("flex min-w-0 flex-col rounded-lg text-card-foreground", variants[variant], className)}>
    <header className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-1.5 font-heading text-[0.9rem] font-semibold text-heading">
          {Icon && <Icon className={cn("size-4.5 shrink-0", variant === "ai" ? "text-ai" : "text-primary-blue dark:text-info")} aria-hidden />}
          <span className="truncate">{title}</span>
        </h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {actions}
        {link && (
          <CardNavLink href={link.href} buttonStyles="text-xs text-muted-foreground">
            {link.label}
          </CardNavLink>
        )}
      </div>
    </header>
    <div className={cn("min-h-0 flex-1 px-4 pb-4", bodyClassName)}>{children}</div>
    {footer && <footer className="flex items-center justify-end gap-2 border-t border-border/70 px-4 py-2.5">{footer}</footer>}
  </Tag>
);
