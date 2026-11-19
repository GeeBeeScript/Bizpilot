import Link from "next/link";
import { MkLogo } from "./MarketingHeader";

const cols = [
  { title: "Product", links: [{ label: "Features", href: "/#workflow" }, { label: "Pricing", href: "/pricing" }, { label: "Sign in", href: "/login" }] },
  { title: "Support", links: [{ label: "Help & docs", href: "/help" }, { label: "Documentation", href: "/docs" }, { label: "Contact", href: "mailto:hello@bizpilot.app" }] },
  { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Security", href: "/security" }] },
];

/** Public site footer (Nimble-style) */
const MarketingFooter = () => (
  <footer className="mk-footer">
    <div className="mk-container mk-footer-inner">
      <div>
        <MkLogo />
        <p className="mk-footer-tagline">One connected workspace for client work, projects, documents and AI.</p>
        <p className="mk-footer-meta">Works in any modern browser · EU and US data regions</p>
      </div>
      <nav className="mk-footer-cols" aria-label="Footer">
        {cols.map((c) => (
          <div key={c.title} className="mk-footer-col">
            <h2 className="mk-footer-title">{c.title}</h2>
            <ul>{c.links.map((l) => <li key={l.label}><Link href={l.href}>{l.label}</Link></li>)}</ul>
          </div>
        ))}
      </nav>
    </div>
    <div className="mk-container mk-footer-bottom">
      <p>© {new Date().getFullYear()} BizPilot. The client operations workspace built for AI.</p>
    </div>
  </footer>
);

export default MarketingFooter;
