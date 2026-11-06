"use client";

import { GripVertical } from "lucide-react";
import { nodeLibrary } from "@/lib/mock/automations";
import { cn } from "@/lib/utils";
import type { AutomationNodeKind } from "@/types";
import { PALETTE_MIME, kindMeta } from "./WorkflowCanvas";

type Props = { onAdd: (item: { kind: AutomationNodeKind; type: string; label: string }) => void; hasTrigger: boolean };

/** Step library. Drag onto the canvas, or click / Enter to add (keyboard alternative) */
export const NodePalette = ({ onAdd, hasTrigger }: Props) => (
  <div className="space-y-4 p-3">
    {(Object.keys(nodeLibrary) as AutomationNodeKind[]).map((kind) => {
      const m = kindMeta[kind];
      const disabled = kind === "trigger" && hasTrigger;
      return (
        <section key={kind}>
          <h3 className="mb-1.5 flex items-center gap-1.5 px-1 text-[0.65rem] font-semibold tracking-wider text-subtle uppercase">
            <m.icon className="size-3" aria-hidden /> {kind === "ai" ? "AI steps" : `${m.label}s`}
            {disabled && <span className="font-normal normal-case">· one per workflow</span>}
          </h3>
          <ul className="space-y-1">
            {nodeLibrary[kind].map((item) => (
              <li key={item.type}>
                <button
                  draggable={!disabled}
                  disabled={disabled}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(PALETTE_MIME, JSON.stringify({ kind, type: item.type, label: item.label }));
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => onAdd({ kind, type: item.type, label: item.label })}
                  className={cn(
                    "group/pal flex w-full cursor-grab items-center gap-2 rounded-md bg-card px-2 py-1.5 text-left text-xs ring-1 ring-border transition-all duration-150 hover:ring-primary/40 hover:elev-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-45",
                  )}
                  aria-label={`Add ${item.label}`}
                >
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded", m.chip)}><m.icon className="size-3" aria-hidden /></span>
                  <span className="flex-1 truncate">{item.label}</span>
                  <GripVertical className="size-3.5 text-subtle opacity-0 group-hover/pal:opacity-100" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
      );
    })}
  </div>
);
