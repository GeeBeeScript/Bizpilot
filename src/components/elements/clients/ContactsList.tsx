"use client";

import { useState } from "react";
import { Contact as ContactIcon, Ellipsis, Mail, PencilLine, Plus, UserCheck, UserMinus, UserPlus } from "lucide-react";
import { EmptyState } from "@/components/generalUIcomp/States";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Chip, ExternalBadge } from "@/components/generalUIcomp/Chips";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import type { Contact } from "@/types";

/** Client organization contacts (§14.3 Contacts tab, §26) */
export const ContactsList = ({ contacts: initial, company }: { contacts: Contact[]; company: string }) => {
  const [contacts, setContacts] = useState(initial);
  const set = (id: string, p: Partial<Contact>, msg: string) => {
    const prev = contacts;
    setContacts((l) => l.map((c) => (c.id === id ? { ...c, ...p } : c)));
    notify.success(msg, { onUndo: () => setContacts(prev) });
  };

  if (contacts.length === 0)
    return (
      <div className="surface rounded-lg">
        <EmptyState icon={ContactIcon} title="No contacts yet" description={`Add people from ${company} to invite them as collaborators and keep track of who's who.`} action={<Button size="sm" onClick={() => notify.info("Add contact")}><Plus /> Add contact</Button>} />
      </div>
    );

  return (
    <div className="surface overflow-hidden rounded-lg">
      <ul className="divide-y divide-border">
        {contacts.map((c) => (
          <li key={c.id} className={cn("flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40", !c.active && "opacity-60")}>
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold", c.isCollaborator ? "bg-ai/20 text-heading ring-2 ring-ai/50" : "bg-muted text-muted-foreground")}>
              {c.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-heading">
                {c.name}
                {c.isCollaborator && <ExternalBadge company={company} />}
                {!c.active && <Chip>Inactive</Chip>}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {c.title} · {company}
                {c.isCollaborator && " · External collaborator"}
              </p>
            </div>
            <a href={`mailto:${c.email}`} className="hidden items-center gap-1.5 text-xs text-muted-foreground hover:text-primary md:flex">
              <Mail className="size-3.5" /> {c.email}
            </a>
            {!c.isCollaborator && c.active && (
              <Button variant="outline" size="sm" onClick={() => set(c.id, { isCollaborator: true }, `Invitation sent to ${c.name}`)} className="max-sm:hidden">
                <UserPlus /> Invite as collaborator
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${c.name}`}><Ellipsis /></Button>} />
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => notify.info("Edit contact")}><PencilLine /> Edit</DropdownMenuItem>
                {!c.isCollaborator && <DropdownMenuItem onClick={() => set(c.id, { isCollaborator: true }, `Invitation sent to ${c.name}`)}><UserPlus /> Invite as collaborator</DropdownMenuItem>}
                <DropdownMenuSeparator />
                {c.active ? (
                  <DropdownMenuItem variant="destructive" onClick={() => set(c.id, { active: false, isCollaborator: false }, `${c.name} marked inactive`)}><UserMinus /> Mark inactive</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => set(c.id, { active: true }, `${c.name} reactivated`)}><UserCheck /> Reactivate</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
    </div>
  );
};
