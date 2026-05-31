# Handoff — SIT Website (svsit.nl) — 2026-05-31

## Doel
Custom HUD-cursor (SIT_CURSOR.sys) site-breed toepassen zonder bug. Live op main.

## Status
- Fase: 4 Implement (post-launch onderhoud, live op main)
- Taak: custom cursor geport + gemount
- Gate: launch APPROVED (svsit.nl live)

## Gewijzigde files (deze sessie)
- `src/components/CustomCursor.tsx` — NIEUW. React-port van Claude Design SIT_CURSOR.sys HUD-cursor
- `src/app/layout.tsx` — `dynamic()` import + `<CustomCursor/>` na ToastProvider (globaal)

## Wat werkt
- `next build` "Compiled successfully in 18.4s", 58/58 static, Proxy middleware actief
- tsc --noEmit clean
- Cursor: gold reticle 1:1 + follower ring + magnetic lock-on + coord-HUD + text-caret + exec-ripple + trail
- Bail-outs: pointer:fine only, prefers-reduced-motion (lerp=1), mobile/coarse -> native cursor + display:none

## Wat niet werkte / geleerde lessen
- Oude (sessie 23 verwijderde) CustomCursor lekte RAF+listeners over route-changes = de "bug". Fix: volledige useEffect-cleanup (cancelAnimationFrame + clearInterval + removeEventListener + class strip + ripple purge)
- Self-isolated `<style>` in component i.p.v. globals.css = geen tangle, makkelijk te verwijderen

## Blokkades
- Geen

## Volgende stappen
1. Live Stripe end-to-end test: betaald event -> webhook checkout.session.completed -> mail+PDF. Check STRIPE_WEBHOOK_SECRET in Vercel
2. Bestuursfoto's Liam/Thijmen/Jamiro/Yusuf in moederbord (nu initialen)
3. NOTION_API_KEY uit Vercel env (niet meer gebruikt)
4. Events-sectie homepage leeg — events in DB zetten of bewust laten
5. Cursor live testen op desktop (npm run dev), evt accent/magnet finetunen via CFG

## Key context (voor nieuwe sessie)
- Supabase ref `plgcqkbfvzwkqzkggmfh`. Events uit DB niet Notion
- Bestuur XII = huidig; badge_founder_xi + cardSkins 'Bestuur XI' = historisch/verdiend, NIET wijzigen
- src/proxy.ts = ACTIEVE auth middleware (Next 16 hernoemde middleware.ts)
- CustomCursor config hardcoded in CFG (accent #F29E18, lock brackets, magnet 0.28). Demo control-deck NIET geport
- Cursor gemount in layout.tsx = GLOBAAL (layout remount niet bij route-change dus geen leak)
- Homepage flow: Hero->About->WhyJoin->Events->Testimonials->SponsorShowcase(Partners)->JoinCta
