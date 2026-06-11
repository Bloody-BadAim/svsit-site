import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import EmailComposer from '@/components/admin/EmailComposer'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('adminEmailPage')
  return {
    title: t('metaTitle'),
  }
}

export default function AdminEmailPage() {
  return <EmailComposer />
}
