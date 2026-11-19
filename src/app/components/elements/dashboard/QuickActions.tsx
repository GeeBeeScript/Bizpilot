"use client";

import { useRouter } from "next/navigation";
import { Brain, ClipboardPlus, FolderPlus, Upload, UserRoundPlus, Workflow, type LucideIcon } from "lucide-react";
import { useQuickCreate, type CreateKind } from "@/context/quickCreateContext";
import { cn } from "@/lib/utils";

type Action = { label: string; icon: LucideIcon; kind?: CreateKind; href?: string; ai?: boolean };

const actions: Action[] = [
  { label: "New client", icon: UserRoundPlus, kind: "client" },
  { label: "New project", icon: FolderPlus, kind: "project" },
  { label: "New task", icon: ClipboardPlus, kind: "task" },
  { label: "Upload document", icon: Upload, kind: "document" },
  { label: "Ask AI", icon: Brain, href: "/u/ai", ai: true },
  { label: "Create automation", icon: Workflow, href: "/u/automations" },
];

/** Prominent shortcuts (§12.13) — a floating glass strip */
const QuickActions = () => {
  const { openCreate } = useQuickCreate();
  const router = useRouter();
  return (
    <div className="glass grid grid-cols-3 gap-1 rounded-lg p-1.5 sm:grid-cols-6">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => (a.kind ? openCreate(a.kind) : router.push(a.href!))}
          className="group/qa flex flex-col items-center gap-1.5 rounded-md px-2 py-2.5 text-xs text-foreground transition-all duration-150 hover:bg-card/80 focus-visible:ring-2 focus-visible:ring-ring/50 outline-none sm:flex-row sm:justify-center"
        >
          <span
            className={cn(
              "grid size-7 place-items-center rounded-md transition-transform duration-150 group-hover/qa:scale-105",
              a.ai ? "bg-linear-to-br from-primary-blue to-deep-sapphire text-primary-gold" : "bg-primary/10 text-primary dark:text-info",
            )}
          >
            <a.icon className="size-3.5" aria-hidden />
          </span>
          <span className="font-medium">{a.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
