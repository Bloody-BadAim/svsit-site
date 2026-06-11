import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import RegisterFlow from '@/components/auth/RegisterFlow'
import HboIctVormtaal from '@/components/HboIctVormtaal'
import { SessionProvider } from 'next-auth/react'
import { SITE_CONFIG } from '@/lib/constants'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageLidWorden')
  const price = SITE_CONFIG.membership.pricePerYear
  return {
    title: t('meta.title'),
    description: t('meta.description', { price }),
    openGraph: {
      title: t('meta.ogTitle'),
      description: t('meta.ogDescription', { price }),
      siteName: '{SIT}',
      locale: 'nl_NL',
      type: 'website',
      url: 'https://svsit.nl/lid-worden',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.twitterTitle'),
      description: t('meta.twitterDescription', { price }),
    },
  }
}

export default async function LidWordenPage() {
  const t = await getTranslations('pageLidWorden')
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
            {t('cobrandEyebrow')}
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
