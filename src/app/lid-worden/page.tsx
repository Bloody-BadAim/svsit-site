import type { Metadata } from 'next'
import Image from 'next/image'
import RegisterFlow from '@/components/auth/RegisterFlow'
import HboIctVormtaal from '@/components/HboIctVormtaal'
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

      {/* HBO-ICT co-brand lockup */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2.5 opacity-80">
          <span
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Word lid van dé studievereniging van
          </span>
          <Image
            src="/hbo-ict-wit.png"
            alt="HBO-ICT"
            width={92}
            height={16}
            className="h-3.5 w-auto"
          />
        </div>
        <HboIctVormtaal
          variant="bands"
          count={8}
          opacity={0.55}
          className="h-[3px] w-40"
        />
      </div>
    </main>
  )
}
