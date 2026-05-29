# Handoff — SIT Website — 2026-05-30

## Doel
svsit.nl — community website voor studievereniging ICT (HvA), introweek 31 aug als deadline

## Status
- Fase: 4 Implement (doorlopend, geen strikte taak IDs meer)
- Laatste taak: Circuit-board achtergrond page-wide + perf fix lag/low-FPS — DONE + live
- Gate: Implement APPROVED (merged to main 26 mei)

## Gewijzigde files (sessie 17 + 17b)
- `src/components/CircuitBackground.tsx` — NEW: React port van canvas PCB-engine (Manhattan traces, vias, SMD parts, glowing pulses, fixed CPU-die). Perf: glowSprite()+glowCache (drawImage ipv shadowBlur), 30fps cap, DPR cap 2, rAF pause op document.hidden, debounced resize 180ms
- `src/components/circuitBackground.css` — NEW: `.circuit-bg-layer` fixed inset:0 z-0 pointer-events:none, @property --chip-accent, .sit-chip cycling/glow, .circuit-bg-veil dark vignette voor leesbaarheid, prefers-reduced-motion fallback
- `public/circuit-chip-logo.png` — NEW: kopie handoff sit-logo.png
- `src/app/page.tsx` — BackgroundStreaks dynamic import VERVANGEN door CircuitBackground (homepage)
- `src/components/Hero.tsx` — getrimd: aurora blobs, code rain, CSS grid, glow-dots, noise + bijbehorende refs weg. Content/typing/counters/CTAs/CommunityLog/scroll-arrow behouden

## Wat werkt
- Page-wide fixed circuit-board achtergrond op homepage, tekst leesbaar (bgOpacity 0.42 + veil)
- Perf: shadowBlur weg → cached glow sprite + drawImage, 30fps cap. Lag/low-FPS opgelost
- Build green (Next 16.2.1 Turbopack, exit 0)
- Commits: `f69eada` (circuit bg integratie), `0ac95d4` (perf fix). Beide gepusht naar main
- Vercel prod deploy live, aliased svsit.nl

## Wat niet werkte / geleerde lessen
- shadowBlur = #1 canvas perf killer. Altijd pre-rendered sprite + drawImage voor glow op animerende full-viewport canvas
- Frame cap 30fps voor ambient bg = visueel onmerkbaar, halveert CPU
- TS strict-null in nested fn: closure narrowing verloren → `canvas!.style.opacity`
- Visual check: geen Playwright MCP/install. Windows Chrome headless werkt op WSL localhost: `--headless=new --no-sandbox --disable-gpu --window-size=1440,900 --virtual-time-budget=6000 --screenshot="C:/.../x.png"`. Tall viewport (>1000px) + #anchor shots falen blank (lazy dynamic sections)

## Blokkades
- Geen

## Volgende stappen
- Lighthouse hertest (target TBT<500ms, Perf>85) — verifieer FPS-winst
- NOTION_API_KEY weg uit Vercel env
- Introweek pagina: Tinka feedback verwerken (Survival Quest samenvoegen, Aloha naar week 2, hackathon week 2)

## Key context
- Path: /mnt/c/Users/matin/Desktop/PROJECTS/svsit-site, branch main
- Stack: Next.js 16.2.1 Turbopack, Supabase (ref plgcqkbfvzwkqzkggmfh), NextAuth v5, Stripe, Resend
- Vercel: project prj_8owLzC9RBFyV9oV8IwqXe1Fmmz5Z, org team_v1AyK1w3BIIgwMG0swf3pIBp, domein svsit.nl
- CircuitBackground CONFIG: bgOpacity 0.42, cycleSpeed 22, speed 0.95, density 0.9, glow 0.85
- Stacking: body solid bg = backdrop; .circuit-bg-layer fixed z-0; main relative z-[1] transparent; Footer relative z-[1] solid bg
