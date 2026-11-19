"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ClipboardCheck,
  Ellipsis,
  FolderOpen,
  Mail,
  Minus,
  RotateCw,
  ShieldCheck,
  UserPlus,
  UsersRound,
  UserX,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  CountBadge,
  PageContainer,
  PageHeader,
} from "@/app/components/generalUIcomp/PageHeader";
import {
  FilterToolbar,
  applyFilters,
  type FilterValues,
} from "@/app/components/generalUIcomp/FilterToolbar";
import {
  DataTable,
  type Column,
} from "@/app/components/generalUIcomp/DataTable";
import { Chip, type Tone } from "@/app/components/generalUIcomp/Chips";
import {
  PersonLabel,
  UserAvatar,
} from "@/app/components/generalUIcomp/UserAvatar";
import { MetricCard } from "@/app/components/generalUIcomp/MetricCard";
import { EmptyState, NoResults } from "@/app/components/generalUIcomp/States";
import { SidePanel } from "@/app/components/generalUIcomp/SidePanel";
import { ActivityFeed } from "@/app/components/generalUIcomp/ActivityFeed";
import { ProjectHealthRow } from "@/app/components/elements/dashboard/ProjectHealthSection";
import { WorkloadBar } from "@/app/components/elements/team/WorkloadBar";
import { useQuickCreate } from "@/context/quickCreateContext";
import { dueLabel, isOverdue, timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { ActivityItem, Project, Role, Task, TeamMember } from "@/types";
import type { DemoState } from "./DashboardPageComp";

export const roleMeta: Record<Role, { label: string; tone: Tone }> = {
  owner: { label: "Owner", tone: "ai" },
  admin: { label: "Admin", tone: "sapphire" },
  manager: { label: "Manager", tone: "info" },
  employee: { label: "Employee", tone: "neutral" },
};
const statusMeta: Record<TeamMember["status"], { label: string; tone: Tone }> =
  {
    active: { label: "Active", tone: "success" },
    invited: { label: "Invitation sent", tone: "warning" },
    deactivated: { label: "Deactivated", tone: "neutral" },
  };

type PermRow = {
  feature: string;
  owner: boolean;
  admin: boolean;
  manager: boolean;
  employee: boolean | "own";
  note?: string;
};

type Props = {
  members: TeamMember[];
  projects: Project[];
  tasks: Task[];
  activity: ActivityItem[];
  permissions: PermRow[];
  demo?: DemoState;
};

/** Team list + member detail (§20) */
const TeamPageComp = ({
  members: initial,
  projects,
  tasks,
  activity,
  permissions,
  demo,
}: Props) => {
  const { openCreate } = useQuickCreate();
  const [members, setMembers] = useState(
    demo === "empty" ? initial.slice(0, 1) : initial,
  );
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [open, setOpen] = useState<TeamMember | null>(null);

  const rows = useMemo(
    () =>
      applyFilters(
        members.filter(
          (m) =>
            !search ||
            `${m.name} ${m.email}`.toLowerCase().includes(search.toLowerCase()),
        ),
        filters,
        {
          role: (m) => m.memberRole,
          status: (m) => m.status,
          load: (m) =>
            m.workload > 100 ? "over" : m.workload >= 85 ? "busy" : "available",
        },
      ),
    [members, search, filters],
  );

  const update = (m: TeamMember, patch: Partial<TeamMember>, msg: string) => {
    const prev = members;
    setMembers((l) => l.map((x) => (x.id === m.id ? { ...x, ...patch } : x)));
    notify.success(msg, { onUndo: () => setMembers(prev) });
  };

  const columns: Column<TeamMember>[] = [
    {
      id: "name",
      header: "Name",
      sortValue: (m) => m.name,
      cell: (m) => <PersonLabel person={m} subtitle={m.email} />,
    },
    {
      id: "role",
      header: "Role",
      sortValue: (m) => m.memberRole,
      cell: (m) => (
        <Chip tone={roleMeta[m.memberRole].tone}>
          {roleMeta[m.memberRole].label}
        </Chip>
      ),
    },
    {
      id: "status",
      header: "Status",
      hideBelow: "md",
      sortValue: (m) => m.status,
      cell: (m) => (
        <Chip tone={statusMeta[m.status].tone} dot>
          {statusMeta[m.status].label}
        </Chip>
      ),
    },
    {
      id: "projects",
      header: "Active projects",
      align: "right",
      hideBelow: "lg",
      sortValue: (m) => m.activeProjects,
      cell: (m) => <span className="tabular">{m.activeProjects}</span>,
    },
    {
      id: "tasks",
      header: "Open tasks",
      align: "right",
      hideBelow: "lg",
      sortValue: (m) => m.openTasks,
      cell: (m) => (
        <span className="tabular">
          {m.openTasks}
          {m.overdueTasks > 0 && (
            <span className="text-danger"> · {m.overdueTasks} late</span>
          )}
        </span>
      ),
    },
    {
      id: "workload",
      header: "Workload",
      sortValue: (m) => m.workload,
      cell: (m) => <WorkloadBar value={m.workload} />,
    },
    {
      id: "last",
      header: "Last active",
      hideBelow: "xl",
      sortValue: (m) => -new Date(m.lastActive).getTime(),
      cell: (m) => (
        <span className="text-xs text-muted-foreground">
          {m.status === "invited" ? "—" : timeAgo(m.lastActive)}
        </span>
      ),
    },
  ];

  const over = members.filter((m) => m.workload > 100).length;
  const memberTasks = open
    ? tasks.filter((t) => t.assignee.id === open.id && t.status !== "done")
    : [];
  const memberProjects = open
    ? projects.filter((p) => p.team.some((x) => x.id === open.id))
    : [];

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Team"
        titleAddon={<CountBadge>{members.length}</CountBadge>}
        description="Who's on the team, what they're working on and how much capacity they have."
        actions={
          <Button onClick={() => openCreate("invite")}>
            <UserPlus /> Invite member
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Members"
          value={String(members.filter((m) => m.status === "active").length)}
          icon={UsersRound}
          tone="info"
        />
        <MetricCard
          label="Pending invitations"
          value={String(members.filter((m) => m.status === "invited").length)}
          icon={Mail}
          tone="warning"
        />
        <MetricCard
          label="Over capacity"
          value={String(over)}
          icon={ClipboardCheck}
          tone="danger"
          delta={over ? "Consider reassigning work" : "Everyone has room"}
          sentiment={over ? "negative" : "positive"}
        />
        <MetricCard
          label="Avg. workload"
          value={`${Math.round(members.reduce((s, m) => s + m.workload, 0) / Math.max(1, members.length))}%`}
          icon={FolderOpen}
          tone="success"
        />
      </div>

      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search people…"
        values={filters}
        onValuesChange={setFilters}
        filters={[
          {
            id: "role",
            label: "Role",
            options: (Object.keys(roleMeta) as Role[]).map((r) => ({
              value: r,
              label: roleMeta[r].label,
            })),
          },
          {
            id: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "invited", label: "Invited" },
              { value: "deactivated", label: "Deactivated" },
            ],
          },
          {
            id: "load",
            label: "Workload",
            options: [
              { value: "over", label: "Over capacity" },
              { value: "busy", label: "Busy" },
              { value: "available", label: "Available" },
            ],
          },
        ]}
      />

      {members.length <= 1 && demo === "empty" ? (
        <div className="surface rounded-lg">
          <EmptyState
            icon={UsersRound}
            title="It's just you so far"
            description="Invite teammates to assign work, share projects and collaborate with clients."
            action={
              <Button onClick={() => openCreate("invite")}>
                <UserPlus /> Invite member
              </Button>
            }
          />
        </div>
      ) : rows.length === 0 ? (
        <div className="surface rounded-lg">
          <NoResults
            query={search}
            onClear={() => {
              setSearch("");
              setFilters({});
            }}
          />
        </div>
      ) : (
        <DataTable
          ariaLabel="Team members"
          rows={rows}
          columns={columns}
          getRowId={(m) => m.id}
          onRowClick={setOpen}
          rowActions={(m) => (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${m.name}`}
                  >
                    <Ellipsis />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                {m.status === "invited" && (
                  <DropdownMenuItem
                    onClick={() =>
                      notify.success("Invitation resent", {
                        description: m.email,
                      })
                    }
                  >
                    <RotateCw /> Resend invitation
                  </DropdownMenuItem>
                )}
                {(["admin", "manager", "employee"] as Role[])
                  .filter((r) => r !== m.memberRole && m.memberRole !== "owner")
                  .map((r) => (
                    <DropdownMenuItem
                      key={r}
                      onClick={() =>
                        update(
                          m,
                          { memberRole: r },
                          `${m.name} is now ${roleMeta[r].label}`,
                        )
                      }
                    >
                      <ShieldCheck /> Make {roleMeta[r].label}
                    </DropdownMenuItem>
                  ))}
                {m.memberRole !== "owner" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        update(
                          m,
                          { status: "deactivated" },
                          `${m.name} deactivated`,
                        )
                      }
                    >
                      <UserX /> Deactivate
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          mobileItem={(m) => (
            <div className="flex items-center gap-3">
              <UserAvatar person={m} size="default" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-heading">
                  {m.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {roleMeta[m.memberRole].label} · {m.openTasks} open tasks
                </p>
              </div>
              <WorkloadBar value={m.workload} />
            </div>
          )}
        />
      )}

      {/* Member detail (§20.3) */}
      <SidePanel
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        size="lg"
        title={open?.name ?? ""}
        description={open ? `${open.role ?? ""} · ${open.email}` : undefined}
      >
        {open && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <UserAvatar person={open} size="lg" showStatus />
              <Chip tone={roleMeta[open.memberRole].tone}>
                {roleMeta[open.memberRole].label}
              </Chip>
              <Chip tone={statusMeta[open.status].tone} dot>
                {statusMeta[open.status].label}
              </Chip>
              <WorkloadBar value={open.workload} className="ml-auto" />
            </div>

            <section>
              <h3 className="mb-2 font-heading text-xs font-semibold tracking-wide text-heading uppercase">
                Assigned projects
              </h3>
              {memberProjects.length ? (
                <div className="overflow-hidden rounded-lg ring-1 ring-border">
                  {memberProjects.map((p) => (
                    <ProjectHealthRow key={p.id} project={p} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={FolderOpen}
                  title="No projects"
                  description="Projects this person is on will appear here."
                />
              )}
            </section>

            <section>
              <h3 className="mb-2 font-heading text-xs font-semibold tracking-wide text-heading uppercase">
                Open & upcoming work
              </h3>
              {memberTasks.length ? (
                <ul className="divide-y divide-border rounded-lg ring-1 ring-border">
                  {memberTasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-3 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate">{t.title}</span>
                      <span className="truncate text-xs text-muted-foreground max-sm:hidden">
                        {t.projectName}
                      </span>
                      <span
                        className={cn(
                          "tabular text-xs",
                          isOverdue(t.dueDate)
                            ? "font-medium text-danger"
                            : "text-muted-foreground",
                        )}
                      >
                        {dueLabel(t.dueDate)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  compact
                  icon={ClipboardCheck}
                  title="Nothing assigned"
                  description="Tasks assigned to this person will appear here."
                />
              )}
            </section>

            <section>
              <h3 className="mb-1 font-heading text-xs font-semibold tracking-wide text-heading uppercase">
                Recent activity
              </h3>
              <ActivityFeed
                items={activity.filter((a) => a.actor?.id === open.id)}
                emptyTitle="No recent activity"
                emptyDescription="Actions by this person will appear here."
              />
            </section>

            <section>
              <h3 className="mb-2 font-heading text-xs font-semibold tracking-wide text-heading uppercase">
                Permissions · {roleMeta[open.memberRole].label}
              </h3>
              <ul className="grid gap-1 sm:grid-cols-2">
                {permissions.map((p) => {
                  const v = p[open.memberRole];
                  return (
                    <li
                      key={p.feature}
                      className={cn(
                        "flex items-center gap-2 text-xs",
                        !v && "text-muted-foreground",
                      )}
                      title={p.note}
                    >
                      {v === true ? (
                        <Check className="size-3.5 text-success" />
                      ) : v === "own" ? (
                        <Check className="size-3.5 text-warning" />
                      ) : (
                        <Minus className="size-3.5 text-subtle" />
                      )}
                      {p.feature}
                      {v === "own" && (
                        <span className="text-muted-foreground">
                          (own work)
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}
      </SidePanel>
    </PageContainer>
  );
};

export default TeamPageComp;
