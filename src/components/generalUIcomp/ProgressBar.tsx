import { cn } from "@/lib/utils";
import type { Health } from "@/types";

type ProgressBarProps = {
  value: number;
  health?: Health;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
  label?: string;
};

const fill: Record<Health, string> = {
  "on-track": "bg-primary",
  "at-risk": "bg-warning",
  "off-track": "bg-danger",
};

export const ProgressBar = ({ value, health = "on-track", showValue = true, size = "sm", className, label }: ProgressBarProps) => (
  <div className={cn("flex items-center gap-2", className)}>
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className={cn("relative w-full overflow-hidden rounded-full bg-muted", size === "sm" ? "h-1.5" : "h-2")}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", fill[health])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
    {showValue && <span className="tabular w-9 shrink-0 text-right text-xs text-muted-foreground">{value}%</span>}
  </div>
);

/** Consumed vs limit meter */
export const UsageMeter = ({ used, limit, label }: { used: number; limit: number; label: string }) => {
  const pct = Math.round((used / limit) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular text-foreground">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <ProgressBar value={pct} health={pct > 90 ? "off-track" : pct > 75 ? "at-risk" : "on-track"} showValue={false} label={label} />
    </div>
  );
};
