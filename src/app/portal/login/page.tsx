import PortalLogin from '@/components/portal/PortalLogin'
import { portalViewer } from '@/lib/mock/portal'
import { people } from '@/lib/mock/people'
import { getClient } from '@/lib/mock/workspace'

export const metadata = { title: 'Client portal sign in' }

const PortalLoginPage = () => (
  <PortalLogin inviter={people.priya} client={getClient(portalViewer.clientId)!} provider={portalViewer.provider} project="Customer Portal" email={portalViewer.person.email ?? ''} />
)

export default PortalLoginPage
