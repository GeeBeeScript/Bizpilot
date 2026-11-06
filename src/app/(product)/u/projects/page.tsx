import ProjectsPageComp from '@/components/pagecomponents/ProjectsPageComp'
import type { DemoState } from '@/components/pagecomponents/DashboardPageComp'
import { projects } from '@/lib/mock/workspace'

export const metadata = { title: 'Projects' }

const ProjectsPage = async ({ searchParams }: PageProps<'/u/projects'>) => {
  const { state } = await searchParams
  return <ProjectsPageComp projects={projects} demo={state as DemoState | 'empty'} />
}

export default ProjectsPage
