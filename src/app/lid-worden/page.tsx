import type { Metadata } from 'next'
import RegisterFlow from '@/components/auth/RegisterFlow'
import { SessionProvider } from 'next-auth/react'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Word lid - {SIT}',
  description:
    `Word lid van SIT voor ${SITE_CONFIG.membership.pricePerYear}. Events, workshops, dev tools, en een community van HBO-ICT studenten aan de HvA.`,
  openGraph: {
    title: 'Word lid - {SIT}',
    description: `Word lid van SIT voor ${SITE_CONFIG.membership.pricePerYear}. Events, workshops, dev tools en meer.`,
    siteName: '{SIT}',
    locale: 'nl_NL',
    type: 'website',
    url: 'https://svsit.nl/lid-worden',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Word lid - {SIT}',
    description: `Word lid van SIT voor ${SITE_CONFIG.membership.pricePerYear}. Events, workshops, dev tools en meer.`,
  },
}

export default function LidWordenPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <SessionProvider>
        <RegisterFlow />
      </SessionProvider>
    </main>
  )
}
