import ClientsPageComp from '@/components/pagecomponents/ClientsPageComp'
import type { DemoState } from '@/components/pagecomponents/DashboardPageComp'
import { clients } from '@/lib/mock/workspace'

export const metadata = { title: 'Clients' }

const ClientsPage = async ({ searchParams }: PageProps<'/u/clients'>) => {
  const { state, health, status } = await searchParams
  // ?health= / ?status= pre-apply filters (used by Reports drill-downs)
  const initialFilters = Object.fromEntries(Object.entries({ health, status }).filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, [v as string]]))
  return <ClientsPageComp clients={clients} demo={state as DemoState | 'empty'} initialFilters={initialFilters} />
}

export default ClientsPage
