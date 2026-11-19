import { notFound } from "next/navigation";
import AutomationBuilderComp from "@/app/components/pagecomponents/AutomationBuilderComp";
import { getAutomation, runsFor } from "@/lib/mock/automations";
import { currentUser } from "@/lib/mock/people";
import type { Automation } from "@/types";

export async function generateMetadata({
  params,
}: PageProps<"/u/automations/[automationId]">) {
  const { automationId } = await params;
  return {
    title:
      automationId === "new"
        ? "New automation"
        : (getAutomation(automationId)?.name ?? "Automation"),
  };
}

/** `/u/automations/new` opens an empty builder; any other id loads that workflow */
const AutomationPage = async ({
  params,
}: PageProps<"/u/automations/[automationId]">) => {
  const { automationId } = await params;
  if (automationId === "new") {
    const blank: Automation = {
      id: "new",
      name: "",
      description: "",
      active: false,
      triggerLabel: "",
      triggerType: "client",
      actionsSummary: [],
      createdBy: currentUser,
      successCount: 0,
      failureCount: 0,
      nodes: [],
      edges: [],
    };
    return <AutomationBuilderComp automation={blank} runs={[]} isNew />;
  }
  const automation = getAutomation(automationId);
  if (!automation) notFound();
  return (
    <AutomationBuilderComp
      automation={automation}
      runs={runsFor(automation.id)}
    />
  );
};

export default AutomationPage;
