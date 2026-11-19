"use client";

import { PageContainer } from "@/app/components/generalUIcomp/PageHeader";
import { ErrorState } from "@/app/components/generalUIcomp/States";

const AppError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <PageContainer>
    <div className="surface rounded-lg">
      <ErrorState
        title="This page couldn't be loaded"
        description="Something went wrong on our side. Try again, or contact support with the reference below."
        reference={error.digest ?? "ERR-UNKNOWN"}
        onRetry={reset}
      />
    </div>
  </PageContainer>
);

export default AppError;
