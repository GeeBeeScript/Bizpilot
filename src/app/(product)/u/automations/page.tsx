import AutomationsPageComp from "@/app/components/pagecomponents/AutomationsPageComp";
import type { DemoState } from "@/app/components/pagecomponents/DashboardPageComp";
import { automationRuns, automations } from "@/lib/mock/automations";

export const metadata = { title: "Automations" };

const AutomationsPage = async ({
  searchParams,
}: PageProps<"/u/automations">) => {
  const { state } = await searchParams;
  return (
    <AutomationsPageComp
      automations={automations}
      runs={automationRuns}
      demo={state as DemoState}
    />
  );
};

export default AutomationsPage;
