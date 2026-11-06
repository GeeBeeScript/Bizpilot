import TeamPageComp from '@/components/pagecomponents/TeamPageComp'
import type { DemoState } from '@/components/pagecomponents/DashboardPageComp'
import { rolePermissions, teamMembers } from '@/lib/mock/organization'
import { projects, tasks } from '@/lib/mock/workspace'
import { teamActivity } from '@/lib/mock/activity'

export const metadata = { title: 'Team' }

const TeamPage = async ({ searchParams }: PageProps<'/u/team'>) => {
  const { state } = await searchParams
  return <TeamPageComp members={teamMembers} projects={projects} tasks={tasks} activity={teamActivity} permissions={rolePermissions} demo={state as DemoState} />
}

export default TeamPage
