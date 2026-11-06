import SettingsPageComp from '@/components/pagecomponents/SettingsPageComp'
import { integrations, rolePermissions, securityEvents, sessions, usage } from '@/lib/mock/organization'

export const metadata = { title: 'Settings' }

const SettingsPage = async ({ searchParams }: PageProps<'/u/settings'>) => {
  const { tab } = await searchParams
  const ai = usage.find((u) => u.id === 'ai')!
  return (
    <SettingsPageComp
      key={(tab as string | undefined) ?? 'general'}
      initialSection={tab as string | undefined}
      permissions={rolePermissions}
      sessions={sessions}
      events={securityEvents}
      integrations={integrations}
      credits={{ used: ai.used, limit: ai.limit, resetsAt: ai.resetsAt }}
    />
  )
}

export default SettingsPage
