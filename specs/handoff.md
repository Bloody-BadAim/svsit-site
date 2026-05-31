# Handoff — SIT Website (svsit.nl) — 2026-05-31

## Doel
Post-launch onderhoud. Stripe-flow verificatie + bug fixes. Live op main, Vercel auto-deploy.

## Status
- Fase: 4 Implement (post-launch onderhoud, live op main)
- Taak: stripe e2e geverifieerd + moederbord scroll-bugs gefixt + gepusht
- Gate: launch APPROVED (svsit.nl live)
- Commits deze sessie: `92e5f71` (moederbord scroll fix telefoon+desktop). Gepusht origin/main.
- Vorige sessie (al live): `b7779ff` introweek, `e66fd17` jamiro+wordlid, `9ee80ab` commissie-optioneel, `e008070` RegisterFlow signIn-fix.

## Gewijzigde files (deze sessie)
- `src/components/Moederbord.tsx` — DetailSheet body-lock alleen als `selected` (was: lock bij elke mount -> telefoon scroll vast)
- `src/components/moederbord.css` — `.sheet-body` flex:1 1 auto + min-height:0 (flexbox scroll-fix desktop paneel) + touch/overscroll

## Wat werkt
- tsc --noEmit groen
- Stripe registratieflow e2e (test-mode) PASS: create-checkout 401 zonder sessie / 200 + cs_test_ url met sessie (signIn-fix werkt), webhook activeert lid + payment-row idempotent
- Moederbord scroll telefoon + desktop paneel gefixt en gepusht

## Wat niet werkte / geleerde lessen
- Telefoon scroll-lock: DetailSheet useEffect liep bij elke mount (hooks vóór `if (!selected) return null`) -> body.overflow=hidden op load. Fix: guard + selected in deps
- Desktop sheet geen scroll: flex-child met overflow-y:auto zonder min-height:0 krimpt niet. Fix: flex:1 1 auto + min-height:0
- Stripe CLI: `stripe login` wrapper persisteert config niet; export STRIPE_API_KEY werkt (de --api-key flag werkt NIET voor `stripe listen`, env var wel)
- curl login met `!` in wachtwoord faalt (form-encoding) -> test-artefact, geen app-bug

## Blokkades
- Geen

## Volgende stappen
1. Echte live Stripe e2e door user zelf (kaart in checkout) ter dubbelcheck
2. TODO: foto's Liam/Thijmen/Yusuf op /over-ons (nog initialen)
3. SECURITY: gelekte rk_live key (in ~/.config/stripe/live-restricted.key) roteren in Stripe dashboard

## Key context (voor nieuwe sessie)
- Webhook activeert membership async; success_url /dashboard?welcome=true kan kort niet-actief tonen tot webhook landt
- create-checkout negeert body-email, gebruikt session.user.email (security). signIn vóór checkout in RegisterFlow.handlePayAndJoin verplicht
- members tabel: kolom heet `password_hash` (niet `password`), bcrypt $2b$12$
- Test schrijft naar PROD Supabase plgcqkbfvzwkqzkggmfh -> altijd fake email + cleanup
- Anti-slop: NOOIT dashes/emojis in UI, alleen Lucide icons. Caveman mode actief (full)
- Repo Bloody-BadAim/svsit-site, branch main
