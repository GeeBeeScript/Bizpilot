import '@/components/marketing/marketing.css'
import MarketingHeader from '@/components/marketing/MarketingHeader'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { RevealObserver } from '@/components/marketing/RevealObserver'

/** Public website shell — Nimble-style, light only (see marketing.css) */
const MarketingLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="mk">
    <MarketingHeader />
    <main id="main">{children}</main>
    <MarketingFooter />
    <RevealObserver />
  </div>
)

export default MarketingLayout
