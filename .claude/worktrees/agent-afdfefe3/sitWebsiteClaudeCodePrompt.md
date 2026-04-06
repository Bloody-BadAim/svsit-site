# SIT Website: Claude Code Prompt

## Context

Je bouwt de website voor SIT (Studievereniging ICT), de studievereniging voor HBO-ICT studenten aan de Hogeschool van Amsterdam. SIT is een vereniging in heropbouw, geleid door een nieuw bestuur van developers en tech enthousiastelingen. De site moet die energie uitstralen.

Het publiek: HBO-ICT studenten (developers, designers, data engineers, cybersecurity studenten). Ze herkennen goede code, ze herkennen goed design, en ze herkennen AI slop van een kilometer afstand. Deze site moet indruk maken.

## Wat je bouwt

Alleen de HOME PAGE. Meer paginas komen later. Focus 100% op een onvergetelijke eerste indruk.

## Tech stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- GSAP (ScrollTrigger) voor scroll animaties
- Lenis voor smooth scrolling
- Google Fonts: gebruik GEEN Inter, Roboto, Arial, Space Grotesk. Kies iets met karakter. Suggesties: JetBrains Mono voor code/mono elementen, Clash Display of Satoshi voor headings, Geist voor body text. Of iets beters als je dat vindt.

## Tijdelijk kleurenschema (wordt later vervangen door brand kit)

Alle kleuren in CSS variables zodat ze in 1 bestand te swappen zijn.

```
--color-bg: #09090B
--color-surface: #111113
--color-surface-hover: #1A1A1D
--color-border: rgba(255, 255, 255, 0.06)
--color-text: #FAFAFA
--color-text-muted: #71717A
--color-accent-gold: #F59E0B
--color-accent-blue: #3B82F6
--color-accent-red: #EF4444
```

## Het SIT logo

{SIT} met curly braces, en eronder drie x'en met streepjes: — x x x —
Dit is een developer logo. De curly braces zijn code syntax. Lean into dat.
Gebruik dit als text based logo in de navbar en hero. Monospace font voor het logo.

## Design richting

### De vibe
Developer culture meets editorial design. Alsof GitHub en een premium tech magazine een kind kregen. Niet corporate, niet studentikoos goedkoop, maar tech savvy en ambitieus. De site moet zeggen: "deze vereniging wordt gerund door mensen die weten wat ze doen."

### WAT HET WEL MOET ZIJN
- Bold typografie die ruimte inneemt. Grote headings. Tekst die ademt.
- Asymmetrische layouts. Niet alles gecentreerd in netjes uitgelijnde kaartjes.
- Scroll driven animaties die het verhaal vertellen. Tekst die revealed, elementen die inschuiven, parallax lagen.
- Noise/grain texture op de achtergrond voor diepte (subtiel, niet overdreven)
- Code inspired elementen: monospace accenten, syntax achtige kleuring, terminal vibes
- De goud kleur als primaire accent, spaarzaam maar impactvol. Blauw en rood als secondary.
- Hover states die verrassen, niet gewoon "opacity gaat omhoog"
- Eén hero moment dat mensen onthouden. Misschien typt het {SIT} logo zichzelf uit als code. Misschien beweegt de achtergrond. Misschien is er een particle effect. Iets dat je laat zien aan een vriend.
- Whitespace als design tool, niet als leegte
- Een custom cursor of een interactief element dat speels is

### WAT HET ABSOLUUT NIET MAG ZIJN (anti patterns)
- Geen grid van identieke kaartjes met hover shadow
- Geen gecentreerde container met padding links en rechts en niks anders
- Geen gradient buttons
- Geen "Welcome to our website" energy
- Geen emoji als icons (gebruik SVG of CSS shapes, of niks)
- Geen purple/blue gradient op witte achtergrond
- Geen carousel/slider
- Geen stock foto's
- Geen Inter, Roboto, Arial font
- Geen rounded corners op ALLES (mix scherp en rond)
- Geen opacity hover op elke knop
- GEEN uniform card layouts. Als er meerdere items zijn (events, bestuursleden), maak ze visueel interessant. Misschien een gestapelde lijst, misschien een asymmetrisch grid, misschien een horizontale scroll.

## Secties op de Home Page (in volgorde)

### 1. Hero
Het eerste dat je ziet. Moet onvergetelijk zijn.
- {SIT} logo groot, in monospace, misschien met een typing/terminal animatie
- Subtitel: "Studievereniging ICT — Hogeschool van Amsterdam"
- Een korte tagline die energie geeft (bv. "Door studenten. Voor studenten. In code.")
- CTA: "Word lid" en "Bekijk events"
- De hero moet de hele viewport vullen (100vh)
- Achtergrond: niet gewoon een kleur. Denk aan subtle grid pattern, moving particles, noise, of een gradient mesh. Iets dat leeft.

### 2. Wat is SIT (kort)
- Geen lange tekst. 2 tot 3 zinnen max.
- Bv: "SIT is de studievereniging voor ICT studenten aan de HvA. We organiseren events, bouwen een community, en maken je studietijd beter."
- Dit blok moet er visueel anders uitzien dan de hero. Andere layout, andere spacing.
- Scroll triggered text reveal

### 3. Waarom lid worden
- 4 redenen, maar NIET als identieke kaartjes
- Events en activiteiten, Netwerk opbouwen, Skills ontwikkelen, Maar 10 euro
- Misschien als een gestapelde lijst met grote nummers/titels links en beschrijving rechts
- Of als een horizontale scroll sectie
- Of als een grid waar elk item een ander formaat heeft
- Wees creatief met de layout

### 4. Aankomende events
De echte events:
- "Meet de OC" — 24 maart 2026, 16:00, WBH 5e verdieping
- "Kroegentocht" — 16 april 2026, 20:00, Amsterdam Centrum
- "Tech + Borrel (met de opleiding)" — mei 2026, TBA

Toon ze als een timeline, of als grote blokken met datum prominent, of als een lijst met hover expand. Niet als drie identieke kaartjes.

### 5. Het bestuur
Bestuur XI:
- Matin — Voorzitter
- Riley — Penningmeester
- Hugo — Secretaris
- Idil — Bestuurslid

Geen foto's beschikbaar (gebruik initialen of abstract placeholders). Maak het compact maar visueel interessant. Misschien een horizontale strip, misschien monospace styled naam+rol.

### 6. CTA (word lid)
- Groot, bold, niet te missen
- "Word lid van SIT" + "Eenmalig €10"
- Eén grote knop
- Dit is de conversie sectie. Maak het impactvol.

### 7. Footer
- {SIT} logo
- "Studievereniging ICT — Hogeschool van Amsterdam"
- Links: Instagram, LinkedIn, Mail (voorzitter@svsit.nl)
- Simpel, clean

## Technische eisen

- Mobile responsive (maar desktop first, de meeste studenten openen dit op laptop)
- Smooth scroll (Lenis)
- GSAP ScrollTrigger voor alle scroll animaties
- Performance: geen zware libraries die de site vertragen. GSAP en Lenis zijn oké. Geen Three.js of heavy particle libraries.
- Alle kleuren via CSS custom properties (makkelijk te swappen voor brand kit)
- Fonts via Google Fonts of next/font
- Geen externe afbeeldingen nodig (alles is text, shapes, en code)
- Components in aparte bestanden (niet alles in page.tsx)

## Projectstructuur

```
sit-website/
  src/
    app/
      layout.tsx          # root layout, fonts, metadata
      page.tsx            # home page, importeert secties
      globals.css         # CSS variables, tailwind, noise texture
    components/
      Navbar.tsx
      Hero.tsx
      About.tsx
      WhyJoin.tsx
      Events.tsx
      Board.tsx
      JoinCta.tsx
      Footer.tsx
    lib/
      theme.ts            # kleur constants (voor als je ze in JS nodig hebt)
```

## Hoe te starten

```bash
npx create-next-app@latest sit-website --typescript --tailwind --app --src-dir --no-import-alias
cd sit-website
npm install gsap @studio-freight/lenis
```

## Belangrijk

- Begin met de Hero. Als die goed is, volgt de rest.
- Test elke sectie visueel voordat je doorgaat naar de volgende.
- Als iets er generiek uitziet, gooi het weg en probeer iets anders.
- De site hoeft niet "af" te zijn. Liever 3 secties die er geweldig uitzien dan 7 secties die er oké uitzien.
- Commit regelmatig zodat we makkelijk terug kunnen als iets misgaat.
