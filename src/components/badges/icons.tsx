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

// 16. IconFirstPurchase — shopping bag
export function IconFirstPurchase({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

// 17. IconProfileComplete — user with checkmark
export function IconProfileComplete({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <polyline points="16 17 18 19 22 15" />
    </svg>
  )
}

// 18. IconStreak7 — lightning bolt (extended streak)
export function IconStreak7({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

// 19. IconNightOwl — moon with stars
export function IconNightOwl({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      <line x1="18" y1="5" x2="18" y2="5.01" strokeWidth={3} />
      <line x1="21" y1="8" x2="21" y2="8.01" strokeWidth={3} />
      <line x1="20" y1="2" x2="20" y2="2.01" strokeWidth={3} />
    </svg>
  )
}

// 20. IconMentor — graduation cap
export function IconMentor({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}

// 21. IconDoubleXpDay — zap with sparkle (100+ XP in a day)
export function IconDoubleXpDay({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H13L13 2Z" />
      <line x1="19" y1="3" x2="19" y2="3.01" strokeWidth={3} />
      <line x1="22" y1="6" x2="22" y2="6.01" strokeWidth={3} />
      <line x1="20" y1="7" x2="21" y2="5" />
    </svg>
  )
}

// 22. IconBossSlayer — crossed swords
export function IconBossSlayer({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="14.5" y1="17.5" x2="3" y2="6" />
      <line x1="9.5" y1="6.5" x2="3" y2="6" />
      <line x1="3" y1="6" x2="3" y2="12.5" />
      <line x1="21" y1="3" x2="14.5" y2="9.5" />
      <line x1="14.5" y1="9.5" x2="17" y2="12" />
      <line x1="14.5" y1="9.5" x2="12" y2="7" />
      <line x1="9.5" y1="17.5" x2="21" y2="6" />
      <line x1="9.5" y1="17.5" x2="7" y2="15" />
      <line x1="9.5" y1="17.5" x2="12" y2="20" />
    </svg>
  )
}

// 23. IconMaxCategory — chart bar (500+ XP in one category)
export function IconMaxCategory({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

// 24. IconHacker — terminal prompt
export function IconHacker({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

// 25. IconCompletionist — trophy
export function IconCompletionist({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

// 26. IconBdflWitness — eye (witness)
export function IconBdflWitness({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="3" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21" />
    </svg>
  )
}

// 27. Icon404 — clock showing 4:04
export function Icon404({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
      <line x1="3" y1="3" x2="5" y2="5" strokeDasharray="2 2" />
      <line x1="19" y1="3" x2="21" y2="5" strokeDasharray="2 2" />
    </svg>
  )
}

// 28. IconNoLife — calendar with all days checked
export function IconNoLife({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polyline points="8 14 11 17 16 12" />
    </svg>
  )
}

// 29. IconKonami — gamepad / controller
export function IconKonami({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="20" height="12" rx="4" />
      <line x1="7" y1="12" x2="7" y2="16" />
      <line x1="5" y1="14" x2="9" y2="14" />
      <line x1="15" y1="12" x2="15" y2="12.01" strokeWidth={3} />
      <line x1="17" y1="14" x2="17" y2="14.01" strokeWidth={3} />
      <line x1="13" y1="14" x2="13" y2="14.01" strokeWidth={3} />
      <line x1="15" y1="16" x2="15" y2="16.01" strokeWidth={3} />
    </svg>
  )
}

// 30. IconFirstBdfl — crown with jewel
export function IconFirstBdfl({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l4 8 6-6 6 6 4-8v14H2V4Z" />
      <circle cx="12" cy="6" r="1.5" />
    </svg>
  )
}

// 31. IconFounderXi — roman numeral XI inside a diamond
export function IconFounderXi({ size = 20, color = 'currentColor' }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 12 12 22 2 12" />
      <line x1="9" y1="8" x2="9" y2="16" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="15" y1="8" x2="15" y2="16" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  )
}
