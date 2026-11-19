"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/hooks";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/** Light / Dark / System segmented control (§3.9). Applies immediately, persisted by next-themes. */
export const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const mounted = useHydrated();

  return (
    <div role="radiogroup" aria-label="Theme" className={cn("grid grid-cols-3 gap-0.5 rounded-lg bg-muted/80 p-0.5", className)}>
      {options.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-7 items-center justify-center gap-1.5 rounded-md text-xs transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              active ? "bg-card font-medium text-heading shadow-sm ring-1 ring-foreground/5" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden /> {label}
          </button>
        );
      })}
    </div>
  );
};
