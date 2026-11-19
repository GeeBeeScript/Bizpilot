import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import type { Tone } from "./Chips";

type MetricCardProps = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  sentiment?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  tone?: Exclude<Tone, "neutral" | "sapphire">;
  href?: string;
  variant?: "glass" | "solid";
  className?: string;
};

const iconTones = {
  info: "bg-info/14 text-info",
  success: "bg-success/14 text-success",
  warning: "bg-warning/16 text-warning",
  danger: "bg-danger/12 text-danger",
  ai: "bg-ai/18 text-ai",
};

const sentimentText = {
  positive: "text-success",
  negative: "text-danger",
  neutral: "text-muted-foreground",
};

/** KPI card — no charts by design (spec §12.3). Whole card drills down when href is given. */
export const MetricCard = ({
  label,
  value,
  delta,
  trend = "flat",
  sentiment = "neutral",
  icon: Icon,
  tone = "info",
  href,
  variant = "glass",
  className,
}: MetricCardProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.8rem] font-semibold text-muted-foreground">{label}</p>
        <span className={cn("grid size-8 place-items-center rounded-full", iconTones[tone])}>
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <div className="tabular mt-1 text-2xl font-semibold text-heading">{value}</div>
      {delta && (
        <div className={cn("mt-1 flex items-center gap-1 text-xs", sentimentText[sentiment])}>
          <TrendIcon className="size-3.5" aria-hidden />
          <span>{delta}</span>
        </div>
      )}
      {href && (
        <ArrowRight
          className="absolute right-3 bottom-3 size-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-150 group-hover/metric:translate-x-0 group-hover/metric:opacity-100"
          aria-hidden
        />
      )}
    </>
  );

  const classes = cn(
    "group/metric relative block min-w-0 rounded-lg px-4 py-3.5 font-num transition-all duration-150",
    variant === "glass" ? "glass" : "surface",
    href && "hover:-translate-y-0.5 hover:lift focus-visible:ring-3 focus-visible:ring-ring/40 outline-none",
    className,
  );

  return href ? (
    <Link href={href} className={classes} aria-label={`${label}: ${value}. ${delta ?? ""}`}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
};
