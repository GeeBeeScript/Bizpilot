import { notFound } from 'next/navigation'
import ProjectWorkspaceComp from '@/components/pagecomponents/ProjectWorkspaceComp'
import { projectActivity, teamActivity } from '@/lib/mock/activity'
import { documentsForProject, getClient, getProject, tasksForProject } from '@/lib/mock/workspace'

export async function generateMetadata({ params }: PageProps<'/u/projects/[projectId]'>) {
  const { projectId } = await params
  return { title: getProject(projectId)?.name ?? 'Project' }
}

const ProjectPage = async ({ params, searchParams }: PageProps<'/u/projects/[projectId]'>) => {
  const { projectId } = await params
  const { tab } = await searchParams
  const project = getProject(projectId)
  if (!project) notFound()

  const data = {
    project,
    client: getClient(project.clientId),
    tasks: tasksForProject(project.id),
    documents: documentsForProject(project.name),
    activity: project.id === 'customer-portal' ? projectActivity : teamActivity.filter((a) => a.context?.includes(project.name)),
  }
  // ?state=empty previews a freshly created project
  const { state } = await searchParams
  const view = state === 'empty'
    ? { ...data, project: { ...project, progress: 0, openTasks: 0, spent: 0, blocker: undefined, milestones: [], collaborators: [] }, tasks: [], documents: [], activity: [] }
    : data
  return <ProjectWorkspaceComp data={view} initialTab={tab as string | undefined} />
}

export default ProjectPage
