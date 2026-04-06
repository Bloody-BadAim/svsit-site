# Events sectie: volledig herbouwen als verticale timeline

De huidige horizontale scroll events sectie werkt niet. De timing klopt niet, het wobbelt, cards zijn te vroeg zichtbaar. Verwijder de hele huidige Events.tsx en bouw het opnieuw.

## Wat je bouwt

Een verticale timeline met events afwisselend links en rechts. Leesbaar voor iedereen (ook niet-techneuten), maar met subtiele code/developer accenten die passen bij de rest van de site.

## Layout

```
                    03 — EVENTS
                         |
                         |  (lijn groeit naar beneden bij scroll)
                         |
    ┌─────────────┐      ●      
    │ Meet de OC  │──────|      
    │ 24 mrt 2026 │      |      
    │ WBH 5e      │      |      
    │ DEZE WEEK   │      |
    └─────────────┘      |
                         |
                         ●──────┌──────────────┐
                         |      │ Kroegentocht  │
                         |      │ 16 apr 2026   │
                         |      │ A'dam Centrum  │
                         |      │ OPEN          │
                         |      └──────────────┘
                         |
    ┌─────────────┐      ●
    │ Tech+Borrel │──────|
    │ mei 2026    │      |
    │ TBA         │      |
    │ COMING SOON │      |
    └─────────────┘      |
                         |
              // meer events coming soon...
```

## Desktop layout (boven 768px)

- De tijdlijn lijn staat in het MIDDEN van het scherm (left: 50%)
- Event 1 en 3: card links van de lijn, horizontale verbindingslijn naar de dot
- Event 2: card rechts van de lijn, horizontale verbindingslijn naar de dot
- Dots zitten OP de verticale lijn, gecentreerd
- Cards nemen max 40-45% breedte in

## Mobile layout (onder 768px)

- De tijdlijn lijn staat LINKS (left: 24px of iets dergelijks)
- Alle cards staan rechts van de lijn
- Geen alternering, alles aan dezelfde kant

## De tijdlijn lijn

- Thin line: 2px breed
- Kleur: gradient van goud (#F59E0B) bovenaan naar blauw (#3B82F6) midden naar rood (#EF4444) onderaan
- De lijn GROEIT van boven naar beneden op basis van scroll positie
- Gebruik GSAP ScrollTrigger met scrub: true op een scaleY van 0 naar 1 (transform-origin: top)
- Of: gebruik een height animatie van 0% naar 100%

## De dots

- 12px diameter cirkel
- Gevuld met de accent kleur van dat event:
  - Meet de OC: goud (#F59E0B)
  - Kroegentocht: blauw (#3B82F6)
  - Tech + Borrel: rood (#EF4444)
- Subtle box-shadow glow in dezelfde kleur (0 0 12px rgba van de kleur)
- De dot verschijnt (scale 0 naar 1) wanneer de lijn die positie bereikt

## De event cards

### Inhoud per card:
- Status badge bovenaan (DEZE WEEK / OPEN / COMING SOON)
- Event naam als heading (text-xl of text-2xl, font-bold)
- Korte beschrijving (1-2 regels, text-sm, muted kleur)
- Locatie en tijd onderaan (monospace, text-xs, muted)

### Styling:
- Achtergrond: var(--color-surface) (#111113)
- Border: 1px solid var(--color-border)
- Padding: 24-32px
- GEEN border-radius op alles. Mix: sommige hoeken scherp, sommige licht afgerond (border-radius: 0 8px 8px 0 voor links-uitgelijnde cards, 8px 0 0 8px voor rechts-uitgelijnde)
- Bij hover: border kleur verandert naar de accent kleur van dat event (subtle transition)

### Status badges:
- DEZE WEEK: gouden achtergrond, donkere tekst, monospace, uppercase, klein (text-xs)
- OPEN: blauwe achtergrond
- COMING SOON: rode achtergrond
- Scherpe hoeken (geen border-radius op badges)

### Verbindingslijn card naar dot:
- Thin horizontal line (1px) van de card edge naar de dot
- Zelfde kleur als de dot (accent kleur)
- Lengte: de afstand tussen card en de center lijn

## Animaties

### Lijn groei:
- GSAP ScrollTrigger, trigger is de events sectie container
- start: "top 80%", end: "bottom 20%"
- scrub: true (lijn groeit mee met scroll)
- De lijn is een div met scaleY(0) die naar scaleY(1) gaat

### Dots:
- Verschijnen wanneer de lijn hun positie bereikt
- Scale van 0 naar 1, met een bounce ease (back.out(1.7))
- Stagger: elke dot verschijnt ~0.2s na de vorige

### Cards:
- Starten op opacity: 0, translateX: -60px (voor links-uitgelijnde cards) of translateX: 60px (voor rechts-uitgelijnde)
- Animeren naar opacity: 1, translateX: 0
- Trigger: wanneer de card positie in de viewport komt
- Duration: 0.6s, ease: power2.out
- De card animatie triggert NET NA de dot animatie op dezelfde hoogte

### Verbindingslijnen:
- ScaleX van 0 naar 1, getriggerd samen met de card
- Transform-origin: de kant die aan de dot zit

## Events data

```typescript
const events = [
  {
    title: "Meet de OC",
    date: "24 mrt",
    year: "2026",
    time: "16:00",
    location: "WBH 5e verdieping",
    description: "Ontmoet de Opleidingscommissie en praat mee over de opleiding.",
    status: "DEZE WEEK",
    accent: "gold", // #F59E0B
    side: "left",
  },
  {
    title: "Kroegentocht",
    date: "16 apr",
    year: "2026",
    time: "20:00",
    location: "Amsterdam Centrum",
    description: "Een avond door de beste kroegen van Amsterdam met je medestudenten.",
    status: "OPEN",
    accent: "blue", // #3B82F6
    side: "right",
  },
  {
    title: "Tech + Borrel",
    date: "mei",
    year: "2026",
    time: "TBA",
    location: "met de opleiding",
    description: "Tech talks gecombineerd met een borrel, samen met de opleiding.",
    status: "COMING SOON",
    accent: "red", // #EF4444
    side: "left",
  },
];
```

## Code accent onderaan

Na het laatste event, onder de tijdlijn, voeg toe:
```
// meer events coming soon...
```
In monospace, muted kleur (var(--color-text-muted)), gecentreerd.

## Sectie label

Bovenaan: `03 — EVENTS` in dezelfde stijl als de andere sectie labels (goud nummer, streepje, uppercase monospace tekst).

## Wat je NIET moet doen

- GEEN horizontale scroll. Alles is verticaal.
- GEEN pin of scroll hijacking. Normaal scrollen.
- GEEN border trail / animated borders. Clean en rustig.
- GEEN cards die al zichtbaar zijn bij page load. Alles begint onzichtbaar.
- GEEN complexe GSAP timelines die moeilijk te debuggen zijn. Simpele fromTo per element met ScrollTrigger.

## Test checklist

Na het bouwen, check:
- [ ] Scroll van hero naar events: lijn groeit smooth mee
- [ ] Cards zijn NIET zichtbaar voordat je bij de events sectie bent
- [ ] Eerste card (links) schuift van links in
- [ ] Tweede card (rechts) schuift van rechts in
- [ ] Derde card (links) schuift van links in
- [ ] Dots verschijnen met een bounce voordat de card inschuift
- [ ] Mobile: alles links uitgelijnd, lijn aan de linkerkant
- [ ] Geen wobble, geen glitch, smooth animaties
