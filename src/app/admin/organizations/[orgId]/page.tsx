import { notFound } from 'next/navigation'
import { AdminOrgDetail } from '@/components/pagecomponents/AdminPages'
import { getAdminOrg, orgActivity } from '@/lib/mock/admin'

const Page = async ({ params }: PageProps<'/admin/organizations/[orgId]'>) => {
  const { orgId } = await params
  const org = getAdminOrg(orgId)
  if (!org) notFound()
  return <AdminOrgDetail org={org} events={orgActivity.filter((a) => a.href?.endsWith(org.id))} />
}

export default Page
