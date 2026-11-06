import ReportsPageComp from '@/components/pagecomponents/ReportsPageComp'
import * as R from '@/lib/mock/reports'

export const metadata = { title: 'Reports' }

const ReportsPage = () => (
  <ReportsPageComp
    revenueTrend={R.revenueTrend}
    revenueByClient={R.revenueByClient}
    revenueByProject={R.revenueByProject}
    clientStats={R.clientStats}
    newClientsByMonth={R.newClientsByMonth}
    projectBudgets={R.projectBudgets}
    projectStats={R.projectStats}
    teamWorkload={R.teamWorkload}
    aiGenerationsByWeek={R.aiGenerationsByWeek}
    aiStats={R.aiStats}
  />
)

export default ReportsPage
