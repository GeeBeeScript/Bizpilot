"use client";

import { SidebarProvider } from "@/context/sidebarContext";
import { BreadcrumbProvider } from "@/context/breadcrumbContext";
import { QuickCreateProvider } from "@/context/quickCreateContext";
import { ShellVariantProvider } from "@/context/shellContext";
import type { ShellVariant } from "./nav";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import MobileNav from "./MobileNav";
import { QuickCreateHost } from "./QuickCreate";

/**
 * Authenticated app shell (§3.11, §4).
 * The viewport never scrolls; only <main id="content"> does. The sidebar and top bar
 * therefore stay fixed, and the glass top bar sits over the content scrolling beneath it.
 */
const AppShell = ({ children, defaultSidebarOpen, variant = "app" }: { children: React.ReactNode; defaultSidebarOpen: boolean; variant?: ShellVariant }) => (
  <ShellVariantProvider variant={variant}>
  <SidebarProvider defaultOpen={defaultSidebarOpen}>
    <BreadcrumbProvider>
      <QuickCreateProvider>
        <div className="app-canvas flex h-dvh w-full overflow-hidden">
          <AppSidebar />
          <div className="relative flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main
              id="content"
              className="h-full overflow-y-auto overscroll-contain pt-(--topbar-h) scrollbar-thin [scroll-padding-top:calc(var(--topbar-h)+1rem)] max-md:pb-16"
            >
              {children}
            </main>
          </div>
        </div>
        <MobileNav />
        <QuickCreateHost />
      </QuickCreateProvider>
    </BreadcrumbProvider>
  </SidebarProvider>
  </ShellVariantProvider>
);

export default AppShell;
