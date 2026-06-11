'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, Users, ScanLine, CalendarDays, Target, Mail, FolderGit2, Briefcase } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ADMIN_ITEMS: { href: string; labelKey: string; Icon: LucideIcon }[] = [
  { href: '/admin',            labelKey: 'overview',    Icon: LayoutDashboard },
  { href: '/admin/leden',      labelKey: 'leden',       Icon: Users           },
  { href: '/admin/scanner',    labelKey: 'scanner',     Icon: ScanLine        },
  { href: '/admin/events',     labelKey: 'events',      Icon: CalendarDays    },
  { href: '/admin/challenges', labelKey: 'challenges',  Icon: Target          },
  { href: '/admin/projecten',  labelKey: 'projecten',   Icon: FolderGit2      },
  { href: '/admin/vacatures',  labelKey: 'vacatures',   Icon: Briefcase       },
  { href: '/admin/email',      labelKey: 'email',       Icon: Mail            },
]

export default function AdminNav() {
  const t = useTranslations('adminNav')
  const pathname = usePathname()

  return (
    <div
      className="flex gap-1 p-1 rounded-lg mb-8"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {ADMIN_ITEMS.map(({ href, labelKey, Icon }) => {
        const active = href === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center"
            style={{
              backgroundColor: active ? 'rgba(242, 158, 24, 0.15)' : 'transparent',
              color: active ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
            }}
          >
            <Icon size={16} strokeWidth={active ? 2.2 : 1.5} />
            <span className="hidden sm:inline">{t(labelKey)}</span>
          </Link>
        )
      })}
    </div>
  )
}
