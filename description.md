# OpsPilot — UI Description & Product Interface Specification

> ## Owner's standing instructions (read first — these override anything below that conflicts)
>
> These were given by the project owner during implementation and apply to every future pass.
>
> 1. **UI only.** Build the interface; the owner implements the backend. Use typed mock data (`src/types`, `src/lib/mock/*`) passed as props so it can be swapped for real data.
> 2. **Product name in the UI is BizPilot** (this document says "OpsPilot"). The AI is "BizPilot AI".
> 3. **Visual direction:** subtle glassmorphism with bold, clean design choices. The palette in the first `@theme` block of `src/app/globals.css` (fonts and colours) is the source of truth; vary colour opacity for a clean look. Take heavy inspiration from **Miro** (dot-grid canvases, floating glass toolbars, colour-edged cards) and Notion, with freer styling.
> 4. **The Dashboard is the visual reference.** Extend its conventions; don't redesign it.
> 5. **Auth pages (login, sign up, verification):** the owner likes their current look. Do **not** significantly change them — only add subtly (validation, states, links, accessibility, dark-mode safety).
> 6. **Top bar background matches the sidebar** (light theme especially).
> 7. **Every section and page needs a designed empty state** with an icon and explanatory text (demo with `?state=empty`).
> 8. **Recent Client Activity is grouped by client company**, each company collapsible, with that company's people's activity inside.
> 9. **Filter/search bars are not sticky** — they scroll with the page so they never cover content.
> 10. **Shadows are purposeful**, using the elevation scale in `devStructure.md` §4.3.1 (flat sections; elevation only for grabbable, hovering, floating or modal elements). No decorative glows.
> 11. **Componentize** meaningful sections and patterns; reuse before creating.
> 12. **Keep `devStructure.md` up to date** whenever UI structure, routes, tokens or conventions change.
> 13. **Charts only where the spec allows** (Reports, Platform admin) — never on the customer Dashboard — and validate chart palettes (dataviz validator) in both themes.
> 14. Work in **passes**; ask clarifying questions in plan mode when starting something new.

## 1. Document Purpose

This document defines the **user interface only** for OpsPilot. It describes the visual structure, information hierarchy, screens, components, interactions, states, animations, drag-and-drop behavior, feedback, responsive behavior, navigation, and reusable UI patterns required to make the application feel like a polished production SaaS product.

This document deliberately avoids prescribing backend implementation, database schema, API design, infrastructure, or internal engineering architecture except where a UI state or interaction requires the interface to represent an underlying process.

**Implementation context:** OpsPilot is being added to a small existing codebase. Do not treat this specification as permission to replace the current UI wholesale. Before changing or adding UI, carefully inspect the existing Dashboard page and the components, style files, font declarations, color/background tokens, and glassmorphism treatments it already uses. The Dashboard is the primary visual reference and source of truth for the established product identity. Preserve and reuse its working conventions; extend them consistently to new screens rather than introducing a competing design system. The Dashboard must not be redesigned merely to make other pages easier to build.

The application should feel like a mature commercial product rather than a portfolio demo. The interface should communicate three things continuously:

1. **This is where a service business runs its work.**
2. **Its information is connected and easy to understand.**
3. **AI is embedded into the workflow rather than presented as a disconnected chatbot.**

The product is designed primarily for a business such as a software agency, digital agency, consultancy, IT company, recruiting firm, or professional-services business. The business that creates the OpsPilot account is the operating organization. Its clients are managed within that organization. Internal employees are team members; selected people from client companies may be invited as external collaborators to specific projects.

---

# 2. Core Product Model Reflected in the UI

The UI should make the following hierarchy immediately understandable:

```text
OpsPilot Account
└── Operating Organization
    ├── Internal Team
    ├── Clients
    │   ├── Client Contacts
    │   ├── Projects
    │   │   ├── Tasks
    │   │   ├── Documents
    │   │   ├── Milestones
    │   │   ├── Activity
    │   │   └── External Collaborators
    │   └── Activity / Notes / AI Context
    ├── Internal Projects
    ├── Tasks
    ├── Documents
    ├── Automations
    ├── Reports
    └── Organization Settings
```

The AI layer sits across these areas:

```text
Clients
Projects
Tasks
Documents
Team
Reports
      │
      ▼
   OpsPilot AI
      │
      ├── Answers
      ├── Summaries
      ├── Insights
      ├── Recommendations
      └── Proposed Actions
```

The UI should make it obvious when AI is:

- answering a question,
- analyzing information,
- generating content,
- processing a document,
- recommending an action,
- or waiting for a human to approve an action.

AI must never visually blur the difference between an **AI recommendation** and an **executed action**.

---

# 3. Overall UX Principles

## 3.1 Visual hierarchy

The interface should have a clear hierarchy:

- primary page title,
- primary page action,
- relevant contextual controls,
- main content,
- secondary information,
- contextual actions.

Avoid interfaces where every element appears equally important.

## 3.2 Information density

OpsPilot is business software. It should be information-rich without becoming visually chaotic. Tables, cards, timelines, chips, status indicators, compact metadata, tabs, drawers, and command surfaces should be used to make a lot of information scannable.

## 3.3 Progressive disclosure

Do not expose every detail at once. Overview pages should summarize; detail pages should reveal deeper information through tabs, drawers, expandable rows, side panels, and drill-down interactions.

## 3.4 Animation philosophy

Animations should communicate hierarchy, continuity, feedback, and state changes rather than decorate the interface.

Use subtle transitions for:

- page transitions,
- sidebar expansion/collapse,
- card hover states,
- dropdowns,
- modals,
- drawers,
- tabs,
- accordions,
- filter changes,
- table updates,
- drag-and-drop movement,
- upload progress,
- AI generation,
- notifications,
- toast messages,
- status changes.

Avoid excessive motion, continuous motion, bouncing elements, or animations that slow down frequent business actions.

## 3.5 Motion timing

Motion should generally feel fast and deliberate:

- micro-interactions: approximately 120–180ms,
- dropdowns/drawers/modals: approximately 180–260ms,
- larger state changes: approximately 250–400ms,
- AI progress states: continuous but restrained.

Respect reduced-motion preferences.


## 3.6 Existing codebase and visual source of truth — mandatory before implementation

OpsPilot is being developed by extending a small existing application. The developer/AI coding agent must **inspect before modifying**. This requirement takes precedence over generic design suggestions in this document whenever the existing Dashboard already expresses the intended visual identity.

Before implementing new screens or changing shared UI, inspect:

- the existing Dashboard page and every component it imports;
- shared layout, card, button, input, menu, modal, and navigation components;
- global CSS, CSS modules, Tailwind configuration, theme variables, and other style tokens in use;
- font imports, font-family declarations, type scale, weights, line heights, and text colors;
- page, section, card, overlay, and input background colors;
- existing transparency/alpha values, gradients, blur/backdrop-filter effects, shadows, and edge treatments;
- existing corner-radius and spacing conventions;
- current light/dark theme behavior, if any;
- icon set and icon sizing conventions;
- responsive breakpoints and existing loading/empty/error patterns.

Use the findings to create a small implementation inventory before expanding the UI. Reuse the established font families, colors, backgrounds, glass effects, spacing, icons, and shared components wherever possible. Do not introduce a new font, a second icon library, conflicting global CSS, arbitrary color values, or a competing set of radii just because a new screen needs a component.

If the Dashboard already has glassmorphism, study **how it is currently applied**: which surfaces are translucent, how much blur is used, where solid surfaces are retained, how edges/shadows work, and how its foreground text stays legible. Reuse the established treatment and improve it only where clearly necessary. Do not assume that every surface should become glass.

When a requested screen requires a new visual pattern, derive it from the existing Dashboard tokens and components. If a genuine inconsistency or technical limitation exists, make the smallest coherent correction and apply it consistently; do not perform an unrelated visual rewrite.

## 3.7 Color, opacity, and balanced glassmorphism

The existing product palette may contain bold or saturated colors. Use them deliberately rather than applying them at full strength to every surface.

- Vary opacity/alpha to create restrained tints, translucent surface fills, subtle highlights, and layered visual depth.
- Prefer existing design tokens and CSS variables. Where the current stack supports it, use token-based alpha/color-mix values rather than hard-coded color variants scattered across components.
- Use glassmorphism **selectively** on surfaces where it contributes to the established Dashboard aesthetic: for example, selected summary modules, floating contextual panels, overlays, or highlighted AI surfaces.
- Balance glassmorphic surfaces with solid-color surfaces. Dense data tables, long-form text, forms, settings, document contents, and areas requiring dependable contrast may use solid or nearly opaque backgrounds.
- Translucency must not make text, icons, status labels, inputs, or controls hard to read. Avoid placing multiple highly transparent panels inside one another when the stacked layers muddy the content.
- Blur, subtle tonal contrast, and restrained shadows may establish depth; do not rely on a bright border around every glass surface.
- Treat light and dark mode separately when selecting surface opacity. A transparency that looks attractive over a light canvas may look muddy or lose contrast in dark mode.
- Preserve the existing Dashboard's background treatment and use it as the visual reference for the rest of the application.

Glassmorphism is an accent in the visual language, **not a universal component default**. The UI should have a deliberate mix of glassmorphic and solid surfaces, with enough quiet space that the glass-treated elements remain special.

## 3.8 Shape, borders, and separation

Avoid overly rounded corners and unnecessary borders. The interface should feel precise and mature rather than pill-shaped or inflated.

- Reuse the radius scale already present in the codebase. If the codebase has no consistent scale, establish a small one rather than inventing a radius for every component.
- Prefer modest corner radii for cards, fields, popovers, dialogs, and drawers. Reserve fully rounded pills for small status/metadata chips or controls where that form already exists in the Dashboard design.
- Do not put every section inside a separate rounded card. Use spacing, typography, alignment, restrained surface changes, and grouping to establish hierarchy.
- Add borders only when they clarify boundaries, affordances, selection, or accessibility. Avoid outlining every card, input group, section, and nested panel simultaneously.
- Use subtle separators for dense tables and long lists. Hover, selected, focused, and drag states should be visible without requiring heavy borders.
- Do not add thick outlines or strong shadows just to make glassmorphism visible.

## 3.9 Dark mode

Provide a complete dark mode for the main application and all supporting interfaces. Dark mode must be a real theme, not a global black overlay or a simple inversion of light-mode colors.

- Add a clearly discoverable theme control in the user/profile menu and/or Settings. Support Light, Dark, and System preferences if compatible with the existing implementation.
- Apply themes through shared tokens/CSS variables so components do not maintain unrelated hard-coded light and dark colors.
- Cover every UI element: fixed sidebar and top bar, page backgrounds, cards, glass surfaces, menus, tooltips, tables, forms, validation messages, dialogs, drawers, toast messages, notifications, skeletons, regular loaders, AI loaders, upload states, drag-and-drop states, charts inside Reports, document previews/metadata, client portal pages, platform-admin pages, and focus/selected/disabled states.
- Re-evaluate translucent colors and blur effects for dark backgrounds. Dark glass surfaces should retain depth and legibility without becoming opaque-looking black slabs or muddy low-contrast layers.
- Status colors must remain distinguishable in both themes. Do not rely on color alone; retain text/icon labels.
- Avoid flashes of the wrong theme during initial rendering or page transitions where the current stack permits theme persistence before paint.
- Keep the user's selected mode consistent across navigation and refreshes using the app's existing preference mechanism.
- Respect system preferences when System mode is selected. Do not change theme unexpectedly while the user has explicitly selected Light or Dark.

## 3.10 Componentization and UI composition — strong preference

Build the interface from focused, reusable components. Pages should primarily compose components rather than contain large blocks of repeated markup and styling. Componentization applies to **visual sections and meaningful behaviors**, not just generic buttons.

A component should generally have one clear responsibility, for example displaying a project-health row, rendering an AI citation, handling an upload item, or presenting a reusable filter toolbar. Components should accept explicit data/configuration, expose clear interaction callbacks, and support the states that apply to them.

Create or reuse shared primitives for patterns such as:

- application shell, fixed sidebar, top bar, navigation item, page container, page header, breadcrumbs, and page toolbar;
- buttons, icon buttons, inputs, selects, date pickers, tabs, dropdowns, tooltips, popovers, menus, modals, drawers, confirmation dialogs, and toasts;
- cards/surfaces, metric summaries, status/priority chips, avatars, progress indicators, data tables, pagination, filter bars, bulk-action bars, and empty states;
- skeletons and regular loading states, AI-specific loading/progress states, document-processing progress, automation execution status, and error/retry states;
- activity feeds, timeline entries, comments, file rows, upload dropzones, file previews, and drag/drop indicators;
- AI conversation messages, source citations, structured AI result blocks, proposed-action cards, approval controls, and AI feedback controls.

Create domain-focused components where reuse and clarity warrant them, such as `ClientSummary`, `ProjectHealthRow`, `TaskListItem`, `TaskDetailPanel`, `DocumentStatus`, `AIBusinessBrief`, `AutomationRunStep`, `UsageSummary`, and `ClientApprovalCard`. Names are illustrative; follow the conventions already used in the codebase rather than renaming existing components to match this list.

Rules:

- First look for a component already used by the Dashboard or another existing screen before creating a duplicate.
- Keep page components responsible for layout and composition; move repeated display/interaction patterns into reusable components.
- Keep styles close to the component or within the project's established styling system; avoid page-specific overrides that accidentally alter other pages.
- Share theme tokens and behavior instead of copying the same CSS with slight color changes.
- Do not create a component for every trivial wrapper or fragment. Componentize meaningful sections, interactions, and repeated patterns; avoid abstraction that makes simple UI harder to follow.
- Preserve existing public component APIs where practical. If a shared component must change, check its existing consumers and ensure the change does not regress the Dashboard.
- The same component should look and behave consistently across clients, projects, documents, automations, reports, the client portal, and admin interfaces unless the context genuinely requires a variant.

## 3.11 Main application shell and scrolling behavior

For the authenticated **main application**, the sidebar and top navigation bar must remain fixed in the viewport while the page content scrolls independently.

- Keep the sidebar anchored to the viewport's left edge and full available viewport height. It must not scroll away with the page content.
- Keep the top bar anchored to the viewport's top edge and aligned with the content area, accounting for the sidebar width/collapsed width.
- The central page/content region is the primary vertical scroll container. Scrolling Dashboard, Clients, Projects, Tasks, Documents, Reports, or Settings must not move the fixed sidebar or top bar.
- Avoid double-scrollbars and accidental body/page scroll caused by nested `100vh` layouts. Account for dynamic viewport height on mobile where supported.
- The sidebar navigation itself may scroll internally if its contents exceed the viewport. Keep the organization switcher/header and user/profile footer accessible where feasible.
- Page-level sticky elements, such as table headers or detail tabs, must remain within the correct content scroll context rather than overlapping the fixed global shell.
- Drawers and modal bodies may scroll independently when their content is long; their headers/footers can remain sticky within the overlay.
- Ensure page content has the correct offset/padding so its first row is never hidden beneath the fixed top bar or behind the sidebar.
- Establish a clear, consistent layering/z-index order for sidebar, top bar, popovers, tooltips, drawers, modals, and toasts. Menus must not be clipped by scroll containers.
- On tablet/mobile, preserve the user's ability to reach navigation without allowing the desktop fixed geometry to crush the content. Use the responsive navigation behavior defined in Section 32; fixed desktop dimensions should adapt to narrower viewports.

---

# 4. Global Application Shell

Every authenticated page uses a common application shell.

## 4.1 Left sidebar

The left sidebar is the primary navigation structure. In the authenticated main app it is **fixed to the viewport** and remains stationary while the central content scrolls. It must be implemented as a reusable layout component, not duplicated separately in each page. Match its existing Dashboard width, typography, colors, icon treatment, background, and glassmorphism before changing anything.

### Header area

- OpsPilot logo/wordmark
- current organization/workspace selector
- optional organization avatar
- small dropdown indicator

The organization selector opens a menu with:

- current organization,
- organizations the user can access,
- create organization,
- organization settings.

For the initial product, most users will have one organization, but the UI should support the concept without making it dominant.

### Primary navigation

```text
Overview
  Dashboard

Work
  AI Assistant
  Clients
  Projects
  Tasks
  Documents
  Automations

Insights
  Reports

Organization
  Team
  Billing
  Settings
```

### Sidebar behavior

The sidebar occupies the full viewport height. Its navigation list may scroll internally if needed; the organization selector and bottom profile/help area should remain accessible. It must layer correctly beside the fixed top bar and above the page canvas without creating an unwanted page-level scrollbar.

Expanded state:

- icon,
- label,
- optional badge.

Collapsed state:

- icon only,
- tooltips on hover,
- active indicator remains visible.

The sidebar should animate between expanded and collapsed states without causing content to jump abruptly.

## 4.2 Top bar

The main-app top bar is **fixed/stationary at the top of the viewport**. Page content scrolls beneath it in the central content container. Keep its height, typography, background, opacity, and any glass effect consistent with the existing Dashboard implementation. Ensure the content area is offset so page headings and controls are not obscured. Implement the top bar once as a shared component.

The top bar contains:

### Global search

A prominent search control with placeholder:

> Search clients, projects, tasks, documents...

Clicking it opens a command/search surface that can search across the organization.

Search results should be grouped by type:

- Clients
- People
- Projects
- Tasks
- Documents
- Notes
- Activity

Each result includes:

- icon/type marker,
- title,
- parent context,
- small metadata,
- optional status.

Keyboard shortcut support should be displayed subtly in the search control.

### Quick-create button

A compact create control with options:

- New client
- New project
- New task
- Upload document
- New automation
- Invite team member

### Notifications

Bell icon with unread badge.

Click opens a notification drawer/dropdown containing:

- unread notifications,
- recent notifications,
- category filtering,
- mark as read,
- mark all as read,
- open notification center.

### Help

Menu options:

- Help center
- Documentation
- Contact support
- Keyboard shortcuts

### User profile

Avatar and menu:

- My profile
- Appearance / Theme: Light, Dark, or System (where supported)
- Security
- Notification preferences
- Sign out

---

# 5. Global UI Components

The application should establish a reusable visual language for these primitives.

## 5.1 Buttons

Buttons should not default to exaggerated pill shapes. Use the established Dashboard shape/radius convention and keep the label, icon, hit area, and state feedback clear.

Types:

- primary,
- secondary,
- ghost,
- destructive,
- icon-only,
- text link.

Buttons must show clear disabled and loading states.

A loading button replaces or supplements its label with a small progress indicator while preserving the button width where possible.

## 5.2 Cards

Do not force every section into a bordered, heavily rounded card. Use cards when they form a meaningful information or action unit; otherwise use aligned sections, lists, separators, or background shifts. Choose between solid and glassmorphic surfaces based on the established Dashboard treatment and the content's contrast needs.

Cards are used for:

- KPIs,
- project summaries,
- client summaries,
- automation summaries,
- AI insights,
- activity modules,
- usage modules.

Cards may be clickable when the entire card is an action. Avoid making every card clickable. Vary the opacity of bold palette colors for subtle fills and highlights; use solid or near-opaque backgrounds for dense content that needs stable contrast. Avoid unnecessary borders and oversized corner radii.

## 5.3 Tables

Tables support:

- sortable columns,
- pagination,
- selectable rows,
- batch actions,
- filters,
- column visibility,
- row hover actions,
- expandable rows where appropriate.

On smaller screens, tables should become horizontally scrollable or transform into compact list/card representations rather than becoming unreadable.

## 5.4 Chips and status indicators

Use compact badges for:

- status,
- priority,
- role,
- processing state,
- plan,
- health,
- access level.

Status color must not be the only indicator; pair color with text/icon where appropriate.

## 5.5 Drawers

Drawers are preferred over full pages for contextual actions such as:

- quick-edit,
- task details,
- member invitation,
- AI proposed action review,
- notification details,
- upload workflows.

## 5.6 Modals

Use modals for focused actions requiring interruption or confirmation:

- delete,
- destructive changes,
- final confirmation,
- payment-sensitive actions.

## 5.7 Toasts

Use toasts for completed lightweight actions:

- saved successfully,
- client created,
- task completed,
- document uploaded,
- invitation sent,
- automation activated.

Toasts should support undo when the operation can safely be reversed.

---

# 6. Loader System

OpsPilot must use **different loading indicators for different classes of work**.

## 6.1 Regular UI loader

For ordinary UI/data operations, use reusable loading components that inherit the active theme and established surface treatment. Their skeleton colors must derive from shared theme tokens and remain visible in both light and dark mode. For ordinary UI/data operations:

- compact spinner,
- skeleton blocks,
- skeleton table rows,
- skeleton cards.

Use skeletons for page-level content where the eventual content shape is known.

## 6.2 AI loader

AI activity must feel visibly different from normal loading. Implement this as a reusable AI loading component with configurable stage/message, not as a separate improvised animation on each screen. It must support light and dark mode and respect the existing glass/solid surface choices.

AI loaders can use:

- subtle animated shimmer,
- pulsing AI mark,
- streaming text cursor,
- rotating contextual stages.

Example:

```text
OpsPilot AI
Analyzing project activity...
Retrieving relevant documents...
Preparing recommendations...
```

Do not use the same generic spinner used for database/UI loading.

## 6.3 Document-processing loader

Document processing uses a step-based state indicator:

```text
Uploading ✓
Extracting text ✓
Indexing •
Preparing for AI ...
```

Use a restrained progress state rather than a generic spinner.

## 6.4 Automation loader

Automation runs should show a workflow/execution indicator:

```text
Trigger ✓
Condition ✓
AI analysis •
Send notification ○
```

## 6.5 Full-screen/route transitions

Use very subtle route-level progress feedback. Avoid blocking full-screen spinners for routine navigation.

---

# 7. Empty, Error, and Success States

Every major screen must have designed states.

## Empty state

Should include:

- contextual illustration/icon,
- explanation,
- primary action,
- optional secondary action.

Example for no clients:

> No clients yet
> Add your first client to start organizing projects and work.
> [Add client]

## Error state

Include:

- what failed,
- whether data is safe,
- retry action,
- support/error reference where appropriate.

## Partial failure

Do not fail the whole page if one module fails. Display the failed module independently with a retry action.

## Success state

Use confirmations without excessive celebration. Business software should feel confident and controlled.

---

# 8. Public Website UI

## 8.1 Home / Landing Page

### Header

- logo,
- Product dropdown/link,
- Pricing,
- Resources,
- Sign in,
- Start free.

### Hero

Headline:

> Run your client work and business operations from one place.

Supporting message describing clients, projects, documents, workflows, AI, and business visibility.

Actions:

- Start free
- See how it works

### Product preview

Show an actual dashboard/application preview rather than an abstract illustration.

### Core capability sections

Cards for:

- Client management
- Project execution
- AI assistant
- Document intelligence
- Automations
- Reports

### AI example section

Display realistic questions and responses.

### Workflow section

```text
Your business information
        ↓
Organize the work
        ↓
OpsPilot AI understands context
        ↓
Insights
        ↓
Human-approved actions
```

### Footer

- Product
- Pricing
- Documentation
- Security
- Privacy
- Terms
- Contact

---

# 9. Pricing Page

## 9.1 Header

- page title,
- monthly/yearly toggle if annual pricing is supported,
- short value proposition.

## 9.2 Pricing cards

Each plan displays:

- plan name,
- price,
- billing frequency,
- summary,
- included limits,
- included AI usage,
- number of team members,
- storage,
- automation access,
- CTA.

The current selection is visually obvious.

## 9.3 Comparison table

Rows for:

- team members,
- clients,
- projects,
- storage,
- AI credits,
- document processing,
- automations,
- reports,
- client portal,
- integrations,
- support.

## 9.4 FAQ

Expandable accordions.

---

# 10. Authentication UI

## 10.1 Sign Up

Elements:

- first name,
- last name,
- work email,
- password,
- show/hide password,
- Google sign-in,
- terms acknowledgment,
- Create account.

Inline validation should happen as the user interacts, without creating visual noise.

## 10.2 Sign In

Elements:

- email,
- password,
- show/hide password,
- remember session,
- Google sign-in,
- Sign in,
- forgot password,
- create account link.

## 10.3 Verification

Elements:

- email destination,
- verification status,
- resend,
- change email.

## 10.4 Password reset

Separate request and password-change states.

---

# 11. Onboarding UI

The onboarding should feel like a guided setup rather than a long form.

Use a compact step indicator:

```text
1. Organization → 2. Team → 3. First Client → 4. Finish
```

## 11.1 Create organization

Fields:

- company name,
- business type,
- website,
- company size.

## 11.2 Invite team

Repeatable email/role rows.

Drag-and-drop is not necessary here; the interaction should be simple and fast.

## 11.3 Add first client

Fields:

- company,
- contact,
- email,
- account manager.

## 11.4 Completion

Show completed setup indicators and a clear transition into the dashboard.

---

# 12. Dashboard UI

## 12.1 Dashboard objective

The existing Dashboard page is the **primary design reference for this codebase**. Before changing or extending other pages, study its actual font usage, type hierarchy, palette, background colors, section/card surfaces, opacity values, glassmorphism, radius, shadows, spacing, and component patterns. Preserve those existing decisions, and reuse/refactor its components where appropriate. Do not redesign the Dashboard or introduce a separate visual identity just to fit this document. New Dashboard modules and all other pages should fit the current implementation.

The dashboard should answer:

> **What is happening across my business, what needs attention, and what should I do next?**

### IMPORTANT DASHBOARD CONSTRAINT

**Do not use graphs or charts on the dashboard.**

The dashboard should provide a dense but highly scannable operational overview using cards, lists, status blocks, summaries, timelines, queues, alerts, and action modules.

Graphs can exist inside Reports, but not on the main Dashboard.

## 12.2 Header

- greeting,
- short contextual summary,
- date range selector,
- refresh control,
- optional customize-dashboard control.

## 12.3 KPI row

Cards:

- Active Clients
- Active Projects
- Overdue Tasks
- Revenue
- AI Usage

Each card can include:

- current value,
- small contextual comparison,
- status indicator,
- clickable drill-down.

No graphs inside the cards.

## 12.4 Priority / Attention section

A large high-priority operational queue.

Examples:

- overdue projects,
- blocked tasks,
- customer approvals waiting,
- client follow-ups overdue,
- failed automations,
- documents awaiting review.

Each item includes:

- type,
- title,
- client/project context,
- responsible person,
- urgency,
- deadline,
- one-click action.

## 12.5 Project Health section

A list of major projects, not a graph.

Each project row includes:

- client,
- project name,
- progress percentage,
- deadline,
- status,
- health,
- number of open tasks,
- current blocker.

Progress may be represented with a compact horizontal progress bar.

## 12.6 Today's Work section

Show the logged-in user's work:

- tasks due today,
- overdue tasks,
- upcoming deadlines,
- tasks awaiting review.

Each task supports quick actions such as:

- complete,
- change status,
- reassign,
- open detail.

## 12.7 Client Activity section

A compact recent-activity stream:

- client uploads,
- client approvals,
- client comments,
- client inactivity alerts,
- newly created engagements.

## 12.8 Team Activity section

Show:

- tasks completed,
- tasks assigned,
- major project updates,
- important internal changes.

## 12.9 AI Business Brief

A prominent but controlled AI module.

Display:

- brief summary,
- key risks,
- key opportunities/attention items,
- recommended actions.

Actions:

- View analysis
- Ask AI follow-up

AI generation/loading should use the dedicated AI loader, not a regular spinner.

## 12.10 Upcoming deadlines

A chronological list:

- date,
- client,
- project,
- milestone/task,
- owner,
- status.

## 12.11 Recent documents

Show:

- recently uploaded files,
- client/project context,
- processing state,
- uploaded by,
- date.

## 12.12 Automation status

Compact status block:

- active automation count,
- failed runs,
- runs awaiting retry,
- last successful execution.

## 12.13 Quick actions

Prominent shortcuts:

- New client
- New project
- New task
- Upload document
- Ask AI
- Create automation

## 12.14 Customization

The dashboard may support:

- show/hide modules,
- reorder modules,
- restore default layout.

Use drag-and-drop reordering with a clear drag handle. Persist the layout per user.

---

# 13. AI Assistant UI

## 13.1 Main screen

Three-column structure on large screens:

```text
Conversation History | Main Chat | Context / Actions
```

On smaller screens, the left and right columns become drawers.

## 13.2 Conversation history

Organize by:

- Today
- Yesterday
- Previous 7 days
- Older.

Conversation items show:

- title,
- timestamp,
- optional context scope.

Actions:

- rename,
- archive,
- delete.

## 13.3 Main chat

Elements:

- title,
- current context indicator,
- message stream,
- suggested prompts,
- text composer,
- attachment control if supported,
- send button,
- stop generation button while AI is streaming.

Suggested prompts:

- What should I prioritize today?
- Which projects are at risk?
- Summarize my client relationships.
- Prepare me for my next client meeting.
- What changed in our latest documents?

## 13.4 AI response structure

AI responses may contain:

- paragraphs,
- bullet summaries,
- tables,
- status cards,
- citations,
- linked records,
- proposed actions.

The interface should visually distinguish AI-generated text from system-record content.

## 13.5 AI citations

Citations should be clickable.

Selecting a citation opens the relevant:

- document,
- client,
- project,
- task,
- activity event.

If a document page/section is available, the document viewer should open at the relevant location.

## 13.6 AI proposed actions

Actions are presented inside distinct action cards.

Example:

> Create a high-priority task for James to resolve Globex API authentication.

Buttons:

- Review
- Approve
- Dismiss

Never silently execute significant mutations from a conversational response.

## 13.7 AI streaming

Generated responses should appear progressively when practical.

Use:

- streaming text,
- subtle cursor,
- generating indicator,
- stop generation control.

## 13.8 AI errors

If AI fails:

- explain that generation failed,
- preserve user input,
- provide retry,
- do not clear the conversation.

---

# 14. Clients UI

## 14.1 Clients List

### Header

- title,
- client count,
- Add Client.

### Toolbar

- search,
- status filter,
- account manager filter,
- industry filter,
- project health filter,
- last activity filter,
- column visibility,
- export if supported.

### Client table

Columns:

- Client
- Primary Contact
- Account Manager
- Active Projects
- Open Tasks
- Last Activity
- Relationship Health
- Status

Row actions:

- Open
- Edit
- Create Project
- More.

Bulk selection supports safe group actions where appropriate.

## 14.2 Add/Edit Client drawer

Sections:

### Company

- company name,
- website,
- industry,
- size,
- address,
- phone.

### Primary Contact

- name,
- title,
- email,
- phone.

### Internal

- account manager,
- tags,
- status,
- relationship health,
- internal notes.

### Commercial

- contract value,
- billing arrangement,
- renewal date.

Actions:

- Save
- Cancel.

## 14.3 Client Overview

Header:

- company name,
- client status,
- relationship health,
- website,
- primary contact,
- account manager.

Primary actions:

- Edit
- New Project
- Invite Client
- Ask AI
- More.

KPI strip:

- Active Projects
- Completed Projects
- Open Tasks
- Pending Approvals.

Tabs:

```text
Overview | Projects | Contacts | Tasks | Documents | Activity | Notes | AI
```

### Overview content

- relationship summary,
- active engagements,
- recent activity,
- outstanding issues,
- upcoming deadlines,
- recent documents,
- AI summary.

### Projects tab

Client-specific projects list.

### Contacts tab

Contacts belonging to the client organization.

Actions:

- edit,
- invite as collaborator,
- remove/inactivate.

### Tasks tab

All tasks associated with this client.

### Documents tab

All documents associated with this client.

### Activity tab

Full client timeline.

### Notes tab

Internal notes only. This tab must be visually and logically distinct from client-visible information.

### AI tab

A client-scoped AI assistant.

Suggested prompts:

- Summarize our relationship with this client.
- What are the current risks?
- Prepare me for our next meeting.
- What does the contract require?
- What changed recently?

---

# 15. Projects UI

## 15.1 Projects List

### Header

- title,
- project count,
- New Project.

### Toolbar

- search,
- client filter,
- project manager filter,
- status filter,
- health filter,
- priority filter,
- deadline filter.

### View switcher

- List
- Board
- Timeline/Calendar if enabled.

## 15.2 Project list rows

Display:

- Project
- Client
- Manager
- Progress
- Deadline
- Health
- Status
- Open Tasks.

## 15.3 Project Board

Kanban columns:

```text
Backlog
To Do
In Progress
Review
Blocked
Done
```

Cards include:

- task title,
- assignee avatar,
- priority,
- due date,
- comments count,
- attachment indicator,
- dependency indicator.

### Drag and drop

Cards can be dragged between columns.

During drag:

- source card becomes visually muted,
- valid drop areas highlight,
- invalid areas remain subdued,
- column accepts card with an insertion indicator,
- drop triggers subtle confirmation animation.

Keyboard alternatives should remain possible for accessibility.

## 15.4 Create Project drawer/page

Sections:

### Basic

- name,
- client,
- description,
- project manager,
- status,
- priority.

### Timeline

- start date,
- deadline.

### Commercial

- budget,
- billing model.

### Team

- internal members.

### Client Collaboration

Toggle:

> Enable client collaboration

If enabled, configure client contacts and permissions.

## 15.5 Project Detail

Header:

- project name,
- client,
- status,
- health,
- deadline,
- progress.

Primary actions:

- Add Task
- Upload Document
- Invite Client
- Ask AI
- More.

Tabs:

```text
Overview | Board | Tasks | Timeline | Documents | Team | Client | Activity | AI
```

### Overview tab

Sections:

- project summary,
- progress,
- milestones,
- current blockers,
- upcoming deadlines,
- recent activity,
- project health,
- AI summary.

### Board tab

Full Kanban experience.

### Tasks tab

Detailed task list.

### Timeline tab

Timeline/Gantt-style view with:

- milestones,
- task bars,
- dependencies,
- dates,
- progress,
- delayed items.

Drag handles may be used to adjust dates where appropriate. Date changes should have confirmation/undo feedback.

### Documents tab

Project-scoped document library.

### Team tab

Separate sections:

- Internal Team
- External Collaborators.

### Client tab

Preview of client-visible project information.

### Activity tab

Chronological audit/activity feed.

### AI tab

Project-scoped AI.

Suggested prompts:

- What is blocking this project?
- Summarize recent activity.
- Which tasks threaten the deadline?
- Analyze the project requirements.
- Draft a client-ready status update.

---

# 16. Task UI

## 16.1 Tasks List

Tabs:

- My Tasks
- Team Tasks
- All Tasks.

Toolbar:

- search,
- client,
- project,
- assignee,
- status,
- priority,
- due date.

Views:

- list,
- board,
- calendar.

### Task list columns

- Task
- Project
- Client
- Assignee
- Status
- Priority
- Due Date
- Dependencies.

## 16.2 Task detail drawer

Sections:

- title,
- description,
- status,
- priority,
- assignee,
- project,
- client,
- due date,
- dependencies,
- attachments,
- comments,
- activity.

Actions:

- complete,
- reassign,
- change due date,
- change priority,
- add dependency,
- duplicate,
- archive.

### AI controls

- Draft implementation plan
- Summarize relevant requirements
- Identify blockers
- Suggest next steps.

AI actions should remain contextual and permission-aware.

---

# 17. Documents UI

## 17.1 Document Library

Header:

- title,
- document count,
- Upload Document.

Toolbar:

- search,
- client filter,
- project filter,
- type filter,
- processing-state filter,
- uploader filter,
- date filter.

Views:

- list,
- compact grid if useful.

### Document row

- file icon/type,
- file name,
- client,
- project,
- uploader,
- date,
- processing status,
- AI index status,
- actions.

## 17.2 Upload experience

Use a drag-and-drop upload zone.

Elements:

- large drop area,
- browse files,
- accepted formats,
- upload queue.

During upload:

- file name,
- size,
- progress bar,
- upload percentage,
- cancel.

After upload:

- processing stages,
- retry if failed.

Multiple documents may be uploaded together.

## 17.3 Document processing state

Use a distinct progress interface:

```text
Upload          ✓
Extract text    ✓
Analyze         •
Index           ○
Ready           ○
```

The user can leave the page; the processing state remains visible when they return.

## 17.4 Document Detail / Viewer

Large document preview area with:

- page navigation,
- zoom controls,
- download,
- fullscreen,
- search within document.

Right-side information panel:

- uploaded by,
- client,
- project,
- upload date,
- size,
- processing state,
- AI indexed state.

AI panel:

- Ask about document
- Summarize
- Extract key requirements
- Identify dates
- Identify obligations
- Identify risks.

AI answers should link back to relevant document pages/sections where possible.

## 17.5 Document versioning UI

Version history panel:

- version number,
- uploaded by,
- timestamp,
- status,
- compare/open options.

---

# 18. Automations UI

Automations are a first-class product section, not a hidden settings feature.

## 18.1 Automation List

Header:

- title,
- description,
- Create Automation.

Filters:

- active/inactive,
- trigger type,
- creator,
- recent failures.

Automation cards/rows show:

- automation name,
- trigger,
- action summary,
- status,
- last run,
- success count,
- failure count.

Example:

```text
New Client Onboarding
When: Client created
Then: Create tasks → Send welcome email → Notify manager
Active
```

## 18.2 Create Automation

Use a visual workflow builder.

Structure:

```text
Trigger
   ↓
Conditions
   ↓
Actions
   ↓
Optional branches
```

### Trigger block

Examples:

- client created,
- project created,
- task completed,
- task overdue,
- document uploaded,
- document processed,
- milestone approved,
- payment failed.

### Condition block

Users configure rules such as:

- client equals X,
- status equals Y,
- priority equals Z,
- project is overdue,
- document type is X.

### Action block

Actions:

- create task,
- send email,
- notify user,
- update status,
- generate AI summary,
- AI classify,
- call external API.

### Drag-and-drop behavior

Workflow nodes are draggable.

Connections between nodes are visual and reorderable where supported.

Nodes should have:

- clear handles,
- valid connection indicators,
- hover controls,
- duplicate,
- delete,
- configure.

The builder should prevent visually invalid connections.

## 18.3 Automation Detail

Header:

- name,
- status,
- last run,
- toggle active/inactive.

Main area:

- workflow visualization.

Secondary area:

- configuration,
- execution history.

## 18.4 Run history

Each run displays:

- timestamp,
- status,
- duration,
- trigger data,
- success/failure.

Open a run to view:

```text
Trigger ✓
Condition ✓
AI analysis ✓
Create task ✓
Send notification ✕
Retry → Success
```

Use a distinct execution visual language for workflow state.

---

# 19. Reports UI

Unlike the Dashboard, Reports may contain graphs and analytical visualizations.

## 19.1 Reports Overview

Sections:

### Revenue

- revenue trends,
- revenue by client,
- revenue by project.

### Clients

- active clients,
- new clients,
- inactive clients,
- at-risk clients.

### Projects

- completion,
- delays,
- budget,
- project performance.

### Team

- workload,
- completion,
- overdue tasks.

### AI Usage

- generations,
- credits consumed,
- usage by feature,
- estimated cost.

## 19.2 Report controls

- date range,
- client filter,
- project filter,
- team filter,
- export.

## 19.3 Drill-down

Every major report value should be clickable when there is an underlying record set.

Example:

> 4 at-risk clients

opens the matching client list filtered to those clients.

## 19.4 AI report analysis

Button:

> Analyze this report with AI

The AI response should be shown in a contextual side panel or inline analysis area.

---

# 20. Team UI

## 20.1 Team List

Header:

- Team
- member count
- Invite Member.

Table columns:

- Name
- Role
- Status
- Active Projects
- Open Tasks
- Workload
- Last Active.

## 20.2 Invite Member drawer

Fields:

- email,
- role,
- optional message.

Invitation status should be visible.

## 20.3 Member Detail

Sections:

### Profile

- avatar,
- name,
- email,
- role,
- status.

### Work

- assigned projects,
- assigned tasks,
- overdue work,
- upcoming work.

### Activity

Recent actions.

### Permissions

Permission summary based on role.

---

# 21. Billing UI

## 21.1 Billing Overview

Visible primarily to owners/admins.

Show:

- current plan,
- monthly/annual price,
- next renewal,
- payment status,
- upgrade/downgrade controls.

## 21.2 Usage

Usage cards for:

- AI credits,
- storage,
- team members,
- projects if plan-limited.

Usage should show:

- consumed,
- limit,
- remaining,
- reset date.

Use progress bars rather than unnecessary charts.

## 21.3 Subscription Management

Controls:

- change plan,
- manage payment method,
- cancel subscription,
- resume where applicable.

## 21.4 Invoices

Table:

- invoice number,
- date,
- amount,
- status,
- download.

---

# 22. Usage UI

Separate usage detail page can expose:

### AI

Break down:

- document analysis,
- summaries,
- RAG questions,
- email drafting,
- other AI operations.

### Storage

- document storage,
- attachment storage.

### Team

- active users,
- invited users.

Every meter should show a clear explanation of what is being counted.

---

# 23. Settings UI

Settings uses a secondary navigation. Appearance/theme controls should be easy to find under General and available from the global profile menu as a quick toggle. The selected theme applies consistently to the full app, not just the Settings page.

```text
General
Profile
Team & Permissions
Security
Notifications
AI
Integrations
Data
```

## 23.1 General

Organization settings:

- organization name,
- logo,
- website,
- business type,
- company size,
- address,
- timezone,
- currency.

Appearance settings:

- Theme: Light / Dark / System (show only the options supported by the implementation).
- A concise preview or clear selected-state indicator for the active theme.
- Explain that the setting affects the main app, overlays, loaders, client portal, and admin UI.
- Save/apply immediately where appropriate, with no unrelated page reload.

## 23.2 Profile

- name,
- avatar,
- title,
- email,
- timezone.

## 23.3 Team & Permissions

Member/role management plus a readable permission matrix.

Example columns:

```text
Feature | Owner | Admin | Manager | Employee
```

Use checkmarks plus text/tooltip explanations.

## 23.4 Security

- password change,
- active sessions,
- 2FA,
- login history,
- security events,
- sign out all sessions.

## 23.5 Notifications

Toggle groups for:

- task assignments,
- task deadlines,
- project alerts,
- client activity,
- document events,
- AI insights,
- billing.

Digest options:

- daily,
- weekly,
- off.

## 23.6 AI Settings

Sections:

### AI preferences

- enable AI action suggestions,
- require confirmation before actions,
- citation preference,
- retention controls.

### Usage

- current credits,
- reset date.

### Knowledge

- indexed documents count,
- indexing status,
- connected knowledge sources.

## 23.7 Integrations

Cards grouped as:

- Connected
- Available

Example integrations:

- Stripe,
- Google,
- email provider,
- Slack,
- calendar.

Each integration supports:

- connect,
- reconnect,
- disconnect,
- view status.

## 23.8 Data

Actions:

- export organization data,
- import where supported,
- data retention,
- delete data,
- delete organization.

---

# 24. Notifications UI

## 24.1 Notification center

Tabs:

- All
- Mentions
- Tasks
- Projects
- Clients
- AI
- Billing.

Each notification shows:

- icon/type,
- title,
- summary,
- source context,
- timestamp,
- read/unread state.

Actions:

- mark read,
- mark all read,
- open linked record.

Unread items should be visually distinct but subtle.

---

# 25. Client Portal UI

The client portal is a restricted external-facing interface for invited client contacts.

The client portal should feel connected to OpsPilot but must make its limited scope obvious.

## 25.1 Client portal sign in

Elements:

- brand,
- invitation context,
- email,
- password or secure sign-in flow,
- sign in.

## 25.2 Client portal home

Header:

- client company name,
- service provider company,
- profile menu.

Content:

### Active Projects

Each card shows:

- project name,
- progress,
- deadline,
- status,
- pending client action.

### Pending Approvals

- deliverable,
- date,
- Review button.

### Recent Activity

Only client-visible activity.

### Shared Documents

Only client-visible files.

## 25.3 Client project page

Tabs:

- Overview
- Milestones
- Deliverables
- Documents
- Messages
- Approvals.

### Overview

- project status,
- progress,
- deadline,
- summary.

### Milestones

- milestone name,
- status,
- date,
- approval requirement.

### Deliverables

- preview,
- version,
- submitted date,
- approval status.

### Documents

Only shared documents.

### Messages

Project-scoped communication between authorized participants.

### Approvals

Clear actions:

- Review
- Approve
- Request Changes.

## 25.4 Client portal profile

- name,
- email,
- company,
- password/security.

---

# 26. External Collaborator UI

External collaborators should be clearly labeled throughout the internal application.

For example:

> John Smith — Globex Corporation — External Collaborator

When inviting them, display a permissions summary before sending.

Permissions may include:

- view project,
- view documents,
- comment,
- upload documents,
- approve deliverables,
- view selected tasks.

The internal interface should offer a **Client-visible preview** so internal users can understand exactly what an invited client contact can see.

---

# 27. Platform Admin UI

A separate private interface for the OpsPilot platform operator.

## 27.1 Platform Overview

KPI cards:

- Organizations
- Active Users
- MRR
- AI Generations
- Estimated AI Cost
- Storage.

Below the cards:

- organization activity feed,
- recent signups,
- subscription events,
- AI processing health,
- failed system operations.

Graphs are acceptable here because this is an administrative analytics surface, not the customer Dashboard.

## 27.2 Organizations

Table:

- organization,
- owner,
- plan,
- users,
- created,
- status,
- usage.

## 27.3 Organization Detail

Panels:

- organization overview,
- subscription,
- usage,
- users,
- recent events,
- support notes.

## 27.4 AI Quality

Show:

- total generations,
- accepted,
- edited,
- rejected,
- average response time,
- estimated cost.

Filters:

- AI feature,
- model,
- date,
- organization,
- success/failure.

Opening an entry shows:

- user request,
- context used,
- model,
- response,
- latency,
- usage,
- feedback.

---

# 28. Search UI

Global search should have a dedicated command surface.

## Search overlay

Top:

- search input,
- keyboard shortcut hint,
- close control.

Results should appear grouped by category.

Example:

```text
Clients
  Globex Corporation

Projects
  Globex Customer Portal

Tasks
  API Integration

Documents
  Security Requirements.pdf
```

Each result shows enough context to disambiguate similarly named records.

Search should support keyboard navigation.

Recent searches can appear when the search field is empty.

---

# 29. Quick Create UI

The global create menu should be available from anywhere.

Options:

- New Client
- New Project
- New Task
- Upload Document
- New Automation
- Invite Team Member.

Selecting an option should open the appropriate drawer/modal without taking the user to a new page unless additional setup is required.

---

# 30. Activity Feed Pattern

Use one reusable activity/timeline component across:

- clients,
- projects,
- documents,
- organization activity,
- platform administration.

Each item can contain:

- actor avatar,
- action verb,
- target item,
- timestamp,
- contextual metadata.

Examples:

> Sarah uploaded Contract.pdf

> James completed API Authentication

> John from Globex approved Milestone 2

> OpsPilot AI generated a project summary

Activity items should be clickable when their target has a detail page.

---

# 31. Drag-and-Drop System

Drag and drop should be used deliberately in areas where it improves productivity.

## Required drag-and-drop experiences

### Project Kanban

Move tasks between statuses.

### Dashboard customization

Reorder dashboard modules.

### Automation builder

Move workflow nodes and create connections.

### Document upload

Drop files into upload zone.

### Task ordering

Optional manual ordering inside lists/boards.

### Timeline

Optional controlled date adjustment with draggable timeline edges.

Every drag interaction should support:

- obvious drag handle where appropriate,
- hover affordance,
- valid-drop highlight,
- invalid-drop feedback,
- drop confirmation,
- undo via toast where practical.

---

# 32. Responsive UI

## Desktop

Desktop is the primary environment. In the authenticated main app, the sidebar and top bar stay fixed; only the central content region scrolls. Use:

- fixed persistent sidebar,
- fixed top navigation bar,
- an independently scrollable main content region with correct offsets,
- multi-column dashboards,
- rich tables,
- side-by-side AI/context views.

Do not let the entire application shell scroll as one document. On narrower viewports, adapt the fixed shell rather than allowing it to cover or compress the page content.

## Tablet

- collapsible sidebar,
- reduced table columns,
- drawers become near-full-width.

## Mobile

The application should remain usable for essential actions even if desktop is the primary interface.

Mobile navigation may use:

- bottom navigation for the most important areas,
- slide-out navigation for secondary areas.

On mobile:

- cards stack,
- tables become compact lists,
- drawers become full-screen sheets,
- side-by-side AI context becomes tabbed/drawer-based,
- Kanban becomes horizontally scrollable.

Do not simply shrink desktop screens onto mobile.

---

# 33. Accessibility Requirements

The UI should be usable through keyboard navigation and assistive technology. Verify contrast in both light and dark themes, including translucent/glassmorphic panels over the actual page background.

Required considerations:

- semantic HTML,
- visible focus states,
- keyboard-accessible menus,
- keyboard-accessible drag alternatives,
- accessible dialog focus management,
- meaningful labels,
- status information not conveyed solely through color,
- reduced-motion support,
- readable contrast.

---

# 34. AI-Specific UX Rules

## AI should always communicate scope

When operating inside a client/project/document context, display a compact indicator such as:

> Context: Globex Corporation / Customer Portal

or:

> Context: Contract.pdf

This prevents users from wondering what the AI is using.

## AI processing should be observable

Use stage-based progress for longer operations.

## AI should cite sources where appropriate

Clickable citations should lead to source material.

## AI should distinguish fact from suggestion

For example:

**Found in your data**

versus:

**Recommended next step**

## AI actions require human confirmation

Especially for:

- creating tasks,
- sending emails,
- changing project statuses,
- updating client records,
- triggering external integrations.

## AI failure should be recoverable

Keep the original prompt, provide retry, and preserve previous messages.

---

# 35. Important Micro-Interactions

The following subtle interactions should be present throughout the application:

### Hover

Cards and actionable rows should provide a slight elevation/border/visual emphasis.

### Save

Successful save should use a compact check confirmation or toast.

### Copy

Copyable information should show a temporary "Copied" state.

### Status change

When status changes, the new badge should transition smoothly rather than abruptly changing.

### Completion

Task completion can use a restrained check animation.

### Delete

Use a clear destructive confirmation state.

### Filters

Filter chips should animate in/out when applied or removed.

### Skeleton replacement

Content should transition smoothly from skeleton to loaded state, avoiding layout jumps.

### AI output

Streaming should feel natural, with a subtle generation indicator rather than a flashing or noisy animation.

### Notifications

New notifications may animate in subtly, but must not distract from the current task.

---

# 36. Contextual Action Philosophy

The same operation should be accessible from multiple sensible locations without duplicating unnecessary UI.

Examples:

### Create task

Available from:

- global create,
- project page,
- client page,
- AI proposed action,
- task page.

### Upload document

Available from:

- global create,
- documents page,
- client page,
- project page.

### Ask AI

Available from:

- global AI page,
- client page,
- project page,
- document page,
- dashboard.

The AI should automatically inherit the most relevant context where appropriate.

---

# 37. Breadcrumbs

Use breadcrumbs on deeper detail pages.

Example:

```text
Clients / Globex Corporation / Projects / Customer Portal
```

On very deep pages, breadcrumbs prevent the user from feeling trapped in nested content.

---

# 38. Confirmation and Undo

Actions such as:

- changing task status,
- moving tasks,
- archiving items,
- changing client associations,
- changing automation states

should provide immediate feedback.

Where safely reversible, offer:

> Undo

through the toast.

Destructive actions that cannot be safely reversed should use confirmation dialogs.

---

# 39. Page-Level State Requirements

Every page in the application must have at minimum:

1. Initial/loading state
2. Normal populated state
3. Empty state
4. Error state
5. Permission-denied state where relevant
6. No-results state after filtering/search
7. Saving/submitting state where applicable

AI-specific screens also need:

- generating,
- streaming,
- generation failed,
- action awaiting approval,
- action completed,
- action rejected.

Document screens also need:

- uploading,
- processing,
- indexing,
- ready,
- failed.

Automation screens also need:

- active,
- paused,
- running,
- successful,
- failed,
- retrying.

---

# 40. Recommended Primary Demo Path

The UI should be designed so a portfolio reviewer can understand the entire product through one coherent demonstration.

The ideal route is:

```text
Sign Up
  ↓
Create Organization
  ↓
Dashboard
  ↓
Create Client
  ↓
Create Project
  ↓
Assign Team
  ↓
Upload Client Document
  ↓
Watch Document Processing
  ↓
Open Project AI
  ↓
Ask: "What is blocking this project?"
  ↓
AI retrieves project + task + document context
  ↓
AI identifies blocker
  ↓
AI proposes a task
  ↓
User reviews and approves
  ↓
Task appears in Project Board
  ↓
Automation reacts to the task/project state
  ↓
Client portal shows selected project information
  ↓
Client approves milestone
  ↓
Dashboard reflects updated state
```

This demo should require no artificial narration to make the product understandable. The interface itself should tell the story.

---

# 41. The Three Hero Experiences

Although the application contains many screens, three experiences deserve the highest UI polish.

## 41.1 Dashboard

The dashboard should feel like a business command center without using graphs. It should answer:

- What is happening?
- What needs attention?
- What is late?
- Who is responsible?
- Which clients need attention?
- What documents changed?
- What does the AI recommend?

## 41.2 Client/Project Workspace

The client and project pages should make relationships obvious:

```text
Client
  ↓
Project
  ↓
Team
  ↓
Tasks
  ↓
Documents
  ↓
Activity
  ↓
AI Context
```

## 41.3 AI Assistant

The AI interface should feel deeply connected to the application:

- contextual,
- source-grounded,
- action-oriented,
- permission-aware,
- visually distinct from ordinary application loading.

---

# 42. Overall Product Feel

The finished UI should follow the **existing Dashboard's visual language** rather than inventing a new one. Use componentization to keep the product consistent, a deliberate mixture of glassmorphic and solid surfaces, opacity variation for bold palette colors, restrained corner radii, and only the borders needed to separate or focus content. The authenticated app's sidebar and top bar remain fixed while the main content scrolls. The entire interface, including glass effects and loaders, supports both light and dark modes.

The finished UI should communicate:

**Calm** — even with lots of information.

**Precise** — statuses and actions are unambiguous.

**Fast** — interactions give immediate feedback.

**Intelligent** — AI appears where it is genuinely useful.

**Operational** — the software is designed around work getting done.

**Professional** — it should be believable as software used by paying companies.

The application should never feel like:

- a generic admin template,
- a ChatGPT wrapper,
- a collection of disconnected dashboards,
- a beginner CRUD project,
- or a visual showcase with little operational depth.

It should feel like a real SaaS product whose interface was designed around the day-to-day reality of a service business.

---

# 43. Final UI Structure

```text
OPSPILOT
│
├── Public Website
│   ├── Home
│   └── Pricing
│
├── Authentication
│   ├── Sign Up
│   ├── Sign In
│   ├── Verify Email
│   ├── Forgot Password
│   └── Reset Password
│
├── Onboarding
│   ├── Organization
│   ├── Team
│   ├── First Client
│   └── Completion
│
├── Main App
│   ├── Dashboard
│   ├── AI Assistant
│   ├── Clients
│   │   └── Client Detail
│   ├── Projects
│   │   └── Project Detail
│   ├── Tasks
│   ├── Documents
│   │   └── Document Viewer
│   ├── Automations
│   │   ├── Automation Builder
│   │   └── Automation Detail
│   ├── Reports
│   ├── Team
│   ├── Billing
│   └── Settings
│
├── Client Portal
│   ├── Sign In
│   ├── Home
│   ├── Project
│   ├── Approvals
│   ├── Documents
│   ├── Messages
│   └── Profile
│
└── Platform Admin
    ├── Overview
    ├── Organizations
    ├── Organization Detail
    └── AI Quality
```

---

# 44. UI Completion Standard

The UI is considered complete only when every primary screen has:

- clear hierarchy,
- polished populated state,
- empty state,
- loading state,
- error state,
- permission-aware state where applicable,
- responsive layout,
- keyboard/accessibility behavior,
- subtle motion,
- correct contextual actions,
- consistent navigation,
- consistent feedback,
- appropriate AI/regular/document/automation loaders,
- reusable components for meaningful sections and repeated interactions,
- a fixed authenticated-app sidebar and top bar with independently scrollable main content,
- working light and dark modes for all visible states and overlays,
- a balanced mix of glassmorphic and solid surfaces, following the existing Dashboard,
- restrained corner radii and purposeful rather than excessive borders,
- and obvious relationships between clients, projects, people, documents, tasks, and AI.

Before declaring the final product complete, verify that the existing Dashboard still looks and behaves as it did before unrelated pages were added or refactored. Check its original fonts, text colors, background colors, glass treatment, component sizing, and interactions. Also verify the fixed shell, independent content scrolling, reusable components, and light/dark themes across the entire app.

The final product should be sufficiently polished that a prospective Upwork client can enter the live demo without being told what to click and quickly infer:

> **This developer understands how to design and build serious SaaS products.**
