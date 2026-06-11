import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { getLevelForXp } from '@/lib/levelEngine'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

async function getMember(id: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('members')
    .select('id, display_name, email, total_xp, current_level, role')
    .eq('id', id)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const member = await getMember(id)
  const t = await getTranslations('pageMember')

  if (!member) {
    return { title: t('notFoundTitle', { SIT: '{SIT}' }) }
  }

  const displayName = member.display_name || member.email.split('@')[0]
  const level = getLevelForXp(member.total_xp)
  const vars = {
    name: displayName,
    level: level.level,
    levelTitle: level.title,
    xp: member.total_xp,
    SIT: '{SIT}',
  }

  return {
    title: t('title', vars),
    description: t('description', vars),
    openGraph: {
      title: t('ogTitle', vars),
      description: t('ogDescription', vars),
      siteName: '{SIT}',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle', vars),
      description: t('twitterDescription', vars),
    },
  }
}

export default async function MemberProfilePage({ params }: Props) {
  const { id } = await params
  const member = await getMember(id)

  if (!member) {
    notFound()
  }

  redirect('/leaderboard')
}
