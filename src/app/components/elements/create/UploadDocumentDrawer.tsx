"use client";

import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/components/ui/native-select";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import {
  Field,
  PanelSection,
  SidePanel,
} from "@/app/components/generalUIcomp/SidePanel";
import { UploadDropzone } from "@/app/components/elements/documents/UploadDropzone";
import {
  UploadQueue,
  useUploadQueue,
} from "@/app/components/elements/documents/UploadQueue";
import { clients, projects } from "@/lib/mock/workspace";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  clientId?: string;
  projectId?: string;
};

/** Upload workflow drawer (§17.2) */
export const UploadDocumentDrawer = ({
  open,
  onOpenChange,
  clientId,
  projectId,
}: Props) => {
  const { items, add, cancel, retry } = useUploadQueue();
  const project = projects.find((p) => p.id === projectId);

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Upload documents"
      description="Files are processed and indexed so BizPilot AI can answer questions about them."
      footer={
        <Button onClick={() => onOpenChange(false)}>
          {items.length ? "Done" : "Close"}
        </Button>
      }
    >
      <PanelSection title="Where">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Client" htmlFor="u-client">
            <NativeSelect
              id="u-client"
              defaultValue={clientId ?? project?.clientId ?? ""}
              className="h-9"
            >
              <NativeSelectOption value="">
                Internal (no client)
              </NativeSelectOption>
              {clients.map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>
                  {c.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Project" htmlFor="u-project">
            <NativeSelect
              id="u-project"
              defaultValue={projectId ?? ""}
              className="h-9"
            >
              <NativeSelectOption value="">No project</NativeSelectOption>
              {projects.map((p) => (
                <NativeSelectOption key={p.id} value={p.id}>
                  {p.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <label className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-3 py-2.5">
          <span className="text-sm">Visible to client collaborators</span>
          <Switch aria-label="Visible to client collaborators" />
        </label>
      </PanelSection>
      <PanelSection title="Files">
        <UploadDropzone onFiles={add} />
        {items.length > 0 && (
          <UploadQueue items={items} onCancel={cancel} onRetry={retry} />
        )}
      </PanelSection>
    </SidePanel>
  );
};
