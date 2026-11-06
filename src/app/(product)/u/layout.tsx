import { cookies } from 'next/headers'
import AppShell from '@/components/shell/AppShell'
import { SIDEBAR_COOKIE } from '@/lib/constants'
import React from 'react'

const ProductLayout = async ({ children }: { children: React.ReactNode }) => {
  // Read the persisted sidebar preference on the server so there's no layout jump
  const sidebar = (await cookies()).get(SIDEBAR_COOKIE)?.value
  return (
    <AppShell defaultSidebarOpen={sidebar !== 'collapsed'}>
      {children}
    </AppShell>
  )
}

export default ProductLayout
