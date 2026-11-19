import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/app/components/ui/button";
import { PageContainer } from "@/app/components/generalUIcomp/PageHeader";
import { EmptyState } from "@/app/components/generalUIcomp/States";

const NotFound = () => (
  <PageContainer>
    <div className="surface rounded-lg">
      <EmptyState
        icon={SearchX}
        title="We couldn't find that"
        description="It may have been archived, deleted, or you may not have access to it."
        action={
          <Link href="/admin" className={buttonVariants()}>
            Back to overview
          </Link>
        }
      />
    </div>
  </PageContainer>
);

export default NotFound;
