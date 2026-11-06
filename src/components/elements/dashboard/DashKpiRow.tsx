import { CircleGauge, ClockAlert, DollarSign, FolderOpen, UserGroup, type LucideIcon } from "lucide-react";
import { MetricCard } from "@/components/generalUIcomp/MetricCard";
import type { Kpi } from "@/types";

const meta: Record<Kpi["id"], { icon: LucideIcon; tone: "info" | "success" | "warning" | "danger" | "ai" }> = {
  clients: { icon: UserGroup, tone: "info" },
  projects: { icon: FolderOpen, tone: "success" },
  overdue: { icon: ClockAlert, tone: "danger" },
  revenue: { icon: DollarSign, tone: "warning" },
  ai: { icon: CircleGauge, tone: "ai" },
};

/** Business Overview KPI row (§12.3) — values, comparison, drill-down; no charts */
const DashKpiRow = ({ kpis }: { kpis: Kpi[] }) => (
  <section aria-label="Business overview">
    <h2 className="sr-only">Business Overview</h2>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {kpis.map((k, i) => (
        <MetricCard
          key={k.id}
          label={k.label}
          value={k.value}
          delta={k.delta}
          trend={k.trend}
          sentiment={k.sentiment}
          href={k.href}
          icon={meta[k.id].icon}
          tone={meta[k.id].tone}
          className={i === kpis.length - 1 ? "max-md:col-span-2" : undefined}
        />
      ))}
    </div>
  </section>
);

export default DashKpiRow;
