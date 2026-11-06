"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Field, PanelSection, SidePanel } from "@/components/generalUIcomp/SidePanel";
import { LoadingButton, useSubmit } from "@/components/generalUIcomp/LoadingButton";
import { notify } from "@/lib/notify";
import { people } from "@/lib/mock/people";
import type { Client } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Edit mode when provided */
  client?: Client;
  onSave?: (values: Record<string, string>) => void;
};

const internal = Object.values(people).filter((p) => !p.external);
const emailOk = (v: string) => !v || /^\S+@\S+\.\S+$/.test(v);

/** Add/Edit Client drawer (§14.2) */
export const ClientFormDrawer = ({ open, onOpenChange, client, onSave }: Props) => {
  const { submitting, submit } = useSubmit();
  const [name, setName] = useState(client?.name ?? "");
  const [email, setEmail] = useState(client?.primaryContact.email ?? "");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    name: !name.trim() ? "Company name is required" : undefined,
    email: !emailOk(email) ? "Enter a valid email address" : undefined,
  };
  const invalid = !!errors.name || !!errors.email;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (invalid) return;
    const values = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    submit(() => {
      onSave?.(values);
      onOpenChange(false);
      notify.success(client ? "Client updated" : "Client created", { description: name });
    });
  };

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title={client ? `Edit ${client.name}` : "New client"}
      description={client ? undefined : "Add a client organization to start organizing projects and work."}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <LoadingButton type="submit" form="client-form" loading={submitting}>
            {client ? "Save changes" : "Create client"}
          </LoadingButton>
        </>
      }
    >
      <form id="client-form" onSubmit={onSubmit} noValidate>
        <PanelSection title="Company">
          <Field label="Company name *" htmlFor="c-name" error={touched.name ? errors.name : undefined}>
            <Input
              id="c-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              aria-invalid={touched.name && !!errors.name}
              placeholder="Globex Corporation"
              className="h-9"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Website" htmlFor="c-web"><Input id="c-web" name="website" defaultValue={client?.website} placeholder="globex.com" className="h-9" /></Field>
            <Field label="Industry" htmlFor="c-ind"><Input id="c-ind" name="industry" defaultValue={client?.industry} placeholder="Insurance" className="h-9" /></Field>
            <Field label="Company size" htmlFor="c-size">
              <NativeSelect id="c-size" name="size" defaultValue={client?.size ?? ""} className="h-9">
                <NativeSelectOption value="">Select…</NativeSelectOption>
                {["1–50", "50–200", "200–500", "500–1,000", "1,000–5,000", "5,000+"].map((s) => <NativeSelectOption key={s} value={s}>{s}</NativeSelectOption>)}
              </NativeSelect>
            </Field>
            <Field label="Phone" htmlFor="c-phone"><Input id="c-phone" name="phone" defaultValue={client?.phone} className="h-9" /></Field>
          </div>
          <Field label="Address" htmlFor="c-addr"><Input id="c-addr" name="address" defaultValue={client?.address} className="h-9" /></Field>
        </PanelSection>

        <PanelSection title="Primary contact">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" htmlFor="pc-name"><Input id="pc-name" name="contactName" defaultValue={client?.primaryContact.name} className="h-9" /></Field>
            <Field label="Title" htmlFor="pc-title"><Input id="pc-title" name="contactTitle" defaultValue={client?.primaryContact.title} className="h-9" /></Field>
            <Field label="Email" htmlFor="pc-email" error={touched.email ? errors.email : undefined}>
              <Input
                id="pc-email"
                name="contactEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={touched.email && !!errors.email}
                className="h-9"
              />
            </Field>
            <Field label="Phone" htmlFor="pc-phone"><Input id="pc-phone" name="contactPhone" defaultValue={client?.primaryContact.phone} className="h-9" /></Field>
          </div>
        </PanelSection>

        <PanelSection title="Internal" description="Only visible to your team.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Account manager" htmlFor="c-am">
              <NativeSelect id="c-am" name="accountManager" defaultValue={client?.accountManager.id ?? people.sarah.id} className="h-9">
                {internal.map((p) => <NativeSelectOption key={p.id} value={p.id}>{p.name}</NativeSelectOption>)}
              </NativeSelect>
            </Field>
            <Field label="Status" htmlFor="c-status">
              <NativeSelect id="c-status" name="status" defaultValue={client?.status ?? "onboarding"} className="h-9">
                <NativeSelectOption value="onboarding">Onboarding</NativeSelectOption>
                <NativeSelectOption value="active">Active</NativeSelectOption>
                <NativeSelectOption value="paused">Paused</NativeSelectOption>
                <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field label="Relationship health" htmlFor="c-health">
              <NativeSelect id="c-health" name="health" defaultValue={client?.health ?? "on-track"} className="h-9">
                <NativeSelectOption value="on-track">On track</NativeSelectOption>
                <NativeSelectOption value="at-risk">At risk</NativeSelectOption>
                <NativeSelectOption value="off-track">Off track</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field label="Tags" htmlFor="c-tags" hint="Comma separated"><Input id="c-tags" name="tags" defaultValue={client?.tags.join(", ")} className="h-9" /></Field>
          </div>
          <Field label="Internal notes" htmlFor="c-notes"><Textarea id="c-notes" name="notes" rows={3} placeholder="Context your team should know…" /></Field>
        </PanelSection>

        <PanelSection title="Commercial">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Contract value" htmlFor="c-val"><Input id="c-val" name="contractValue" inputMode="numeric" defaultValue={client?.contractValue} placeholder="$" className="h-9" /></Field>
            <Field label="Billing" htmlFor="c-bill">
              <NativeSelect id="c-bill" name="billing" defaultValue="retainer" className="h-9">
                <NativeSelectOption value="retainer">Retainer</NativeSelectOption>
                <NativeSelectOption value="fixed">Fixed fee</NativeSelectOption>
                <NativeSelectOption value="tm">Time & materials</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field label="Renewal date" htmlFor="c-renew"><Input id="c-renew" name="renewalDate" type="date" className="h-9" /></Field>
          </div>
        </PanelSection>
      </form>
    </SidePanel>
  );
};
