# BizPilot — UI Developer Structure

A map of the BizPilot user interface: where things live, how they fit together, and what to know before changing or wiring them. The UI spec is `description.md` (it calls the product "OpsPilot"; the product name in code is **BizPilot**).

> The UI is complete enough to demo, but all data is mocked. Every screen reads typed fixtures from `src/lib/mock/*` and every action resolves locally with a toast. Section 9 explains how to swap in the backend.

---

## 1. Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19 | Async `params`/`searchParams` (`PageProps<'/route'>`). Run `npx next typegen` after adding routes so route types exist. |
| Styling | Tailwind CSS v4 | Tokens and custom utilities live in `src/app/globals.css`. Container queries (`@container`, `@xl:`, `@max-xl:`) are used for modules whose width varies. |
| Primitives | shadcn (`base-nova` style) on `@base-ui/react` | In `src/components/ui`. Triggers use the `render={<Button/>}` prop, not `asChild`. |
| Icons | `lucide-react` (v1 names, e.g. `UserGroup`, `BuildingComplex`) | One icon set only. |
| Theme | `next-themes` | `class` strategy, Light / Dark / System, no flash. |
| Motion | `motion` (`motion/react`) | Wrapped in `<MotionConfig reducedMotion="user">`. |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` | Pointer, touch and keyboard sensors. |
| Dates | `date-fns` | Helpers in `src/lib/date.ts`. |
| Charts | `recharts` via `src/components/ui/chart.tsx` | Reports only. **No charts on the Dashboard** (spec §12.1). |
| Workflow canvas | `@xyflow/react` (React Flow v12) | Automation builder; themed via `.bp-flow` CSS variables in `globals.css`. |
| Classes | `cn` package (clsx + tailwind-merge) | Re-exported from `@/lib/utils`. |

---

## 2. Routes

All authenticated pages live under `src/app/(product)/u/` and share the app shell.

| URL | Page component | Notes |
|---|---|---|
| `/u` | redirect | → `/u/dashboard` |
| `/u/dashboard` | `DashboardPageComp` | Customizable module grid |
| `/u/ai` | `AIAssistantComp` | `?q=` sends a prompt on load |
| `/u/clients` | `ClientsPageComp` | |
| `/u/clients/[clientId]` | `ClientWorkspaceComp` | `?tab=overview\|projects\|contacts\|tasks\|documents\|activity\|notes\|ai` |
| `/u/projects` | `ProjectsPageComp` | List / Board view |
| `/u/projects/[projectId]` | `ProjectWorkspaceComp` | `?tab=overview\|board\|tasks\|timeline\|documents\|team\|client\|activity\|ai` |
| `/u/tasks` | `TasksPageComp` | My / Team / All · List, Board, Calendar |
| `/u/documents` | `DocumentsPageComp` | List / Grid, processing strip, upload |
| `/u/documents/[documentId]` | `DocumentViewerComp` | Viewer + AI / Details / Versions; `#page-N` deep links |
| `/u/automations` | `AutomationsPageComp` | Workflow cards with on/off |
| `/u/automations/new`, `/u/automations/[automationId]` | `AutomationBuilderComp` | Builder (Workflow · Run history · Configuration) |
| `/u/reports` | `ReportsPageComp` | Charts allowed here; AI analysis panel |
| `/u/team` | `TeamPageComp` | Member drawer with work, activity, permissions |
| `/u/billing` | `BillingPageComp` | `?tab=overview\|usage\|invoices`; `?state=failing` shows payment failure |
| `/u/settings` | `SettingsPageComp` | `?tab=general\|profile\|team\|security\|notifications\|ai\|integrations\|data` |
| `/u/notifications` | `NotificationsPageComp` | Notification center |

Route-level files in `/u`: `layout.tsx` (shell, reads the sidebar cookie), `loading.tsx` (top progress bar + page skeleton), `error.tsx` (error state with retry + reference), `not-found.tsx`.

### Public, auth, onboarding, portal and admin routes

| URL | Component | Notes |
|---|---|---|
| `/` | `HomeSections` → `HomePage` (Hero, Command palette, BizPilot AI, Integrations, Requests, Stats, Privacy, Pricing, FAQ, Final CTA) | Nimble (gitnimble.com) clone. `(marketing)` layout wraps everything in `.mk` (light-only) with `MarketingHeader` + `MarketingFooter` + `RevealObserver` |
| `/pricing` | `PricingSections` | Monthly/annual, selectable plan, comparison table, FAQ |
| `/terms`, `/privacy`, `/security`, `/docs`, `/help` | `(marketing)/[slug]` | Lightweight info pages (replace copy) |
| `/login`, `/signup` | `LoginSection`, `SignupSection` | **Owner's original look — only subtle additions allowed** (validation, show/hide, strength meter, terms checkbox, links) |
| `/login/verifytoken`, `/signup/verifytoken` | `VerifyTokenPage` | `?email=`; countdown, resend after 30s, change email, auto-verify; "000000" demos an invalid code; signup → `/onboarding`, login → `/u/dashboard` |
| `/forgot-password`, `/reset-password` | `PasswordResetSection` | Request → "check inbox"; new password → success |
| `/onboarding` | `OnboardingComp` | Organization → Team → First client → Finish |
| `/portal/login` | `PortalLogin` | Invitation context; password or email link |
| `/portal`, `/portal/approvals`, `/portal/documents`, `/portal/profile`, `/portal/projects/[projectId]` | `PortalPages` in `PortalShell` + `PortalProvider` | Client-only scope; approvals shared across pages via `usePortal()` |
| `/admin`, `/admin/organizations`, `/admin/organizations/[orgId]`, `/admin/ai-quality` | `AdminPages` | `AppShell variant="admin"` (own nav, "Platform admin" marker, no New menu); gate server-side |

### Demo states

Pages accept `?state=` so every state can be shown without a backend:

| Value | Where | Shows |
|---|---|---|
| `loading` | dashboard, clients, projects | Skeletons + AI loader |
| `error` | dashboard (one module fails = partial failure), clients, projects | Error state with retry + reference |
| `empty` | dashboard, clients, projects, client & project workspaces, AI, tasks, documents, automations, team, billing, notifications | Every section's empty state |
| `failing` | billing | Failed-payment banner |

URL filters: `/u/clients?health=at-risk` or `?status=active` pre-applies filters (used by Reports drill-downs).

Other demo hooks: an AI prompt containing **"fail"** shows the generation-failed state (retry succeeds). Uploading a file with **"fail"** in its name shows a processing failure + retry.

---

## 3. Folder structure

```text
src/
├── app/
│   ├── globals.css              Design tokens, themes, glass/canvas utilities, keyframes
│   ├── layout.tsx               Fonts + <AppProviders>
│   ├── ui/fonts.ts              next/font declarations
│   └── (product)/u/…            Routes (see §2)
├── components/
│   ├── ui/                      shadcn/base-ui primitives (+ tabs.tsx, switch.tsx added)
│   ├── providers/AppProviders   Theme, motion, tooltip, toast providers
│   ├── shell/                   App shell (variants "app" | "admin"): sidebar, top bar, search, menus, quick create
│   ├── marketing/               Public site (Nimble-style): header/footer, home & pricing sections
│   │   ├── marketing.css        `.mk` scoped design system: Nimble tokens (`--mk-*`, Inter via `--font-inter`), light-only, resets in `:where()`; `mk-*` classes
│   │   ├── GitTree.tsx          Coloured background lines: orthogonal hero routes + scroll-drawn trunk/branches (clipPath reveal, head dots). Hooks: `data-tree="window|h1|lede|cta|micro|logo"`, `data-tree-feature` per section, `data-tree-end`. Hidden <800px; scroll parts hidden 800–1200px
│   │   ├── Mockups.tsx          Product mockups (Workspace, CommandPalette, AIWindow, Integrations, Requests) sized with `cqi` container units
│   │   └── RevealObserver.tsx   Adds `is-in` to `.mk [data-reveal]` on intersection
│   ├── portal/                  Client portal shell, approval context/drawer, sign in
│   ├── generalUIcomp/           Shared app-level building blocks (cards, chips, tables…)
│   ├── loaders/                 Spinner/skeletons, AI loader, step progress, route progress
│   ├── elements/
│   │   ├── dashboard/           Dashboard modules
│   │   ├── clients/             Client workspace pieces
│   │   ├── projects/            Project workspace pieces
│   │   ├── tasks/               Task table, board, detail drawer, menus
│   │   ├── documents/           Dropzone, upload queue, document rows/table
│   │   ├── board/               Generic Kanban (dnd-kit)
│   │   ├── ai/                  AI chat, blocks, citations, proposed actions, history
│   │   ├── create/              Create/edit drawers (client, project, task, upload, invite)
│   │   ├── automations/         React Flow canvas, node palette, run history
│   │   ├── reports/             Chart primitives (recharts) + chart/table toggle
│   │   ├── settings/            Settings sections
│   │   ├── team/                Workload bar
│   │   └── Logo*, Auth*, Login/SignupSection   (pre-existing)
│   └── pagecomponents/          One composition component per page
├── context/                     sidebar, breadcrumbs, quick-create contexts
├── lib/
│   ├── mock/                    Fixtures + lookup helpers (replace with API)
│   ├── date.ts                  Date formatting + relative labels
│   ├── hooks.ts                 useMediaQuery, useLocalStorage, useHydrated
│   ├── notify.ts                Toast helper with Undo
│   ├── useTabParam.ts           Tab state mirrored to ?tab=
│   └── constants.ts             Cookie names
└── types/index.ts               All domain types used by the UI
```

**Convention:** `app/**/page.tsx` files are server components that load data (mock today) and pass it as props to a `pagecomponents/*Comp` client component. Page components only compose; reusable sections live in `elements/` or `generalUIcomp/`.

---

## 4. Design system

### 4.1 Palette (`@theme` in `globals.css`, unchanged from the original)

`deep-sapphire #123A63`, `midnight-navy #081C33`, `primary-blue #2563A8`, `primary-gold #C9A45C`, `porcelain #F7F9FC`, `ink #172333`, `slate #637286`, `silver-slate #DCE3EC`, `emerald #16866A`, `amber #D28A24`, `crimson #C74747`.

### 4.2 Semantic tokens (themed; use these in components)

| Token / utility | Light | Dark | Use |
|---|---|---|---|
| `bg-background` | porcelain | `#061527` | Page canvas |
| `text-foreground` / `text-heading` | ink / midnight-navy | light slate / near-white | Body / headings |
| `bg-card`, `bg-popover` | white | navy surfaces | Solid surfaces |
| `text-muted-foreground`, `text-subtle` | slate tones | | Secondary / tertiary text |
| `primary` | primary-blue | lighter blue | Actions, active states |
| `success` `warning` `danger` `info` | emerald, amber, crimson, blue | brighter variants | Status (always with text/icon) |
| `ai` | primary-gold | lighter gold | **Reserved for AI** (mark, labels, recommendations) |
| `bg-sidebar` / `bg-topbar` | silver-slate tint | navy tint | Shell surfaces (top bar matches the sidebar) |

Use opacity modifiers for tints (e.g. `bg-danger/12 text-danger`). Avoid raw hex values and Tailwind palette colours (`red-400`, `gray-500`) in new code.

### 4.3 Surfaces (custom utilities)

| Utility | What it is | Use for |
|---|---|---|
| `app-canvas` | Porcelain/navy + faint blue/gold/sapphire colour fields | Shell background (gives glass something to blur) |
| `surface` | Solid card + subtle edge shadow | Dense content: tables, lists, forms |
| `glass` | Translucent + blur + inner highlight | KPI cards, floating toolbars, quick actions, context panels |
| `glass-strong` | Near-opaque glass | Menus, popovers, toasts, command search, bottom nav |
| `glass-ai` | Glass with blue tint + gold corner spark | AI surfaces only |
| `elev-1` … `elev-4`, `lift` | Elevation (see 4.3.1) | Add explicitly; materials carry no drop shadow |
| `dot-grid` | Miro-style dot canvas | Boards, AI context panel, dropzones |
| `tabular` | Noto Sans + tabular numerals | Numbers |
| `ai-text-shimmer` | Gold shimmer text | AI loader stage text |

Rule of thumb: glass is an accent. Dense data stays on `surface`. Never nest translucent panels.

#### 4.3.1 Elevation (shadows)

Materials (`surface`, `glass`, `glass-strong`, `glass-ai`) give only a hairline edge (+ glass highlight). Drop shadow comes from an explicit level, chosen by what the element *does*:

| Level | Class | Use for |
|---|---|---|
| 0 | none | In-page sections, tables, static cards, filter bars, KPI tiles at rest |
| 1 | `elev-1` | Items you can grab or open, at rest: Kanban cards, workflow nodes, calendar pills |
| 2 | `elev-2` / `hover:lift` | Hover on clickable cards; docked tools over content (AI composer, viewer toolbar, customize handles) |
| 3 | `elev-3` | Floats over content: menus, popovers, select, tooltips/chart tooltips, toasts, floating action bars, test-run panel, node toolbar |
| 4 | `elev-4` | Modal layer: drawers/side panels, dialogs, command search, drag overlays, overlaying sidebar |

Shadows compose with Tailwind rings (they write `--tw-shadow`), so `ring-*` focus/selection states work on any surface. Don't use Tailwind `shadow-*` sizes or coloured glows on app components; if something needs separation without elevation, use spacing or a hairline.

### 4.4 Typography roles

| Role | Font | Class |
|---|---|---|
| Body / UI | Open Sans | default (`font-sans`) |
| Headings, top bar | Montserrat | `font-heading` |
| Navigation | Work Sans | `font-nav` |
| Numbers / KPIs | Noto Sans | `tabular` or `font-num` |
| Keys, IDs | Geist Mono | `font-mono` |

### 4.5 Shape, spacing and motion

- `--radius: 0.5rem`; cards use `rounded-lg`, chips are the only pills.
- Borders only where they clarify; prefer `surface` shadow and spacing.
- Motion: micro 120–180 ms, overlays 180–260 ms, larger changes 250–400 ms. `prefers-reduced-motion` disables animations globally.
- Z-order: canvas → sticky content (10) → top bar (20) → sidebar (30) → floating bars (40) → overlays/toasts (50).

---

## 5. App shell (`components/shell`)

| Component | Responsibility |
|---|---|
| `AppShell` | Viewport-locked layout. Only `<main id="content">` scrolls; sidebar and top bar never move. Provides sidebar, breadcrumb and quick-create contexts; mounts `MobileNav` and `QuickCreateHost`. |
| `AppSidebar` | Logo, `OrgSwitcher`, grouped nav (`nav.ts`), profile footer. lg+: 16rem ↔ 4rem rail (persisted in `bp-sidebar` cookie, read server-side). md–lg: rail; expanding overlays content. <md: slide-out drawer. Tooltips + active indicator in rail mode. |
| `TopBar` | Back/forward, breadcrumbs (`PageCrumbs` overrides), search trigger, New menu, notifications, help (+ shortcuts dialog), user menu. Absolutely positioned over the scroll area (`--topbar-h`). |
| `CommandSearch` | Ctrl/⌘ K. Grouped results (Clients, People, Projects, Tasks, Documents, Notes, Activity), keyboard navigation, recent searches, no-results state. |
| `QuickCreate` | `QuickCreateMenu` (top bar) + `QuickCreateHost` (drawers). Open from anywhere: `useQuickCreate().openCreate("task", { projectId })`. |
| `NotificationsPopover` | Unread badge, category filter, mark read / all, link to notification centre. |
| `UserMenu` + `ThemeSwitcher` | Profile actions; Light / Dark / System. |
| `MobileNav` | Bottom bar (Dashboard, Clients, Projects, AI, More). |
| `nav.ts` | Single source of navigation items and groups for both variants (`navGroups`, `adminNavGroups`, `shellNav(variant)`). |
| `context/shellContext` | `ShellVariantProvider` / `useShellNav()` — sidebar, top bar breadcrumbs and mobile nav read their nav from here. |

---

## 6. Shared components (`components/generalUIcomp`)

| Component | Purpose |
|---|---|
| `PageHeader`, `CountBadge`, `PageContainer` | Page title row, count, standard padding/width |
| `SectionCard` | Module container (`solid` / `glass` / `ai` variants; icon, description, link, actions, footer) |
| `MetricCard` | KPI tile (value, delta, trend, tone, optional drill-down) — no charts |
| `Chips` | `Chip` + `HealthChip`, `PriorityChip`, `PriorityBars`, `TaskStatusChip`, `ProjectStatusChip`, `ClientStatusChip`, `DocumentStatusChip`, `ExternalBadge` |
| `UserAvatar`, `AvatarStack`, `PersonLabel` | People. External collaborators get a gold ring + label. |
| `ClientLogo` | Tinted initials tile per client tone |
| `ProgressBar`, `UsageMeter` | Progress / consumed-vs-limit |
| `DataTable` | Sortable, selectable, paginated table with hover actions, column visibility, responsive column hiding and a compact mobile list |
| `FilterToolbar` + `applyFilters` | Glass filter bar in the page flow (not sticky) with animated active-filter chips; search is optional |
| `FloatingBar`, `BulkActionBar` | Floating glass action pill (bulk actions, customize mode) |
| `SidePanel`, `PanelSection`, `Field` | Right drawer with sticky header/footer (full-screen on mobile) and form layout |
| `LoadingButton`, `useSubmit` | Width-preserving loading button; placeholder async submit |
| `States` | `EmptyState`, `ErrorState` (data-safe note, retry, reference), `NoResults`, `PermissionDenied` |
| `ActivityFeed` | The one activity/timeline component (list or timeline rail, AI actor, built-in empty state) |
| `Kbd` | Keyboard hint |
| `CardNavLink` | "Section >" link (pre-existing; now a styled link, not a button inside a link) |

---

## 7. Loaders (`components/loaders`)

| Loader | When |
|---|---|
| `Spinner`, `SkeletonCard`, `SkeletonRows`, `SkeletonMetricRow`, `PageSkeleton` | Ordinary data/UI loading |
| `AILoader` (+ `StreamingCaret`) | **Only** for AI work: pulsing AI mark, rotating stage text, shimmer lines. `bare` hides the mark when the surrounding UI already shows it. |
| `StepProgress` | Document processing (`kind="document"`) and automation runs (`kind="automation"`): ✓ done · • active · ○ pending · ✕ failed |
| `RouteProgress` | Thin top bar during route transitions (`loading.tsx`) |

---

## 8. Feature modules

### Dashboard (`elements/dashboard`, `DashboardPageComp`)
Header (greeting, summary, date range, refresh, customize) → `DashboardGrid` of modules: KPI row, Quick actions, Needs attention, AI business brief (`DashAIInsights`), Project health, Today's work, Upcoming deadlines, Recent client activity (grouped by client company, collapsible), Team activity, Recent documents, Automations. Customize mode: drag to reorder (mouse or keyboard), hide/show, reset; stored per user in `localStorage` (`bp.dashboard.layout.<userId>`). Module rows use container queries, so they fit any column.

### Clients
`ClientsPageComp` (filters, columns, bulk actions, add/edit drawer) and `ClientWorkspaceComp` (header, KPI strip, 8 tabs). Notes are internal-only and styled distinctly (amber + lock).

### Projects
`ProjectsPageComp` (List / Board), `ProjectWorkspaceComp` (header with facts strip, 9 tabs). `TaskBoard` (Kanban on a dot grid, colour-edged cards, dependency rule blocks moving to Done, undo toast), `TaskTable`, `ProjectTimeline` (Gantt, milestones, today line, delayed hatching, drag or arrow-key due-date changes), `ProjectTeam` (internal vs external), `ClientVisiblePreview`.

### Tasks
`TaskDetailPanel` (properties, AI quick actions, attachments, comments, activity), `TaskMenus` (status / reassign submenus), `CompleteToggle`.

### Kanban (`elements/board/KanbanBoard`)
Generic over item type. Live cross-column preview, muted source card, valid-column highlight, invalid-drop reason, drop flash, undo toast, screen-reader announcements. Keyboard: focus a card → Space → arrows → Space.

### AI (`elements/ai`)
| Piece | Role |
|---|---|
| `useAIConversation` | Message state: thinking → streaming → done / error / stopped; retry keeps the prompt; stop. **Swap `mockRespond` for your endpoint here.** |
| `AIChat` | Message stream, empty state with suggestions, composer (Enter / Shift+Enter, stop, attach, context chip) |
| `AIBlocks` | Structured answers: paragraph, **Found in your data** (facts), **Recommended next step** (suggestions), status cards, table, proposed action. Inline `[n]` citations link to records. |
| `ProposedActionCard` | Pending → Approved (executed) / Dismissed; Review opens an editable drawer. Nothing runs without approval. |
| `AIQuickActions` | Contextual AI buttons with inline results (task panel, project overview) |
| `ScopedAIChat` | AI tab inside client/project workspaces with inherited context |
| `ConversationHistory`, `AIContextPanel` | AI Assistant side columns (become drawers below lg/xl) |
| `AIMark`, `AIGeneratedLabel` | AI identity marks |

### Tasks (page)
`TasksPageComp` scopes My / Team / All, shares filters across `TaskTable`, `TaskBoard` and `TaskCalendar` (month grid → agenda list on mobile). Edits from a filtered view merge back into the full list.

### Documents
`DocumentsPageComp` (filters, list/grid, persistent processing strip with `StepProgress`, empty state with inline dropzone). `DocumentViewerComp`: `DocumentPreview` (page nav, zoom, find-in-document with highlights, fullscreen, download; pages have `id="page-N"`), `DocumentAIPanel` (quick actions + ask box; answers cite `#page-N`), details with processing steps + activity, version history with open/compare.

### Automations
`WorkflowCanvas` (React Flow): custom `StepNode` coloured by kind (trigger/condition/action/AI), hover `NodeToolbar` (configure / duplicate / delete), connection validation (no edges into triggers, no self-loops, duplicates or cycles; handles turn green/red while connecting), dot-grid background, controls, minimap. `NodePalette` supports drag-in and click/Enter. `AutomationBuilderComp` adds the configure drawer, an animated **test run** (nodes light up in execution order + step panel), active toggle with undo, run history (`RunHistory` + run drawer with retry) and configuration (retry policy, approval, danger zone).

### Reports
`elements/reports/Charts.tsx`: `TrendChart` (area + 2px line, crosshair tooltip), `RankedBars` (sorted horizontal bars, value at tip, click to drill down, optional reference line), `ColumnChart` (1–n series, legend for ≥2), `ChartFrame` (Chart / Table toggle). Series colours are `--chart-1…4`, validated with the dataviz validator against the card surface in both themes: light `#2563A8 #eb6834 #169f6e #6250d6`, dark `#3987e5 #d95926 #199e70 #9085e9`. Use them in that order; never status colours or AI gold for series. Stat tiles drill down to filtered lists. "Analyze this report with AI" opens an AI side panel.

### Team, Billing, Settings, Notifications
`TeamPageComp` (KPIs, workload meter, role changes with undo, member drawer: projects, work, activity, permissions). `BillingPageComp` (plan card, plan switcher monthly/annual, cancel/resume with confirmation, usage meters with explanations — no charts, invoices). `SettingsPageComp` + `SettingsSections` (organization + appearance previews, profile, permission matrix, password/2FA/sessions/security events, notification matrix + digest, AI preferences/usage/knowledge, integrations connect/reconnect/disconnect, export/import/retention/danger zone with type-to-confirm). `NotificationsPageComp` (category tabs with unread counts, unread-only, mark read/unread, mark all with undo).

### Create flows (`elements/create`)
`ClientFormDrawer` (also edit), `ProjectFormDrawer` (team, client collaboration + permissions), `TaskFormDrawer`, `UploadDocumentDrawer` (`UploadDropzone` + `UploadQueue` with processing stages), `InviteMemberDrawer` (role + permission summary). Inline validation on blur/submit.

---

## 9. Data & backend handoff

- **Types:** `src/types/index.ts` — `Client`, `Contact`, `Project`, `Milestone`, `Task`, `DocumentItem`, `ActivityItem` (with `clientId` for grouping), `AttentionItem`, `Deadline`, `Kpi`, `AutomationSummary`, `NotificationItem`, `Person` (`external` marks client-side people), AI types (`AIMessage`, `AIBlock`, `AICitation`, `AIProposedAction`, `AIScope`, `AIConversation`).
- **Fixtures:** `lib/mock/people.ts`, `workspace.ts` (+ lookup helpers such as `getClient`, `tasksForProject`), `activity.ts`, `ai.ts` (`mockRespond`, suggestions, brief), `search.ts` (`searchAll`), `documents.ts` (pages, versions), `automations.ts` (workflows, runs, node library), `organization.ts` (team, roles/permissions, plans, usage, invoices, integrations, sessions), `reports.ts` (report series).
- **Pass 3 fixtures:** `marketing.ts` (capabilities, workflow, comparison rows, FAQs), `portal.ts` (viewer, deliverables, client-visible activity, messages), `admin.ts` (orgs, platform KPIs, MRR/AI series, ops health, failed jobs, AI generations).
- **More types:** `Automation`, `AutomationNode`, `AutomationEdge`, `AutomationRun`, `TeamMember`, `Role`, `Plan`, `Invoice`, `UsageMeterData`, `Integration`, `Session`, `DocumentPage`, `DocumentVersion`.
- **Where to swap:**
  1. `app/**/page.tsx` — replace mock imports with fetches; keep the prop shapes.
  2. `useSubmit` (`generalUIcomp/LoadingButton.tsx`) — form saves.
  3. `useUploadQueue` (`elements/documents/UploadQueue.tsx`) — upload progress + processing status.
  4. `useAIConversation` (`elements/ai/useAIConversation.ts`) — AI streaming.
  5. `searchAll` (`lib/mock/search.ts`) — global search.
  6. `notify(...)` calls — keep them; call your mutation first and use `onUndo` to revert.
- **Client state that should move server-side later:** dashboard layout (`localStorage`), sidebar preference (cookie), notification read state.

---

## 10. Patterns to follow

1. Check `generalUIcomp/` and `elements/` before creating a component.
2. Use semantic tokens and opacity modifiers; add new tokens to `globals.css` for both themes.
3. Every list or section needs a loading, empty and error state (`EmptyState compact` inside modules).
4. Reversible actions → toast with `onUndo`. Irreversible → `AlertDialog` confirmation.
5. AI output is always labelled (`AIGeneratedLabel`), distinguishes facts from recommendations, cites sources, and never executes without approval.
6. Use `SidePanel` for contextual work and `Dialog`/`AlertDialog` for interruptions.
7. Status is never colour-only: chips carry text and/or an icon.
8. Server pages must not pass functions/components to client components (e.g. pass `icon` only from client files).
9. Accessibility: visible focus rings, labelled icon buttons, keyboard alternatives for drag, `aria-current` on nav, dialogs trap focus (base-ui).

---

## 11. Build status

| Area | Status |
|---|---|
| Shell, design system, loaders, create drawers | Done |
| Dashboard, Clients, Projects, AI Assistant | Done |
| Tasks, Documents (+ viewer), Automations (+ builder), Reports, Team, Billing & Usage, Settings, Notifications | Done |
| Public site, Pricing, Auth additions (verify, reset), Onboarding, Client portal, Platform admin | Done |

Checks: `npx tsc --noEmit`, `npm run lint` (remaining warnings/errors are in pre-existing auth files and shadcn's `carousel.tsx`).
