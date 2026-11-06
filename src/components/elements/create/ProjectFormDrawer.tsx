"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Field, PanelSection, SidePanel } from "@/components/generalUIcomp/SidePanel";
import { LoadingButton, useSubmit } from "@/components/generalUIcomp/LoadingButton";
import { UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { notify } from "@/lib/notify";
import { people } from "@/lib/mock/people";
import { clients } from "@/lib/mock/workspace";

type Props = { open: boolean; onOpenChange: (o: boolean) => void; clientId?: string };

const internal = Object.values(people).filter((p) => !p.external);
const permissions = ["View project", "View documents", "Comment", "Upload documents", "Approve deliverables", "View selected tasks"];

/** Create Project drawer (§15.4) */
export const ProjectFormDrawer = ({ open, onOpenChange, clientId }: Props) => {
  const { submitting, submit } = useSubmit();
  const [name, setName] = useState("");
  const [client, setClient] = useState(clientId ?? "");
  const [touched, setTouched] = useState(false);
  const [team, setTeam] = useState<Set<string>>(new Set([people.sarah.id]));
  const [collab, setCollab] = useState(false);
  const selectedClient = clients.find((c) => c.id === client);

  const errors = { name: !name.trim() ? "Project name is required" : undefined, client: !client ? "Choose a client" : undefined };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (errors.name || errors.client) return;
    submit(() => {
      onOpenChange(false);
      notify.success("Project created", { description: `${name} · ${selectedClient?.name}` });
    });
  };

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="New project"
      description="Set up the engagement. You can add tasks and documents next."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <LoadingButton type="submit" form="project-form" loading={submitting}>Create project</LoadingButton>
        </>
      }
    >
      <form id="project-form" onSubmit={onSubmit} noValidate>
        <PanelSection title="Basics">
          <Field label="Project name *" htmlFor="p-name" error={touched ? errors.name : undefined}>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={touched && !!errors.name} placeholder="Customer Portal" className="h-9" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Client *" htmlFor="p-client" error={touched ? errors.client : undefined}>
              <NativeSelect id="p-client" value={client} onChange={(e) => setClient(e.target.value)} aria-invalid={touched && !!errors.client} className="h-9">
                <NativeSelectOption value="">Select client…</NativeSelectOption>
                {clients.map((c) => <NativeSelectOption key={c.id} value={c.id}>{c.name}</NativeSelectOption>)}
              </NativeSelect>
            </Field>
            <Field label="Project manager" htmlFor="p-pm">
              <NativeSelect id="p-pm" defaultValue={people.priya.id} className="h-9">
                {internal.map((p) => <NativeSelectOption key={p.id} value={p.id}>{p.name}</NativeSelectOption>)}
              </NativeSelect>
            </Field>
            <Field label="Status" htmlFor="p-status">
              <NativeSelect id="p-status" defaultValue="planning" className="h-9">
                <NativeSelectOption value="planning">Planning</NativeSelectOption>
                <NativeSelectOption value="active">Active</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field label="Priority" htmlFor="p-pri">
              <NativeSelect id="p-pri" defaultValue="medium" className="h-9">
                {["low", "medium", "high", "urgent"].map((v) => <NativeSelectOption key={v} value={v} className="capitalize">{v[0].toUpperCase() + v.slice(1)}</NativeSelectOption>)}
              </NativeSelect>
            </Field>
          </div>
          <Field label="Description" htmlFor="p-desc"><Textarea id="p-desc" rows={3} placeholder="What does success look like?" /></Field>
        </PanelSection>

        <PanelSection title="Timeline">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Start date" htmlFor="p-start"><Input id="p-start" type="date" className="h-9" /></Field>
            <Field label="Deadline" htmlFor="p-end"><Input id="p-end" type="date" className="h-9" /></Field>
          </div>
        </PanelSection>

        <PanelSection title="Commercial">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Budget" htmlFor="p-budget"><Input id="p-budget" inputMode="numeric" placeholder="$" className="h-9" /></Field>
            <Field label="Billing model" htmlFor="p-billing">
              <NativeSelect id="p-billing" defaultValue="fixed" className="h-9">
                <NativeSelectOption value="fixed">Fixed fee</NativeSelectOption>
                <NativeSelectOption value="tm">Time & materials</NativeSelectOption>
                <NativeSelectOption value="retainer">Retainer</NativeSelectOption>
              </NativeSelect>
            </Field>
          </div>
        </PanelSection>

        <PanelSection title="Team">
          <ul className="grid gap-1 sm:grid-cols-2">
            {internal.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/60">
                  <Checkbox
                    checked={team.has(p.id)}
                    onCheckedChange={() =>
                      setTeam((s) => {
                        const n = new Set(s);
                        if (n.has(p.id)) n.delete(p.id);
                        else n.add(p.id);
                        return n;
                      })
                    }
                  />
                  <UserAvatar person={p} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{p.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{p.role}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </PanelSection>

        <PanelSection title="Client collaboration">
          <label className="flex items-start justify-between gap-4 rounded-lg bg-muted/50 p-3">
            <span>
              <span className="block text-sm font-medium text-heading">Enable client collaboration</span>
              <span className="block text-xs text-muted-foreground">Invite client contacts to view progress, share documents and approve deliverables.</span>
            </span>
            <Switch checked={collab} onCheckedChange={setCollab} aria-label="Enable client collaboration" />
          </label>
          <AnimatePresence initial={false}>
            {collab && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                <Field label="Client contacts" htmlFor="p-contacts">
                  <NativeSelect id="p-contacts" className="h-9" disabled={!selectedClient}>
                    {!selectedClient && <NativeSelectOption>Select a client first</NativeSelectOption>}
                    {selectedClient?.contacts.map((c) => <NativeSelectOption key={c.id} value={c.id}>{c.name} — {c.title}</NativeSelectOption>)}
                  </NativeSelect>
                </Field>
                <div>
                  <p className="mb-1.5 text-xs font-medium">Permissions</p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {permissions.map((perm, i) => (
                      <label key={perm} className="flex items-center gap-2 text-sm">
                        <Checkbox defaultChecked={i < 3} /> {perm}
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PanelSection>
      </form>
    </SidePanel>
  );
};
