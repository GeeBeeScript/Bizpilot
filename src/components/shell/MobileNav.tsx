"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useSidebar } from "@/context/sidebarContext";
import { cn } from "@/lib/utils";
import { isActivePath } from "./nav";
import { useShellNav } from "@/context/shellContext";

/** Bottom navigation for the most important areas on mobile (§32) */
const MobileNav = () => {
  const pathname = usePathname();
  const { setMobileOpen } = useSidebar();
  const { items: allNavItems, mobilePrimary } = useShellNav();
  const items = mobilePrimary.map((href) => allNavItems.find((n) => n.href === href)!);

  return (
    <nav
      aria-label="Mobile"
      className="glass-strong fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border pb-[env(safe-area-inset-bottom)] font-nav md:hidden"
    >
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("flex h-14 flex-col items-center justify-center gap-0.5 text-[0.65rem]", active ? "text-primary dark:text-info" : "text-muted-foreground")}
          >
            <Icon className={cn("size-5", active ? "stroke-[1.75]" : "stroke-[1.4]")} aria-hidden />
            {item.label === "AI Assistant" ? "AI" : item.label === "Back to workspace" ? "Workspace" : item.label}
          </Link>
        );
      })}
      <button onClick={() => setMobileOpen(true)} className="flex h-14 flex-col items-center justify-center gap-0.5 text-[0.65rem] text-muted-foreground">
        <Menu className="size-5 stroke-[1.4]" aria-hidden /> More
      </button>
    </nav>
  );
};

export default MobileNav;
