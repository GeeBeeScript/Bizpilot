"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, PanelSection, SidePanel } from "@/components/generalUIcomp/SidePanel";
import { LoadingButton, useSubmit } from "@/components/generalUIcomp/LoadingButton";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

const roles = [
  { id: "admin", label: "Admin", desc: "Manage members, billing and all workspace data", perms: ["All projects & clients", "Billing & settings", "Invite and remove members"] },
  { id: "manager", label: "Manager", desc: "Run clients and projects they're assigned to", perms: ["Create clients & projects", "Assign tasks", "Invite client collaborators"] },
  { id: "employee", label: "Employee", desc: "Work on assigned projects and tasks", perms: ["View assigned projects", "Update own tasks", "Upload documents"] },
];

/** Invite Member drawer (§20.2) — shows a permission summary before sending */
export const InviteMemberDrawer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const { submitting, submit } = useSubmit();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [touched, setTouched] = useState(false);
  const error = !/^\S+@\S+\.\S+$/.test(email) ? "Enter a valid work email" : undefined;
  const r = roles.find((x) => x.id === role)!;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (error) return;
    submit(() => {
      onOpenChange(false);
      notify.success("Invitation sent", { description: `${email} · ${r.label}` });
    });
  };

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Invite team member"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <LoadingButton type="submit" form="invite-form" loading={submitting}>Send invitation</LoadingButton>
        </>
      }
    >
      <form id="invite-form" onSubmit={onSubmit} noValidate>
        <PanelSection title="Who">
          <Field label="Work email *" htmlFor="i-email" error={touched ? error : undefined}>
            <Input id="i-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} aria-invalid={touched && !!error} placeholder="name@company.com" className="h-9" />
          </Field>
        </PanelSection>
        <PanelSection title="Role">
          <div role="radiogroup" className="space-y-1.5">
            {roles.map((x) => (
              <button
                type="button"
                key={x.id}
                role="radio"
                aria-checked={role === x.id}
                onClick={() => setRole(x.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg p-3 text-left ring-1 transition-colors duration-150",
                  role === x.id ? "bg-primary/8 ring-primary/40" : "ring-border hover:bg-muted/50",
                )}
              >
                <span className={cn("mt-0.5 grid size-4 place-items-center rounded-full ring-1", role === x.id ? "bg-primary ring-primary" : "ring-input")}>
                  {role === x.id && <span className="size-1.5 rounded-full bg-white" />}
                </span>
                <span>
                  <span className="block text-sm font-medium text-heading">{x.label}</span>
                  <span className="block text-xs text-muted-foreground">{x.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1.5 text-xs font-medium text-heading">{r.label} can</p>
            <ul className="space-y-1">
              {r.perms.map((p) => (
                <li key={p} className="flex items-center gap-2 text-xs text-foreground"><Check className="size-3.5 text-success" /> {p}</li>
              ))}
            </ul>
          </div>
        </PanelSection>
        <PanelSection title="Message">
          <Field label="Optional message" htmlFor="i-msg"><Textarea id="i-msg" rows={3} placeholder="Welcome aboard!" /></Field>
        </PanelSection>
      </form>
    </SidePanel>
  );
};
