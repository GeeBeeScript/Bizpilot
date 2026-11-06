import { cookies } from 'next/headers'
import AppShell from '@/components/shell/AppShell'
import { SIDEBAR_COOKIE } from '@/lib/constants'

export const metadata = { title: { default: 'Platform admin', template: '%s · Platform admin' } }

/** Private operator area (§27). Reuses the app shell in its "admin" variant. Gate this route server-side. */
const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const sidebar = (await cookies()).get(SIDEBAR_COOKIE)?.value
  return <AppShell variant="admin" defaultSidebarOpen={sidebar !== 'collapsed'}>{children}</AppShell>
}

export default AdminLayout
