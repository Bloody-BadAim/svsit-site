import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { getLevelForXp } from '@/lib/levelEngine'
import type { Metadata } from 'next'

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

  if (!member) {
    return { title: 'Member niet gevonden — {SIT}' }
  }

  const displayName = member.display_name || member.email.split('@')[0]
  const level = getLevelForXp(member.total_xp)

  return {
    title: `${displayName} — Level ${level.level} ${level.title} | {SIT}`,
    description: `${displayName} is een level ${level.level} ${level.title} bij {SIT} — Studievereniging ICT aan de HvA. ${member.total_xp} XP verdiend.`,
    openGraph: {
      title: `${displayName} — {SIT} Member`,
      description: `Level ${level.level} ${level.title} | ${member.total_xp} XP | Studievereniging ICT`,
      siteName: '{SIT}',
      locale: 'nl_NL',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} — {SIT} Member`,
      description: `Level ${level.level} ${level.title} | ${member.total_xp} XP`,
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
