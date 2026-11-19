"use client";

import { useId, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Ban, Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

export type BoardColumn = {
  id: string;
  label: string;
  icon: LucideIcon;
  accent: string;
};

type KanbanBoardProps<T> = {
  columns: BoardColumn[];
  items: T[];
  getId: (item: T) => string;
  getColumn: (item: T) => string;
  setColumn: (item: T, column: string) => T;
  onItemsChange: (items: T[]) => void;
  renderCard: (
    item: T,
    state: { overlay?: boolean; justDropped?: boolean },
  ) => React.ReactNode;
  /** Return a reason string when a drop is not allowed (shown on the column) */
  invalidReason?: (item: T, column: string) => string | null;
  onAdd?: (column: string) => void;
  itemLabel?: (item: T) => string;
};

const SortableCard = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "relative touch-manipulation rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        // Source card becomes muted; its slot doubles as the insertion indicator
        isDragging &&
          "opacity-40 [&>*]:outline-2 [&>*]:outline-offset-2 [&>*]:outline-dashed [&>*]:outline-primary/50",
      )}
    >
      {children}
    </li>
  );
};

const Column = ({
  column,
  count,
  children,
  dragActive,
  isSource,
  isOver,
  invalid,
  onAdd,
}: {
  column: BoardColumn;
  count: number;
  children: React.ReactNode;
  dragActive: boolean;
  isSource: boolean;
  isOver: boolean;
  invalid: string | null;
  onAdd?: () => void;
}) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  const Icon = column.icon;
  return (
    <section
      ref={setNodeRef}
      aria-label={`${column.label}, ${count} items`}
      className={cn(
        "flex w-[17.5rem] shrink-0 flex-col rounded-xl bg-muted/45 ring-1 ring-border/60 backdrop-blur-sm transition-all duration-200 dark:bg-card/40",
        dragActive && !isSource && !invalid && "bg-primary/5 ring-primary/25",
        isOver && !invalid && "bg-primary/10 ring-2 ring-primary/50",
        invalid && "bg-danger/4 opacity-60 ring-danger/30",
      )}
    >
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span
          className="h-3.5 w-1 rounded-full"
          style={{ background: column.accent }}
          aria-hidden
        />
        <Icon className="size-3.5 text-muted-foreground" aria-hidden />
        <h3 className="text-[0.8rem] font-semibold text-heading">
          {column.label}
        </h3>
        <span className="tabular rounded bg-card/80 px-1.5 text-[0.65rem] text-muted-foreground ring-1 ring-border">
          {count}
        </span>
        {onAdd && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="ml-auto text-muted-foreground"
            onClick={onAdd}
            aria-label={`Add to ${column.label}`}
          >
            <Plus />
          </Button>
        )}
      </header>
      {invalid && (
        <p className="mx-3 mb-2 flex items-center gap-1.5 rounded-md bg-danger/10 px-2 py-1 text-[0.7rem] text-danger">
          <Ban className="size-3" aria-hidden /> {invalid}
        </p>
      )}
      <ul className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-3 scrollbar-thin">
        {children}
      </ul>
    </section>
  );
};

/**
 * Kanban board (§15.3, §31). Drag cards between columns with mouse, touch or keyboard
 * (focus a card, Space to pick up, arrows to move, Space to drop, Esc to cancel).
 */
export function KanbanBoard<T>({
  columns,
  items,
  getId,
  getColumn,
  setColumn,
  onItemsChange,
  renderCard,
  invalidReason,
  onAdd,
  itemLabel,
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<{
    col: string;
    reason: string;
  } | null>(null);
  const [dropped, setDropped] = useState<string | null>(null);
  const [sourceCol, setSourceCol] = useState<string | null>(null);
  const snapshot = useRef<T[]>(items);
  // Stable id keeps dnd-kit's aria-describedby identical on server and client
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const colIds = columns.map((c) => c.id);
  const byId = (id: UniqueIdentifier) =>
    items.find((i) => getId(i) === String(id));
  const containerOf = (id: UniqueIdentifier | undefined) => {
    if (id === undefined) return undefined;
    if (colIds.includes(String(id))) return String(id);
    const it = byId(id);
    return it ? getColumn(it) : undefined;
  };
  const active = activeId ? byId(activeId) : undefined;

  const onDragStart = ({ active }: DragStartEvent) => {
    snapshot.current = items;
    setActiveId(String(active.id));
    const it = byId(active.id);
    setSourceCol(it ? getColumn(it) : null);
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    const to = containerOf(over?.id);
    setOverCol(to ?? null);
    const item = byId(active.id);
    if (!item || !to) return;
    const reason = invalidReason?.(item, to) ?? null;
    setInvalid(reason ? { col: to, reason } : null);
    const from = getColumn(item);
    if (reason || from === to) return;
    // Live-move into the new column at the hovered position
    const rest = items.filter((i) => getId(i) !== getId(item));
    const overIndex =
      over && !colIds.includes(String(over.id))
        ? rest.findIndex((i) => getId(i) === String(over.id))
        : -1;
    const moved = setColumn(item, to);
    const next = [...rest];
    if (overIndex >= 0) next.splice(overIndex, 0, moved);
    else next.push(moved);
    onItemsChange(next);
  };

  const finish = () => {
    setActiveId(null);
    setOverCol(null);
    setInvalid(null);
    setSourceCol(null);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const item = byId(active.id);
    const before = snapshot.current;
    const prevItem = before.find((i) => getId(i) === String(active.id));
    if (!item || !over || invalid) {
      if (invalid && prevItem)
        notify.warning(
          `Can't move to ${columns.find((c) => c.id === invalid.col)?.label}`,
          { description: invalid.reason },
        );
      onItemsChange(before);
      finish();
      return;
    }
    let next = items;
    const to = containerOf(over.id);
    if (
      to &&
      to === getColumn(item) &&
      over.id !== active.id &&
      !colIds.includes(String(over.id))
    ) {
      const a = items.findIndex((i) => getId(i) === String(active.id));
      const b = items.findIndex((i) => getId(i) === String(over.id));
      next = arrayMove(items, a, b);
      onItemsChange(next);
    }
    if (prevItem && getColumn(prevItem) !== getColumn(item)) {
      const label = columns.find((c) => c.id === getColumn(item))?.label;
      notify.success(`Moved to ${label}`, {
        description: itemLabel?.(item),
        onUndo: () => onItemsChange(before),
      });
    }
    setDropped(String(active.id));
    setTimeout(() => setDropped(null), 900);
    finish();
  };

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        onItemsChange(snapshot.current);
        finish();
      }}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) =>
            `Picked up ${itemLabel?.(byId(active.id)!) ?? "card"}.`,
          onDragOver: ({ over }) =>
            over
              ? `Over ${columns.find((c) => c.id === containerOf(over.id))?.label}.`
              : "Not over a column.",
          onDragEnd: ({ over }) =>
            over
              ? `Dropped in ${columns.find((c) => c.id === containerOf(over.id))?.label}.`
              : "Dropped.",
          onDragCancel: () => "Move cancelled.",
        },
      }}
    >
      <div
        className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin"
        role="group"
        aria-label="Board"
      >
        {columns.map((col) => {
          const colItems = items.filter((i) => getColumn(i) === col.id);
          return (
            <Column
              key={col.id}
              column={col}
              count={colItems.length}
              dragActive={!!activeId}
              isSource={sourceCol === col.id}
              isOver={overCol === col.id}
              invalid={
                activeId && invalid?.col === col.id
                  ? invalid.reason
                  : activeId && active && invalidReason?.(active, col.id)
                    ? invalidReason(active, col.id)
                    : null
              }
              onAdd={onAdd ? () => onAdd(col.id) : undefined}
            >
              <SortableContext
                items={colItems.map(getId)}
                strategy={verticalListSortingStrategy}
              >
                {colItems.map((it) => (
                  <SortableCard key={getId(it)} id={getId(it)}>
                    {renderCard(it, { justDropped: dropped === getId(it) })}
                  </SortableCard>
                ))}
              </SortableContext>
              {colItems.length === 0 && (
                <li className="grid flex-1 place-items-center rounded-lg border-2 border-dashed border-border py-6 text-xs text-subtle">
                  Drop here
                </li>
              )}
            </Column>
          );
        })}
      </div>
      <DragOverlay
        dropAnimation={{ duration: 200, easing: "cubic-bezier(0.22,1,0.36,1)" }}
      >
        {active ? (
          <div className="rotate-2 cursor-grabbing">
            {renderCard(active, { overlay: true })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
