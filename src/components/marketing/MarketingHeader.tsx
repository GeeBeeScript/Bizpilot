"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BuildingComplex, Menu, Sparkles } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";

const links = [
  { href: "/", label: "Home" },
  { href: "/#workflow", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Support" },
];

export const MkLogo = ({ tree }: { tree?: boolean }) => (
  <Link href="/" className="mk-logo" aria-label="BizPilot home" data-tree={tree ? "logo" : undefined}>
    <BuildingComplex className="size-[22px]" strokeWidth={2.2} aria-hidden />
    <span className="mk-logo-word">BizPilot</span>
  </Link>
);

/** Public site nav — transparent at the top, frosted once you scroll */
const MarketingHeader = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="mk-nav" data-scrolled={scrolled || undefined}>
      <div className="mk-nav-inner">
        <MkLogo tree />
        <nav className="mk-nav-links" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="mk-nav-link" aria-current={pathname === l.href ? "page" : undefined}>{l.label}</Link>
          ))}
        </nav>
        <div className="mk-nav-actions">
          <Link href="/login" className="mk-nav-link mk-nav-cta">Sign in</Link>
          <Link href="/signup" className="mk-btn mk-btn-primary mk-btn-sm mk-nav-cta"><Sparkles className="size-4" aria-hidden /> Start free</Link>
          <button className="mk-nav-menu" onClick={() => setOpen(true)} aria-label="Menu"><Menu className="size-5" /></button>
        </div>
      </div>
      <Drawer open={open} onOpenChange={setOpen} swipeDirection="down">
        <DrawerContent className="mk bg-white">
          <DrawerTitle className="sr-only">Menu</DrawerTitle>
          <nav className="flex flex-col gap-1 p-3">
            {[...links, { href: "/login", label: "Sign in" }].map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="flex min-h-14 items-center justify-between rounded-2xl px-[18px] text-[19px] font-[540] hover:bg-black/[0.04]">
                {l.label} <span aria-hidden className="text-[22px] font-normal text-[var(--mk-text-3)]">→</span>
              </Link>
            ))}
            <Link href="/signup" onClick={() => setOpen(false)} className="mk-btn mk-btn-primary mk-btn-lg mt-3">Start free</Link>
          </nav>
        </DrawerContent>
      </Drawer>
    </header>
  );
};

export default MarketingHeader;
