import { notFound } from 'next/navigation'
import ClientWorkspaceComp from '@/components/pagecomponents/ClientWorkspaceComp'
import { clientActivity, attentionItems, deadlines, projectActivity } from '@/lib/mock/activity'
import { documentsForClient, getClient, projectsForClient, tasksForClient } from '@/lib/mock/workspace'

export async function generateMetadata({ params }: PageProps<'/u/clients/[clientId]'>) {
  const { clientId } = await params
  return { title: getClient(clientId)?.name ?? 'Client' }
}

const ClientPage = async ({ params, searchParams }: PageProps<'/u/clients/[clientId]'>) => {
  const { clientId } = await params
  const { tab } = await searchParams
  const client = getClient(clientId)
  if (!client) notFound()

  const data = {
    client,
    projects: projectsForClient(client.id),
    tasks: tasksForClient(client.name),
    documents: documentsForClient(client.name),
    activity: [...clientActivity.filter((a) => a.clientId === client.id), ...(client.id === 'globex' ? projectActivity : [])].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
    issues: attentionItems.filter((a) => a.context.includes(client.name)),
    deadlines: deadlines.filter((d) => d.clientName === client.name),
  }
  // ?state=empty previews a newly added client with nothing yet
  const { state } = await searchParams
  const view = state === 'empty'
    ? { ...data, client: { ...client, contacts: [], tags: [], activeProjects: 0, completedProjects: 0, openTasks: 0, pendingApprovals: 0, summary: `${client.name} was added recently. A relationship summary appears once there is project activity.` }, projects: [], tasks: [], documents: [], activity: [], issues: [], deadlines: [] }
    : data
  return <ClientWorkspaceComp data={view} initialTab={tab as string | undefined} />
}

export default ClientPage
