import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import IntroweekClient from './IntroweekClient'
import { SITE_CONFIG } from '@/lib/constants'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageIntroweek')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription', { price: SITE_CONFIG.membership.price }),
      siteName: '{SIT}',
      type: 'website',
      url: 'https://svsit.nl/introweek',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
    },
  }
}

export default function IntroweekPage() {
  return (
    <>
      <Navbar />
      <IntroweekClient />
      <Footer />
    </>
  )
}
