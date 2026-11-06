"use client";

import { Brain, Ellipsis, FolderPlus, Globe, PencilLine, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientLogo } from "@/components/generalUIcomp/ClientLogo";
import { ClientStatusChip, HealthChip } from "@/components/generalUIcomp/Chips";
import { UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { notify } from "@/lib/notify";
import type { Client } from "@/types";

type Props = {
  client: Client;
  onEdit: () => void;
  onNewProject: () => void;
  onInvite: () => void;
  onAskAI: () => void;
};

/** Client workspace header (§14.3) */
export const ClientHeader = ({ client: c, onEdit, onNewProject, onInvite, onAskAI }: Props) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div className="flex min-w-0 items-start gap-4">
      <ClientLogo client={c} size="lg" />
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-heading md:text-[1.45rem]">{c.name}</h1>
          <ClientStatusChip status={c.status} />
          <HealthChip health={c.health} />
        </div>
        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Website</dt>
            <Globe className="size-3.5" aria-hidden />
            <dd><a href={`https://${c.website}`} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">{c.website}</a></dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt>Primary contact</dt>
            <dd className="text-foreground">{c.primaryContact.name}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt>Account manager</dt>
            <dd className="flex items-center gap-1.5 text-foreground"><UserAvatar person={c.accountManager} className="size-5" /> {c.accountManager.name}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Industry</dt>
            <dd>{c.industry} · {c.size} employees</dd>
          </div>
        </dl>
      </div>
    </div>
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Button variant="outline" onClick={onEdit}><PencilLine /> Edit</Button>
      <Button variant="outline" onClick={onInvite}><UserPlus /> Invite client</Button>
      <Button variant="outline" onClick={onAskAI} className="border-ai/40 text-foreground hover:bg-ai/10"><Brain className="text-ai" /> Ask AI</Button>
      <Button onClick={onNewProject}><FolderPlus /> New project</Button>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More client actions"><Ellipsis /></Button>} />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => notify.success("Link copied")}>Copy client link</DropdownMenuItem>
          <DropdownMenuItem onClick={() => notify.info("Export started")}>Export client data</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => notify.warning("Archiving requires confirmation")}>Archive client…</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);
