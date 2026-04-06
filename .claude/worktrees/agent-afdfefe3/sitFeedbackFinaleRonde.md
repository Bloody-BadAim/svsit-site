# SIT Website: Finale polish ronde

Je hebt de basis staan. Nu moet het van "goed" naar "onvergetelijk". Dit is een studievereniging voor HBO-ICT studenten. Die studenten zijn developers, designers, data engineers, cybersecurity nerds. Ze herkennen slechte code EN slecht design. De site moet zeggen: tech + fun. Professioneel maar speels. Career minded maar ook gezellig.

Lees alles hieronder, maak een plan, en werk punt voor punt. Test na elke grote verandering visueel in de browser.

---

## 1. Spacing: Over SIT en Waarom Lid Worden

De overgang tussen "Over SIT" en "Waarom Lid Worden" is te krap. Er zit te weinig lucht tussen. Voeg minstens 160px verticale ruimte toe tussen deze twee secties. Elke sectie moet voelen als een nieuw hoofdstuk, niet als een alinea die doorloopt.

Check ook alle andere sectie overgangen. Overal minstens 120px ruimte.

---

## 2. Vertical Infinite Slider: scope en twee kolommen

De slider aan de rechterkant moet:
- Pas beginnen bij de "Waarom Lid Worden" sectie (niet bij hero, niet bij Over SIT)
- Doorlopen tot en met de Bestuur sectie
- Verdwijnen voor de "Word Lid" CTA en footer
- Twee kolommen zijn: één scrollt omhoog, de andere omlaag (zie het InfiniteSlider component met `reverse` prop)
- Elke kolom ~120px breed, gap van 12-16px ertussen
- Opacity 0.25-0.35 zodat het niet afleidt van de content
- Fade gradient aan boven- en onderkant
- Gebruik placeholder blokjes met monospace labels: "Workshop", "Hackathon", "Borrel", "Game Night", "Study Jam", "Network Event", "Tech Talk", "SIT Event", "Code Review", "Pizza Night", "LAN Party", "Demo Day"

---

## 3. Events sectie: horizontale scroll timeline FIX

De structuur is er maar het werkt nog niet goed. Dit moet gefixt worden:

### Cards mogen NIET van tevoren zichtbaar zijn
De event cards moeten onzichtbaar beginnen en pas verschijnen als je naar dat punt op de timeline scrollt. Gebruik GSAP ScrollTrigger om elke card in te animeren (scale van 0.8 naar 1 + opacity van 0 naar 1) wanneer die card positie in de horizontale scroll bereikt wordt. De cards moeten "poppen" bij scroll, niet al klaarstaan.

### Meer afstand tussen de cards
Er moet meer horizontale ruimte zijn tussen de event cards. Minstens 200-300px gap. De timeline lijn loopt door die lege ruimte heen, zodat je het gevoel hebt dat je door de tijd scrollt.

### Dots op de lijn
De timeline dots (goud, blauw, rood) moeten direct OP de tijdlijn lijn zitten, niet eronder of erboven. De dot is het ankerpunt waar de verticale verbindingslijn naar de card vertrekt.

### Alternerende positie: boven en onder de lijn
- Event 1 (Meet de OC): card BOVEN de lijn, datum chip ONDER de lijn
- Event 2 (Kroegentocht): card ONDER de lijn, datum chip BOVEN de lijn
- Event 3 (Tech + Borrel): card BOVEN de lijn, datum chip ONDER de lijn
Dit zigzag patroon maakt de timeline visueel veel interessanter.

### De animated border op de cards
Elk card moet een animated border hebben. Een glowing trail die langzaam rond de border van de card draait. Gebruik een conic-gradient animatie of een border-image trick. De kleur van de trail matcht de accent kleur van dat event (goud, blauw, rood).

---

## 4. Bestuur sectie: meer leven

De bestuur sectie is te minimaal en saai. Verbeter het:
- De blokken mogen hoger zijn (minstens 300px op desktop)
- Bij hover over een blok: een subtiele kleur shift of border glow in een accent kleur
- De initialen (RL, HG, ID) mogen groter en meer aanwezig. Ze zijn nu te klein en te transparant.
- De foto van Matin heeft een gradient nodig van onder naar boven zodat de naam leesbaar is
- Voeg een hover effect toe: bij hover op een bestuurslid blok verschijnt er een korte code-style beschrijving. Bijvoorbeeld bij hover op Matin: `// voorzitter | fullstack dev | ADHD-powered`, bij Riley: `// penningmeester | houdt de centen bij`, bij Hugo: `// secretaris | notuleert alles`, bij Idil: `// bestuurslid | FemIT x SIT`
- De code tag `{ bestuur: 'XI', since: 2026 }` mag wat meer padding van de blokken

---

## 5. Word Lid CTA sectie

De grootte en layout zijn nu goed. Fixes:
- De "WORD LID →" knop is te klein. Maak hem groter: meer padding (py-5 px-12), grotere font (text-xl), en de glow effect moet duidelijker zichtbaar zijn
- De beschrijvende tekst ("Geen maandelijkse kosten...") en de code snippet (`await sit.join('jij')`) zitten te dicht op de heading en op de knop. Meer verticale ruimte ertussen.
- De knop moet het magnetische effect hebben (volgt de cursor lichtjes, max 6px displacement)

---

## 6. Footer: strakker en wijder

De footer moet schoner:
- Meer horizontale ruimte gebruiken. De drie kolommen (info, links, contact) mogen wijder uit elkaar staan
- Duidelijk visueel verschil: "LINKS" en "CONTACT" als labels in uppercase, muted kleur, kleiner font. De items eronder in normaal formaat.
- `word_lid()` in goud (consistent met navbar)
- De copyright regel en "built with" code comment onderaan moeten op een eigen rij staan met een thin border-top erboven
- Alles netjes uitgelijnd, geen losse teksten die rondzweven

---

## 7. Custom cursor

Voeg een custom cursor toe voor de hele site:
- Vervang de standaard cursor met een custom design
- Twee elementen: een kleine dot (4-6px, goud, volgt de muis exact) en een grotere circle (30-40px, border only, volgt de muis met een kleine delay/lerp)
- Bij hover over interactieve elementen (links, buttons): de grote circle wordt groter (scale 1.5) en krijgt een achtergrondkleur (goud, lage opacity)
- Bij hover over tekst: de grote circle wordt kleiner
- Verberg de default cursor met `cursor: none` op de body
- Op mobile/touch: schakel de custom cursor uit (detect met matchMedia of pointer: coarse)

---

## 8. Lege ruimte rechts vullen + meer ICT/code sfeer

Naast de infinite slider (die een deel van de rechte kant vult), zijn er nog manieren om de site meer ICT sfeer te geven:

### Code easter eggs
- Console message: als iemand DevTools opent, zie je:
```js
console.log("%c{SIT} — Studievereniging ICT", "color: #F59E0B; font-size: 20px; font-weight: bold; font-family: monospace;");
console.log("%cHey developer 👀 Interesse in meehelpen aan onze site? Mail bestuur@svsit.nl", "color: #71717A; font-size: 14px;");
console.log("%c// P.S. Deze site is open source: github.com/svsit/website", "color: #3B82F6; font-size: 12px; font-family: monospace;");
```

- HTML comment bovenaan de page source:
```html
<!--
  {SIT} — Studievereniging ICT
  Hogeschool van Amsterdam

  Door studenten. Voor studenten. In code.

  TODO: meer events toevoegen
  TODO: dark mode is de enige mode
  FIXME: te weinig pizza bij events

  Wil je meehelpen? bestuur@svsit.nl
-->
```

### Subtiele achtergrond elementen
- Op sommige secties: heel subtiele code regels die langzaam scrollen op de achtergrond (opacity 0.03-0.05). Denk aan pseudo code of echte TypeScript/Python snippets. Niet leesbaar, maar je ziet dat het code is. Dit vult lege ruimte zonder af te leiden.

### ICT humor / easter eggs in content
- Ergens op de pagina (misschien bij hover op het {SIT} logo in de navbar): een tooltip met een random ICT grap of referentie. Voorbeelden:
  - "Geen bugs, alleen features"
  - "Works on my machine ¯\_(ツ)_/¯"
  - "// dit is geen comment, dit is een schreeuw om hulp"
  - "git commit -m 'fix: everything'"
  - "404: social life not found"
  - "while(true) { study(); code(); borrel(); }"

- Bij het typen van het Konami code (↑↑↓↓←→←→BA) op de site: trigger een visueel effect. Misschien veranderen alle accent kleuren tijdelijk naar neon, of verschijnt er een hidden message, of rolt er een ASCII art SIT logo over het scherm.

---

## 9. Scroll progress bar

Als die er nog niet is: voeg een dunne (2-3px) progress bar toe helemaal bovenaan de pagina, boven de navbar. Gradient van goud (#F59E0B) links naar blauw (#3B82F6) midden naar rood (#EF4444) rechts. Groeit van links naar rechts op basis van scroll positie. Fixed position, hoogste z-index.

---

## Volgorde van aanpak

1. Spacing fixes (sectie 1 — snel, weinig risico)
2. Footer opschonen (sectie 6)
3. Word Lid CTA fixes (sectie 5)
4. Bestuur sectie verbeteren (sectie 4)
5. Custom cursor (sectie 7)
6. Events horizontale scroll fixen (sectie 3 — complex)
7. Infinite slider twee kolommen + scope (sectie 2)
8. Easter eggs en sfeer (sectie 8)
9. Scroll progress bar (sectie 9)
10. Finale visuele check: open de site, scroll van boven naar beneden, check elke sectie

Commit na elke werkende stap. Als iets niet lukt na 3 pogingen, ga door naar het volgende punt en kom later terug.

Succes. Maak er iets moois van.