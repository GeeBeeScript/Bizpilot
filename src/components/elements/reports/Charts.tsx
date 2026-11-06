"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { BarChart3, Table2 } from "lucide-react";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { SegmentedList, SegmentedTrigger, Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* Mark specs (dataviz): bars ≤24px, 4px rounded data-end, square at baseline; 2px lines;
   ~10% area wash; hairline horizontal grid only; hover tooltips; table view for every chart. */

export const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K` : String(n);
export const money = (n: number) => `$${compact(n)}`;

type Row = Record<string, string | number>;

/** Chart card body with a Chart | Table toggle (table view = accessible alternative) */
export const ChartFrame = ({
  rows,
  columns,
  children,
  className,
}: {
  rows: Row[];
  columns: { key: string; label: string; format?: (v: number) => string }[];
  children: React.ReactNode;
  className?: string;
}) => {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-end">
        <Tabs value={view} onValueChange={(v) => setView(v as "chart" | "table")}>
          <SegmentedList aria-label="Display as">
            <SegmentedTrigger value="chart" aria-label="Chart"><BarChart3 /></SegmentedTrigger>
            <SegmentedTrigger value="table" aria-label="Table"><Table2 /></SegmentedTrigger>
          </SegmentedList>
        </Tabs>
      </div>
      {view === "chart" ? (
        children
      ) : (
        <div className="max-h-72 overflow-auto rounded-md ring-1 ring-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted">
              <tr>{columns.map((c, i) => <th key={c.key} className={cn("px-3 py-1.5 text-xs font-semibold text-muted-foreground", i === 0 ? "text-left" : "text-right")}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border/70">
                  {columns.map((c, j) => (
                    <td key={c.key} className={cn("px-3 py-1.5", j === 0 ? "text-left" : "tabular text-right")}>
                      {typeof r[c.key] === "number" && c.format ? c.format(r[c.key] as number) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/** Single-series trend (area wash + 2px line + crosshair tooltip). Single series → no legend. */
export const TrendChart = ({ data, x, y, label, format = compact, className }: { data: Row[]; x: string; y: string; label: string; format?: (n: number) => string; className?: string }) => {
  const config = { [y]: { label, color: "var(--chart-1)" } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className={cn("aspect-auto h-64 w-full", className)}>
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          <linearGradient id={`fill-${y}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`var(--color-${y})`} stopOpacity={0.14} />
            <stop offset="100%" stopColor={`var(--color-${y})`} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey={x} tickLine={false} axisLine={{ stroke: "var(--border)" }} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v) => format(Number(v))} />
        <ChartTooltip cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }} content={<ChartTooltipContent formatter={(v) => <span className="tabular font-medium text-foreground">{format(Number(v))}</span>} />} />
        <Area dataKey={y} type="monotone" stroke={`var(--color-${y})`} strokeWidth={2} fill={`url(#fill-${y})`} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }} />
      </AreaChart>
    </ChartContainer>
  );
};

/** Ranked horizontal bars; each bar drills down to its record (§19.3). */
export const RankedBars = ({
  data,
  label,
  format = compact,
  hrefFor,
  reference,
  className,
}: {
  data: { id: string; name: string; value: number }[];
  label: string;
  format?: (n: number) => string;
  hrefFor?: (id: string) => string;
  reference?: { value: number; label: string };
  className?: string;
}) => {
  const router = useRouter();
  const config = { value: { label, color: "var(--chart-1)" } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full", className)} style={{ height: Math.max(160, data.length * 40 + 24) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 48, top: 4, bottom: 4 }} barCategoryGap={8}>
        <XAxis type="number" hide domain={[0, "dataMax"]} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={150} tick={{ fill: "var(--foreground)", fontSize: 12 }} />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltipContent hideIndicator formatter={(v) => <span className="tabular font-medium text-foreground">{format(Number(v))}</span>} />} />
        {reference && <ReferenceLine x={reference.value} stroke="var(--danger)" strokeDasharray="0" strokeWidth={1} label={{ value: reference.label, position: "top", fill: "var(--muted-foreground)", fontSize: 11 }} />}
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={[0, 4, 4, 0]}
          maxBarSize={22}
          className={cn(hrefFor && "cursor-pointer")}
          onClick={(d: { payload?: { id: string } }) => hrefFor && d.payload && router.push(hrefFor(d.payload.id))}
          label={{ position: "right", fill: "var(--muted-foreground)", fontSize: 11, formatter: (v: unknown) => format(Number(v)) }}
        />
      </BarChart>
    </ChartContainer>
  );
};

/** Column chart, one series per key. ≥2 series get a legend; 2px surface gap between grouped bars. */
export const ColumnChart = ({
  data,
  x,
  series,
  format = compact,
  className,
}: {
  data: Row[];
  x: string;
  series: { key: string; label: string; color: string }[];
  format?: (n: number) => string;
  className?: string;
}) => {
  const config = Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }])) satisfies ChartConfig;
  return (
    <ChartContainer config={config} className={cn("aspect-auto h-64 w-full", className)}>
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }} barGap={2}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey={x} tickLine={false} axisLine={{ stroke: "var(--border)" }} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v) => format(Number(v))} allowDecimals={false} />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltipContent formatter={(v, name) => <span className="flex w-full justify-between gap-4"><span className="text-muted-foreground">{config[name as string]?.label}</span><span className="tabular font-medium text-foreground">{format(Number(v))}</span></span>} />} />
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((s) => <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={[4, 4, 0, 0]} maxBarSize={24} />)}
      </BarChart>
    </ChartContainer>
  );
};
