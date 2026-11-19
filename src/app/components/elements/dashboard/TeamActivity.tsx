import { UsersRound } from "lucide-react";
import { SectionCard } from "@/app/components/generalUIcomp/SectionCard";
import { ActivityFeed } from "@/app/components/generalUIcomp/ActivityFeed";
import type { ActivityItem } from "@/types";

/** Team activity (§12.8): completions, assignments, project updates */
const TeamActivity = ({ items }: { items: ActivityItem[] }) => (
  <SectionCard
    title="Team Activity"
    icon={UsersRound}
    link={{ href: "/u/team", label: "Team" }}
    className="h-full"
    bodyClassName="px-2 pb-2"
  >
    <div className="max-h-96 overflow-y-auto scrollbar-thin">
      <ActivityFeed
        items={items}
        variant="timeline"
        emptyTitle="No team activity yet"
        emptyDescription="Completed tasks, assignments and project updates from your team will appear here."
      />
    </div>
  </SectionCard>
);

export default TeamActivity;
