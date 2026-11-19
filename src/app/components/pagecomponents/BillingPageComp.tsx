"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Download,
  Receipt,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  SegmentedList,
  SegmentedTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
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
import {
  PageContainer,
  PageHeader,
} from "@/app/components/generalUIcomp/PageHeader";
import { SectionCard } from "@/app/components/generalUIcomp/SectionCard";
import { Chip } from "@/app/components/generalUIcomp/Chips";
import {
  ProgressBar,
  UsageMeter,
} from "@/app/components/generalUIcomp/ProgressBar";
import {
  DataTable,
  type Column,
} from "@/app/components/generalUIcomp/DataTable";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import {
  LoadingButton,
  useSubmit,
} from "@/app/components/generalUIcomp/LoadingButton";
import { formatLongDate } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { Invoice, Plan, UsageMeterData } from "@/types";

type Props = {
  plans: Plan[];
  current: {
    planId: Plan["id"];
    billing: "monthly" | "annual";
    renewsAt: string;
    paymentStatus: "ok" | "failing";
    card: string;
  };
  usage: UsageMeterData[];
  aiBreakdown: { feature: string; credits: number }[];
  invoices: Invoice[];
  initialTab?: string;
};

const money = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0 })}`;

/** Billing overview, usage and invoices (§21, §22). Visible to owners/admins. */
const BillingPageComp = ({
  plans,
  current,
  usage,
  aiBreakdown,
  invoices,
  initialTab,
}: Props) => {
  const [tab, setTab] = useState(
    initialTab === "usage" || initialTab === "invoices"
      ? initialTab
      : "overview",
  );
  const [cycle, setCycle] = useState<"monthly" | "annual">(current.billing);
  const [planId, setPlanId] = useState(current.planId);
  const [cancelled, setCancelled] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { submitting, submit } = useSubmit();
  const plan = plans.find((p) => p.id === planId)!;
  const failing = current.paymentStatus === "failing";
  const totalAi = aiBreakdown.reduce((s, b) => s + b.credits, 0);

  const invoiceCols: Column<Invoice>[] = [
    {
      id: "num",
      header: "Invoice",
      sortValue: (i) => i.number,
      cell: (i) => <span className="font-mono text-xs">{i.number}</span>,
    },
    {
      id: "date",
      header: "Date",
      sortValue: (i) => -new Date(i.date).getTime(),
      cell: (i) => formatLongDate(i.date),
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      sortValue: (i) => i.amount,
      cell: (i) => <span className="tabular">{money(i.amount)}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortValue: (i) => i.status,
      cell: (i) => (
        <Chip
          tone={
            i.status === "paid"
              ? "success"
              : i.status === "open"
                ? "warning"
                : "danger"
          }
          dot
          className="capitalize"
        >
          {i.status}
        </Chip>
      ),
    },
  ];

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Billing"
        description="Your plan, usage and invoices. Only owners and admins can see this page."
      />

      {failing && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-lg bg-danger/8 px-4 py-3 ring-1 ring-danger/25"
        >
          <AlertTriangle className="size-5 text-danger" />
          <p className="flex-1 text-sm">
            <span className="font-semibold text-heading">
              Your last payment failed.
            </span>{" "}
            <span className="text-muted-foreground">
              Update your payment method to avoid interruption.
            </span>
          </p>
          <Button
            size="sm"
            onClick={() => notify.info("Opens the secure payment form")}
          >
            Update payment method
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices{" "}
            <span className="tabular text-xs text-subtle">
              {invoices.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="glass-ai space-y-3 rounded-lg p-5 lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Current plan
                </p>
                {cancelled ? (
                  <Chip tone="warning" dot>
                    Cancels {formatLongDate(current.renewsAt)}
                  </Chip>
                ) : (
                  <Chip tone={failing ? "danger" : "success"} dot>
                    {failing ? "Payment failing" : "Active"}
                  </Chip>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <h2 className="font-heading text-2xl font-semibold text-heading">
                  {plan.name}
                </h2>
                <p className="tabular pb-0.5 text-lg text-heading">
                  {money(cycle === "monthly" ? plan.monthly : plan.annual)}
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    / month{cycle === "annual" && ", billed annually"}
                  </span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{plan.summary}</p>
              <dl className="grid gap-3 pt-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {cancelled ? "Access until" : "Next renewal"}
                  </dt>
                  <dd className="font-medium text-heading">
                    {formatLongDate(current.renewsAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Payment method
                  </dt>
                  <dd className="flex items-center gap-1.5 font-medium text-heading">
                    <CreditCard className="size-3.5" /> {current.card}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Billing cycle
                  </dt>
                  <dd className="font-medium text-heading capitalize">
                    {cycle}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => notify.info("Opens the secure payment form")}
                >
                  <CreditCard /> Manage payment method
                </Button>
                {cancelled ? (
                  <Button
                    onClick={() => {
                      setCancelled(false);
                      notify.success("Subscription resumed");
                    }}
                  >
                    <RotateCw /> Resume subscription
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-danger hover:text-danger"
                    onClick={() => setConfirmCancel(true)}
                  >
                    Cancel subscription
                  </Button>
                )}
              </div>
            </section>
            <SectionCard title="This period" icon={Sparkles}>
              <div className="space-y-4">
                {usage
                  .filter((u) => u.limit > 0)
                  .map((u) => (
                    <UsageMeter
                      key={u.id}
                      label={u.label}
                      used={u.used}
                      limit={u.limit}
                    />
                  ))}
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => setTab("usage")}
                >
                  View usage details →
                </Button>
              </div>
            </SectionCard>
          </div>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-sm font-semibold text-heading">
                Change plan
              </h2>
              <Tabs
                value={cycle}
                onValueChange={(v) => setCycle(v as "monthly" | "annual")}
              >
                <SegmentedList aria-label="Billing cycle">
                  <SegmentedTrigger value="monthly">Monthly</SegmentedTrigger>
                  <SegmentedTrigger value="annual">
                    Annual <span className="text-success">−17%</span>
                  </SegmentedTrigger>
                </SegmentedList>
              </Tabs>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((p) => {
                const isCurrent = p.id === planId;
                const idx =
                  plans.findIndex((x) => x.id === p.id) -
                  plans.findIndex((x) => x.id === planId);
                return (
                  <article
                    key={p.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-lg p-5",
                      isCurrent ? "surface ring-2 ring-primary" : "surface",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-semibold text-heading">
                        {p.name}
                      </h3>
                      {isCurrent && <Chip tone="info">Current plan</Chip>}
                    </div>
                    <p className="tabular text-2xl font-semibold text-heading">
                      {money(cycle === "monthly" ? p.monthly : p.annual)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        /mo
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">{p.summary}</p>
                    <ul className="space-y-1.5 text-sm">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Check className="size-3.5 text-success" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-2">
                      {isCurrent ? (
                        <Button variant="outline" disabled className="w-full">
                          Your plan
                        </Button>
                      ) : (
                        <LoadingButton
                          className="w-full"
                          variant={idx > 0 ? "default" : "outline"}
                          loading={submitting}
                          onClick={() =>
                            submit(() => {
                              const prev = planId;
                              setPlanId(p.id);
                              notify.success(`Switched to ${p.name}`, {
                                description:
                                  idx > 0
                                    ? "Prorated charge applied today."
                                    : "Takes effect at next renewal.",
                                onUndo: () => setPlanId(prev),
                              });
                            })
                          }
                        >
                          {idx > 0
                            ? `Upgrade to ${p.name}`
                            : `Downgrade to ${p.name}`}
                        </LoadingButton>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {usage.map((u) => (
              <SectionCard
                key={u.id}
                title={u.label}
                description={u.explanation}
              >
                {u.limit > 0 ? (
                  <div className="space-y-2">
                    <UsageMeter
                      label="Consumed"
                      used={u.used}
                      limit={u.limit}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="tabular">
                        {(u.limit - u.used).toLocaleString()} {u.unit} remaining
                      </span>
                      {u.resetsAt && (
                        <span>Resets {formatLongDate(u.resetsAt)}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="tabular text-sm">
                    <span className="text-xl font-semibold text-heading">
                      {u.used}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {u.unit} · Unlimited
                    </span>
                  </p>
                )}
              </SectionCard>
            ))}
          </div>
          <SectionCard
            title="AI credits by feature"
            icon={Sparkles}
            description="What used your AI credits this period"
          >
            <ul className="space-y-3">
              {aiBreakdown.map((b) => (
                <li
                  key={b.feature}
                  className="grid grid-cols-[9rem_1fr] items-center gap-3 text-sm sm:grid-cols-[12rem_1fr]"
                >
                  <span className="truncate">{b.feature}</span>
                  <span className="flex items-center gap-2">
                    <ProgressBar
                      value={Math.round((b.credits / totalAi) * 100)}
                      showValue={false}
                      className="flex-1"
                      label={b.feature}
                    />
                    <span className="tabular w-24 text-right text-xs text-muted-foreground">
                      {b.credits.toLocaleString()} credits
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
          <div className="grid gap-4 md:grid-cols-2">
            <SectionCard title="Storage breakdown">
              <div className="space-y-3">
                <UsageMeter label="Documents" used={34} limit={100} />
                <UsageMeter label="Task attachments" used={7} limit={100} />
              </div>
            </SectionCard>
            <SectionCard title="Seats">
              <div className="space-y-3">
                <UsageMeter label="Active members" used={7} limit={20} />
                <UsageMeter label="Pending invitations" used={1} limit={20} />
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <DataTable
            ariaLabel="Invoices"
            rows={invoices}
            columns={invoiceCols}
            getRowId={(i) => i.id}
            rowActions={(i) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  notify.success("Download started", { description: i.number })
                }
              >
                <Download /> PDF
              </Button>
            )}
            empty={
              <div className="surface rounded-lg">
                <EmptyState
                  icon={Receipt}
                  title="No invoices yet"
                  description="Invoices appear here after your first billing cycle."
                />
              </div>
            }
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll keep access until {formatLongDate(current.renewsAt)}.
              After that, automations stop and the workspace becomes read-only.
              Your data is kept for 90 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep subscription</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setCancelled(true);
                notify.info("Subscription cancelled", {
                  description: `Access continues until ${formatLongDate(current.renewsAt)}.`,
                });
              }}
            >
              Cancel subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default BillingPageComp;
