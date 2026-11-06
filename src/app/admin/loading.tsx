import { PageContainer } from '@/components/generalUIcomp/PageHeader'
import { PageSkeleton, RouteProgress } from '@/components/loaders/Loaders'

/** Route-level loading: subtle top progress + page skeleton (§6.5) */
const Loading = () => (
  <>
    <RouteProgress />
    <PageContainer>
      <PageSkeleton />
    </PageContainer>
  </>
)

export default Loading
