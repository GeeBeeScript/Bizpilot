"use client";

import Link from "next/link";
import { ChevronDown, ListClock, MessagesSquare } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTriggerIconRemoved } from "@/components/ui/accordion";
import { SectionCard } from "@/components/generalUIcomp/SectionCard";
import { ActivityFeed } from "@/components/generalUIcomp/ActivityFeed";
import { ClientLogo } from "@/components/generalUIcomp/ClientLogo";
import { AvatarStack } from "@/components/generalUIcomp/UserAvatar";
import { EmptyState } from "@/components/generalUIcomp/States";
import { timeAgo } from "@/lib/date";
import type { ActivityItem, Client, Person } from "@/types";

export type ClientRef = Pick<Client, "id" | "name" | "initials" | "tone">;

type Group = { client: ClientRef; items: ActivityItem[]; people: Person[]; latest: string };

/** Group activity by client organization, most recently active first */
export function groupByClient(items: ActivityItem[], clients: ClientRef[]): Group[] {
  const map = new Map<string, ActivityItem[]>();
  for (const a of items) {
    const key = a.clientId ?? "other";
    map.set(key, [...(map.get(key) ?? []), a]);
  }
  return Array.from(map.entries())
    .map(([id, list]) => {
      const sorted = [...list].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
      const client = clients.find((c) => c.id === id) ?? { id, name: "Other activity", initials: "··", tone: "blue" as const };
      const people = Array.from(new Map(sorted.flatMap((a) => (a.actor ? [[a.actor.id, a.actor] as const] : []))).values());
      return { client, items: sorted, people, latest: sorted[0].timestamp };
    })
    .sort((a, b) => +new Date(b.latest) - +new Date(a.latest));
}

/** Recent client activity (§12.7), grouped per client company; each company collapses */
const DashClientActivity = ({ items, clients }: { items: ActivityItem[]; clients: ClientRef[] }) => {
  const groups = groupByClient(items, clients);

  return (
    <SectionCard title="Recent Client Activity" icon={ListClock} link={{ href: "/u/clients", label: "Clients" }} className="h-full" bodyClassName="px-3 pb-3">
      {groups.length === 0 ? (
        <EmptyState compact icon={MessagesSquare} title="No client activity yet" description="Uploads, approvals and comments from client contacts will appear here." />
      ) : (
        <Accordion multiple defaultValue={groups.slice(0, 2).map((g) => g.client.id)} className="max-h-[26rem] gap-2 overflow-y-auto scrollbar-thin">
          {groups.map((g) => {
            const first = g.people[0];
            return (
              <AccordionItem key={g.client.id} value={g.client.id} className="shrink-0 overflow-hidden rounded-lg bg-muted/35 ring-1 ring-border/70 not-last:border-b-0">
                <AccordionTriggerIconRemoved className="items-center gap-3 rounded-none px-3 py-2.5 hover:bg-muted/50 hover:no-underline">
                  <ClientLogo client={g.client} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-heading">{g.client.name}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {first ? (
                        <>
                          {first.name}
                          {g.people.length > 1 && <> &amp; {g.people.length - 1} other{g.people.length > 2 ? "s" : ""}</>}
                        </>
                      ) : (
                        "BizPilot AI"
                      )}{" "}
                      · {g.items.length} update{g.items.length > 1 ? "s" : ""} · {timeAgo(g.latest)}
                    </span>
                  </span>
                  {g.people.length > 0 && <AvatarStack people={g.people} max={3} />}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-180" aria-hidden />
                </AccordionTriggerIconRemoved>
                <AccordionContent className="border-t border-border/70 bg-card/60 px-1 pt-1 pb-1 [&_a]:no-underline">
                  <ActivityFeed items={g.items} variant="timeline" />
                  <Link href={`/u/clients/${g.client.id}?tab=activity`} className="block px-2 pt-1 pb-1.5 text-xs text-primary hover:underline!">
                    View all {g.client.name} activity
                  </Link>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </SectionCard>
  );
};

export default DashClientActivity;
