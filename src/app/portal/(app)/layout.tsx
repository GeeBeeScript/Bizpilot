import PortalShell from '@/components/portal/PortalShell'
import { PortalProvider } from '@/components/portal/PortalParts'
import { deliverables, portalViewer } from '@/lib/mock/portal'
import { getClient } from '@/lib/mock/workspace'

export const metadata = { title: { default: 'Client portal', template: '%s · Client portal' } }

/** Restricted client-facing area (§25). Replace mock reads with the signed-in contact's scoped data. */
const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  const client = getClient(portalViewer.clientId)!
  return (
    <PortalProvider initial={deliverables}>
      <PortalShell viewer={portalViewer.person} client={client} provider={portalViewer.provider} pending={deliverables.filter((d) => d.status === 'awaiting').length}>
        {children}
      </PortalShell>
    </PortalProvider>
  )
}

export default PortalLayout
