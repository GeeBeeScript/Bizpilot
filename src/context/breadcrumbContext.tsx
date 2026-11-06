"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Crumb = { label: string; href?: string };

type BreadcrumbContextType = {
  crumbs: Crumb[] | null;
  setCrumbs: (c: Crumb[] | null) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
  const [crumbs, setCrumbs] = useState<Crumb[] | null>(null);
  return <BreadcrumbContext.Provider value={{ crumbs, setCrumbs }}>{children}</BreadcrumbContext.Provider>;
};

export const useBreadcrumbs = () => {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("useBreadcrumbs must be used inside a BreadcrumbProvider");
  return ctx;
};

/** Drop into a detail page to replace the path-derived breadcrumbs (§37) */
export const PageCrumbs = ({ items }: { items: Crumb[] }) => {
  const { setCrumbs } = useBreadcrumbs();
  const key = JSON.stringify(items);
  useEffect(() => {
    setCrumbs(JSON.parse(key));
    return () => setCrumbs(null);
  }, [key, setCrumbs]);
  return null;
};
