import { CalendarCheck, CalendarClock, Diamond } from "lucide-react";
import { EmptyState } from "@/app/components/generalUIcomp/States";
import { format } from "date-fns";
import { SectionCard } from "@/app/components/generalUIcomp/SectionCard";
import { Chip, type Tone } from "@/app/components/generalUIcomp/Chips";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import { dueLabel } from "@/lib/date";
import type { Deadline } from "@/types";

const statusTone: Record<Deadline["status"], { tone: Tone; label: string }> = {
  "on-track": { tone: "success", label: "On track" },
  "at-risk": { tone: "warning", label: "At risk" },
  late: { tone: "danger", label: "Late" },
};

/** Chronological deadlines list (§12.10) */
export const DeadlineList = ({ items }: { items: Deadline[] }) =>
  items.length === 0 ? (
    <EmptyState
      compact
      icon={CalendarCheck}
      title="No upcoming deadlines"
      description="Milestones and task due dates for the coming weeks will appear here."
    />
  ) : (
    <ol className="space-y-1">
      {items.map((d) => {
        const date = new Date(d.date);
        const s = statusTone[d.status];
        return (
          <li
            key={d.id}
            className="flex items-center gap-3 rounded-md px-1 py-1.5"
          >
            <span className="tabular grid w-11 shrink-0 place-items-center rounded-md bg-muted/70 py-1 leading-none">
              <span className="text-[0.6rem] font-semibold text-muted-foreground uppercase">
                {format(date, "MMM")}
              </span>
              <span className="text-base font-semibold text-heading">
                {format(date, "d")}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-sm text-heading">
                {d.kind === "milestone" && (
                  <Diamond
                    className="size-3 shrink-0 fill-ai text-ai"
                    aria-label="Milestone"
                  />
                )}
                <span className="truncate">{d.item}</span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {d.clientName} · {d.projectName} · {dueLabel(d.date)}
              </p>
            </div>
            <UserAvatar person={d.owner} />
            <Chip tone={s.tone} dot className="max-sm:hidden">
              {s.label}
            </Chip>
          </li>
        );
      })}
    </ol>
  );

const UpcomingDeadlines = ({ items }: { items: Deadline[] }) => (
  <SectionCard
    title="Upcoming Deadlines"
    icon={CalendarClock}
    className="h-full"
    bodyClassName="px-3"
  >
    <DeadlineList items={items} />
  </SectionCard>
);

export default UpcomingDeadlines;
