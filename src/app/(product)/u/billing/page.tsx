import BillingPageComp from "@/app/components/pagecomponents/BillingPageComp";
import {
  aiUsageBreakdown,
  currentPlan,
  invoices,
  plans,
  usage,
} from "@/lib/mock/organization";

export const metadata = { title: "Billing" };

/** ?state=failing shows the failed-payment state; ?state=empty shows a workspace without invoices */
const BillingPage = async ({ searchParams }: PageProps<"/u/billing">) => {
  const { state, tab } = await searchParams;
  return (
    <BillingPageComp
      plans={plans}
      current={{
        ...currentPlan,
        paymentStatus:
          state === "failing" ? "failing" : currentPlan.paymentStatus,
      }}
      usage={usage}
      aiBreakdown={aiUsageBreakdown}
      invoices={state === "empty" ? [] : invoices}
      initialTab={tab as string | undefined}
    />
  );
};

export default BillingPage;
