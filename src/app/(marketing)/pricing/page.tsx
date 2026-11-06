import { Pricing } from '@/components/marketing/PricingSections'
import { plans } from '@/lib/mock/organization'
import { comparisonRows, faqs } from '@/lib/mock/marketing'

export const metadata = { title: 'Pricing' }

const PricingPage = () => <Pricing plans={plans} rows={comparisonRows} faqs={faqs} />

export default PricingPage
