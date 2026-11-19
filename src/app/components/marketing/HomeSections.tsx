import Link from "next/link";
import { BadgeCheck, ChevronDown, Download, EyeOff, Hash, Inbox, KeyRound, Lock, Mail, MessageSquareText, FileText, Network, ShieldCheck, Sparkles, Zap, Search, Check } from "lucide-react";
import { GitTree } from "./GitTree";
import { AIWindowMock, CommandPaletteMock, IntegrationsMock, RequestsMock, WorkspaceMock } from "./Mockups";
import { faqs } from "@/lib/mock/marketing";

const CheckItem = ({ children }: { children: React.ReactNode }) => (
  <li><span className="mk-ok" aria-hidden><Check strokeWidth={3.2} /></span> <span>{children}</span></li>
);

const Hero = () => (
  <section className="mk-hero">
    <div className="mk-container mk-hero-copy" data-tree="hero-container">
      <h1 className="mk-display-xl" data-tree="h1">The client workspace<br />built for&nbsp;AI.</h1>
      <p className="mk-lede mk-hero-lede" data-tree="lede">
        BizPilot is one workspace for clients, projects and documents, built to live alongside your AI. Ask about any client,
        get an answer with sources, then approve the next step without breaking flow. No tool sprawl, no clutter.
      </p>
      <div className="mk-hero-cta" data-tree="cta">
        <Link href="/signup" className="mk-btn mk-btn-primary mk-btn-lg mk-squircle"><Sparkles className="size-[18px]" aria-hidden /> Start free trial</Link>
        <Link href="/pricing" className="mk-btn mk-btn-secondary mk-btn-lg mk-squircle">Plans from $29</Link>
      </div>
      <p className="mk-hero-micro" data-tree="micro">Free 14-day trial · No card required · EU or US data regions · Cancel anytime</p>
    </div>
    <div className="mk-container-wide mk-hero-mockup" data-reveal>
      <div className="mk-window-frame mk-hero-window" data-tree="window">
        <WorkspaceMock />
      </div>
    </div>
  </section>
);

const CommandSection = () => (
  <section id="workflow" className="mk-section mk-band" data-tree-feature>
    <div className="mk-container-wide">
      <header className="mk-section-head" data-reveal>
        <h2 className="mk-display">Your entire business,<br />one command palette.</h2>
        <p className="mk-lede mk-section-sub">
          Press <kbd className="mk-kbd">⌘K</kbd> to jump to any client, project or document, or ask BizPilot AI straight in. Create tasks,
          upload files, switch clients, find an invoice and much more, all without leaving the keyboard.
        </p>
      </header>
      <div className="mk-palette-visual" data-reveal>
        <CommandPaletteMock />
      </div>
    </div>
  </section>
);

const AISection = () => (
  <section className="mk-section" data-tree-feature>
    <div className="mk-container-wide">
      <header className="mk-section-head" data-reveal>
        <h2 className="mk-display">BizPilot AI already knows<br />the right client.</h2>
        <p className="mk-lede mk-section-sub" style={{ maxWidth: "60ch" }}>
          Ask from a client email, a Slack thread or a contract. BizPilot identifies the client and project and opens with the right
          context already selected. AI proposes the next steps, then <kbd className="mk-kbd">⇧Tab</kbd> approves them. No copy-pasting.
          No tab switching.
        </p>
      </header>
      <div className="mk-ai-visual">
        <div className="mk-ai-stage">
          <div className="mk-chips">
            <span className="mk-chip mk-chip-lg mk-squircle" style={{ ["--rot" as string]: "-9deg", ["--dur" as string]: "6.5s", top: "16%", left: -44, background: "#d97757" }}><Mail /></span>
            <span className="mk-chip mk-chip-lg mk-squircle" style={{ ["--rot" as string]: "8deg", ["--dur" as string]: "7.5s", ["--delay" as string]: "-2.5s", top: "42%", right: -44, background: "#10a37f" }}><MessageSquareText /></span>
            <span className="mk-chip mk-chip-lg mk-squircle" style={{ ["--rot" as string]: "-7deg", ["--dur" as string]: "8s", ["--delay" as string]: "-4.5s", bottom: -46, left: "30%", background: "linear-gradient(135deg,#4285f4,#9b72cb,#d96570)" }}><FileText /></span>
          </div>
          <div data-reveal><AIWindowMock /></div>
        </div>
      </div>
    </div>
  </section>
);

const IntegrationsSection = () => (
  <section className="mk-section mk-band" data-tree-feature>
    <div className="mk-container mk-split">
      <div data-reveal>
        <h2 className="mk-display-lg">Google, Slack and Stripe, built in.</h2>
        <p className="mk-lede">
          Work with the tools your team already lives in without breaking your flow. Calendar, files, messages and payments are part
          of the same connected workspace as everything else in BizPilot.
        </p>
        <ul className="mk-check-list">
          <CheckItem>Attach Drive files and Gmail threads to any client</CheckItem>
          <CheckItem>Get approvals and alerts in Slack</CheckItem>
          <CheckItem>Search invoices quickly from the <kbd className="mk-kbd">⌘K</kbd> command palette</CheckItem>
          <CheckItem>Trigger automations when a payment fails</CheckItem>
        </ul>
      </div>
      <div className="mk-integration mk-visual-first" data-reveal>
        <IntegrationsMock />
        <span className="mk-chip mk-chip-sm mk-squircle" style={{ ["--rot" as string]: "-8deg", ["--dur" as string]: "7s", top: -30, right: "17%", background: "#4a154b" }}><Hash /></span>
        <span className="mk-chip mk-chip-sm mk-squircle" style={{ ["--rot" as string]: "-7deg", ["--dur" as string]: "8s", ["--delay" as string]: "-4s", left: "17%", bottom: -30, background: "#635bff", fontWeight: 800, fontSize: 28 }}>S</span>
      </div>
    </div>
  </section>
);

const RequestsSection = () => (
  <section className="mk-section" data-tree-feature>
    <div className="mk-container mk-split">
      <div className="mk-integration mk-visual-first" data-reveal>
        <RequestsMock />
        <span className="mk-chip mk-chip-sm mk-squircle" style={{ ["--rot" as string]: "8deg", ["--dur" as string]: "7.5s", ["--delay" as string]: "-2s", top: "40%", left: -30, background: "#18181a" }}><Inbox /></span>
      </div>
      <div data-reveal>
        <h2 className="mk-display-lg">Turn client requests into tasks.</h2>
        <p className="mk-lede">Keep requests close to the work. Capture one from an email or the client portal, or pick an existing request and start a correctly scoped task from it.</p>
        <ul className="mk-check-list">
          <CheckItem>Capture requests without leaving BizPilot</CheckItem>
          <CheckItem>Find an existing request from <kbd className="mk-kbd">⌘K</kbd></CheckItem>
          <CheckItem>Create a task with the right project, owner and due date</CheckItem>
        </ul>
      </div>
    </div>
  </section>
);

const stats = [
  { icon: Zap, k: "Instant", v: "search across everything" },
  { icon: Network, k: "Connected", v: "clients, projects, docs & AI" },
  { icon: Search, k: "Grounded", v: "AI answers with sources" },
  { icon: ShieldCheck, k: "Zero", v: "AI actions without approval" },
];

const StatsSection = () => (
  <section className="mk-section mk-band" data-tree-feature>
    <div className="mk-container mk-split">
      <div className="mk-stat-grid" data-reveal>
        {stats.map((s, i) => (
          <div key={s.k} className="mk-stat" style={{ ["--i" as string]: i }}>
            <s.icon className="size-6" strokeWidth={1.75} aria-hidden />
            <span className="mk-stat-k">{s.k}</span>
            <span className="mk-stat-v">{s.v}</span>
          </div>
        ))}
      </div>
      <div data-reveal>
        <h2 className="mk-display-lg">Not five tools stitched together.</h2>
        <p className="mk-lede">
          BizPilot is one connected workspace, so clients, projects, documents and AI share the same data and nothing is copied between
          tools. No sync jobs. No stale dashboards. Just open a client and everything&apos;s there.
        </p>
      </div>
    </div>
  </section>
);

const privacy = [
  { icon: KeyRound, title: "Encrypted everywhere", body: "TLS in transit and AES-256 at rest, with keys managed per region." },
  { icon: BadgeCheck, title: "Permission-aware AI", body: "AI only reads what the person asking can see. Nothing leaks across roles." },
  { icon: EyeOff, title: "Client isolation", body: "Client contacts see only what you share. Internal notes never leave your team." },
  { icon: Download, title: "Export anytime", body: "Your data is yours. Export everything as CSV and original files in one click." },
];

const PrivacySection = () => (
  <section className="mk-section" data-tree-feature>
    <div className="mk-container">
      <header className="mk-section-head" data-reveal>
        <h2 className="mk-display">Your data stays yours.</h2>
        <p className="mk-lede mk-section-sub">No training on your data. No surprises. Your clients see only what you choose to share.</p>
      </header>
      <div className="mk-feature-grid" data-reveal>
        {privacy.map((c) => (
          <div key={c.title} className="mk-cell">
            <c.icon className="size-6" strokeWidth={1.6} aria-hidden />
            <h3 className="mk-cell-title">{c.title}</h3>
            <p className="mk-cell-body">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PricingSection = () => (
  <section className="mk-section mk-band" data-tree-end>
    <div className="mk-container mk-pricing">
      <div data-reveal>
        <h2 className="mk-display-lg">Simple pricing.<br />Everything included.</h2>
        <p className="mk-lede" style={{ marginTop: 20 }}>BizPilot AI, the client portal and automations on every team plan.</p>
      </div>
      <div data-reveal>
        <div className="mk-price-card mk-squircle">
          <div className="mk-price-head"><span className="mk-price-amount">$99</span><span className="mk-price-term">per month</span></div>
          <p className="mk-price-note">Growth plan · 20 team members · 10,000 AI credits · unlimited projects</p>
          <div className="mk-price-actions">
            <Link href="/signup?plan=growth" className="mk-btn mk-btn-primary mk-btn-lg mk-btn-block mk-squircle">Start your free trial</Link>
            <Link href="/pricing" className="mk-btn mk-btn-secondary mk-btn-lg mk-btn-block mk-squircle">Or compare all plans</Link>
          </div>
          <p className="mk-price-guarantee"><Check className="size-4" aria-hidden /> 14-day free trial · cancel anytime</p>
          <p className="mk-price-trust"><Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden /> <span>Secure checkout by Stripe · VAT &amp; sales tax handled · cards &amp; bank transfer</span></p>
        </div>
      </div>
    </div>
  </section>
);

const FAQSection = () => (
  <section className="mk-section">
    <div className="mk-container-prose">
      <header className="mk-section-head mk-section-head-left" data-reveal>
        <h2 className="mk-display">Frequently Asked Questions</h2>
      </header>
      <div>
        {faqs.map((f) => (
          <details key={f.q} className="mk-faq-item">
            <summary><span>{f.q}</span><ChevronDown className="size-5" aria-hidden /></summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="mk-section mk-band">
    <div className="mk-container mk-final mk-squircle" data-reveal>
      <h2 className="mk-display-lg">Give your clients the workspace they deserve.</h2>
      <p className="mk-lede">Start your free trial, or see which plan fits your team.</p>
      <div className="mk-hero-cta">
        <Link href="/signup" className="mk-btn mk-btn-primary mk-btn-lg mk-squircle">Start free trial</Link>
        <Link href="/pricing" className="mk-btn mk-btn-secondary mk-btn-lg mk-squircle">See pricing</Link>
      </div>
      <p className="mk-hero-micro">Free 14-day trial · No card required · Cancel anytime</p>
    </div>
  </section>
);

/** Home page. Direct children are sections so the git tree can read their backgrounds. */
export const HomePage = () => (
  <div className="relative">
    <GitTree />
    <Hero />
    <CommandSection />
    <AISection />
    <IntegrationsSection />
    <RequestsSection />
    <StatsSection />
    <PrivacySection />
    <PricingSection />
    <FAQSection />
    <FinalCTA />
  </div>
);
