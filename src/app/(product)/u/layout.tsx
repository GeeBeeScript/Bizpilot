import { cookies } from "next/headers";
import AppShell from "@/app/components/shell/AppShell";
import { SIDEBAR_COOKIE } from "@/lib/constants";
import React from "react";
import { getViewer } from "@/server/dal/viewer";

const ProductLayout = async ({ children }: { children: React.ReactNode }) => {
  // Read the persisted sidebar preference on the server so there's no layout jump
  const [cookieStore, viewer] = await Promise.all([cookies(), getViewer()])
  const sidebar = cookieStore.get(SIDEBAR_COOKIE)?.value;
  return (
    <AppShell viewer={viewer} defaultSidebarOpen={sidebar !== "collapsed"}>{children}</AppShell>
  );
};

export default ProductLayout;
