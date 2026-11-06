"use client";

import { useId, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FloatingBar } from "@/components/generalUIcomp/FloatingBar";
import { cn } from "@/lib/utils";

export type GridModule = { id: string; title: string; span: string; content: React.ReactNode };

type Props = {
  modules: GridModule[];
  order: string[];
  hidden: string[];
  customizing: boolean;
  onOrderChange: (order: string[]) => void;
  onHiddenChange: (hidden: string[]) => void;
  onReset: () => void;
  onDone: () => void;
};

const SortableModule = ({ mod, customizing, onHide }: { mod: GridModule; customizing: boolean; onHide: () => void }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: mod.id, disabled: !customizing });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "relative min-w-0",
        mod.span,
        customizing && "rounded-lg outline-2 outline-offset-4 outline-primary/35 outline-dashed",
        isDragging && "z-10 opacity-35",
      )}
    >
      {customizing && (
        <div className="absolute -top-3.5 left-3 z-20 flex items-center gap-0.5 rounded-full glass-strong elev-2 py-0.5 pr-1 pl-0.5 text-xs font-medium text-heading">
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="grid size-6 cursor-grab place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring/50 outline-none"
            aria-label={`Reorder ${mod.title}. Press space to pick up, arrow keys to move.`}
          >
            <GripVertical className="size-3.5" />
          </button>
          <span className="px-1">{mod.title}</span>
          <button onClick={onHide} className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Hide ${mod.title}`}>
            <EyeOff className="size-3.5" />
          </button>
        </div>
      )}
      <div className={cn("h-full transition-opacity", customizing && "pointer-events-none opacity-90 select-none")} aria-hidden={customizing || undefined}>
        {mod.content}
      </div>
    </div>
  );
};

/** Reorderable / hideable module grid (§12.14, §31) */
const DashboardGrid = ({ modules, order, hidden, customizing, onOrderChange, onHiddenChange, onReset, onDone }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byId = Object.fromEntries(modules.map((m) => [m.id, m]));
  const visible = order.filter((id) => byId[id] && !hidden.includes(id));
  const hiddenMods = hidden.map((id) => byId[id]).filter(Boolean);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const next = [...order];
    const from = next.indexOf(String(active.id));
    const to = next.indexOf(String(over.id));
    next.splice(to, 0, next.splice(from, 1)[0]);
    onOrderChange(next);
  };

  return (
    <>
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(String(active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={visible} strategy={rectSortingStrategy}>
          <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-6 xl:grid-cols-12", customizing && "gap-y-8 pt-3")}>
            {visible.map((id) => (
              <SortableModule key={id} mod={byId[id]} customizing={customizing} onHide={() => onHiddenChange([...hidden, id])} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.22,1,0.36,1)" }}>
          {activeId && (
            <div className="glass-strong elev-4 flex h-20 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-heading ring-2 ring-primary/40">
              <GripVertical className="size-4 text-muted-foreground" /> {byId[activeId]?.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <FloatingBar open={customizing}>
        <span className="px-2.5 text-sm text-muted-foreground max-sm:hidden">Drag modules to reorder</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" disabled={!hiddenMods.length}>
                <Eye /> Hidden <span className="tabular text-muted-foreground">{hiddenMods.length}</span>
              </Button>
            }
          />
          <DropdownMenuContent side="top" align="center" className="w-56">
            <DropdownMenuLabel>Show module</DropdownMenuLabel>
            {hiddenMods.map((m) => (
              <DropdownMenuItem key={m.id} onClick={() => onHiddenChange(hidden.filter((h) => h !== m.id))}>
                <Eye /> {m.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw /> Reset layout
        </Button>
        <Button size="sm" onClick={onDone}>Done</Button>
      </FloatingBar>
    </>
  );
};

export default DashboardGrid;
