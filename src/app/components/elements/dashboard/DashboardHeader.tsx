"use client";

import { useState } from "react";
import { Calendar, ChevronDown, LayoutGrid, RotateCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { greeting } from "@/lib/date";
import { cn } from "@/lib/utils";

const ranges = ["Today", "Last 7 days", "Last 30 days", "This quarter"];

type Props = {
  firstName: string;
  summary: React.ReactNode;
  customizing: boolean;
  onCustomize: () => void;
};

/** Dashboard header (§12.2): greeting, context summary, date range, refresh, customize */
const DashboardHeader = ({
  firstName,
  summary,
  customizing,
  onCustomize,
}: Props) => {
  const [range, setRange] = useState("Last 7 days");
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState("Updated 2m ago");

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setUpdated("Updated just now");
    }, 900);
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        <h1
          className="font-heading text-xl font-semibold tracking-tight text-heading md:text-[1.45rem]"
          suppressHydrationWarning
        >
          {greeting()}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-subtle max-sm:hidden" aria-live="polite">
          {refreshing ? "Refreshing…" : updated}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={refresh}
          disabled={refreshing}
          aria-label="Refresh dashboard"
        >
          <RotateCw className={cn(refreshing && "animate-spin")} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="secondary" className="h-8 gap-2 px-3">
                <Calendar className="text-muted-foreground" /> {range}{" "}
                <ChevronDown className="text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuRadioGroup
              value={range}
              onValueChange={(v) => setRange(v as string)}
            >
              {ranges.map((r) => (
                <DropdownMenuRadioItem key={r} value={r}>
                  {r}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant={customizing ? "default" : "outline"}
          className="h-8"
          onClick={onCustomize}
          aria-pressed={customizing}
        >
          <LayoutGrid /> {customizing ? "Customizing" : "Customize"}
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
