import "@/app/components/marketing/marketing.css";
import MarketingHeader from "@/app/components/marketing/MarketingHeader";
import MarketingFooter from "@/app/components/marketing/MarketingFooter";
import { RevealObserver } from "@/app/components/marketing/RevealObserver";

/** Public website shell — Nimble-style, light only (see marketing.css) */
const MarketingLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="mk">
    <MarketingHeader />
    <main id="main">{children}</main>
    <MarketingFooter />
    <RevealObserver />
  </div>
);

export default MarketingLayout;
