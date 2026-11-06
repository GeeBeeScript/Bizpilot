"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, ClipboardPlus, FolderPlus, Plus, Upload, UserPlus, UserRoundPlus, Workflow } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuickCreate } from "@/context/quickCreateContext";
import { ClientFormDrawer } from "@/components/elements/create/ClientFormDrawer";
import { ProjectFormDrawer } from "@/components/elements/create/ProjectFormDrawer";
import { TaskFormDrawer } from "@/components/elements/create/TaskFormDrawer";
import { UploadDocumentDrawer } from "@/components/elements/create/UploadDocumentDrawer";
import { InviteMemberDrawer } from "@/components/elements/create/InviteMemberDrawer";

/** Global create control (§4.2, §29) */
export const QuickCreateMenu = () => {
  const { openCreate } = useQuickCreate();
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="default" className="h-8 gap-1 pr-2 pl-2.5 font-heading text-xs font-semibold" aria-label="Create new">
            <Plus className="size-4" /> <span className="max-sm:hidden">New</span>
            <ChevronDown className="size-3.5 opacity-70 max-sm:hidden" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={6} className="w-56 font-sans">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openCreate("client")}><UserRoundPlus /> New client <DropdownMenuShortcut>C</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreate("project")}><FolderPlus /> New project <DropdownMenuShortcut>P</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreate("task")}><ClipboardPlus /> New task <DropdownMenuShortcut>T</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreate("document")}><Upload /> Upload document <DropdownMenuShortcut>U</DropdownMenuShortcut></DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/u/automations")}><Workflow /> New automation</DropdownMenuItem>
        <DropdownMenuItem onClick={() => openCreate("invite")}><UserPlus /> Invite team member</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/** Mounts the create drawers once for the whole app */
export const QuickCreateHost = () => {
  const { active, payload, close } = useQuickCreate();
  const onOpenChange = (o: boolean) => !o && close();
  // Keys reset form state when a drawer opens with different context (not on open/close, to keep animations)
  const key = `${payload.clientId ?? ""}-${payload.projectId ?? ""}`;
  return (
    <>
      <ClientFormDrawer key={`c-${key}`} open={active === "client"} onOpenChange={onOpenChange} />
      <ProjectFormDrawer key={`p-${key}`} open={active === "project"} onOpenChange={onOpenChange} clientId={payload.clientId} />
      <TaskFormDrawer key={`t-${key}`} open={active === "task"} onOpenChange={onOpenChange} projectId={payload.projectId} />
      <UploadDocumentDrawer key={`d-${key}`} open={active === "document"} onOpenChange={onOpenChange} clientId={payload.clientId} projectId={payload.projectId} />
      <InviteMemberDrawer key={`i-${key}`} open={active === "invite"} onOpenChange={onOpenChange} />
    </>
  );
};
