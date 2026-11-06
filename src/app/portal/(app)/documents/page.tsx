import { PortalDocuments } from '@/components/pagecomponents/PortalPages'
import { portalDocuments } from '@/lib/mock/portal'

export const metadata = { title: 'Documents' }

const Page = () => <PortalDocuments docs={portalDocuments} />

export default Page
