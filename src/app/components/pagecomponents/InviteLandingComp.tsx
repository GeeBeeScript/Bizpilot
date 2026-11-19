"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  Clock3,
  FileText,
  FolderOpen,
  Link2Off,
  Lock,
  Mail,
  MessageSquareText,
  Minus,
  ShieldCheck,
  Stamp,
  UserRoundX,
  type LucideIcon,
} from "lucide-react";
import Logo from "@/app/components/elements/Logo";
import { Button } from "@/app/components/ui/button";
import { ClientLogo } from "@/app/components/generalUIcomp/ClientLogo";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import { Chip, type Tone } from "@/app/components/generalUIcomp/Chips";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { Invite, InviteKind, Role } from "@/types";

export type InvitePermission = { label: string; allowed: boolean | "own" };

const kindMeta: Record<InviteKind, { kicker: string; icon: LucideIcon }> = {
  team: { kicker: "Team invitation", icon: ShieldCheck },
  client: { kicker: "Client portal invitation", icon: Lock },
  contact: { kicker: "Project collaboration", icon: FolderOpen },
};

const roleMeta: Record<Role, { label: string; tone: Tone; summary: string }> = {
  owner: { label: "Owner", tone: "ai", summary: "Full control of the workspace, billing and members." },
  admin: { label: "Admin", tone: "sapphire", summary: "Runs the workspace day to day, including members and roles." },
  manager: { label: "Manager", tone: "info", summary: "Leads clients and projects, approves work and runs reports." },
  employee: { label: "Employee", tone: "neutral", summary: "Works on assigned projects and tasks." },
};

const portalFeatures: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: FolderOpen, title: "Projects", body: "Progress, milestones and what's next" },
  { icon: FileText, title: "Documents", body: "Files shared with your team" },
  { icon: Stamp, title: "Approvals", body: "Deliverables waiting for sign-off" },
  { icon: MessageSquareText, title: "Updates", body: "Status notes and messages" },
];

/** Landing page for shareable invite links (§26): team members, client portal owners and project contacts */
const InviteLandingComp = ({
  invite,
  token,
  expires,
  permissions,
}: {
  /** Undefined when the token doesn't match any invitation */
  invite?: Invite;
  token: string;
  /** Pre-formatted on the server, e.g. "Expires in 6 days" */
  expires?: string;
  /** Team invites: the role's permission summary */
  permissions?: InvitePermission[];
}) => {
  const [declined, setDeclined] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);

  return (
    <section className="flex min-h-screen flex-col">
      <nav className="w-full border-b border-b-ring">
        <div className="mx-auto flex max-w-300 items-center justify-between px-4 py-2">
          <Logo className="text-2xl rounded-md px-3 py-2 bg-gray-100 dark:bg-muted" />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="size-3.5" aria-hidden /> Invitation
          </span>
        </div>
      </nav>

      <div className="flex-1 bg-amber/5 px-4 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-xl">
          {!invite || invite.state === "revoked" ? (
            <InviteStatus
              icon={Link2Off}
              tone="danger"
              title="This invitation link isn't valid"
              body="It may have been revoked, already replaced by a newer link, or copied incorrectly. Ask the person who invited you to send a fresh one."
              action={<Button nativeButton={false} render={<Link href="/" />} variant="outline">Go to BizPilot</Button>}
            />
          ) : declined ? (
            <InviteStatus
              icon={UserRoundX}
              tone="neutral"
              title="Invitation declined"
              body={`We've let ${invite.inviter.name} know. If you change your mind, ask them for a new link.`}
              action={<Button nativeButton={false} render={<Link href="/" />} variant="outline">Go to BizPilot</Button>}
            />
          ) : invite.state === "expired" ? (
            <InviteStatus
              icon={Clock3}
              tone="warning"
              title="This invitation has expired"
              body={`Invitation links stay valid for a limited time. Ask ${invite.inviter.name} at ${invite.organization.name} to send you a new one.`}
              action={
                <Button onClick={() => notify.success("Request sent", { description: `${invite.inviter.name} will get an email to resend your invitation.` })}>
                  Request a new link
                </Button>
              }
            />
          ) : invite.state === "accepted" ? (
            <InviteStatus
              icon={CircleCheck}
              tone="success"
              title="You've already accepted this invitation"
              body={`Sign in with ${invite.email} to pick up where you left off.`}
              action={<Button nativeButton={false} render={<Link href={invite.kind === "team" ? "/login" : "/portal/login"} />}>Sign in</Button>}
            />
          ) : (
            <article className="overflow-hidden rounded-lg border border-primary bg-background">
              <InviteHeader invite={invite} />

              <div className="space-y-6 px-5 py-6 sm:px-7">
                {invite.message && (
                  <figure className="flex gap-3 rounded-md bg-muted/60 p-3.5">
                    <UserAvatar person={invite.inviter} className="mt-0.5" />
                    <div className="min-w-0 text-sm">
                      <blockquote className="text-foreground">{invite.message}</blockquote>
                      <figcaption className="mt-1 text-xs text-muted-foreground">
                        {invite.inviter.name} · {invite.inviter.role}
                      </figcaption>
                    </div>
                  </figure>
                )}

                {invite.kind === "team" && invite.role && <TeamDetails role={invite.role} permissions={permissions ?? []} org={invite.organization.name} />}
                {invite.kind === "client" && invite.client && <ClientDetails clientName={invite.client.name} provider={invite.organization.name} />}
                {invite.kind === "contact" && <ContactDetails invite={invite} />}

                <InviteActions invite={invite} token={token} />
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border bg-muted/40 px-5 py-3 text-xs text-muted-foreground sm:px-7">
                <span>
                  Sent to <span className="text-foreground">{invite.email}</span>
                  {expires && <> · {expires}</>}
                </span>
                {confirmDecline ? (
                  <span className="flex items-center gap-2">
                    Decline this invitation?
                    <button type="button" className="font-medium text-danger hover:underline" onClick={() => setDeclined(true)}>
                      Decline
                    </button>
                    <button type="button" className="hover:text-foreground" onClick={() => setConfirmDecline(false)}>
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button type="button" className="hover:text-foreground hover:underline" onClick={() => setConfirmDecline(true)}>
                    Not you? Decline
                  </button>
                )}
              </footer>
            </article>
          )}

          <p className="mt-5 text-center text-xs text-muted-foreground">
            BizPilot never asks for your password by email. Only open invitation links from people you work with.
          </p>
        </div>
      </div>
    </section>
  );
};

/* ---------- Pieces ---------- */

const InviteHeader = ({ invite }: { invite: Invite }) => {
  const meta = kindMeta[invite.kind];
  const org = { name: invite.organization.name, initials: invite.organization.initials, tone: "sapphire" as const };
  const title =
    invite.kind === "team"
      ? `Join ${invite.organization.name} on BizPilot`
      : invite.kind === "client"
        ? `Your ${invite.client?.name} portal is ready`
        : `Collaborate on ${invite.projects?.[0]?.name ?? "a project"}`;
  const lede =
    invite.kind === "team"
      ? `${invite.inviter.name} invited you to join their team. You’ll work on clients, projects and documents together in one workspace.`
      : invite.kind === "client"
        ? `${invite.inviter.name} from ${invite.organization.name} set up a private client portal for ${invite.client?.name}.`
        : `${invite.inviter.name} from ${invite.organization.name} invited you to work with them as part of ${invite.client?.name}.`;

  return (
    <header className="relative border-b border-border bg-muted/40 px-5 pb-6 pt-7 sm:px-7">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="relative">
        {/* Who's inviting whom */}
        <div className="flex items-center">
          <ClientLogo client={org} size="lg" className="ring-4 ring-background" />
          {invite.client ? (
            <>
              <span className="z-10 -mx-2 grid size-7 place-items-center rounded-full bg-background text-muted-foreground ring-1 ring-border" aria-hidden>
                <ArrowRight className="size-3.5" />
              </span>
              <ClientLogo client={invite.client} size="lg" className="ring-4 ring-background" />
            </>
          ) : (
            <UserAvatar person={invite.inviter} size="lg" className="-ml-3 ring-4 ring-background" />
          )}
        </div>

        <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary-blue dark:text-info">
          <meta.icon className="size-3.5" aria-hidden /> {meta.kicker}
        </p>
        <h1 className="mt-1.5 font-heading text-2xl font-semibold tracking-tight text-heading">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{lede}</p>
      </div>
    </header>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</h2>
);

const TeamDetails = ({ role, permissions, org }: { role: Role; permissions: InvitePermission[]; org: string }) => {
  const r = roleMeta[role];
  const allowed = permissions.filter((p) => p.allowed);
  const notIncluded = permissions.filter((p) => !p.allowed);
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-md border border-border p-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary-blue/10 text-primary-blue dark:text-info">
          <BadgeCheck className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 text-sm">
          <p className="flex items-center gap-2 text-foreground">
            Your role <Chip tone={r.tone}>{r.label}</Chip>
          </p>
          <p className="mt-0.5 text-muted-foreground">{r.summary}</p>
        </div>
      </div>

      <div>
        <SectionLabel>What you’ll be able to do</SectionLabel>
        <ul className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          {allowed.map((p) => (
            <li key={p.label} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              <span>
                {p.label}
                {p.allowed === "own" && <span className="text-muted-foreground"> (your own)</span>}
              </span>
            </li>
          ))}
        </ul>
        {notIncluded.length > 0 && (
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Minus className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>Not included: {notIncluded.map((p) => p.label.toLowerCase()).join(", ")}. An admin at {org} can change your role later.</span>
          </p>
        )}
      </div>
    </div>
  );
};

const ClientDetails = ({ clientName, provider }: { clientName: string; provider: string }) => (
  <div className="space-y-4">
    <div>
      <SectionLabel>In your portal</SectionLabel>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {portalFeatures.map((f) => (
          <li key={f.title} className="flex items-start gap-3 rounded-md border border-border p-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-blue/10 text-primary-blue dark:text-info">
              <f.icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 text-sm">
              <span className="block font-medium text-foreground">{f.title}</span>
              <span className="block text-xs text-muted-foreground">{f.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
    <ul className="space-y-1.5 text-sm text-muted-foreground">
      <li className="flex items-start gap-2">
        <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary-blue dark:text-info" aria-hidden />
        You’ll be the portal admin for {clientName} and can invite your colleagues.
      </li>
      <li className="flex items-start gap-2">
        <Lock className="mt-0.5 size-4 shrink-0 text-primary-blue dark:text-info" aria-hidden />
        Private by default: you only see what {provider} chooses to share.
      </li>
    </ul>
  </div>
);

const ContactDetails = ({ invite }: { invite: Invite }) => (
  <div className="space-y-5">
    {invite.projects && invite.projects.length > 0 && (
      <div>
        <SectionLabel>{invite.projects.length === 1 ? "Project" : "Projects"}</SectionLabel>
        <ul className="space-y-2">
          {invite.projects.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
              <FolderOpen className="size-4 shrink-0 text-primary-blue dark:text-info" aria-hidden />
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">{p.name}</span>
              {invite.client && <span className="text-xs text-muted-foreground">{invite.client.name}</span>}
            </li>
          ))}
        </ul>
      </div>
    )}
    {invite.permissions && (
      <div>
        <SectionLabel>You’ll be able to</SectionLabel>
        <ul className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          {invite.permissions.map((p) => (
            <li key={p} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </div>
    )}
    <p className="flex items-start gap-2 rounded-md bg-ai/10 px-3 py-2.5 text-xs text-foreground">
      <ShieldCheck className="mt-px size-3.5 shrink-0 text-[#8a6a2c] dark:text-ai" aria-hidden />
      <span>
        You’ll appear to {invite.organization.name}’s team as an <span className="font-semibold">external collaborator</span>
        {invite.client && <> from {invite.client.name}</>}. Internal notes and other clients stay private.
      </span>
    </p>
  </div>
);

const InviteActions = ({ invite, token }: { invite: Invite; token: string }) => {
  const q = `invite=${encodeURIComponent(token)}&email=${encodeURIComponent(invite.email)}`;
  if (invite.kind === "team") {
    return (
      <div className="space-y-3">
        <Button nativeButton={false} render={<Link href={`/signup?${q}`} />} className="h-11 w-full bg-primary-blue font-semibold hover:bg-primary-blue/85">
          Accept and create account
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-3"
          onClick={() => notify.info("Redirecting to Google…")}
        >
          <Image src="/icons/google-icon.svg" alt="" width={18} height={18} />
          Continue with Google
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have a BizPilot account?{" "}
          <Link href={`/login?${q}`} className="text-blue-500 underline underline-offset-2">
            Sign in to accept
          </Link>
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Button nativeButton={false} render={<Link href={`/portal/login?${q}`} />} className="h-11 w-full bg-primary-blue font-semibold hover:bg-primary-blue/85">
        {invite.kind === "client" ? "Open your portal" : "Accept and continue"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        No password needed to start. We’ll email a secure sign-in link to {invite.email}.
      </p>
    </div>
  );
};

const statusTones = {
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/12 text-warning",
  success: "bg-success/12 text-success",
  neutral: "bg-muted text-muted-foreground",
};

const InviteStatus = ({
  icon: Icon,
  tone,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  tone: keyof typeof statusTones;
  title: string;
  body: string;
  action: React.ReactNode;
}) => (
  <div className="flex flex-col items-center rounded-lg border border-primary bg-background px-6 py-10 text-center">
    <span className={cn("grid size-12 place-items-center rounded-full", statusTones[tone])}>
      <Icon className="size-6" aria-hidden />
    </span>
    <h1 className="mt-4 font-heading text-xl font-semibold text-heading">{title}</h1>
    <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
    <div className="mt-6">{action}</div>
  </div>
);

export default InviteLandingComp;
