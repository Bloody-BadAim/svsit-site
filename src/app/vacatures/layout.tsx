import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vacatures - {SIT}',
  description:
    'Stages, werkplekken en bijbanen bij onze partners. Vind je volgende ICT-kans via SIT.',
  openGraph: {
    title: 'Vacatures - {SIT}',
    description: 'ICT stages en bijbanen via SIT partners.',
    siteName: '{SIT}',
    locale: 'nl_NL',
    type: 'website',
    url: 'https://svsit.nl/vacatures',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vacatures - {SIT}',
    description: 'ICT stages en bijbanen via SIT partners.',
  },
}

export default function VacaturesLayout({ children }: { children: React.ReactNode }) {
  return children
}
