import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { XP_REWARDS } from '@/lib/xpEngine'
import { STAT_CATEGORIES } from '@/lib/constants'

export const metadata = {
  title: 'XP — SIT',
}

const XP_SOURCES = [
  { actie: 'Borrel check-in',       xp: XP_REWARDS.borrelCheckIn,  categorie: 'social'  },
  { actie: 'Workshop / event',      xp: XP_REWARDS.workshopEvent,  categorie: 'varies'  },
  { actie: 'Hackathon',             xp: XP_REWARDS.hackathon,      categorie: 'code'    },
  { actie: 'Event organiseren',     xp: XP_REWARDS.organizeEvent,  categorie: 'impact'  },
  { actie: 'Weekly quest',          xp: '10-25',                   categorie: 'varies'  },
  { actie: 'Skill track milestone', xp: '15-50',                   categorie: 'varies'  },
  { actie: 'Track completion',      xp: XP_REWARDS.trackCompletion,categorie: 'varies'  },
  { actie: 'Boss fight bonus',      xp: '20-75',                   categorie: 'n/a'     },
  { actie: 'Badge unlock bonus',    xp: '10-500',                  categorie: 'n/a'     },
] as const

export default async function XpPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const supabase = createServiceClient()

  const { data } = await supabase
    .from('xp_transactions')
    .select('amount, source, category, created_at')
    .eq('member_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const transactions = (data ?? []) as Array<{
    amount: number
    source: string
    category: string | null
    created_at: string
  }>

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono text-white mb-1">HOE VERDIEN IK XP?</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Elke actie levert XP en coins op. XP bepaalt je level, coins kun je uitgeven in de shop.
        </p>
      </div>

      {/* XP Sources table */}
      <div
        className="rounded-xl overflow-x-auto"
        style={{
          border: '1px solid var(--color-border)',
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr
              className="text-left"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Actie
              </th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                XP
              </th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Categorie
              </th>
            </tr>
          </thead>
          <tbody>
            {XP_SOURCES.map((source, i) => {
              const catDef = STAT_CATEGORIES.find((c) => c.id === source.categorie)
              return (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="px-4 py-3" style={{ color: 'var(--color-text)' }}>
                    {source.actie}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                    {typeof source.xp === 'number' ? `+${source.xp}` : source.xp}
                  </td>
                  <td className="px-4 py-3">
                    {catDef ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: catDef.kleur }}
                        />
                        <span style={{ color: 'var(--color-text-muted)' }}>{catDef.naam}</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>{source.categorie}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* XP History */}
      <div>
        <h2 className="text-lg font-bold font-mono text-white mb-4">XP GESCHIEDENIS</h2>
        {transactions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Nog geen XP verdiend. Ga naar een event!
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, i) => {
              const catDef = STAT_CATEGORIES.find((c) => c.id === tx.category)
              return (
                <div
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-3"
                  style={{
                    border: '1px solid rgba(255,255,255,0.05)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {catDef && (
                      <div
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: catDef.kleur }}
                      />
                    )}
                    <span className="text-sm capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                      {tx.source.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                      +{tx.amount}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(tx.created_at).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
