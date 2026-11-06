import { cn } from "@/lib/utils";

/** Capacity bar: >100% is over-allocated (danger), 85–100% busy (warning) */
export const WorkloadBar = ({ value, className }: { value: number; className?: string }) => {
  const tone = value > 100 ? "bg-danger" : value >= 85 ? "bg-warning" : "bg-success";
  const label = value > 100 ? "Over capacity" : value >= 85 ? "Busy" : value === 0 ? "No work assigned" : "Available";
  return (
    <div className={cn("flex items-center gap-2", className)} title={`${value}% of capacity · ${label}`}>
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-muted" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={120} aria-label={`Workload ${value}%`}>
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${Math.min(100, (value / 120) * 100)}%` }} />
        <span className="absolute inset-y-0 left-[83.3%] w-px bg-foreground/30" aria-hidden />
      </div>
      <span className={cn("tabular w-9 text-xs", value > 100 ? "font-medium text-danger" : "text-muted-foreground")}>{value}%</span>
    </div>
  );
};
