"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  AlertTriangle,
  Check,
  Download,
  Laptop,
  LogOut,
  Minus,
  Monitor,
  Moon,
  Plug,
  RefreshCw,
  Smartphone,
  Sun,
  Upload,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Switch } from "@/app/components/ui/switch";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/components/ui/native-select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
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
import { SectionCard } from "@/app/components/generalUIcomp/SectionCard";
import { Field } from "@/app/components/generalUIcomp/SidePanel";
import { Chip } from "@/app/components/generalUIcomp/Chips";
import { UsageMeter } from "@/app/components/generalUIcomp/ProgressBar";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import {
  LoadingButton,
  useSubmit,
} from "@/app/components/generalUIcomp/LoadingButton";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import { useHydrated } from "@/lib/hooks";
import { formatLongDate, timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { currentOrg, currentUser } from "@/lib/mock/people";
import type { Integration, Session } from "@/types";

const SaveRow = ({
  label = "Save changes",
  message = "Settings saved",
}: {
  label?: string;
  message?: string;
}) => {
  const { submitting, submit } = useSubmit();
  return (
    <div className="flex justify-end border-t border-border/70 pt-3">
      <LoadingButton
        loading={submitting}
        onClick={() =>
          submit(() => {
            notify.success(message);
          })
        }
      >
        {label}
      </LoadingButton>
    </div>
  );
};

const ToggleRow = ({
  title,
  description,
  defaultChecked,
  disabled,
  note,
}: {
  title: string;
  description?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  note?: string;
}) => (
  <label
    className={cn(
      "flex items-start justify-between gap-4 py-3",
      disabled && "opacity-80",
    )}
  >
    <span>
      <span className="block text-sm text-heading">{title}</span>
      {description && (
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      )}
      {note && <span className="mt-0.5 block text-xs text-ai">{note}</span>}
    </span>
    <Switch
      defaultChecked={defaultChecked}
      disabled={disabled}
      aria-label={title}
      onCheckedChange={(v) => notify.success(`${title} ${v ? "on" : "off"}`)}
    />
  </label>
);

/* ---------- General (organization + appearance) ---------- */
const themePreviews = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    bg: "bg-[#F7F9FC]",
    card: "bg-white",
    bar: "bg-[#DCE3EC]",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    bg: "bg-[#061527]",
    card: "bg-[#0C2039]",
    bar: "bg-[#12304F]",
  },
  {
    id: "system",
    label: "System",
    icon: Monitor,
    bg: "bg-linear-to-r from-[#F7F9FC] from-50% to-[#061527] to-50%",
    card: "bg-linear-to-r from-white from-50% to-[#0C2039] to-50%",
    bar: "bg-[#8A97A8]/40",
  },
] as const;

export const GeneralSettings = () => {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  return (
    <div className="space-y-4">
      <SectionCard title="Organization">
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-lg bg-linear-to-br from-primary-gold/80 to-primary-gold/50 font-heading text-lg font-bold text-midnight-navy">
              {currentOrg.initials}
            </span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => notify.info("Choose a logo file")}
              >
                <Upload /> Upload logo
              </Button>
              <Button variant="ghost" size="sm">
                Remove
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Organization name" htmlFor="o-name">
              <Input
                id="o-name"
                defaultValue={currentOrg.name}
                className="h-9"
              />
            </Field>
            <Field label="Website" htmlFor="o-web">
              <Input
                id="o-web"
                defaultValue="cornucopia.studio"
                className="h-9"
              />
            </Field>
            <Field label="Business type" htmlFor="o-type">
              <NativeSelect id="o-type" defaultValue="agency" className="h-9">
                <NativeSelectOption value="agency">
                  Digital agency
                </NativeSelectOption>
                <NativeSelectOption value="software">
                  Software agency
                </NativeSelectOption>
                <NativeSelectOption value="consulting">
                  Consultancy
                </NativeSelectOption>
                <NativeSelectOption value="it">IT services</NativeSelectOption>
                <NativeSelectOption value="recruiting">
                  Recruiting
                </NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field label="Company size" htmlFor="o-size">
              <NativeSelect id="o-size" defaultValue="11-50" className="h-9">
                {["1–10", "11-50", "51–200", "200+"].map((s) => (
                  <NativeSelectOption key={s} value={s}>
                    {s}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Address" htmlFor="o-addr" className="sm:col-span-2">
              <Input
                id="o-addr"
                defaultValue="14 Admiralty Way, Lekki, Lagos"
                className="h-9"
              />
            </Field>
            <Field label="Timezone" htmlFor="o-tz">
              <NativeSelect
                id="o-tz"
                defaultValue="Africa/Lagos"
                className="h-9"
              >
                {[
                  "Africa/Lagos",
                  "Europe/London",
                  "America/New_York",
                  "America/Los_Angeles",
                ].map((t) => (
                  <NativeSelectOption key={t} value={t}>
                    {t}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Currency" htmlFor="o-cur">
              <NativeSelect id="o-cur" defaultValue="USD" className="h-9">
                {["USD", "EUR", "GBP", "NGN"].map((c) => (
                  <NativeSelectOption key={c} value={c}>
                    {c}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <SaveRow />
        </div>
      </SectionCard>

      <SectionCard
        title="Appearance"
        description="Applies immediately across the app — overlays, loaders, AI surfaces, client portal and admin."
      >
        <div
          role="radiogroup"
          aria-label="Theme"
          className="grid gap-3 sm:grid-cols-3"
        >
          {themePreviews.map((t) => {
            const selected = hydrated && theme === t.id;
            return (
              <button
                key={t.id}
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "rounded-lg p-2 text-left ring-1 transition-all duration-150",
                  selected
                    ? "ring-2 ring-primary"
                    : "ring-border hover:ring-primary/40",
                )}
              >
                <div
                  className={cn(
                    "mb-2 h-20 overflow-hidden rounded-md p-2",
                    t.bg,
                  )}
                  aria-hidden
                >
                  <div className={cn("mb-1.5 h-2 w-1/2 rounded", t.bar)} />
                  <div className={cn("h-10 rounded-md shadow-sm", t.card)} />
                </div>
                <span className="flex items-center gap-1.5 text-sm text-heading">
                  <t.icon className="size-3.5" /> {t.label}
                  {selected && (
                    <Check className="ml-auto size-4 text-primary" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};

/* ---------- Profile ---------- */
export const ProfileSettings = () => (
  <SectionCard title="Your profile">
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <UserAvatar person={currentUser} size="lg" className="size-14" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => notify.info("Choose a photo")}
        >
          <Upload /> Change photo
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" htmlFor="p-name">
          <Input id="p-name" defaultValue={currentUser.name} className="h-9" />
        </Field>
        <Field label="Title" htmlFor="p-title">
          <Input id="p-title" defaultValue={currentUser.role} className="h-9" />
        </Field>
        <Field
          label="Email"
          htmlFor="p-email"
          hint="We'll send a confirmation link if you change this."
        >
          <Input
            id="p-email"
            type="email"
            defaultValue={currentUser.email}
            className="h-9"
          />
        </Field>
        <Field label="Timezone" htmlFor="p-tz">
          <NativeSelect id="p-tz" defaultValue="Africa/Lagos" className="h-9">
            {["Africa/Lagos", "Europe/London", "America/New_York"].map((t) => (
              <NativeSelectOption key={t} value={t}>
                {t}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <SaveRow message="Profile updated" />
    </div>
  </SectionCard>
);

/* ---------- Team & permissions ---------- */
type PermRow = {
  feature: string;
  owner: boolean;
  admin: boolean;
  manager: boolean;
  employee: boolean | "own";
  note?: string;
};
export const PermissionSettings = ({
  permissions,
}: {
  permissions: PermRow[];
}) => (
  <div className="space-y-4">
    <SectionCard
      title="Members"
      description="Invite people, change roles and deactivate accounts from the Team page."
    >
      <Link
        href="/u/team"
        className="text-sm font-medium text-primary hover:underline"
      >
        Manage members →
      </Link>
    </SectionCard>
    <SectionCard
      title="Permission matrix"
      description="What each role can do. Hover a partial check for details."
      bodyClassName="px-0 pb-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border bg-muted/40 text-xs text-muted-foreground">
              <th className="px-4 py-2 text-left font-semibold">Feature</th>
              {["Owner", "Admin", "Manager", "Employee"].map((r) => (
                <th key={r} className="px-3 py-2 text-center font-semibold">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((p) => (
              <tr
                key={p.feature}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-4 py-2.5">{p.feature}</td>
                {(["owner", "admin", "manager", "employee"] as const).map(
                  (r) => {
                    const v = p[r];
                    return (
                      <td key={r} className="px-3 py-2.5 text-center">
                        {v === true && (
                          <Check
                            className="mx-auto size-4 text-success"
                            aria-label="Allowed"
                          />
                        )}
                        {v === false && (
                          <Minus
                            className="mx-auto size-4 text-subtle"
                            aria-label="Not allowed"
                          />
                        )}
                        {v === "own" && (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="inline-flex items-center gap-1 text-xs text-warning">
                                  <Check className="size-4" /> Own
                                </span>
                              }
                            />
                            <TooltipContent>{p.note}</TooltipContent>
                          </Tooltip>
                        )}
                      </td>
                    );
                  },
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  </div>
);

/* ---------- Security ---------- */
export const SecuritySettings = ({
  sessions: initial,
  events,
}: {
  sessions: Session[];
  events: { id: string; event: string; detail: string; at: string }[];
}) => {
  const [sessions, setSessions] = useState(initial);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="space-y-4">
      <SectionCard title="Password">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Current password" htmlFor="pw-c">
            <Input id="pw-c" type="password" className="h-9" />
          </Field>
          <Field
            label="New password"
            htmlFor="pw-n"
            hint="At least 12 characters"
          >
            <Input id="pw-n" type="password" className="h-9" />
          </Field>
          <Field label="Confirm new password" htmlFor="pw-r">
            <Input id="pw-r" type="password" className="h-9" />
          </Field>
        </div>
        <div className="mt-3">
          <SaveRow label="Update password" message="Password updated" />
        </div>
      </SectionCard>
      <SectionCard title="Two-factor authentication">
        <ToggleRow
          title="Authenticator app"
          description="Required for owners and admins."
          defaultChecked
          note="Enabled 3 months ago"
        />
      </SectionCard>
      <SectionCard
        title="Active sessions"
        actions={
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:text-danger"
            onClick={() => setConfirm(true)}
            disabled={sessions.length < 2}
          >
            <LogOut /> Sign out all other sessions
          </Button>
        }
        bodyClassName="px-0 pb-1"
      >
        <ul className="divide-y divide-border/70 border-t border-border/70">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 px-4 py-2.5 text-sm"
            >
              {s.device.includes("iPhone") ? (
                <Smartphone className="size-4 text-muted-foreground" />
              ) : (
                <Laptop className="size-4 text-muted-foreground" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-heading">
                  {s.device}{" "}
                  {s.current && (
                    <Chip tone="success" className="ml-1">
                      This device
                    </Chip>
                  )}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {s.location} · {timeAgo(s.lastActive)}
                </span>
              </span>
              {!s.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSessions((l) => l.filter((x) => x.id !== s.id));
                    notify.success("Session signed out");
                  }}
                >
                  Sign out
                </Button>
              )}
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard
        title="Login history & security events"
        bodyClassName="px-0 pb-1"
      >
        <ul className="divide-y divide-border/70 border-t border-border/70">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 px-4 py-2.5 text-sm"
            >
              {e.event.startsWith("Failed") ? (
                <AlertTriangle className="size-4 text-warning" />
              ) : (
                <Check className="size-4 text-success" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-heading">{e.event}</span>
                <span className="block text-xs text-muted-foreground">
                  {e.detail}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(e.at)}
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out all other sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              Every device except this one will need to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSessions((l) => l.filter((s) => s.current));
                notify.success("Signed out of other sessions");
              }}
            >
              Sign out others
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ---------- Notifications ---------- */
const notificationGroups = [
  {
    id: "assign",
    label: "Task assignments",
    desc: "When a task is assigned to you",
  },
  {
    id: "deadline",
    label: "Task deadlines",
    desc: "Due tomorrow and overdue reminders",
  },
  {
    id: "project",
    label: "Project alerts",
    desc: "Health changes, blockers and milestones",
  },
  {
    id: "client",
    label: "Client activity",
    desc: "Uploads, comments and approvals from clients",
  },
  {
    id: "docs",
    label: "Document events",
    desc: "Processing finished or failed",
  },
  {
    id: "ai",
    label: "AI insights",
    desc: "Risks and recommendations from BizPilot AI",
  },
  {
    id: "billing",
    label: "Billing",
    desc: "Invoices, usage limits and payment issues",
  },
];
export const NotificationSettings = () => {
  const [digest, setDigest] = useState("daily");
  return (
    <div className="space-y-4">
      <SectionCard title="What to notify me about" bodyClassName="px-0 pb-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/40 text-xs text-muted-foreground">
                <th className="px-4 py-2 text-left font-semibold">Event</th>
                <th className="w-24 px-3 py-2 text-center font-semibold">
                  In-app
                </th>
                <th className="w-24 px-3 py-2 text-center font-semibold">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {notificationGroups.map((g, i) => (
                <tr
                  key={g.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-4 py-2.5">
                    <span className="block text-heading">{g.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {g.desc}
                    </span>
                  </td>
                  <td className="text-center">
                    <Switch defaultChecked aria-label={`${g.label} in-app`} />
                  </td>
                  <td className="text-center">
                    <Switch
                      defaultChecked={i < 3 || g.id === "billing"}
                      aria-label={`${g.label} email`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard
        title="Email digest"
        description="A summary of activity you weren't notified about individually."
      >
        <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
          {[
            { id: "daily", label: "Daily", d: "Every weekday at 8:00" },
            { id: "weekly", label: "Weekly", d: "Mondays at 8:00" },
            { id: "off", label: "Off", d: "No digest emails" },
          ].map((o) => (
            <button
              key={o.id}
              role="radio"
              aria-checked={digest === o.id}
              onClick={() => {
                setDigest(o.id);
                notify.success(`Digest: ${o.label}`);
              }}
              className={cn(
                "rounded-lg p-3 text-left ring-1 transition-colors",
                digest === o.id
                  ? "bg-primary/8 ring-primary/40"
                  : "ring-border hover:bg-muted/50",
              )}
            >
              <span className="block text-sm font-medium text-heading">
                {o.label}
              </span>
              <span className="block text-xs text-muted-foreground">{o.d}</span>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

/* ---------- AI ---------- */
export const AISettings = ({
  credits,
}: {
  credits: { used: number; limit: number; resetsAt?: string };
}) => (
  <div className="space-y-4">
    <SectionCard variant="ai" title="AI preferences">
      <div className="divide-y divide-border/70">
        <ToggleRow
          title="Suggest actions in AI answers"
          description="AI may propose tasks, emails and status changes."
          defaultChecked
        />
        <ToggleRow
          title="Require confirmation before actions"
          description="Always on for anything that changes records or contacts clients."
          defaultChecked
          disabled
          note="Required by your organization's policy"
        />
        <div className="grid gap-3 py-3 sm:grid-cols-2">
          <Field label="Citations" htmlFor="ai-cite">
            <NativeSelect id="ai-cite" defaultValue="inline" className="h-9">
              <NativeSelectOption value="inline">
                Inline numbered citations
              </NativeSelectOption>
              <NativeSelectOption value="end">
                Sources list only
              </NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field label="Conversation retention" htmlFor="ai-ret">
            <NativeSelect id="ai-ret" defaultValue="90" className="h-9">
              <NativeSelectOption value="30">30 days</NativeSelectOption>
              <NativeSelectOption value="90">90 days</NativeSelectOption>
              <NativeSelectOption value="365">1 year</NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>
      </div>
    </SectionCard>
    <div className="grid gap-4 md:grid-cols-2">
      <SectionCard title="Usage">
        <UsageMeter
          label="AI credits"
          used={credits.used}
          limit={credits.limit}
        />
        {credits.resetsAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Resets {formatLongDate(credits.resetsAt)} ·{" "}
            <Link
              href="/u/billing?tab=usage"
              className="text-primary hover:underline"
            >
              Usage details
            </Link>
          </p>
        )}
      </SectionCard>
      <SectionCard title="Knowledge">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Indexed documents</dt>
            <dd className="tabular text-heading">214</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Indexing status</dt>
            <dd>
              <Chip tone="ai" dot>
                2 in progress
              </Chip>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Connected sources</dt>
            <dd className="text-heading">Documents, Google Drive</dd>
          </div>
        </dl>
      </SectionCard>
    </div>
  </div>
);

/* ---------- Integrations ---------- */
export const IntegrationSettings = ({
  integrations: initial,
}: {
  integrations: Integration[];
}) => {
  const [items, setItems] = useState(initial);
  const set = (id: string, status: Integration["status"], msg: string) => {
    const prev = items;
    setItems((l) =>
      l.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              connectedAt:
                status === "connected"
                  ? new Date().toISOString()
                  : i.connectedAt,
            }
          : i,
      ),
    );
    notify.success(msg, { onUndo: () => setItems(prev) });
  };
  const Card = ({ i }: { i: Integration }) => (
    <article className="surface flex flex-col gap-3 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted font-heading text-sm font-bold text-heading">
          {i.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-heading">{i.name}</p>
          <p className="text-xs text-muted-foreground">{i.description}</p>
        </div>
        {i.status === "connected" && (
          <Chip tone="success" dot>
            Connected
          </Chip>
        )}
        {i.status === "error" && (
          <Chip tone="danger" icon={AlertTriangle}>
            Needs attention
          </Chip>
        )}
      </div>
      <div className="mt-auto flex items-center gap-2">
        {i.status === "available" && (
          <Button
            size="sm"
            onClick={() => set(i.id, "connected", `${i.name} connected`)}
          >
            <Plug /> Connect
          </Button>
        )}
        {i.status === "error" && (
          <Button
            size="sm"
            onClick={() => set(i.id, "connected", `${i.name} reconnected`)}
          >
            <RefreshCw /> Reconnect
          </Button>
        )}
        {i.status !== "available" && (
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:text-danger"
            onClick={() => set(i.id, "available", `${i.name} disconnected`)}
          >
            Disconnect
          </Button>
        )}
        {i.connectedAt && i.status !== "available" && (
          <span className="ml-auto text-xs text-muted-foreground">
            Since {formatLongDate(i.connectedAt)}
          </span>
        )}
      </div>
    </article>
  );
  const connected = items.filter((i) => i.status !== "available");
  const available = items.filter((i) => i.status === "available");
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold text-heading">
          Connected · {connected.length}
        </h2>
        {connected.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {connected.map((i) => (
              <Card key={i.id} i={i} />
            ))}
          </div>
        ) : (
          <div className="surface rounded-lg">
            <EmptyState
              compact
              icon={Plug}
              title="Nothing connected yet"
              description="Connect the tools your team already uses."
            />
          </div>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold text-heading">
          Available
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {available.map((i) => (
            <Card key={i.id} i={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

/* ---------- Data ---------- */
export const DataSettings = () => {
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);
  const { submitting, submit } = useSubmit();
  return (
    <div className="space-y-4">
      <SectionCard
        title="Export"
        description="A ZIP with clients, projects, tasks, documents and activity as CSV + original files."
      >
        <LoadingButton
          variant="outline"
          loading={submitting}
          onClick={() =>
            submit(() => {
              notify.success("Export started", {
                description: "We'll email a download link when it's ready.",
              });
            }, 1200)
          }
        >
          <Download /> Export organization data
        </LoadingButton>
      </SectionCard>
      <SectionCard
        title="Import"
        description="Bring clients and contacts in from a CSV or another tool."
      >
        <Button
          variant="outline"
          onClick={() => notify.info("Choose a CSV file")}
        >
          <Upload /> Import CSV
        </Button>
      </SectionCard>
      <SectionCard title="Data retention">
        <Field label="Keep deleted items for" htmlFor="d-ret">
          <NativeSelect id="d-ret" defaultValue="30" className="h-9 max-w-xs">
            <NativeSelectOption value="7">7 days</NativeSelectOption>
            <NativeSelectOption value="30">30 days</NativeSelectOption>
            <NativeSelectOption value="90">90 days</NativeSelectOption>
          </NativeSelect>
        </Field>
      </SectionCard>
      <SectionCard title="Danger zone" className="ring-1 ring-danger/25">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-medium text-heading">
                Delete all workspace data
              </span>
              <br />
              <span className="text-xs text-muted-foreground">
                Removes clients, projects, tasks and documents. Members and
                billing stay.
              </span>
            </p>
            <Button variant="destructive" onClick={() => setOpen(true)}>
              Delete data…
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
            <p className="text-sm">
              <span className="font-medium text-heading">
                Delete organization
              </span>
              <br />
              <span className="text-xs text-muted-foreground">
                Permanently deletes {currentOrg.name} and cancels the
                subscription.
              </span>
            </p>
            <Button variant="destructive" onClick={() => setOpen(true)}>
              Delete organization…
            </Button>
          </div>
        </div>
      </SectionCard>
      <AlertDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          setConfirmText("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This can&apos;t be undone</AlertDialogTitle>
            <AlertDialogDescription>
              Type{" "}
              <span className="font-semibold text-heading">
                {currentOrg.name}
              </span>{" "}
              to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            aria-label="Type the organization name to confirm"
            className="h-9"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText !== currentOrg.name}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                notify.warning("Deletion scheduled", {
                  description: "Owners will receive a confirmation email.",
                })
              }
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
