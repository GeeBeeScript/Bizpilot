import DocumentsPageComp from '@/components/pagecomponents/DocumentsPageComp'
import type { DemoState } from '@/components/pagecomponents/DashboardPageComp'
import { documents } from '@/lib/mock/workspace'

export const metadata = { title: 'Documents' }

const DocumentsPage = async ({ searchParams }: PageProps<'/u/documents'>) => {
  const { state } = await searchParams
  return <DocumentsPageComp documents={documents} demo={state as DemoState} />
}

export default DocumentsPage
