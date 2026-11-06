import { PortalHome } from '@/components/pagecomponents/PortalPages'
import { portalActivity, portalDocuments, portalProjects, portalViewer } from '@/lib/mock/portal'

const PortalHomePage = async ({ searchParams }: PageProps<'/portal'>) => {
  const { state } = await searchParams
  const empty = state === 'empty'
  return <PortalHome viewer={portalViewer.person} projects={empty ? [] : portalProjects} activity={empty ? [] : portalActivity} docs={empty ? [] : portalDocuments} />
}

export default PortalHomePage
