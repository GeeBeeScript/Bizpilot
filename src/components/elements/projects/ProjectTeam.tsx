"use client";

import { Check, Ellipsis, Handshake, UserPlus } from "lucide-react";
import { EmptyState } from "@/components/generalUIcomp/States";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SectionCard } from "@/components/generalUIcomp/SectionCard";
import { Chip, ExternalBadge } from "@/components/generalUIcomp/Chips";
import { UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { notify } from "@/lib/notify";
import type { Person } from "@/types";

const collaboratorPerms = ["View project", "View shared documents", "Comment", "Approve deliverables"];

const MemberRow = ({ person, badge }: { person: Person; badge?: React.ReactNode }) => (
  <li className="flex items-center gap-3 px-4 py-2.5">
    <UserAvatar person={person} size="default" showStatus />
    <div className="min-w-0 flex-1">
      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-heading">{person.name} {badge}</p>
      <p className="truncate text-xs text-muted-foreground">
        {person.role}
        {person.external && <> — {person.external.company} — External collaborator</>}
      </p>
    </div>
    <span className="text-xs text-muted-foreground max-md:hidden">{person.email}</span>
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${person.name}`}><Ellipsis /></Button>} />
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => notify.info("Change role")}>Change role</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => notify.success(`${person.name} removed from project`, { onUndo: () => {} })}>Remove from project</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </li>
);

/** Team tab (§15.5): internal team and external collaborators kept clearly separate (§26) */
export const ProjectTeam = ({ team, manager, collaborators, onInviteMember, onInviteClient }: { team: Person[]; manager: Person; collaborators: Person[]; onInviteMember: () => void; onInviteClient: () => void }) => (
  <div className="grid gap-4 xl:grid-cols-2">
    <SectionCard title={`Internal team · ${team.length}`} actions={<Button variant="ghost" size="sm" className="text-xs" onClick={onInviteMember}><UserPlus /> Add member</Button>} bodyClassName="px-0 pb-1">
      <ul className="divide-y divide-border/70 border-t border-border/70">
        {team.map((p) => <MemberRow key={p.id} person={p} badge={p.id === manager.id ? <Chip tone="info">Project manager</Chip> : undefined} />)}
      </ul>
    </SectionCard>
    <SectionCard title={`External collaborators · ${collaborators.length}`} description="People from the client organization with limited access" actions={<Button variant="ghost" size="sm" className="text-xs" onClick={onInviteClient}><UserPlus /> Invite</Button>} bodyClassName="px-0 pb-1">
      {collaborators.length ? (
        <ul className="divide-y divide-border/70 border-t border-border/70">
          {collaborators.map((p) => <MemberRow key={p.id} person={p} badge={<ExternalBadge company={p.external?.company} />} />)}
        </ul>
      ) : (
        <EmptyState compact icon={Handshake} title="No client collaborators yet" description="Invite client contacts to follow progress, share files and approve deliverables." action={<Button size="sm" variant="outline" onClick={onInviteClient}><UserPlus /> Invite client</Button>} />
      )}
      <div className="mx-4 mt-2 mb-3 rounded-lg bg-ai/6 p-3 ring-1 ring-ai/20">
        <p className="mb-1.5 text-xs font-semibold text-heading">Collaborators can</p>
        <ul className="grid gap-1 sm:grid-cols-2">
          {collaboratorPerms.map((perm) => <li key={perm} className="flex items-center gap-1.5 text-xs"><Check className="size-3.5 text-success" /> {perm}</li>)}
        </ul>
      </div>
    </SectionCard>
  </div>
);
