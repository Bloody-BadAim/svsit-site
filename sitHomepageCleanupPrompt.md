# SIT Homepage: Finale Cleanup & Brand Kit Alignment

## Stap 0: Lees de Figma brand kit

Gebruik de Figma MCP om het brand kit bestand te lezen:
- File key: `tIr6cbTBLa26HIsLkW2vyG`
- Lees ALLE pagina's metadata via `get_metadata` (nodeId: `0:1`)
- Haal de design variables op via `get_variable_defs`
- Zoek specifiek naar: kleurenpalet, typografie (fonts + sizes + weights), spacing tokens, card styles, button styles
- Gebruik `get_design_context` op de belangrijkste template frames voor visuele referentie

Pas ALLE kleuren, fonts, en spacing in de website aan op basis van wat je in de brand kit vindt. De brand kit is de single source of truth.

Bekende specs (verificeer tegen Figma):
- Achtergrond: #09090B
- Surface: #111113
- Goud accent: #F59E0B
- Logo font: JetBrains Mono Bold
- Display headings: Big Shoulders Display Bold
- Muted text: #71717A
- Border: rgba(255,255,255, 0.06)

---

## Stap 1: Importeer Big Shoulders Display Bold

```bash
# In layout.tsx of via next/font
import { Big_Shoulders_Display } from 'next/font/google'

const bigShoulders = Big_Shoulders_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
})
```

Gebruik dit font voor ALLE section headings. Dit is het belangrijkste visuele verschil.

---

## Stap 2: VERWIJDER deze componenten/elementen

### Volledig verwijderen:
1. **Beide image marquee/slider strips** (pro1-7 en fun1-13 foto's) — het component EN de afbeeldingen uit /public/slider/
2. **De `sit.config.ts` code editor block** — het hele component
3. **Counter animaties** in de "over sit" sectie (de 0→getal tellers)
4. **RPG stat bars** bij bestuur (code, chaos, coffee, social scores + SPECIAL MOVE)
5. **Terminal commands in footer** (`$ git checkout HEAD~999`, `⚠ WARN: sleep.hours`)

### Verwijder alle `// comment` grappen BEHALVE in de hero:
- `// TODO: meer pizza bij events`
- `// FIXME: waarom is iedereen zo gemotiveerd`
- `// ERROR: te weinig pizza bij events`
- `// meer events coming soon...`
- `// TODO: fix bug waar events.length altijd te laag is`
- `// einde van de pagina. begin van jouw SIT verhaal.`
- Alle `> await ...` en `> const ...` code snippets onder waarom-lid items

### Versimpel:
- **Navbar**: verander `word_lid()` / `word_lid(true)` naar gewoon "Word lid"
- **"Word lid" CTA sectie**: verwijder `// tap or hold`, `await sit.join('jij')`, `return 0;`, `// RangeError: price too low to be real`
- **Events**: verwijder code snippets, houd alleen titel + datum + locatie + status badge

---

## Stap 3: Hero achtergrond — CSS Grid Pulse

Vervang de huidige hero achtergrond met een animated CSS grid. Specificaties:

```css
.hero-grid {
  position: absolute;
  inset: 0;
  /* Grid lijnen */
  background-image:
    linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  /* Fade aan de randen */
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 70%);
}

/* Gouden glow punten op kruispunten — gebruik pseudo element of aparte div */
.hero-glow-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle 2px, rgba(245, 158, 11, 0.15) 0%, transparent 100%);
  background-size: 60px 60px;
  background-position: -0.5px -0.5px; /* Centered op kruispunten */
  mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, black 10%, transparent 60%);
}
```

Optioneel: GSAP animatie die 3-4 willekeurige kruispunten laat "pulsen" met een gouden glow (opacity 0→0.4→0). Zeer subtiel, duration 3-6s, staggered. Gebruik `will-change: opacity` alleen tijdens de animatie.

```javascript
// Alleen als geen reduced-motion
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Maak 4-6 absolute positioned glow dots
  // GSAP timeline met stagger, repeat: -1, yoyo: true
  // Duration: 4s per dot, stagger: 1.5s
  // Property: alleen opacity (GPU safe)
}
```

Noise/grain overlay (subtiel):
```css
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* Tiny noise SVG */
  opacity: 0.03;
  pointer-events: none;
}
```

---

## Stap 4: Events met calendar download

Elke event card krijgt een "Toevoegen aan agenda" knop die een .ics file download:

```typescript
// lib/calendar.ts
export function generateICSFile(event: {
  title: string;
  date: Date;
  endDate?: Date;
  location: string;
  description: string;
}) {
  const formatICSDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const endDate = event.endDate || new Date(event.date.getTime() + 2 * 60 * 60 * 1000); // default 2 uur

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SIT Studievereniging ICT//NL',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(event.date)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:${event.description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
```

In de Events component:
```tsx
<button
  onClick={() => generateICSFile({
    title: 'Kroegentocht',
    date: new Date('2026-04-16T20:00:00'),
    location: 'Amsterdam Centrum',
    description: 'Een avond door de beste kroegen van Amsterdam met SIT',
  })}
  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors"
>
  + Toevoegen aan agenda
</button>
```

Later wordt de event data vervangen door Notion API calls. De .ics generator blijft hetzelfde.

---

## Stap 5: Bestuur — clean cards

Vervang RPG stats met simpele cards:

```tsx
// Bestuur card — brand kit aligned
<div className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] p-0 overflow-hidden
  hover:border-[var(--color-accent-gold)]/30 transition-all duration-300">
  {/* Foto */}
  <div className="aspect-[3/4] overflow-hidden">
    <Image src={member.photo} alt={member.name} fill className="object-cover
      group-hover:scale-[1.02] transition-transform duration-500" />
  </div>
  {/* Info */}
  <div className="p-4">
    <h3 className="font-display text-lg font-bold">{member.name}</h3>
    <p className="text-sm text-[var(--color-text-muted)] font-mono">{member.role}</p>
  </div>
</div>
```

Layout: 4 kolommen op desktop, 2 op mobile. Geen RPG, geen special moves.

---

## Stap 6: Spacing en whitespace

Tussen elke sectie: minimaal `py-24 md:py-32 lg:py-40`. De brand kit heeft ruime margins.

Section headings: `mb-12 md:mb-16`

De site moet ademen. Als twee secties op elkaar lijken te botsen, voeg meer padding toe.

---

## Stap 7: Performance checklist

- [ ] Verwijder alle `/public/slider/` afbeeldingen (pro1-7, fun1-13 = ~20+ files)
- [ ] Bestuursfoto's converteren naar WebP, max 400x600px
- [ ] `loading="lazy"` op alle images behalve hero
- [ ] `content-visibility: auto` op secties onder de fold
- [ ] GSAP: alleen ScrollTrigger importeren, niet de hele suite
- [ ] `prefers-reduced-motion`: alle animaties uit, statisch grid
- [ ] Geen marquee = geen continu draaiende animatie loop
- [ ] Check bundle size: `npm run build` moet < 100KB JS gzipped zijn
- [ ] Hero grid achtergrond: pure CSS, alleen de optional glow dots gebruiken GSAP

---

## Stap 8: Scroll animaties (simpel houden)

Gebruik alleen deze GSAP patronen:
1. **Fade up** voor section content (opacity 0→1, y 30→0, duration 0.8)
2. **Stagger** voor lijsten en cards (stagger 0.1-0.15s)
3. **Text reveal** voor headings (clip-path of opacity)

NIET gebruiken:
- Parallax lagen (te zwaar voor deze pagina)
- Pinned sticky sections
- Horizontal scroll conversie
- Perspective zoom

De hero terminal typing is het enige complexe effect. De rest is subtiel.

---

## Samenvatting volgorde

1. Lees Figma brand kit → pas CSS variables aan
2. Importeer Big Shoulders Display Bold
3. Verwijder alle genoemde elementen
4. Bouw hero grid achtergrond
5. Versimpel events + voeg calendar download toe
6. Versimpel bestuur cards
7. Pas spacing aan (meer whitespace)
8. Performance cleanup (verwijder slider images, WebP conversie)
9. Test op `prefers-reduced-motion`
10. `npm run build` + check bundle size
