"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FilterDef = {
  id: string;
  label: string;
  options: { value: string; label: string }[];
};

export type FilterValues = Record<string, string[]>;

type FilterToolbarProps = {
  /** Omit both to hide the search field */
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  filters: FilterDef[];
  values: FilterValues;
  onValuesChange: (v: FilterValues) => void;
  /** Right side: view switcher, column menu, export… */
  right?: React.ReactNode;
  className?: string;
};

/** Glass filter bar (§14.1 toolbar). Sits in the page flow above its list. */
export const FilterToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  values,
  onValuesChange,
  right,
  className,
}: FilterToolbarProps) => {
  const toggle = (id: string, value: string) => {
    const cur = values[id] ?? [];
    onValuesChange({ ...values, [id]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] });
  };
  const active = filters.flatMap((f) =>
    (values[f.id] ?? []).map((v) => ({ id: f.id, value: v, label: `${f.label}: ${f.options.find((o) => o.value === v)?.label ?? v}` })),
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="glass flex flex-wrap items-center gap-1.5 rounded-lg p-1.5">
        {onSearchChange && (
        <label className="flex h-8 min-w-48 flex-1 items-center gap-2 rounded-md bg-card/70 px-2.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring/40 md:max-w-72">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label={searchPlaceholder}
          />
          {search && (
            <button onClick={() => onSearchChange("")} aria-label="Clear search" className="text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </label>
        )}
        <div className="flex flex-wrap items-center gap-1">
          {filters.map((f) => {
            const count = values[f.id]?.length ?? 0;
            return (
              <DropdownMenu key={f.id}>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="sm" className={cn("h-8 text-xs text-muted-foreground", count > 0 && "bg-primary/10 text-primary hover:bg-primary/15")}>
                      {f.label}
                      {count > 0 && <span className="tabular rounded bg-primary px-1 text-[0.6rem] text-primary-foreground">{count}</span>}
                      <ChevronDown className="size-3.5 opacity-60" />
                    </Button>
                  }
                />
                <DropdownMenuContent className="min-w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{f.label}</DropdownMenuLabel>
                    {f.options.map((o) => (
                      <DropdownMenuCheckboxItem
                        key={o.value}
                        checked={values[f.id]?.includes(o.value) ?? false}
                        onCheckedChange={() => toggle(f.id, o.value)}
                      >
                        {o.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </div>
        {right && <div className="ml-auto flex items-center gap-1">{right}</div>}
      </div>

      <AnimatePresence initial={false}>
        {active.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-wrap items-center gap-1.5 overflow-hidden px-1"
          >
            <AnimatePresence initial={false}>
              {active.map((a) => (
                <motion.button
                  layout
                  key={`${a.id}-${a.value}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => toggle(a.id, a.value)}
                  className="inline-flex h-6 items-center gap-1 rounded-full bg-primary/10 pr-1.5 pl-2.5 text-xs text-primary hover:bg-primary/15"
                  aria-label={`Remove filter ${a.label}`}
                >
                  {a.label} <X className="size-3" />
                </motion.button>
              ))}
            </AnimatePresence>
            <button onClick={() => onValuesChange({})} className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Apply FilterValues to rows given accessor functions */
export function applyFilters<T>(rows: T[], values: FilterValues, accessors: Record<string, (row: T) => string>) {
  return rows.filter((row) =>
    Object.entries(values).every(([id, vals]) => !vals.length || !accessors[id] || vals.includes(accessors[id](row))),
  );
}
