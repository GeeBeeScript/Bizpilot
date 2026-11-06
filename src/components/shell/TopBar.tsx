"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Keyboard,
  LifeBuoy,
  Menu,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSidebar } from "@/context/sidebarContext";
import { useBreadcrumbs, type Crumb } from "@/context/breadcrumbContext";
import { currentUser } from "@/lib/mock/people";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { Kbd } from "@/components/generalUIcomp/Kbd";
import { useShellNav } from "@/context/shellContext";
import { CommandSearch } from "./CommandSearch";
import { NotificationsPopover } from "./NotificationsPopover";
import { QuickCreateMenu } from "./QuickCreate";
import { UserMenu } from "./UserMenu";

const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function useDerivedCrumbs(): Crumb[] {
  const pathname = usePathname();
  const { crumbs } = useBreadcrumbs();
  const { items, variant } = useShellNav();
  if (crumbs) return crumbs;
  const [base, ...parts] = pathname.split("/").filter(Boolean);
  // Admin's root page is itself a crumb ("Overview"); the main app's "/u" isn't
  const segments = variant === "admin" ? ["", ...parts] : parts;
  return segments.map((_, i) => {
    const tail = segments.slice(1, i + 1).join("/");
    const href = variant === "admin" ? `/${base}${tail ? `/${tail}` : ""}` : `/${base}/${parts.slice(0, i + 1).join("/")}`;
    const raw = variant === "admin" ? segments[i] || "overview" : segments[i];
    return { label: items.find((n) => n.href === href)?.label ?? titleCase(raw), href };
  });
}

const Breadcrumbs = () => {
  const crumbs = useDerivedCrumbs();
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-sm">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${c.label}-${i}`} className={cn("flex min-w-0 items-center gap-1", !last && "max-md:hidden")}>
              {c.href && !last ? (
                <Link href={c.href} className="truncate text-muted-foreground transition-colors hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span className="truncate font-semibold text-heading" aria-current={last ? "page" : undefined}>
                  {c.label}
                </span>
              )}
              {!last && <span className="text-subtle">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const shortcuts = [
  ["Search", "Ctrl K"],
  ["New task (in create menu)", "T"],
  ["Move card on board", "Space, then ←/→"],
  ["Close panel / dialog", "Esc"],
];

/** Fixed top bar (§4.2). Glass over the scrolling content beneath it. */
const TopBar = () => {
  const router = useRouter();
  const { isOpen, toggleIsOpen, setMobileOpen } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { variant } = useShellNav();

  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-(--topbar-h) items-center gap-2 border-b border-sidebar-border bg-topbar px-3 font-heading backdrop-blur-xl backdrop-saturate-150 md:px-4">
      <Button variant="ghost" size="icon" className="text-muted-foreground md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
        <Menu className="size-5" />
      </Button>
      {!isOpen && (
        <Button variant="ghost" size="icon" className="text-muted-foreground max-md:hidden lg:hidden" onClick={toggleIsOpen} aria-label="Expand sidebar">
          <PanelLeftOpen className="size-4.5" />
        </Button>
      )}
      <div className="flex items-center max-md:hidden">
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => router.back()} aria-label="Go back">
          <ChevronLeft />
        </Button>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => router.forward()} aria-label="Go forward">
          <ChevronRight />
        </Button>
      </div>
      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => setSearchOpen(true)}
          className="group/search flex h-8 items-center gap-2 rounded-lg bg-card/60 px-2.5 font-sans text-sm text-muted-foreground ring-1 ring-border transition-all duration-150 hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 outline-none max-sm:w-8 max-sm:justify-center max-sm:px-0 lg:w-80 xl:w-96"
          aria-label="Search clients, projects, tasks, documents"
        >
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="flex-1 truncate text-left max-lg:hidden">Search clients, projects, tasks, documents…</span>
          <Kbd className="max-lg:hidden">Ctrl K</Kbd>
        </button>

        {variant === "app" && <QuickCreateMenu />}
        <NotificationsPopover />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="text-muted-foreground max-sm:hidden" aria-label="Help">
                <CircleHelp className="size-[1.15rem]" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52 font-sans">
            <DropdownMenuItem><LifeBuoy /> Help center</DropdownMenuItem>
            <DropdownMenuItem><BookOpen /> Documentation</DropdownMenuItem>
            <DropdownMenuItem><CircleHelp /> Contact support</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShortcutsOpen(true)}><Keyboard /> Keyboard shortcuts</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserMenu
          trigger={
            <button className="ml-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50" aria-label="Account menu">
              <UserAvatar person={currentUser} size="default" showStatus />
            </button>
          }
        />
      </div>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="font-sans sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Keyboard shortcuts</DialogTitle>
          </DialogHeader>
          <ul className="divide-y divide-border">
            {shortcuts.map(([label, keys]) => (
              <li key={label} className="flex items-center justify-between py-2 text-sm">
                {label}
                <span className="flex gap-1">{keys.split(" ").map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default TopBar;
