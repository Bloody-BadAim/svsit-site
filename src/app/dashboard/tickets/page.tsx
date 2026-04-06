import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TicketCard } from './TicketCard'

export const metadata = {
  title: 'Tickets — SIT',
}

interface TicketRow {
  id: string
  event_id: string
  email: string
  name: string | null
  status: 'pending' | 'paid' | 'cancelled' | 'checked_in'
  paid_amount: number
  ticket_number: string | null
  created_at: string
  checked_in_at: string | null
  events: {
    title: string
    date: string
    end_date: string | null
    location: string | null
  }
}

export default async function TicketsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const supabase = createServiceClient()

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, events(title, date, end_date, location)')
    .eq('email', session.user.email)
    .order('created_at', { ascending: false })

  const typedTickets = (tickets ?? []) as unknown as TicketRow[]

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-accent-gold)',
              boxShadow: '0 0 8px rgba(245,158,11,0.5)',
            }}
          />
          <span
            className="font-mono text-xs uppercase tracking-[0.15em]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            tickets &middot; {typedTickets.length} totaal
          </span>
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight uppercase leading-[0.9]"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          MIJN TICKETS
        </h1>
      </div>

      {typedTickets.length === 0 ? (
        <div
          style={{
            padding: '40px 24px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}
        >
          <p
            className="font-mono text-sm mb-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Je hebt nog geen tickets.
          </p>
          <Link
            href="/#events"
            className="font-mono text-sm underline underline-offset-4"
            style={{ color: 'var(--color-accent-gold)' }}
          >
            Bekijk onze events
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {typedTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}
