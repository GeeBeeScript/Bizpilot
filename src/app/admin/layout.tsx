import { cookies } from "next/headers";
import AppShell from "@/app/components/shell/AppShell";
import { SIDEBAR_COOKIE } from "@/lib/constants";
import { getViewer } from "@/server/dal/viewer";

export const metadata = {
  title: { default: "Platform admin", template: "%s · Platform admin" },
};

/** Private operator area (§27). Reuses the app shell in its "admin" variant. Gate this route server-side. */
const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const [cookieStore, viewer] = await Promise.all([cookies(), getViewer()])
  const sidebar = cookieStore.get(SIDEBAR_COOKIE)?.value;
  return (
    <AppShell viewer={viewer} variant="admin" defaultSidebarOpen={sidebar !== "collapsed"}>
      {children}
    </AppShell>
  );
};

export default AdminLayout;
