import { PageContainer } from "@/app/components/generalUIcomp/PageHeader";
import { PageSkeleton, RouteProgress } from "@/app/components/loaders/Loaders";

/** Route-level loading: subtle top progress + page skeleton (§6.5) */
const Loading = () => (
  <>
    <RouteProgress />
    <PageContainer>
      <PageSkeleton />
    </PageContainer>
  </>
);

export default Loading;
