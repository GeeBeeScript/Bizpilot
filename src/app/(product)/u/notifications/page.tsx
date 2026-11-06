import NotificationsPageComp from '@/components/pagecomponents/NotificationsPageComp'
import { notifications } from '@/lib/mock/activity'

export const metadata = { title: 'Notifications' }

const NotificationsPage = async ({ searchParams }: PageProps<'/u/notifications'>) => {
  const { state } = await searchParams
  return <NotificationsPageComp items={state === 'empty' ? [] : notifications} />
}

export default NotificationsPage
