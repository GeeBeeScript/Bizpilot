"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EllipsisVertical, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Drawer, DrawerContent, DrawerTitle } from "@/app/components/ui/drawer";
import { useSidebar } from "@/context/sidebarContext";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mock/people";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import LogoIcon from "@/app/components/elements/LogoIcon";
import LogoText from "@/app/components/elements/LogoText";
import { isActivePath, type NavItem } from "./nav";
import { useShellNav } from "@/context/shellContext";
import { ShieldCheck } from "lucide-react";
import { OrgSwitcher } from "./OrgSwitcher";
import { UserMenu } from "./UserMenu";

const NavLink = ({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[0.9rem] font-light text-sidebar-foreground transition-colors duration-150 outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
        active &&
          "bg-primary/10 font-normal text-primary dark:bg-primary/20 dark:text-info",
        collapsed && "justify-center px-0",
      )}
    >
      {/* Active indicator stays visible in both states */}
      <span
        className={cn(
          "absolute top-1/2 -left-2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-150 dark:bg-info",
          active ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
      <Icon
        className={cn(
          "size-[1.15rem] shrink-0",
          active ? "stroke-[1.75]" : "stroke-[1.4]",
        )}
        aria-hidden
      />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="tabular rounded-md bg-primary/12 px-1.5 text-[0.65rem] font-semibold text-primary dark:text-info">
          {item.badge}
        </span>
      )}
      {collapsed && item.badge && (
        <span
          className="absolute top-1.5 right-2 size-1.5 rounded-full bg-primary"
          aria-hidden
        />
      )}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">
        {item.label}
        {item.badge && (
          <span className="tabular opacity-70">· {item.badge}</span>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

const SidebarBody = ({
  collapsed,
  onNavigate,
  showCollapse = true,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  showCollapse?: boolean;
}) => {
  const { toggleIsOpen } = useSidebar();
  const { groups: navGroups, variant } = useShellNav();
  return (
    <div className="flex h-full flex-col font-nav">
      {/* Header: logo + org switcher stay pinned */}
      <div
        className={cn("shrink-0 space-y-3 px-3 pt-4 pb-3", collapsed && "px-2")}
      >
        <div
          className={cn(
            "flex items-center justify-between",
            collapsed && "flex-col gap-2",
          )}
        >
          <Link
            href="/u/dashboard"
            className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50"
            onClick={onNavigate}
          >
            <LogoIcon className="size-5" />
            {!collapsed && <LogoText className="text-xl" />}
          </Link>
          {showCollapse && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    onClick={toggleIsOpen}
                    aria-label={
                      collapsed ? "Expand sidebar" : "Collapse sidebar"
                    }
                  >
                    {collapsed ? (
                      <PanelLeftOpen className="size-4.5" />
                    ) : (
                      <PanelLeftClose className="size-4.5" />
                    )}
                  </Button>
                }
              />
              <TooltipContent side="right">
                {collapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {variant === "admin" ? (
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-md bg-deep-sapphire/90 p-1.5 text-white",
              collapsed && "justify-center",
            )}
            title="Platform admin"
          >
            <span className="grid size-7 place-items-center rounded-md bg-white/15">
              <ShieldCheck className="size-4 text-primary-gold" />
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  Platform admin
                </span>
                <span className="block text-[0.7rem] text-white/70">
                  BizPilot operator
                </span>
              </span>
            )}
          </div>
        ) : (
          <OrgSwitcher collapsed={collapsed} />
        )}
      </div>

      {/* Nav scrolls internally if needed */}
      <nav
        aria-label="Primary"
        className={cn(
          "min-h-0 flex-1 overflow-y-auto scrollbar-none px-3 pb-3",
          collapsed && "px-2",
        )}
      >
        {navGroups.map((g, i) => (
          <div key={g.label} className={cn(i > 0 && "mt-4")}>
            {collapsed ? (
              i > 0 && (
                <div
                  className="mx-auto mb-3 h-px w-6 bg-sidebar-border"
                  aria-hidden
                />
              )
            ) : (
              <p className="mb-1 px-2.5 text-[0.65rem] font-medium tracking-[0.08em] text-subtle uppercase">
                {g.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profile footer stays pinned */}
      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border p-3",
          collapsed && "px-2",
        )}
      >
        <UserMenu
          side={collapsed ? "right" : "top"}
          align={collapsed ? "end" : "start"}
          trigger={
            <button
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md p-1.5 text-left text-sm transition-colors duration-150 outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
                collapsed && "justify-center",
              )}
              aria-label="Account menu"
            >
              <UserAvatar person={currentUser} size="default" showStatus />
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-sidebar-accent-foreground">
                      {currentUser.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {currentUser.email}
                    </span>
                  </span>
                  <EllipsisVertical
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                </>
              )}
            </button>
          }
        />
      </div>
    </div>
  );
};

/**
 * Fixed application sidebar (§4.1, §3.11).
 * lg+: in-flow, animates between 16rem and 4rem.
 * md–lg: 4rem rail; expanding overlays the content.
 * <md: hidden; slide-out drawer opened from the top bar / bottom nav.
 */
const AppSidebar = () => {
  const { isOpen, toggleIsOpen, mobileOpen, setMobileOpen } = useSidebar();
  const expanded = !!isOpen;

  return (
    <>
      <aside
        className={cn(
          "relative z-30 hidden h-full shrink-0 transition-[width] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] md:block",
          expanded ? "w-16 lg:w-64" : "w-16",
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 overflow-hidden border-r border-sidebar-border bg-sidebar backdrop-blur-xl backdrop-saturate-150 transition-[width,box-shadow] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
            expanded
              ? "w-64 max-lg:bg-[var(--glass-bg-strong)] max-lg:elev-4"
              : "w-16",
          )}
        >
          <div className={cn("h-full", expanded ? "w-64" : "w-16")}>
            <SidebarBody collapsed={!expanded} />
          </div>
        </div>
      </aside>

      {/* Tablet overlay scrim */}
      {expanded && (
        <button
          className="fixed inset-0 z-20 hidden bg-midnight-navy/10 backdrop-blur-[1px] max-lg:md:block"
          aria-label="Close sidebar"
          onClick={toggleIsOpen}
        />
      )}

      {/* Mobile slide-out */}
      <Drawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        swipeDirection="left"
      >
        <DrawerContent className="glass-strong elev-4 border-r-0 [--drawer-content-width:18rem] data-[swipe-direction=left]:rounded-r-xl">
          <DrawerTitle className="sr-only">Navigation</DrawerTitle>
          <SidebarBody
            collapsed={false}
            showCollapse={false}
            onNavigate={() => setMobileOpen(false)}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AppSidebar;
