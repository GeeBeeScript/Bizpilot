import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageContainer } from '@/components/generalUIcomp/PageHeader'
import { EmptyState } from '@/components/generalUIcomp/States'

const NotFound = () => (
  <PageContainer>
    <div className="surface rounded-lg">
      <EmptyState
        icon={SearchX}
        title="We couldn't find that"
        description="It may have been archived, deleted, or you may not have access to it."
        action={<Link href="/u/dashboard" className={buttonVariants()}>Back to dashboard</Link>}
      />
    </div>
  </PageContainer>
)

export default NotFound
