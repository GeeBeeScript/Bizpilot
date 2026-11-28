"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Check, ChevronsUpDown, Loader2, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { currentOrg, organizations } from "@/lib/mock/people";
import { notify } from "@/lib/notify";
import { useViewer } from "@/context/viewerContext";
import { useTransition } from "react";
import { switchOrg } from "@/actions/org-actions";

const OrgTile = ({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) => (
  <span
    className={cn(
      "grid size-7 shrink-0 place-items-center rounded-md bg-linear-to-br from-primary-gold/80 to-primary-gold/50 font-heading text-[0.65rem] font-bold text-midnight-navy",
      className,
    )}
  >
    {initials}
  </span>
);

const roleLabel = (role: string) => role[0]!.toUpperCase() + role.slice(1)

/** Organization/workspace selector (§4.1 header). Present but intentionally understated. */
export const OrgSwitcher = ({ collapsed }: { collapsed: boolean }) => {
  const router = useRouter();
  const { activeOrg, orgs } = useViewer()
  const [pending, startTransition] = useTransition()

  const select = (orgId: string) => {
    if (orgId === activeOrg.id || pending) return
    startTransition(async () => {
      const result = await switchOrg(orgId)
      if (result?.error) notify.error(result.error)
    })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors duration-150 outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
              collapsed && "justify-center",
            )}
            aria-label={`Organization: ${activeOrg.name}`}
          >
            <OrgTile initials={activeOrg.initials} />
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-sidebar-accent-foreground">
                    {activeOrg.name}
                  </span>
                  <span className="block text-[0.7rem] text-muted-foreground">
                    {roleLabel(activeOrg.role)} plan
                  </span>
                </span>
                <ChevronsUpDown
                  className="size-3.5 text-muted-foreground"
                  aria-hidden
                />
              </>
            )}
          </button>
        }
      />
      <DropdownMenuContent
        align="start"
        side={collapsed ? "right" : "bottom"}
        className="w-60 font-sans"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          {orgs.map((o) => (
            <DropdownMenuItem
              key={o.id}
              onClick={() =>
                o.id !== activeOrg.id && select(o.id)
              }
            >
              <OrgTile
                initials={o.initials}
                className="size-5 text-[0.55rem]"
              />
              <span className="flex-1">{o.name}</span>
              { pending ? <Loader2 className="animate-spin"/> : o.id === activeOrg.id && <Check className="text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            notify.info("Create organization", {
              description: "Opens organization setup.",
            })
          }
        >
          <Plus /> Create organization
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/u/settings")}>
          <Settings /> Organization settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
