'use client'

import { useTranslations } from 'next-intl'
import ChallengeManager from '@/components/admin/ChallengeManager'
import SubmissionInbox from '@/components/admin/SubmissionInbox'

export default function ChallengesPage() {
  const t = useTranslations('adminChallengesPage')
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
        {t('heading')}
      </h1>

      <ChallengeManager />
      <SubmissionInbox />
    </div>
  )
}
