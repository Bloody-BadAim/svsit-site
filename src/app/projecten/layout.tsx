import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projecten - {SIT}',
  description:
    'Bekijk projecten gebouwd door SIT-leden. Van websites tot AI tools - ontdek wat onze community maakt.',
  openGraph: {
    title: 'Projecten - {SIT}',
    description: 'Projecten gebouwd door SIT-leden aan de HvA.',
    siteName: '{SIT}',
    locale: 'nl_NL',
    type: 'website',
    url: 'https://svsit.nl/projecten',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projecten - {SIT}',
    description: 'Projecten gebouwd door SIT-leden aan de HvA.',
  },
}

export default function ProjectenLayout({ children }: { children: React.ReactNode }) {
  return children
}
