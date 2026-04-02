// Badge SVG icons — stroke-based, 24x24 viewBox, no fills

import type { ReactElement } from 'react'

interface IconProps {
  size?: number
  color?: string
}

// 1. IconJoined — checkmark inside a circle
export function IconJoined({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  )
}

// 2. IconFirstEvent — ticket/admission ticket shape
export function IconFirstEvent({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9Z" />
      <line x1="9" y1="7" x2="9" y2="17" strokeDasharray="2 2" />
    </svg>
  )
}

// 3. IconHackathon — code brackets </>
export function IconHackathon({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="7 8 3 12 7 16" />
      <polyline points="17 8 21 12 17 16" />
      <line x1="14" y1="6" x2="10" y2="18" />
    </svg>
  )
}

// 4. IconBorrel5 — a drink glass
export function IconBorrel5({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2h8l-1 7H9L8 2Z" />
      <path d="M9 9c0 4 3 7 3 7s3-3 3-7" />
      <line x1="12" y1="16" x2="12" y2="21" />
      <line x1="9" y1="21" x2="15" y2="21" />
    </svg>
  )
}

// 5. IconBorrel10 — crown on top of a glass
export function IconBorrel10({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 5 7 9 12 5 17 9 20 5 20 12 4 12 4 5" />
      <path d="M7 12c0 3 2 5 5 5s5-2 5-5" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="9" y1="21" x2="15" y2="21" />
    </svg>
  )
}

// 6. IconHelper — open hand (helping gesture)
export function IconHelper({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 11V7a2 2 0 0 0-4 0v4" />
      <path d="M14 11V5a2 2 0 0 0-4 0v6" />
      <path d="M10 11V7a2 2 0 0 0-4 0v8l-1-1a2 2 0 0 0-3 3l4 4a6 6 0 0 0 6 0l1-1a6 6 0 0 0 2-4v-5a2 2 0 0 0-1.87-2" />
    </svg>
  )
}

// 7. IconOG — vintage/old-style shield
export function IconOG({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3L4 6v6c0 5 4 9 8 10 4-1 8-5 8-10V6L12 3Z" />
      <line x1="12" y1="9" x2="12" y2="15" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  )
}

// 8. IconBestuur — curly braces { } (SIT logo style)
export function IconBestuur({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4c0 1.1.9 2 2 2h1" />
      <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" />
    </svg>
  )
}

// 9. IconStreak — flame
export function IconStreak({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c0 1.5-1.5 2.5-2 3 2 0 6-1 6-5 0-2-1-3.5-2-4.5 0 1.5-1 2-2 2-.5-1.5.5-3 1-4.5-2 1-3 3-1.5 6Z" />
    </svg>
  )
}

// 10. IconAllrounder — star with radiating lines
export function IconAllrounder({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

// 11. IconFullstack — stacked layers (3 horizontal layers)
export function IconFullstack({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5Z" />
      <path d="M2 12l10 5 10-5" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  )
}

// 12. IconAI — neural network (3 connected nodes)
export function IconAI({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="19" cy="19" r="2" />
      <line x1="7" y1="11" x2="17" y2="6" />
      <line x1="7" y1="13" x2="17" y2="18" />
      <line x1="19" y1="7" x2="19" y2="17" />
    </svg>
  )
}

// 13. IconSecurity — lock/padlock
export function IconSecurity({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  )
}

// 14. IconPartyAnimal — party hat (triangle with decorations)
export function IconPartyAnimal({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.8 21L12 3l6.2 18" />
      <path d="M5.8 21h12.4" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="15" y1="7" x2="17" y2="5" />
      <line x1="17" y1="8" x2="19" y2="6" />
    </svg>
  )
}

// 15. IconCommunityBuilder — network/connections (nodes connected by lines)
export function IconCommunityBuilder({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2" />
      <circle cx="4" cy="6" r="2" />
      <circle cx="20" cy="6" r="2" />
      <circle cx="4" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
      <line x1="6" y1="7" x2="10" y2="11" />
      <line x1="18" y1="7" x2="14" y2="11" />
      <line x1="6" y1="17" x2="10" y2="13" />
      <line x1="18" y1="17" x2="14" y2="13" />
    </svg>
  )
}
