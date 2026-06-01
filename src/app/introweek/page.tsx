import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import IntroweekClient from './IntroweekClient'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Introweek 2026 - {SIT}',
  description:
    'Twee introweken in september 2026. Je eerste weken aan de HvA HBO-ICT. Boot in, vlieg de SIT-core in, en vind je mensen. Gratis voor leden.',
  openGraph: {
    title: 'Introweek 2026 - {SIT}',
    description:
      `Twee introweken in september 2026. Programma, survival kit en je plek in de community. Word lid voor ${SITE_CONFIG.membership.price} euro.`,
    siteName: '{SIT}',
    locale: 'nl_NL',
    type: 'website',
    url: 'https://svsit.nl/introweek',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Introweek 2026 - {SIT}',
    description: 'Twee introweken in september 2026. Je eerste weken aan de HvA HBO-ICT.',
  },
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
