import {
  ArrowRightLeft,

  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  ClipboardPlus,
  Download,
  FileText,
  FilePlus2,
  Folder,
  FolderOpen,
  FolderPlus,
  Hash,
  Inbox,
  ListChecks,
  Mail,
  MessageSquareText,
  PanelLeft,
  Plug,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Upload,
  UserRoundPlus,
  Wand2,
} from "lucide-react";

const Tick = () => (
  <span className="mk-check">
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2l2.3 2.3 4.7-5" /></svg>
  </span>
);

/* ---------- Hero: BizPilot workspace window ---------- */
const clientsList: [string, string, string][] = [
  ["Globex Corporation", "GC", "#2563A8"], ["Acme Retail", "AR", "#d84848"], ["Initech", "IN", "#123A63"], ["Nipe Corporation", "NC", "#009e66"],
  ["Gale Logistics", "GL", "#d28a24"], ["Umbrella Health", "UH", "#C9A45C"], ["Stark Fintech", "SF", "#5e6ad2"], ["Northwind Studio", "NS", "#0ea5e9"],
  ["Brightpath", "BP", "#16866A"], ["Kite & Co", "KC", "#ec4899"], ["Orbit IT", "OI", "#555b65"], ["Loom & Loft", "LL", "#9b5de5"],
  ["Halcyon Labs", "HL", "#00a6a6"], ["Meridian Law", "ML", "#f59e0b"], ["Quarry & Co", "QC", "#cf4850"],
];
const tasks: [string, string, string?][] = [
  ["T", "Claims status timeline"], ["R", "Review change request #4"], ["T", "Policy documents download"], ["B", "Resolve API authentication", "is-red"],
  ["N", "Mock auth service for QA", "is-green"], ["T", "SSO login flow QA"], ["T", "Accessibility audit"], ["R", "Claims flow beta sign-off"],
  ["T", "Notification preferences"], ["T", "Load testing plan"], ["T", "Policy API contract tests"], ["R", "Release notes v0.9"], ["N", "Weekly client update", "is-green"],
];

const Line = ({ n, kw, rest, sym, added }: { n?: number; kw: string; rest: string; sym: string; added?: boolean }) => (
  <div className={`mk-line ${added ? "is-added" : ""}`}>
    <span>{n ?? ""}</span>
    <b>{added ? "+" : ""}</b>
    <span><span className="mk-kw">{kw}</span> {rest} <span className="mk-sym">{sym}</span></span>
  </div>
);

export const WorkspaceMock = () => (
  <div className="mk-window">
    <div className="mk-ws" aria-hidden>
      <aside className="mk-pane mk-ws-sidebar">
        <div className="mk-toolbar">
          <div className="mk-lights"><i /><i /><i /></div>
          <PanelLeft className="size-[1.5cqi] text-[var(--mk-mock-text-3)]" />
        </div>
        <div className="mk-nav-label"><ChevronRight className="size-[1.1cqi]" /> Workspace</div>
        <div className="mk-nav-label"><ChevronDown className="size-[1.1cqi]" /> Clients</div>
        {clientsList.map(([name, ini, col], i) => (
          <div key={name} className={`mk-row ${i === 0 ? "is-current" : ""}`}>
            <span className="mk-avatar" style={{ background: col }}>{ini}</span>
            <span>{name}</span>
          </div>
        ))}
      </aside>
      <section className="mk-pane mk-ws-pane-mid">
        <div className="mk-toolbar">
          <div className="mk-pill"><FolderPlus /><ListChecks /></div>
          <div className="mk-title-block" style={{ marginRight: "auto", marginLeft: "1.2cqi" }}>
            <strong>Customer Portal</strong>
            <span>Globex Corporation</span>
          </div>
        </div>
        <div className="mk-list-head">
          <span><strong>Open tasks</strong><b>13</b></span>
          <span className="flex items-center gap-[0.6cqi]">All <Tick /></span>
        </div>
        {tasks.map(([s, t, tone], i) => (
          <div key={t} className={`mk-file ${i === 3 ? "is-selected" : ""}`}>
            <Tick />
            <span className={`mk-status ${tone ?? ""}`}>{s}</span>
            <span>{t}</span>
          </div>
        ))}
      </section>
      <section className="mk-pane">
        <div className="mk-toolbar" style={{ justifyContent: "flex-end", gap: "1cqi" }}>
          <div className="mk-pill"><Brain /><ArrowRightLeft /></div>
          <div className="mk-pill"><RefreshCw /><Download /><Upload /></div>
        </div>
        <div className="mk-hunk">
          <div className="mk-hunk-head"><span>Activity · Today</span><span>Mark all read</span></div>
          <Line n={9} kw="moved" rest="BP-104 to" sym="Review" />
          <Line n={10} kw="uploaded" rest="Security" sym="Requirements.pdf" />
          <Line n={11} kw="commented" rest="on" sym="SSO checklist" />
          <Line kw="ai.suggest" rest="mock auth service for" sym="QA" added />
          <Line n={12} kw="approved" rest="budget for" sym="CR #4" />
          <Line n={13} kw="assigned" rest="SSO QA to" sym="Tom Becker" />
        </div>
        <div className="mk-hunk">
          <div className="mk-hunk-head"><span>AI brief · Risks</span><span>Ask a follow-up</span></div>
          <Line n={1} kw="risk" rest="API milestone slips" sym="4–6 days" />
          <Line n={2} kw="risk" rest="Storefront budget at" sym="82%" />
          <Line kw="recommend" rest="escalate credentials to" sym="Raj Patel" added />
          <Line kw="recommend" rest="schedule Umbrella" sym="check-in" added />
          <Line n={3} kw="watch" rest="Umbrella renewal in" sym="30 days" />
        </div>
        <div className="mk-hunk">
          <div className="mk-hunk-head"><span>Upcoming · This week</span><span>Open calendar</span></div>
          <Line n={14} kw="due" rest="Change request" sym="decision" />
          <Line n={16} kw="milestone" rest="Compliance" sym="review" />
          <Line kw="ai.draft" rest="client status" sym="update" added />
        </div>
      </section>
    </div>
  </div>
);

/* ---------- ⌘K command palette ---------- */
const commands: { icon: typeof Brain; label: string; keys?: string[] }[] = [
  { icon: Sparkles, label: "Ask BizPilot AI", keys: ["tab"] },
  { icon: Wand2, label: "AI summarize this client", keys: ["⇧", "tab"] },
  { icon: MessageSquareText, label: "AI draft a client status update", keys: ["⌥", "⇧", "tab"] },
  { icon: CircleCheck, label: "Mark task complete", keys: ["⇧", "⌘", "C"] },
  { icon: UserRoundPlus, label: "Create client" },
  { icon: FolderPlus, label: "New project", keys: ["⌘", "P"] },
  { icon: ClipboardPlus, label: "New task", keys: ["⌘", "T"] },
  { icon: FilePlus2, label: "Upload document", keys: ["⇧", "⌘", "U"] },
  { icon: Receipt, label: "Find an invoice", keys: ["⌥", "⌘", "I"] },
  { icon: ArrowRightLeft, label: "Switch client", keys: ["⌥", "⌘", "K"] },
];

export const CommandPaletteMock = () => (
  <div className="mk-palette mk-squircle" aria-hidden>
    <div className="mk-palette-search"><Search className="size-5" /> <span>Search clients, tasks and documents, or ask AI…</span></div>
    <div className="mk-cmd-list">
      {commands.map((c, i) => (
        <div key={c.label} className={`mk-cmd ${i === 0 ? "is-selected" : ""}`}>
          <span className="mk-cmd-icon"><c.icon /></span>
          <span className="mk-cmd-label">{c.label}</span>
          {c.keys && <span className="mk-shortcut">{c.keys.map((k, j) => <kbd key={j} className={k === "tab" ? "wide" : ""}>{k}</kbd>)}</span>}
        </div>
      ))}
    </div>
    <div className="mk-palette-footer">
      <span className="mk-footer-hint"><kbd>⇧</kbd><kbd className="wide">tab</kbd><span>Ask</span></span>
      <span className="mk-footer-hint"><kbd>⌥</kbd><kbd>⇧</kbd><kbd className="wide">tab</kbd><span>Ask and create task</span></span>
    </div>
  </div>
);

/* ---------- AI window (Quick Commit analogue) ---------- */
const proposed: [string, string, string?][] = [
  ["T", "Mock policy-API auth service"], ["T", "Escalate credentials to Raj Patel"], ["N", "Client update: Customer Portal", "is-green"], ["R", "Re-sequence SSO QA"],
  ["T", "Contract tests against stub"], ["N", "Risk note for Globex renewal", "is-green"], ["T", "Book Thursday check-in"], ["R", "Confirm CR #4 budget"],
];
const contextLines: [number | null, number, string, boolean?][] = [
  [16, 16, "> FOUND: BP-101 blocked for 8 days"],
  [17, 17, "> FOUND: Security Req. §2.3 needs client OAuth"],
  [18, 18, "> FOUND: health changed to At risk yesterday"],
  [null, 19, "> PROPOSE: mock auth so QA can continue", true],
  [null, 20, "> PROPOSE: escalate to Raj with 48h deadline", true],
  [null, 21, "> PROPOSE: send John a status update", true],
  [null, 22, "> PROPOSE: re-plan SSO QA after credentials", true],
  [19, 23, "> NOTE: launch still possible on Oct 30"],
  [20, 24, "> NOTE: CR #4 adds ~9 working days"],
  [null, 25, "> PROPOSE: confirm CR #4 budget with Linda", true],
  [null, 26, "> PROPOSE: log risk on Globex renewal", true],
];

export const AIWindowMock = () => (
  <div className="mk-qc mk-squircle" aria-hidden>
    <header className="mk-qc-toolbar">
      <div className="mk-qc-repo"><Folder /> <strong>Globex Corporation</strong> <ChevronDown /></div>
      <div className="mk-qc-status">
        <span><FolderOpen /> <strong>Customer Portal</strong></span>
        <span className="mk-qc-diffstat"><span style={{ color: "var(--mk-positive)" }}>+6 tasks</span> <span style={{ color: "var(--mk-negative)" }}>−1</span></span>
        <span className="mk-qc-dots"><i /><i /><i /><i /><i className="is-red" /></span>
      </div>
    </header>
    <div className="mk-qc-work">
      <section className="mk-qc-files">
        <div className="mk-qc-head"><span><strong>Proposed</strong><b>8</b></span><span className="flex items-center gap-[1cqi]">All <Tick /></span></div>
        {proposed.map(([s, t, tone], i) => (
          <div key={t} className={`mk-qc-file ${i === 0 ? "is-selected" : ""}`}>
            <Tick /><span className={`mk-status ${tone ?? ""}`}>{s}</span><span>{t}</span>
          </div>
        ))}
      </section>
      <section className="mk-qc-diff">
        <div className="mk-qc-chunk"><span>Context: 14 sources</span><strong>Edit context</strong></div>
        {contextLines.map(([a, b, text, added]) => (
          <div key={b} className={`mk-qc-line ${added ? "is-added" : ""}`}>
            <span>{a ?? ""}</span><span>{b}</span><b>{added ? "+" : ""}</b><code>{text}</code>
          </div>
        ))}
      </section>
    </div>
    <div className="mk-qc-compose">
      <span style={{ color: "var(--mk-mock-text-1)" }}>Unblock Customer Portal: 6 tasks and a client update</span>
      <div className="mk-qc-actions">
        <span className="mk-qc-push"><Tick /> Notify client</span>
        <span className="mk-qc-button">Approve</span>
      </div>
    </div>
  </div>
);

/* ---------- Integrations card ---------- */
export const IntegrationsMock = () => (
  <div className="mk-int-card mk-squircle" aria-hidden>
    <div className="mk-int-head"><Plug className="size-4" /> Connected services</div>
    <div className="mk-int-list">
      {[
        { name: "Google Workspace", meta: "Calendar · Drive · Gmail", bg: "#4285f4", mark: "G" },
        { name: "Slack", meta: "Notifications · Approvals", bg: "#4a154b", mark: <Hash className="size-5" /> },
        { name: "Stripe", meta: "Invoices · Payment alerts", bg: "#635bff", mark: "S" },
      ].map((r) => (
        <div key={r.name} className="mk-int-row">
          <span className="mk-int-mark" style={{ background: r.bg }}>{r.mark}</span>
          <span className="mk-int-copy"><strong>{r.name}</strong><small>{r.meta}</small></span>
          <span className="mk-ok mk-ok-sm"><Check strokeWidth={3.4} /></span>
        </div>
      ))}
    </div>
  </div>
);

/* ---------- Requests → tasks palette (Linear analogue) ---------- */
const requests: { id: string; title: string; started?: boolean; labels: [string, string][]; prio?: boolean }[] = [
  { id: "GLX-312", title: "Add an appeal step to the claims flow", started: true, labels: [["Change request", "#eb5757"], ["Globex", "#45b985"]], prio: true },
  { id: "ACM-298", title: "Show delivery estimates at checkout", labels: [["Acme Retail", "#5e6ad2"], ["Improvement", "#4aa8f0"]] },
  { id: "NIP-287", title: "Export invoices as CSV for finance", labels: [["Nipe", "#5e6ad2"], ["Finance", "#45b985"], ["Request", "#4aa8f0"]], prio: true },
  { id: "UMB-264", title: "Large-print option on intake forms", labels: [["Umbrella", "#45b985"], ["Accessibility", "#b47cf4"]], prio: true },
  { id: "GAL-243", title: "Live map for delayed shipments", labels: [["Gale", "#45b985"], ["Feature", "#b47cf4"]], prio: true },
  { id: "INI-219", title: "Nightly report of failed imports", labels: [["Feature", "#b47cf4"]], prio: true },
];

export const RequestsMock = () => (
  <div className="mk-req mk-squircle" aria-hidden>
    <div className="mk-req-search">
      <span className="mk-req-scope"><Inbox className="size-3.5" /><strong>Requests</strong></span>
      <i className="mk-req-caret" /> Search client requests
    </div>
    <div className="mk-req-list">
      {requests.map((r, i) => (
        <div key={r.id} className={`mk-req-row ${i === 0 ? "is-selected" : ""}`}>
          <div className="mk-req-top">
            <i className={`mk-req-state ${r.started ? "is-started" : ""}`} />
            <span className="mk-req-id">{r.id}</span>
            <span className="mk-req-title">{r.title}</span>
            {r.prio && <span className="mk-req-prio">!</span>}
          </div>
          <div className="mk-req-meta">{r.labels.map(([l, c]) => <span key={l}><i style={{ ["--l" as string]: c }} />{l}</span>)}</div>
        </div>
      ))}
    </div>
    <div className="mk-req-footer">
      <span><kbd>↩</kbd> Create task</span>
      <span><kbd>⌘</kbd><kbd>↩</kbd> Open request</span>
    </div>
  </div>
);

/* Floating provider chips (no third-party logos — simple marks) */
export const ChipIcons = { Mail, MessageSquareText, FileText, Hash, Inbox, Send, Check, Sparkles };
