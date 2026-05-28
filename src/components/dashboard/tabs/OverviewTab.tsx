'use client'

import Link from 'next/link'
import { Calendar, MapPin, Ticket, Users, Zap, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Role } from '@/types/database'
import { ROLLEN } from '@/lib/constants'

// ── Types ───────────────────────────────────────────────────────────────────

export interface OverviewTabProps {
  upcomingEvents: {
    id: string
    title: string
    date: string
    endDate: string | null
    location: string | null
    category: string
    isPaid: boolean
    priceMembers: number
  }[]
  myTicketEventIds: string[]
  commissieNaam: string | null
  memberRole: Role
  membershipActive: boolean
  totalXp: number
  currentLevel: number
}

// ── Category config ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  social: '#F29E18',
  code: '#22C55E',
  learn: '#3B82F6',
  impact: '#EF4444',
}

// ── Date helpers ────────────────────────────────────────────────────────────

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

// ── Component ───────────────────────────────────────────────────────────────

export default function OverviewTab({
  upcomingEvents,
  myTicketEventIds,
  commissieNaam,
  memberRole,
  membershipActive,
  totalXp,
  currentLevel,
}: OverviewTabProps) {
  const ticketSet = new Set(myTicketEventIds)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Membership warning */}
      {!membershipActive && (
        <div
          className="flex items-start gap-3 p-4 rounded-md"
          style={{
            backgroundColor: 'rgba(242, 158, 24, 0.06)',
            border: '1px solid rgba(242, 158, 24, 0.2)',
          }}
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" style={{ color: '#F29E18' }} />
          <div>
            <p className="font-mono text-sm font-semibold" style={{ color: '#F29E18' }}>
              Lidmaatschap niet actief
            </p>
            <p className="font-mono text-xs mt-1" style={{ color: '#A1A1AA' }}>
              Activeer je lidmaatschap om toegang te krijgen tot events, shop en meer.
            </p>
            <Link
              href="/lid-worden"
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold mt-2 transition-colors hover:underline"
              style={{ color: '#F29E18' }}
            >
              Activeer nu <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-xs tracking-[0.15em] uppercase" style={{ color: '#F29E18' }}>
            {'>'} aankomende events
          </h3>
          <Link
            href="/events"
            className="font-mono text-[10px] tracking-wider uppercase transition-colors hover:underline"
            style={{ color: '#71717A' }}
          >
            Alle events
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div
            className="p-6 rounded-md text-center"
            style={{ border: '1px dashed #27272A' }}
          >
            <p className="font-mono text-xs" style={{ color: '#71717A' }}>
              Geen aankomende events. Check later!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => {
              const catColor = CATEGORY_COLORS[event.category] ?? '#F29E18'
              const hasTicket = ticketSet.has(event.id)

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group flex items-center gap-4 p-3 rounded-md transition-all hover:translate-x-1"
                  style={{
                    backgroundColor: '#18181B',
                    border: '1px solid #27272A',
                  }}
                >
                  {/* Date block */}
                  <div
                    className="font-mono text-center leading-none shrink-0 w-12"
                    style={{ color: catColor }}
                  >
                    <div className="text-lg font-bold">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-[9px] tracking-widest uppercase opacity-70">
                      {['JAN','FEB','MRT','APR','MEI','JUN','JUL','AUG','SEP','OKT','NOV','DEC'][new Date(event.date).getMonth()]}
                    </div>
                  </div>

                  {/* Event info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-semibold truncate" style={{ color: '#FAFAFA' }}>
                      {event.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 font-mono text-[10px]" style={{ color: '#71717A' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatShortDate(event.date)}, {formatTime(event.date)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={10} />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ticket status / price */}
                  <div className="shrink-0">
                    {hasTicket ? (
                      <span
                        className="flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded"
                        style={{
                          color: '#22C55E',
                          backgroundColor: 'rgba(34, 197, 94, 0.08)',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                        }}
                      >
                        <Ticket size={10} />
                        TICKET
                      </span>
                    ) : (
                      <span
                        className="font-mono text-[10px] px-2 py-1 rounded"
                        style={{
                          color: event.isPaid ? '#F29E18' : '#22C55E',
                          backgroundColor: event.isPaid ? 'rgba(242, 158, 24, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                          border: `1px solid ${event.isPaid ? 'rgba(242, 158, 24, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                        }}
                      >
                        {event.isPaid ? `€${(event.priceMembers / 100).toFixed(0)}` : 'GRATIS'}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Quick info cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Commissie */}
        <div
          className="p-4 rounded-md"
          style={{
            backgroundColor: '#18181B',
            border: '1px solid #27272A',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} style={{ color: '#3B82F6' }} />
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: '#71717A' }}>
              Commissie
            </span>
          </div>
          {commissieNaam ? (
            <p className="font-mono text-sm font-semibold" style={{ color: '#FAFAFA' }}>
              {commissieNaam}
            </p>
          ) : (
            <div>
              <p className="font-mono text-xs" style={{ color: '#71717A' }}>
                Nog niet gekozen
              </p>
              <Link
                href="/commissies"
                className="font-mono text-[10px] mt-1 inline-block transition-colors hover:underline"
                style={{ color: '#3B82F6' }}
              >
                Bekijk commissies
              </Link>
            </div>
          )}
        </div>

        {/* Rol + lidmaatschap */}
        <div
          className="p-4 rounded-md"
          style={{
            backgroundColor: '#18181B',
            border: '1px solid #27272A',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            {membershipActive ? (
              <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
            ) : (
              <AlertCircle size={14} style={{ color: '#F29E18' }} />
            )}
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: '#71717A' }}>
              Lidmaatschap
            </span>
          </div>
          <p className="font-mono text-sm font-semibold" style={{ color: '#FAFAFA' }}>
            {ROLLEN[memberRole].naam}
          </p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: membershipActive ? '#22C55E' : '#F29E18' }}>
            {membershipActive ? 'Actief' : 'Niet actief'}
          </p>
        </div>

        {/* Level */}
        <div
          className="p-4 rounded-md"
          style={{
            backgroundColor: '#18181B',
            border: '1px solid #27272A',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} style={{ color: '#F29E18' }} />
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: '#71717A' }}>
              Level
            </span>
          </div>
          <p className="font-mono text-sm font-semibold" style={{ color: '#FAFAFA' }}>
            Level {currentLevel}
          </p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: '#71717A' }}>
            {totalXp.toLocaleString('nl-NL')} XP
          </p>
        </div>

        {/* Tickets */}
        <div
          className="p-4 rounded-md"
          style={{
            backgroundColor: '#18181B',
            border: '1px solid #27272A',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Ticket size={14} style={{ color: '#8B5CF6' }} />
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: '#71717A' }}>
              Tickets
            </span>
          </div>
          <p className="font-mono text-sm font-semibold" style={{ color: '#FAFAFA' }}>
            {myTicketEventIds.length}
          </p>
          <Link
            href="/dashboard/tickets"
            className="font-mono text-[10px] mt-0.5 inline-block transition-colors hover:underline"
            style={{ color: '#8B5CF6' }}
          >
            Bekijk tickets
          </Link>
        </div>
      </div>
    </div>
  )
}
