"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/components/ui/native-select";
import { Button } from "@/app/components/ui/button";
import {
  Field,
  PanelSection,
  SidePanel,
} from "@/app/components/generalUIcomp/SidePanel";
import {
  LoadingButton,
  useSubmit,
} from "@/app/components/generalUIcomp/LoadingButton";
import { notify } from "@/lib/notify";
import { people } from "@/lib/mock/people";
import { projects } from "@/lib/mock/workspace";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId?: string;
};
const internal = Object.values(people).filter((p) => !p.external);

/** Quick task creation (§29) */
export const TaskFormDrawer = ({ open, onOpenChange, projectId }: Props) => {
  const { submitting, submit } = useSubmit();
  const [title, setTitle] = useState("");
  const [touched, setTouched] = useState(false);
  const error = !title.trim() ? "Give the task a title" : undefined;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (error) return;
    submit(() => {
      onOpenChange(false);
      notify.success("Task created", { description: title });
    });
  };

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title="New task"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton type="submit" form="task-form" loading={submitting}>
            Create task
          </LoadingButton>
        </>
      }
    >
      <form id="task-form" onSubmit={onSubmit} noValidate>
        <PanelSection title="Task">
          <Field
            label="Title *"
            htmlFor="t-title"
            error={touched ? error : undefined}
          >
            <Input
              id="t-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={touched && !!error}
              placeholder="What needs to be done?"
              className="h-9"
            />
          </Field>
          <Field label="Description" htmlFor="t-desc">
            <Textarea id="t-desc" rows={4} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Project" htmlFor="t-proj">
              <NativeSelect
                id="t-proj"
                defaultValue={projectId ?? projects[0].id}
                className="h-9"
              >
                {projects.map((p) => (
                  <NativeSelectOption key={p.id} value={p.id}>
                    {p.name} — {p.clientName}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Assignee" htmlFor="t-assignee">
              <NativeSelect
                id="t-assignee"
                defaultValue={people.sarah.id}
                className="h-9"
              >
                {internal.map((p) => (
                  <NativeSelectOption key={p.id} value={p.id}>
                    {p.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Priority" htmlFor="t-pri">
              <NativeSelect id="t-pri" defaultValue="medium" className="h-9">
                <NativeSelectOption value="low">Low</NativeSelectOption>
                <NativeSelectOption value="medium">Medium</NativeSelectOption>
                <NativeSelectOption value="high">High</NativeSelectOption>
                <NativeSelectOption value="urgent">Urgent</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field label="Due date" htmlFor="t-due">
              <Input id="t-due" type="date" className="h-9" />
            </Field>
          </div>
        </PanelSection>
      </form>
    </SidePanel>
  );
};
