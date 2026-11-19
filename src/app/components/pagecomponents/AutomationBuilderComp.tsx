"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEdgesState, useNodesState, type Edge } from "@xyflow/react";
import { AnimatePresence, motion } from "motion/react";
import {
  History,
  Library,
  Play,
  Save,
  Settings2,
  Trash2,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/components/ui/native-select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Drawer, DrawerContent, DrawerTitle } from "@/app/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { PageContainer } from "@/app/components/generalUIcomp/PageHeader";
import { SectionCard } from "@/app/components/generalUIcomp/SectionCard";
import { Chip } from "@/app/components/generalUIcomp/Chips";
import { Field, SidePanel } from "@/app/components/generalUIcomp/SidePanel";
import {
  LoadingButton,
  useSubmit,
} from "@/app/components/generalUIcomp/LoadingButton";
import { StepProgress, type Step } from "@/app/components/loaders/StepProgress";
import {
  WorkflowCanvas,
  kindMeta,
  type FlowNode,
  type RunState,
} from "@/app/components/elements/automations/WorkflowCanvas";
import { NodePalette } from "@/app/components/elements/automations/NodePalette";
import { RunHistory } from "@/app/components/elements/automations/RunHistory";
import { PageCrumbs } from "@/context/breadcrumbContext";
import { nodeLibrary } from "@/lib/mock/automations";
import { timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import type { Automation, AutomationNodeKind, AutomationRun } from "@/types";

const toFlow = (a: Automation) => ({
  nodes: a.nodes.map<FlowNode>((n) => ({
    id: n.id,
    type: "step",
    position: n.position,
    data: { kind: n.kind, type: n.type, label: n.label, detail: n.detail },
  })),
  edges: a.edges.map<Edge>((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
  })),
});

/** Breadth-first order from the trigger — used to animate test runs */
const runOrder = (nodes: FlowNode[], edges: Edge[]) => {
  const start = nodes.find((n) => n.data.kind === "trigger");
  if (!start) return [];
  const order: string[] = [];
  const queue = [start.id];
  while (queue.length) {
    const id = queue.shift()!;
    if (order.includes(id)) continue;
    order.push(id);
    edges.filter((e) => e.source === id).forEach((e) => queue.push(e.target));
  }
  return order;
};

type Props = { automation: Automation; runs: AutomationRun[]; isNew?: boolean };

/** Automation builder + detail (§18.2–18.4) */
const AutomationBuilderComp = ({ automation, runs, isNew }: Props) => {
  const router = useRouter();
  const initial = toFlow(automation);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(
    initial.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
  const [name, setName] = useState(automation.name);
  const [active, setActive] = useState(automation.active);
  const [tab, setTab] = useState("workflow");
  const [configId, setConfigId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [testSteps, setTestSteps] = useState<Step[] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { submitting, submit } = useSubmit();
  const counter = useRef(500);

  const configNode = nodes.find((n) => n.id === configId) ?? null;
  const hasTrigger = nodes.some((n) => n.data.kind === "trigger");
  const onConfigure = useCallback((id: string) => setConfigId(id), []);

  const addNode = (item: {
    kind: AutomationNodeKind;
    type: string;
    label: string;
  }) => {
    counter.current += 1;
    const x =
      Math.max(0, ...nodes.map((n) => n.position.x)) + (nodes.length ? 300 : 0);
    setNodes((ns) => [
      ...ns,
      {
        id: `n${counter.current}`,
        type: "step",
        position: { x, y: 120 },
        data: {
          ...item,
          detail: "Not configured yet — double-click to configure",
        },
      },
    ]);
    setPaletteOpen(false);
    notify.success(`${item.label} added`);
  };

  const setRunState = (states: Record<string, RunState | undefined>) =>
    setNodes((ns) =>
      ns.map((n) => ({ ...n, data: { ...n.data, runState: states[n.id] } })),
    );

  const testRun = () => {
    const order = runOrder(nodes, edges);
    if (order.length < 2)
      return notify.warning(
        "Add a trigger and at least one connected step first",
      );
    const label = (id: string) =>
      nodes.find((n) => n.id === id)?.data.label ?? id;
    order.forEach((_, i) =>
      setTimeout(() => {
        const st: Record<string, RunState> = {};
        order.forEach(
          (id, j) => (st[id] = j < i ? "done" : j === i ? "active" : "pending"),
        );
        setRunState(st);
        setTestSteps(
          order.map((id, j) => ({
            label: label(id),
            state: j < i ? "done" : j === i ? "active" : "pending",
          })),
        );
      }, i * 850),
    );
    setTimeout(() => {
      setRunState(Object.fromEntries(order.map((id) => [id, "done" as const])));
      setTestSteps(order.map((id) => ({ label: label(id), state: "done" })));
      notify.success("Test run succeeded", {
        description: `${order.length} steps · no real records were changed`,
      });
    }, order.length * 850);
  };

  const clearRun = () => {
    setRunState({});
    setTestSteps(null);
  };

  const toggleActive = (v: boolean) => {
    setActive(v);
    notify.success(v ? "Automation activated" : "Automation paused", {
      onUndo: () => setActive(!v),
    });
  };

  const save = () =>
    submit(() => {
      notify.success(isNew ? "Automation created" : "Automation saved", {
        description: name,
      });
      if (isNew) router.push("/u/automations");
    });

  return (
    <PageContainer className="space-y-5">
      <PageCrumbs
        items={[
          { label: "Automations", href: "/u/automations" },
          { label: name || "Untitled automation" },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Automation name"
            placeholder="Untitled automation"
            className="w-full rounded-md bg-transparent font-heading text-xl font-semibold tracking-tight text-heading outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/40 md:text-[1.4rem]"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Chip tone={active ? "success" : "neutral"} dot>
              {active ? "Active" : "Paused"}
            </Chip>
            <span className="flex items-center gap-1">
              <Zap className="size-3.5" />{" "}
              {nodes.find((n) => n.data.kind === "trigger")?.data.label ??
                "No trigger yet"}
            </span>
            {automation.lastRun && (
              <span>· Last run {timeAgo(automation.lastRun)}</span>
            )}
            {!isNew && (
              <span>
                · {automation.successCount} succeeded ·{" "}
                <span className={automation.failureCount ? "text-danger" : ""}>
                  {automation.failureCount} failed
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 text-sm">
            <Switch
              checked={active}
              onCheckedChange={toggleActive}
              aria-label="Automation active"
            />{" "}
            {active ? "On" : "Off"}
          </label>
          <Button variant="outline" onClick={testRun}>
            <Play /> Test run
          </Button>
          <LoadingButton loading={submitting} onClick={save}>
            <Save /> {isNew ? "Create" : "Save"}
          </LoadingButton>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList>
          <TabsTrigger value="workflow">
            <Workflow /> Workflow
          </TabsTrigger>
          <TabsTrigger value="runs">
            <History /> Run history{" "}
            <span className="tabular text-xs text-subtle">{runs.length}</span>
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings2 /> Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow">
          <div className="relative grid h-[calc(100dvh-var(--topbar-h)-15rem)] min-h-[30rem] gap-3 lg:grid-cols-[15rem_minmax(0,1fr)]">
            <aside
              className="glass hidden overflow-y-auto rounded-lg scrollbar-thin lg:block"
              aria-label="Step library"
            >
              <NodePalette onAdd={addNode} hasTrigger={hasTrigger} />
            </aside>
            <div className="surface relative overflow-hidden rounded-lg">
              <WorkflowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                setNodes={setNodes}
                setEdges={setEdges}
                onConfigure={onConfigure}
              />

              {nodes.length === 0 && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="glass max-w-xs rounded-lg p-5 text-center">
                    <Zap
                      className="mx-auto mb-2 size-6 text-info"
                      aria-hidden
                    />
                    <p className="font-heading text-sm font-semibold text-heading">
                      Start with a trigger
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Drag a trigger from the library, then connect conditions,
                      actions and AI steps.
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="glass-strong elev-2 absolute top-3 left-3 lg:hidden"
                onClick={() => setPaletteOpen(true)}
              >
                <Library /> Add step
              </Button>

              <AnimatePresence>
                {testSteps && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="glass-strong elev-3 absolute right-3 bottom-3 w-60 rounded-lg p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-heading">
                        Test run
                      </p>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={clearRun}
                        aria-label="Close test run"
                      >
                        <X />
                      </Button>
                    </div>
                    <StepProgress steps={testSteps} kind="automation" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Drag steps from the library · connect from the right handle to the
            left handle · double-click a step to configure · Delete removes the
            selection.
          </p>
        </TabsContent>

        <TabsContent value="runs">
          <RunHistory runs={runs} />
        </TabsContent>

        <TabsContent value="config">
          <div className="grid max-w-4xl gap-4">
            <SectionCard title="Details">
              <div className="grid gap-3">
                <Field label="Name" htmlFor="a-name">
                  <Input
                    id="a-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9"
                  />
                </Field>
                <Field label="Description" htmlFor="a-desc">
                  <Textarea
                    id="a-desc"
                    defaultValue={automation.description}
                    rows={2}
                  />
                </Field>
              </div>
            </SectionCard>
            <SectionCard title="Error handling">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Retry failed steps" htmlFor="a-retry">
                  <NativeSelect id="a-retry" defaultValue="3" className="h-9">
                    <NativeSelectOption value="0">
                      Don&apos;t retry
                    </NativeSelectOption>
                    <NativeSelectOption value="1">Once</NativeSelectOption>
                    <NativeSelectOption value="3">
                      Up to 3 times (backoff)
                    </NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field label="Max runs per hour" htmlFor="a-limit">
                  <Input
                    id="a-limit"
                    type="number"
                    defaultValue={60}
                    className="h-9"
                  />
                </Field>
              </div>
              <label className="mt-3 flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
                Notify me when a run fails{" "}
                <Switch defaultChecked aria-label="Notify on failure" />
              </label>
              <label className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
                Require approval before AI-generated emails are sent{" "}
                <Switch
                  defaultChecked
                  aria-label="Require approval for AI emails"
                />
              </label>
            </SectionCard>
            {!isNew && (
              <SectionCard
                title="Danger zone"
                className="ring-1 ring-danger/25"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Deleting removes the workflow and its run history. This
                    can&apos;t be undone.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 /> Delete automation
                  </Button>
                </div>
              </SectionCard>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Mobile palette */}
      <Drawer
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        swipeDirection="down"
      >
        <DrawerContent className="bg-card elev-4">
          <DrawerTitle className="px-4 pt-3 font-heading text-sm font-semibold">
            Add a step
          </DrawerTitle>
          <div className="overflow-y-auto">
            <NodePalette onAdd={addNode} hasTrigger={hasTrigger} />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Configure step */}
      <SidePanel
        open={!!configNode}
        onOpenChange={(o) => !o && setConfigId(null)}
        eyebrow={configNode && kindMeta[configNode.data.kind].label}
        title={configNode?.data.label ?? ""}
        footer={
          <Button
            onClick={() => {
              setConfigId(null);
              notify.success("Step updated");
            }}
          >
            Done
          </Button>
        }
      >
        {configNode && (
          <div className="space-y-4">
            <Field label="Step" htmlFor="s-type">
              <NativeSelect
                id="s-type"
                value={configNode.data.type}
                onChange={(e) => {
                  const lib = nodeLibrary[configNode.data.kind] as readonly {
                    type: string;
                    label: string;
                  }[];
                  const item = lib.find((l) => l.type === e.target.value);
                  setNodes((ns) =>
                    ns.map((n) =>
                      n.id === configNode.id
                        ? {
                            ...n,
                            data: {
                              ...n.data,
                              type: e.target.value,
                              label: item?.label ?? n.data.label,
                            },
                          }
                        : n,
                    ),
                  );
                }}
                className="h-9"
              >
                {(
                  nodeLibrary[configNode.data.kind] as readonly {
                    type: string;
                    label: string;
                  }[]
                ).map((l) => (
                  <NativeSelectOption key={l.type} value={l.type}>
                    {l.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Label" htmlFor="s-label">
              <Input
                id="s-label"
                value={configNode.data.label}
                onChange={(e) =>
                  setNodes((ns) =>
                    ns.map((n) =>
                      n.id === configNode.id
                        ? { ...n, data: { ...n.data, label: e.target.value } }
                        : n,
                    ),
                  )
                }
                className="h-9"
              />
            </Field>
            {configNode.data.kind === "condition" && (
              <div className="grid grid-cols-3 gap-2">
                <Field label="Field" htmlFor="s-f">
                  <NativeSelect id="s-f" className="h-9">
                    <NativeSelectOption>Status</NativeSelectOption>
                    <NativeSelectOption>Priority</NativeSelectOption>
                    <NativeSelectOption>Client</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field label="Operator" htmlFor="s-o">
                  <NativeSelect id="s-o" className="h-9">
                    <NativeSelectOption>equals</NativeSelectOption>
                    <NativeSelectOption>is not</NativeSelectOption>
                    <NativeSelectOption>contains</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field label="Value" htmlFor="s-v">
                  <Input id="s-v" defaultValue="Active" className="h-9" />
                </Field>
              </div>
            )}
            <Field
              label="Settings"
              htmlFor="s-detail"
              hint="Shown on the step card"
            >
              <Textarea
                id="s-detail"
                value={configNode.data.detail}
                onChange={(e) =>
                  setNodes((ns) =>
                    ns.map((n) =>
                      n.id === configNode.id
                        ? { ...n, data: { ...n.data, detail: e.target.value } }
                        : n,
                    ),
                  )
                }
                rows={3}
              />
            </Field>
            {(configNode.data.kind === "action" ||
              configNode.data.kind === "ai") && (
              <label className="flex items-center justify-between gap-4 rounded-lg bg-ai/8 px-3 py-2.5 text-sm ring-1 ring-ai/20">
                Require human approval before this step runs{" "}
                <Switch
                  defaultChecked={configNode.data.kind === "ai"}
                  aria-label="Require approval"
                />
              </label>
            )}
          </div>
        )}
      </SidePanel>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The workflow and {runs.length} runs will be permanently deleted.
              Records it created are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                notify.success("Automation deleted");
                router.push("/u/automations");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default AutomationBuilderComp;
