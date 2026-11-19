"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Eye, LogOut, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import LogoIcon from "@/app/components/elements/LogoIcon";
import { ClientLogo } from "@/app/components/generalUIcomp/ClientLogo";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import { ThemeSwitcher } from "@/app/components/shell/ThemeSwitcher";
import { cn } from "@/lib/utils";
import type { Client, Person } from "@/types";

const nav = [
  { href: "/portal", label: "Home" },
  { href: "/portal/approvals", label: "Approvals" },
  { href: "/portal/documents", label: "Documents" },
];

/**
 * Client portal shell (§25). Feels like BizPilot but deliberately narrower: no sidebar,
 * the client's own name leads, and a scope note makes the limited view obvious.
 */
const PortalShell = ({
  viewer,
  client,
  provider,
  pending,
  children,
}: {
  viewer: Person;
  client: Pick<Client, "name" | "initials" | "tone">;
  provider: string;
  pending: number;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="app-canvas min-h-screen">
      <header className="sticky top-0 z-30 border-b border-sidebar-border bg-topbar backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-6">
          <Link href="/portal" className="flex min-w-0 items-center gap-3">
            <ClientLogo client={client} />
            <span className="min-w-0">
              <span className="block truncate font-heading text-sm font-semibold text-heading">
                {client.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                with {provider}
              </span>
            </span>
          </Link>
          <nav
            aria-label="Portal"
            className="ml-4 hidden items-center gap-1 font-nav text-sm md:flex"
          >
            {nav.map((n) => {
              const active =
                n.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-md px-3 py-1.5 transition-colors",
                    active
                      ? "bg-primary/10 text-primary dark:text-info"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {n.label}
                  {n.href === "/portal/approvals" && pending > 0 && (
                    <span className="tabular ml-1.5 rounded bg-ai/25 px-1 text-[0.65rem] font-semibold text-heading">
                      {pending}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-[0.7rem] text-muted-foreground lg:flex">
              <LogoIcon className="size-3" /> Powered by BizPilot
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    aria-label="Account menu"
                  >
                    <UserAvatar person={viewer} size="default" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="text-foreground">
                  <span className="block font-medium">{viewer.name}</span>
                  <span className="block font-normal text-muted-foreground">
                    {viewer.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/portal/profile")}
                >
                  <UserRound /> Profile & security
                </DropdownMenuItem>
                <div className="px-1.5 py-1.5">
                  <ThemeSwitcher />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => router.push("/portal/login")}
                >
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <nav
          aria-label="Portal mobile"
          className="flex gap-1 overflow-x-auto px-4 pb-2 text-sm md:hidden"
        >
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "shrink-0 rounded-md px-3 py-1",
                (
                  n.href === "/portal"
                    ? pathname === "/portal"
                    : pathname.startsWith(n.href)
                )
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
        <p className="flex items-center gap-2 rounded-lg bg-info/8 px-3 py-2 text-xs text-muted-foreground ring-1 ring-info/15">
          <Eye className="size-3.5 text-info" aria-hidden /> You&apos;re seeing
          what {provider} shares with {client.name}. Internal notes, budgets and
          team tasks aren&apos;t visible here.
        </p>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
};

export default PortalShell;
