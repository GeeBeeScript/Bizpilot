"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  NodeToolbar,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useReactFlow,
  type Connection,
  type Edge,
  type IsValidConnection,
  type Node,
  type NodeProps,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import {
  BrainCircuit,
  Check,
  CopyPlus,
  Filter,
  Loader,
  Settings2,
  Trash2,
  X,
  Zap,
  Play,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { AutomationNodeKind } from "@/types";

export type RunState = "done" | "active" | "pending" | "failed";
export type FlowNodeData = {
  kind: AutomationNodeKind;
  type: string;
  label: string;
  detail: string;
  runState?: RunState;
};
export type FlowNode = Node<FlowNodeData, "step">;

export const kindMeta: Record<
  AutomationNodeKind,
  { label: string; icon: LucideIcon; accent: string; chip: string }
> = {
  trigger: {
    label: "Trigger",
    icon: Zap,
    accent: "before:bg-info",
    chip: "bg-info/12 text-info",
  },
  condition: {
    label: "Condition",
    icon: Filter,
    accent: "before:bg-warning",
    chip: "bg-warning/14 text-warning",
  },
  action: {
    label: "Action",
    icon: Play,
    accent: "before:bg-success",
    chip: "bg-success/12 text-success",
  },
  ai: {
    label: "AI step",
    icon: BrainCircuit,
    accent: "before:bg-ai",
    chip: "bg-ai/16 text-ai",
  },
};

type NodeCallbacks = {
  onConfigure: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

/** A workflow node: colour edge by kind, run-state ring, hover toolbar (§18.2 node behaviour) */
const StepNode = ({ id, data, selected }: NodeProps<FlowNode>) => {
  const m = kindMeta[data.kind];
  const cb = (data as FlowNodeData & { cb?: NodeCallbacks }).cb;
  return (
    <>
      <NodeToolbar
        position={Position.Top}
        className="glass-strong elev-3 flex gap-0.5 rounded-md p-0.5"
      >
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => cb?.onConfigure(id)}
          aria-label="Configure step"
        >
          <Settings2 />
        </Button>
        {data.kind !== "trigger" && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => cb?.onDuplicate(id)}
            aria-label="Duplicate step"
          >
            <CopyPlus />
          </Button>
        )}
        {data.kind !== "trigger" && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-danger"
            onClick={() => cb?.onDelete(id)}
            aria-label="Delete step"
          >
            <Trash2 />
          </Button>
        )}
      </NodeToolbar>
      {data.kind !== "trigger" && (
        <Handle
          type="target"
          position={Position.Left}
          className="!size-3 !border-2 !border-card !bg-muted-foreground"
        />
      )}
      <div
        onDoubleClick={() => cb?.onConfigure(id)}
        className={cn(
          "relative w-60 overflow-hidden rounded-lg surface elev-1 px-3.5 py-3 pl-4 text-left transition-all duration-200",
          "before:absolute before:inset-y-0 before:left-0 before:w-1",
          m.accent,
          selected && "ring-2 ring-primary/60",
          data.runState === "active" &&
            "ring-2 ring-ai outline-6 outline-ai/15",
          data.runState === "done" && "ring-2 ring-success/60",
          data.runState === "failed" && "ring-2 ring-danger/70",
          data.runState === "pending" && "opacity-60",
        )}
      >
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={cn("grid size-6 place-items-center rounded-md", m.chip)}
          >
            <m.icon className="size-3.5" aria-hidden />
          </span>
          <span className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            {m.label}
          </span>
          {data.runState === "done" && (
            <Check
              className="ml-auto size-4 text-success"
              aria-label="Completed"
            />
          )}
          {data.runState === "active" && (
            <Loader
              className="ml-auto size-4 animate-spin text-ai"
              aria-label="Running"
            />
          )}
          {data.runState === "failed" && (
            <X className="ml-auto size-4 text-danger" aria-label="Failed" />
          )}
        </div>
        <p className="text-sm font-medium text-heading">{data.label}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {data.detail}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!size-3 !border-2 !border-card !bg-primary"
      />
    </>
  );
};

const nodeTypes = { step: StepNode };

type CanvasProps = {
  nodes: FlowNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onConfigure: (id: string) => void;
  readOnly?: boolean;
};

export const PALETTE_MIME = "application/bizpilot-node";

const Canvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  onConfigure,
  readOnly,
}: CanvasProps) => {
  const { resolvedTheme } = useTheme();
  const { screenToFlowPosition } = useReactFlow();
  const counter = useRef(100);

  const onDuplicate = useCallback(
    (id: string) =>
      setNodes((ns) => {
        const src = ns.find((n) => n.id === id);
        if (!src) return ns;
        counter.current += 1;
        return [
          ...ns,
          {
            ...src,
            id: `${src.id}-copy${counter.current}`,
            selected: false,
            position: { x: src.position.x + 30, y: src.position.y + 150 },
          },
        ];
      }),
    [setNodes],
  );
  const onDelete = useCallback(
    (id: string) => {
      setNodes((ns) => ns.filter((n) => n.id !== id));
      setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
      notify.success("Step removed");
    },
    [setNodes, setEdges],
  );

  // Inject callbacks so the node component stays a pure renderer
  const withCallbacks = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: { ...n.data, cb: { onConfigure, onDuplicate, onDelete } },
      })),
    [nodes, onConfigure, onDuplicate, onDelete],
  );

  /** Prevent visually invalid connections (§18.2) */
  const isValidConnection: IsValidConnection = useCallback(
    (c) => {
      if (c.source === c.target) return false;
      const target = nodes.find((n) => n.id === c.target);
      if (!target || target.data.kind === "trigger") return false;
      if (edges.some((e) => e.source === c.source && e.target === c.target))
        return false;
      // No cycles: target must not already reach source
      const reaches = (
        from: string,
        to: string,
        seen = new Set<string>(),
      ): boolean =>
        from === to ||
        edges
          .filter((e) => e.source === from && !seen.has(e.target))
          .some((e) => (seen.add(e.target), reaches(e.target, to, seen)));
      return !reaches(c.target!, c.source!);
    },
    [nodes, edges],
  );

  const onConnect = useCallback(
    (c: Connection) => setEdges((es) => addEdge({ ...c, animated: false }, es)),
    [setEdges],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData(PALETTE_MIME);
    if (!raw) return;
    const item = JSON.parse(raw) as {
      kind: AutomationNodeKind;
      type: string;
      label: string;
    };
    counter.current += 1;
    const position = screenToFlowPosition({
      x: e.clientX - 120,
      y: e.clientY - 40,
    });
    setNodes((ns) => [
      ...ns,
      {
        id: `n${counter.current}`,
        type: "step",
        position,
        data: {
          ...item,
          detail: "Not configured yet — double-click to configure",
        },
      },
    ]);
    notify.success(`${item.label} added`, {
      description: "Connect it from a handle on another step.",
    });
  };

  return (
    <ReactFlow
      nodes={withCallbacks}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      isValidConnection={isValidConnection}
      onDrop={onDrop}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      colorMode={resolvedTheme === "dark" ? "dark" : "light"}
      nodesDraggable={!readOnly}
      nodesConnectable={!readOnly}
      elementsSelectable={!readOnly}
      defaultEdgeOptions={{
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 1.75 },
      }}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      proOptions={{ hideAttribution: true }}
      className="bp-flow"
      deleteKeyCode={readOnly ? null : ["Backspace", "Delete"]}
    >
      <Background variant={BackgroundVariant.Dots} gap={18} size={1.2} />
      <Controls showInteractive={false} className="!rounded-md !shadow-none" />
      <MiniMap
        pannable
        zoomable
        className="!rounded-md max-md:!hidden"
        nodeColor={(n) =>
          ({
            trigger: "#2563A8",
            condition: "#D28A24",
            action: "#16866A",
            ai: "#C9A45C",
          })[(n.data as FlowNodeData).kind]
        }
      />
    </ReactFlow>
  );
};

/** Visual workflow builder canvas (Miro-style: dot grid, pan/zoom, minimap) */
export const WorkflowCanvas = (props: CanvasProps) => (
  <ReactFlowProvider>
    <Canvas {...props} />
  </ReactFlowProvider>
);
