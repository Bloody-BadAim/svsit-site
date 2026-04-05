# Visual Redesign — Gamification V2

> Datum: 2026-04-06
> Status: Approved
> Stijl: Cyberpunk (effects/accessories) + Clean Premium (card base)

## 1. Badge Rarity Visual Effects

Elke rarity tier krijgt een unieke visuele behandeling met geanimeerde elementen:

| Rarity | Background | Border | Animated Effects |
|--------|-----------|--------|-----------------|
| Common | gradient 135deg #1a1a1a→#0a0a0a | 1.5px solid #555 | Inner light sweep (4s) |
| Uncommon | gradient #0a1f0a→#0d0d0d | 1.5px solid #22C55E + glow 12px | Vertical data streams (2s, 3 lijnen) |
| Rare | gradient #070d1f→#0d0d0d | 1.5px solid #3B82F6 + glow 20px | Holographic refraction sweep (3s) + corner accent |
| Epic | gradient #130a1f→#0d0d0d | 1.5px solid #8B5CF6 + glow 24px | Energy core breath (2s) + scan line + SVG lightning flicker |
| Legendary | gradient #1f1205→#0a0805 | 2px solid #F59E0B + glow 30px | 3 orbiting particles (4s) + rising embers (2-2.5s) + fire aura |
| Mythic | gradient #0f0a15→#050507 | 2px solid white/30% + glow 30px | Dual counter-rotating rainbow rings + prismatic light + star bursts + infinity crystal SVG icon |

Badge icons: filled SVG met transparante kleur fill + stroke (niet alleen stroke).

## 2. Card Skins (8 nieuwe + legacy)

Elk skin is CSS art met geanimeerde elementen. Unlock per level:

| Skin | Level | Kleur | Animated Elements |
|------|-------|-------|-------------------|
| Digital Rain | L2 | #22C55E | Scrollende binaire code + matrix column drops |
| GL1TCH | L4 | #EF4444 | RGB split, glitch slices, CRT scanlines, random jitter |
| Hologram | L5 | white | Rainbow lichtbreking sweep + fine grid overlay |
| Aurora | L6 | #22C55E | 3 aurora borealis golven (blur, float, 6-8s) |
| Neon City | L8 | #EC4899 | Cyberpunk skyline silhouet + knipperende raamlichten |
| Frost | L10 | #06B6D4 | IJskristal SVG structuren + vallende sneeuw + shimmer |
| Plasma | L11 | #F59E0B | Zwevende energie orbs + elektrische bogen |
| The Void | L12 | #8B5CF6/#EC4899 | Zwart gat + event horizon ringen + lichtdeeltjes die opgezogen worden |

Legacy skins (V1) blijven als OG collection.

## 3. Pet SVG Creatures (9 pets)

Elke pet is een custom SVG met idle animatie:

| Pet | Shop/Unlock | Animatie |
|-----|------------|----------|
| Ghost | Shop 250 | Float up/down (3s), transparant lichaam |
| Pixel Cat | Shop 150 | Blink ogen (4s interval), staart wag |
| Octocat | Shop 400 | 4 tentakels golven onafhankelijk (2.5-3.2s) |
| Clippy | Shop 125 | Wiebel (3s), ogen volgen (cx animate 5s), wenkbrauwen |
| Debug Bug | Shop 200 | Schuifel heen/weer (2s), antennes pulseren, 6 poten |
| Baby Dragon | Shop 1000 | Vleugels flappen (3s), vuur spuwen (5s, intermittent) |
| Robot | Shop 400 | Antenna blink (1.5s), ogen scan (3s width), chest light |
| Rubber Duck | Shop 125 | Wiebel rotate (2s) |
| Konami Snake | Easter egg | Pixel snake segmenten, flickering tong, rainbow naam |

SVG viewBox: 32x32, rendered at 48x48 op de card.

## 4. Level-Up Ceremony

Sequence (totaal ~2.5s):
1. Screen flash (white overlay → fade) — 100ms
2. Shockwave rings expand (2 ringen, staggered 500ms) — 500ms
3. Radial light rays burst (4 kleuren, 300ms stagger) — 300ms
4. Level nummer slam-in (scale 3→1, blur 10→0, cubic-bezier spring) — 400ms
5. Title fade up (opacity + translateY) — 200ms
6. Tier-colored particle rain (continues) — continuous
7. Unlocked items slide in from bottom — 600ms
8. "NICE" button pulse — waiting

Visuele elementen:
- Shockwave: expanding circles (scale 0.3→2.5, fade out)
- Light rays: 4 gekleurde stralen (gold, blue, red, green) vanuit center
- Level text: monospace, tier-colored, text-shadow glow 40px+80px
- Particles: 30+ dots in tier kleur, falling + rotation

## 5. Boss Fight Widget — War Room

Visuele elementen:
- Danger stripes: repeating-linear-gradient (8px rood, 8px transparent) boven en onder
- "ACTIVE THREAT" label: uppercase, letter-spacing 3px, rode tint
- HP bar: 8px hoogte, gradient fill (groen→geel→rood), shimmer overlay sweep, damage tick flash
- Countdown: pulserende border + kleur (2s ease-in-out)
- Stats: monospace, strijders (white), jouw DMG (gold), rank (green)

## 6. Implementatie Scope

Bestanden die aangepast/aangemaakt worden:
- `src/components/badges/icons.tsx` — alle 31 badge icons redesignen (filled + animated)
- `src/components/badges/BadgeIcon.tsx` — rarity effects (data streams, particles, crystal)
- `src/lib/cardSkins.ts` — 8 nieuwe skins toevoegen met CSS art properties
- `src/components/MemberCard.tsx` — skin rendering updaten voor CSS art layers
- `src/components/pets/` — nieuwe directory met 9 SVG pet componenten
- `src/components/dashboard/LevelUpModal.tsx` — volledige redesign met shockwave sequence
- `src/components/dashboard/BossFightWidget.tsx` — war room redesign
- `src/app/globals.css` — alle nieuwe keyframe animaties
- `supabase/migrations/20260406-visual-redesign-seed.sql` — nieuwe skins + pets in accessory_definitions
