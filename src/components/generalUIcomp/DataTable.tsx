"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Column<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Enables sorting on this column */
  sortValue?: (row: T) => string | number;
  className?: string;
  /** Responsive column reduction (§32 tablet) */
  hideBelow?: "md" | "lg" | "xl" | "2xl";
  align?: "left" | "right" | "center";
};

type DataTableProps<T> = {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  hiddenColumns?: string[];
  selectable?: boolean;
  selected?: Set<string>;
  onSelectedChange?: (s: Set<string>) => void;
  /** Revealed on row hover / focus */
  rowActions?: (row: T) => React.ReactNode;
  rowHref?: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Compact list item rendered instead of the table below md (§5.3) */
  mobileItem?: (row: T) => React.ReactNode;
  pageSize?: number;
  empty?: React.ReactNode;
  className?: string;
  ariaLabel: string;
};

const hide = { md: "max-md:hidden", lg: "max-lg:hidden", xl: "max-xl:hidden", "2xl": "max-2xl:hidden" };
const align = { left: "text-left", right: "text-right", center: "text-center" };

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  hiddenColumns = [],
  selectable,
  selected = new Set(),
  onSelectedChange,
  rowActions,
  rowHref,
  onRowClick,
  mobileItem,
  pageSize = 10,
  empty,
  className,
  ariaLabel,
}: DataTableProps<T>) {
  const router = useRouter();
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);

  const visible = columns.filter((c) => !hiddenColumns.includes(c.id));

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      const r = va < vb ? -1 : va > vb ? 1 : 0;
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, columns, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  const pageRows = sorted.slice(current * pageSize, current * pageSize + pageSize);
  const pageIds = pageRows.map(getRowId);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someChecked = pageIds.some((id) => selected.has(id));

  const toggleAll = () => {
    const next = new Set(selected);
    pageIds.forEach((id) => (allChecked ? next.delete(id) : next.add(id)));
    onSelectedChange?.(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedChange?.(next);
  };

  const cycleSort = (id: string) =>
    setSort((s) => (s?.id !== id ? { id, dir: "asc" } : s.dir === "asc" ? { id, dir: "desc" } : null));

  const activate = (row: T) => {
    if (onRowClick) onRowClick(row);
    else if (rowHref) router.push(rowHref(row));
  };

  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className={cn("surface overflow-hidden rounded-lg", className)}>
      {/* Desktop/tablet table */}
      <div className={cn("overflow-x-auto scrollbar-thin", mobileItem && "max-md:hidden")}>
        <table className="w-full text-sm" aria-label={ariaLabel}>
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {selectable && (
                <th className="w-10 px-3">
                  <Checkbox
                    checked={allChecked}
                    indeterminate={!allChecked && someChecked}
                    onCheckedChange={toggleAll}
                    aria-label="Select all rows on this page"
                  />
                </th>
              )}
              {visible.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  aria-sort={sort?.id === c.id ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={cn(
                    "h-9 px-3 text-[0.72rem] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase",
                    align[c.align ?? "left"],
                    c.hideBelow && hide[c.hideBelow],
                  )}
                >
                  {c.sortValue ? (
                    <button
                      onClick={() => cycleSort(c.id)}
                      className="inline-flex items-center gap-1 rounded tracking-wide uppercase hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 outline-none"
                    >
                      {c.header}
                      {sort?.id === c.id ? (
                        sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
              {rowActions && <th className="w-px" aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const id = getRowId(row);
              const isSel = selected.has(id);
              return (
                <tr
                  key={id}
                  data-selected={isSel || undefined}
                  onClick={() => activate(row)}
                  className={cn(
                    "group/row border-b border-border/70 transition-colors duration-150 last:border-0 hover:bg-muted/45 data-selected:bg-primary/6",
                    (rowHref || onRowClick) && "cursor-pointer",
                  )}
                >
                  {selectable && (
                    <td className="w-10 px-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSel} onCheckedChange={() => toggleOne(id)} aria-label="Select row" />
                    </td>
                  )}
                  {visible.map((c) => (
                    <td
                      key={c.id}
                      className={cn("px-3 py-2.5 align-middle whitespace-nowrap", align[c.align ?? "left"], c.hideBelow && hide[c.hideBelow], c.className)}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 group-focus-within/row:opacity-100 max-lg:opacity-100">
                        {rowActions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile compact list */}
      {mobileItem && (
        <ul className="divide-y divide-border md:hidden">
          {pageRows.map((row) => (
            <li key={getRowId(row)}>
              <button onClick={() => activate(row)} className="w-full px-4 py-3 text-left active:bg-muted/60">
                {mobileItem(row)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span className="tabular">
            {current * pageSize + 1}–{Math.min(sorted.length, (current + 1) * pageSize)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page">
              <ChevronLeft />
            </Button>
            <span className="tabular px-1">
              {current + 1} / {pages}
            </span>
            <Button variant="ghost" size="icon-sm" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Next page">
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
