import { notFound } from 'next/navigation'
import Link from 'next/link'

// Lightweight info pages linked from the header, footer and auth forms. Replace copy with real content.
const pages: Record<string, { title: string; intro: string; sections: { h: string; p: string }[] }> = {
  terms: { title: 'Terms & conditions', intro: 'These terms govern your use of BizPilot.', sections: [
    { h: 'Your account', p: 'You are responsible for activity in your workspace and for keeping credentials secure.' },
    { h: 'Your data', p: 'You own your data. You can export or delete it at any time from Settings → Data.' },
    { h: 'AI features', p: 'AI output may be inaccurate. Proposed actions always require a person to approve them.' },
  ] },
  privacy: { title: 'Privacy policy', intro: 'How we collect, use and protect information.', sections: [
    { h: 'What we collect', p: 'Account details, workspace content you upload, and usage needed to run the service.' },
    { h: 'How AI uses your data', p: 'Your content is used to answer your questions within your workspace. It is not used to train shared models.' },
    { h: 'Your rights', p: 'Access, export, correct or delete your data at any time.' },
  ] },
  security: { title: 'Security', intro: 'Security is built into how BizPilot stores and processes your work.', sections: [
    { h: 'Encryption', p: 'TLS 1.2+ in transit and AES-256 at rest.' },
    { h: 'Access control', p: 'Role-based permissions, 2FA, session management and audit events.' },
    { h: 'Client isolation', p: 'Client collaborators only see what you explicitly share.' },
  ] },
  docs: { title: 'Documentation', intro: 'Guides for getting the most out of BizPilot.', sections: [
    { h: 'Getting started', p: 'Create your organization, invite your team and add your first client.' },
    { h: 'Working with AI', p: 'Ask questions, review citations and approve proposed actions.' },
    { h: 'Automations', p: 'Build workflows from triggers, conditions, actions and AI steps.' },
  ] },
  help: { title: 'Help center', intro: 'Answers to common questions.', sections: [
    { h: 'Account & billing', p: 'Change plans, update payment methods and download invoices from Billing.' },
    { h: 'Contact support', p: 'Email support@bizpilot.app — we usually reply within a few hours.' },
  ] },
}

export async function generateMetadata({ params }: PageProps<'/[slug]'>) {
  const { slug } = await params
  return { title: pages[slug]?.title ?? 'Not found' }
}

const InfoPage = async ({ params }: PageProps<'/[slug]'>) => {
  const { slug } = await params
  const page = pages[slug]
  if (!page) notFound()
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-heading text-4xl font-semibold tracking-tight text-heading">{page.title}</h1>
      <p className="mt-3 text-muted-foreground">{page.intro}</p>
      <div className="surface mt-8 space-y-6 rounded-xl p-6">
        {page.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-heading text-lg font-semibold text-heading">{s.h}</h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{s.p}</p>
          </section>
        ))}
      </div>
      <Link href="/" className="mt-6 inline-block text-sm text-primary hover:underline">← Back to home</Link>
    </article>
  )
}

export default InfoPage
