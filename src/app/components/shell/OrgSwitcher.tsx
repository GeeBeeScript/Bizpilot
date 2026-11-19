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
import { Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { currentOrg, organizations } from "@/lib/mock/people";
import { notify } from "@/lib/notify";

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

/** Organization/workspace selector (§4.1 header). Present but intentionally understated. */
export const OrgSwitcher = ({ collapsed }: { collapsed: boolean }) => {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors duration-150 outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
              collapsed && "justify-center",
            )}
            aria-label={`Organization: ${currentOrg.name}`}
          >
            <OrgTile initials={currentOrg.initials} />
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-sidebar-accent-foreground">
                    {currentOrg.name}
                  </span>
                  <span className="block text-[0.7rem] text-muted-foreground">
                    {currentOrg.plan} plan
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
          {organizations.map((o) => (
            <DropdownMenuItem
              key={o.id}
              onClick={() =>
                o.id !== currentOrg.id && notify.info(`Switching to ${o.name}`)
              }
            >
              <OrgTile
                initials={o.initials}
                className="size-5 text-[0.55rem]"
              />
              <span className="flex-1">{o.name}</span>
              {o.id === currentOrg.id && <Check className="text-primary" />}
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
