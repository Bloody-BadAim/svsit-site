import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commissies — {SIT}',
  description:
    'Ontdek de 8 commissies van SIT: ServCo, Community, Educatie, Evenementen, AI4HvA, GameIT, Sponsoring en Witboeken. Sluit je aan en bouw mee.',
  openGraph: {
    title: 'Commissies — {SIT}',
    description: '8 commissies waar je als SIT-lid aan mee kunt bouwen.',
    siteName: '{SIT}',
    locale: 'nl_NL',
    type: 'website',
    url: 'https://svsit.nl/commissies',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commissies — {SIT}',
    description: '8 commissies waar je als SIT-lid aan mee kunt bouwen.',
  },
}

export default function CommissiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
