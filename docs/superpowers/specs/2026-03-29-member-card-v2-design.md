# SIT Member Card v2 — Gaming ID Badge

## Context

De huidige member card in de Word Lid sectie is te basic/leeg. Het voelt als een formulier, niet als een collectible game card. De card moet een full gaming player ID badge worden met avatar, stats, XP bar, achievement badges — alsof je je player profile bekijkt voor je een game start.

## Design

### Card layout

```
┌─────────────────────────────────────┐
│  {SIT} MEMBER CARD      Bestuur XI  │  header bar
│─────────────────────────────────────│
│                                     │
│  ┌──────────┐   JOUW NAAM           │
│  │          │   ─────────────────   │
│  │  AVATAR  │   CLASS: Undecided    │
│  │   ?????  │   LVL 01  ★ ROOKIE   │
│  │          │                       │
│  └──────────┘   ▓▓▓▓▓░░░░░ 0/100   │  XP bar
│                 xp tot next level   │
│                                     │
│  ── STATS ──────────────────────    │
│  code    ▓▓▓▓▓▓░░░░  ?/10          │
│  social  ▓▓▓▓▓░░░░░  ?/10          │
│  chaos   ▓▓▓▓▓▓▓░░░  ?/10          │
│                                     │
│  ── BADGES ─────────────────────    │
│  [✓] [  ] [  ] [  ]                │
│                                     │
│  ▐█▌█▐█▌ █▐█▌█ ▐█▌█▐█▌ █▐█▌       │  barcode
│  SIT-2026-XXXX        × × ×        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     [ WORD LID BUTTON ]    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Elementen

| Element | Specificatie |
|---------|-------------|
| Header | `{SIT} MEMBER CARD` (gold braces), `Bestuur XI` rechts |
| Avatar | 80×80px, diamond grid pattern, `?????` placeholder text |
| Naam | "Jouw Naam" placeholder, `font-mono text-base text-white` |
| Class | "Undecided" — placeholder voor specialisatie |
| Level + Rank | `LVL 01` + `★ ROOKIE` in gold |
| XP Bar | Gold progress bar, 0% gevuld, label `0 / 100 xp` |
| Stats | 3 bars: code (blue), social (green), chaos (red) — alle met `?/10` |
| Badges | 4 slots, eerste = gold checkmark "JOINED", rest = locked (border only) |
| Barcode | Behouden — deterministic CSS bars in gold |
| Card ID | `SIT-2026-2027` + Amsterdam × marks |
| CTA | `HoldToJoinButton` via children prop (al geimplementeerd) |

### Stats bars specificatie

Elke bar is een `flex` row: label (w-14) + bar track (flex-1, h-2, bg-white/5) + value.
Bar fill is een inner div met `width: random%`, brand kleur, opacity 0.3 (locked state).
Value toont `?/10` in muted text.

### Badge slots specificatie

4 vierkante slots (28×28px), `border border-white/10`.
Slot 1: gold border + gold checkmark SVG (Lucide `Check` icon, 14px).
Slots 2-4: empty, `border-dashed border-white/6`, lock icon of leeg.

### Bestand

`src/components/MemberCard.tsx` — herschrijven met nieuwe content.

### Behouden

- Gradient animated border (conic-gradient, borderRotate animation)
- Glassmorphism body (rgba(17,17,19,0.95), backdrop-blur)
- Holographic shine overlay (cardShine animation)
- Noise texture overlay
- Glow effect achter card
- `children` prop voor CTA slot
- Barcode + card ID + Amsterdam × marks
- Card max-width 340px in JoinCta

### Niet wijzigen

- `JoinCta.tsx` — card positie en sectie layout blijft hetzelfde
- `globals.css` — bestaande keyframes zijn voldoende
