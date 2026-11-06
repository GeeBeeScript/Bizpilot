"use client";

import { createContext, useContext } from "react";
import { shellNav, type ShellVariant } from "@/components/shell/nav";

const ShellContext = createContext<ShellVariant>("app");

/** Which product area the shell is rendering (main app or platform admin) */
export const ShellVariantProvider = ({ variant, children }: { variant: ShellVariant; children: React.ReactNode }) => (
  <ShellContext.Provider value={variant}>{children}</ShellContext.Provider>
);

export const useShellNav = () => {
  const variant = useContext(ShellContext);
  return { variant, ...shellNav(variant) };
};
