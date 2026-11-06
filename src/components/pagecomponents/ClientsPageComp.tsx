"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  Columns3,
  Download,
  Ellipsis,
  FolderPlus,
  PencilLine,
  Plus,
  SquareArrowOutUpRight,
  UserGroup,
  UserRoundCog,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountBadge, PageContainer, PageHeader } from "@/components/generalUIcomp/PageHeader";
import { FilterToolbar, applyFilters, type FilterValues } from "@/components/generalUIcomp/FilterToolbar";
import { DataTable, type Column } from "@/components/generalUIcomp/DataTable";
import { BulkActionBar } from "@/components/generalUIcomp/FloatingBar";
import { ClientStatusChip, HealthChip } from "@/components/generalUIcomp/Chips";
import { ClientLogo } from "@/components/generalUIcomp/ClientLogo";
import { PersonLabel } from "@/components/generalUIcomp/UserAvatar";
import { EmptyState, ErrorState, NoResults } from "@/components/generalUIcomp/States";
import { SkeletonRows } from "@/components/loaders/Loaders";
import { ClientFormDrawer } from "@/components/elements/create/ClientFormDrawer";
import { useQuickCreate } from "@/context/quickCreateContext";
import { timeAgo } from "@/lib/date";
import { notify } from "@/lib/notify";
import type { Client } from "@/types";
import type { DemoState } from "./DashboardPageComp";

type Props = { clients: Client[]; demo?: DemoState | "empty"; initialFilters?: FilterValues };

const lastActivityBucket = (iso: string) => {
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return days < 1 ? "24h" : days < 7 ? "7d" : "older";
};

/** Clients list (§14.1) */
const ClientsPageComp = ({ clients: initial, demo, initialFilters = {} }: Props) => {
  const { openCreate } = useQuickCreate();
  const router = useRouter();
  const [clients, setClients] = useState(demo === "empty" ? [] : initial);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hiddenCols, setHiddenCols] = useState<string[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);

  const managers = Array.from(new Map(initial.map((c) => [c.accountManager.id, c.accountManager])).values());
  const industries = Array.from(new Set(initial.map((c) => c.industry)));

  const filterDefs = [
    { id: "status", label: "Status", options: [{ value: "active", label: "Active" }, { value: "onboarding", label: "Onboarding" }, { value: "paused", label: "Paused" }, { value: "inactive", label: "Inactive" }] },
    { id: "manager", label: "Account manager", options: managers.map((m) => ({ value: m.id, label: m.name })) },
    { id: "industry", label: "Industry", options: industries.map((i) => ({ value: i, label: i })) },
    { id: "health", label: "Health", options: [{ value: "on-track", label: "On track" }, { value: "at-risk", label: "At risk" }, { value: "off-track", label: "Off track" }] },
    { id: "activity", label: "Last activity", options: [{ value: "24h", label: "Past 24 hours" }, { value: "7d", label: "Past 7 days" }, { value: "older", label: "Older than 7 days" }] },
  ];

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return applyFilters(
      clients.filter((c) => !q || `${c.name} ${c.primaryContact.name} ${c.industry}`.toLowerCase().includes(q)),
      filters,
      {
        status: (c) => c.status,
        manager: (c) => c.accountManager.id,
        industry: (c) => c.industry,
        health: (c) => c.health,
        activity: (c) => lastActivityBucket(c.lastActivity),
      },
    );
  }, [clients, search, filters]);

  const columns: Column<Client>[] = [
    {
      id: "client",
      header: "Client",
      sortValue: (c) => c.name,
      cell: (c) => (
        <Link href={`/u/clients/${c.id}`} className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
          <ClientLogo client={c} />
          <span className="min-w-0">
            <span className="block truncate font-medium text-heading hover:text-primary">{c.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{c.industry} · {c.website}</span>
          </span>
        </Link>
      ),
    },
    { id: "contact", header: "Primary contact", hideBelow: "xl", cell: (c) => <span className="block"><span className="block text-sm">{c.primaryContact.name}</span><span className="block text-xs text-muted-foreground">{c.primaryContact.title}</span></span> },
    { id: "manager", header: "Account manager", hideBelow: "2xl", sortValue: (c) => c.accountManager.name, cell: (c) => <PersonLabel person={c.accountManager} /> },
    { id: "projects", header: "Active projects", align: "right", sortValue: (c) => c.activeProjects, cell: (c) => <span className="tabular">{c.activeProjects}</span> },
    { id: "tasks", header: "Open tasks", align: "right", hideBelow: "lg", sortValue: (c) => c.openTasks, cell: (c) => <span className="tabular">{c.openTasks}</span> },
    { id: "activity", header: "Last activity", sortValue: (c) => -new Date(c.lastActivity).getTime(), cell: (c) => <span className="text-xs text-muted-foreground">{timeAgo(c.lastActivity)}</span> },
    { id: "health", header: "Relationship", sortValue: (c) => c.health, cell: (c) => <HealthChip health={c.health} /> },
    { id: "status", header: "Status", hideBelow: "md", sortValue: (c) => c.status, cell: (c) => <ClientStatusChip status={c.status} /> },
  ];

  const archiveSelected = () => {
    const prev = clients;
    const n = selected.size;
    setClients((l) => l.map((c) => (selected.has(c.id) ? { ...c, status: "inactive" } : c)));
    setSelected(new Set());
    notify.success(`${n} client${n > 1 ? "s" : ""} marked inactive`, { onUndo: () => setClients(prev) });
  };

  const body = () => {
    if (demo === "loading") return <div className="surface rounded-lg"><SkeletonRows rows={8} /></div>;
    if (demo === "error") return <div className="surface rounded-lg"><ErrorState onRetry={() => router.replace("/u/clients")} reference="ERR-CLI-500" /></div>;
    if (clients.length === 0)
      return (
        <div className="surface rounded-lg">
          <EmptyState
            icon={UserGroup}
            title="No clients yet"
            description="Add your first client to start organizing projects and work."
            action={<Button onClick={() => openCreate("client")}><Plus /> Add client</Button>}
            secondaryAction={<Button variant="ghost" onClick={() => notify.info("Import from CSV")}>Import CSV</Button>}
          />
        </div>
      );
    return (
      <DataTable
        ariaLabel="Clients"
        rows={rows}
        columns={columns}
        getRowId={(c) => c.id}
        hiddenColumns={hiddenCols}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        rowHref={(c) => `/u/clients/${c.id}`}
        empty={<div className="surface rounded-lg"><NoResults query={search} onClear={() => { setSearch(""); setFilters({}); }} /></div>}
        rowActions={(c) => (
          <>
            <Link href={`/u/clients/${c.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label={`Open ${c.name}`}><SquareArrowOutUpRight /></Link>
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}><PencilLine /></Button>
            <Button variant="ghost" size="icon-sm" onClick={() => openCreate("project", { clientId: c.id })} aria-label={`Create project for ${c.name}`}><FolderPlus /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="More"><Ellipsis /></Button>} />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => openCreate("document", { clientId: c.id })}>Upload document</DropdownMenuItem>
                <DropdownMenuItem onClick={() => notify.info("Invite sent flow")}>Invite client contact</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => { setSelected(new Set([c.id])); }}>Mark inactive…</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        mobileItem={(c) => (
          <div className="flex items-center gap-3">
            <ClientLogo client={c} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-heading">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">{c.activeProjects} active projects · {timeAgo(c.lastActivity)}</p>
            </div>
            <HealthChip health={c.health} />
          </div>
        )}
      />
    );
  };

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Clients"
        titleAddon={<CountBadge>{clients.length}</CountBadge>}
        description="Every organization you do work for, with relationship health at a glance."
        actions={
          <>
            <Button variant="outline" onClick={() => notify.success("Export started", { description: "You'll get a CSV by email." })}>
              <Download /> Export
            </Button>
            <Button onClick={() => openCreate("client")}><Plus /> Add client</Button>
          </>
        }
      />

      {clients.length > 0 && (
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search clients or contacts…"
          filters={filterDefs}
          values={filters}
          onValuesChange={setFilters}
          right={
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"><Columns3 /> Columns</Button>} />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                  {columns.filter((c) => c.id !== "client").map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.id}
                      checked={!hiddenCols.includes(c.id)}
                      onCheckedChange={() => setHiddenCols((h) => (h.includes(c.id) ? h.filter((x) => x !== c.id) : [...h, c.id]))}
                    >
                      {c.header}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      )}

      {body()}

      <BulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
        <Button variant="ghost" size="sm" onClick={() => notify.info("Choose an account manager")}><UserRoundCog /> Assign manager</Button>
        <Button variant="ghost" size="sm" onClick={() => notify.success("Export started")}><Download /> Export</Button>
        <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={archiveSelected}><Archive /> Mark inactive</Button>
      </BulkActionBar>

      {editing && <ClientFormDrawer key={editing.id} open={!!editing} onOpenChange={(o) => !o && setEditing(null)} client={editing} />}
    </PageContainer>
  );
};

export default ClientsPageComp;
