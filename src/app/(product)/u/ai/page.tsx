import AIAssistantComp from '@/components/pagecomponents/AIAssistantComp'
import { conversations } from '@/lib/mock/ai'

export const metadata = { title: 'AI Assistant' }

const AIPage = async ({ searchParams }: PageProps<'/u/ai'>) => {
  const { q, state } = await searchParams
  return <AIAssistantComp conversations={state === 'empty' ? [] : conversations} initialPrompt={typeof q === 'string' ? q : undefined} />
}

export default AIPage
