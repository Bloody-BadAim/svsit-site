# Handoff — SIT Website (svsit.nl) — 2026-05-31

## Doel
Post-launch onderhoud. Introweek redesign + registratieflow fixes. Live op main, Vercel auto-deploy.

## Status
- Fase: 4 Implement (post-launch onderhoud, live op main)
- Taak: stripe e2e geverifieerd + moederbord scroll-bugs gefixt (NIET gecommit, wacht op seintje)
- Gate: launch APPROVED (svsit.nl live)
- Commits vorige sessie: `b7779ff` (introweek), `e66fd17` (jamiro foto + word-lid knop), `9ee80ab` (commissie optioneel), `e008070` (checkout login fix). Allen gepusht origin/main.
- UNCOMMITTED nu: Moederbord.tsx + moederbord.css (2 scroll fixes)

## Gewijzigde files (deze sessie)
- `src/components/Moederbord.tsx` — DetailSheet effect: body-lock alleen als `selected` (was: lock bij elke mount -> telefoon scroll vast)
- `src/components/moederbord.css` — `.sheet-body` flex:1 1 auto + min-height:0 (flexbox scroll-fix desktop paneel) + touch/overscroll
- (vorige sessie, al gepusht): introweek redesign, jamiro foto, JoinCta knop, ClassSelector, RegisterFlow signIn-fix

## Wat werkt
- tsc --noEmit groen na elke fix
- Registratieflow volledig geaudit: stap1 validatie, rolmapping (member/contributor/mentor), /api/members dedup+bcrypt, create-checkout (sessie-email), webhook activatie/renewal/cancel idempotent, betaal-later signIn+redirect
- Dashboard /dashboard/tickets werkt (query op email, QR + PDF), niet kapot

## Wat niet werkte / geleerde lessen
- handlePayAndJoin betaalknop faalde voor nieuwe email/wachtwoord-leden: account aangemaakt maar niet ingelogd -> create-checkout 401 "Niet ingelogd". Fix: signIn('credentials') voor checkout-fetch, net als handleSkipPayment
- Tickets nav leek "kapot" maar was leeg-state (account zonder tickets), code werkt
- Commissie was code-matig al optioneel (role default member, knoppen op akkoord gated) maar UI miste expliciete geen-commissie keuze

## Blokkades
- Geen

## Volgende stappen
1. Live Stripe e2e test registratie (user zelf) — verifieer credentials-user betaalflow nu werkt
2. TODO: foto's Liam/Thijmen/Yusuf op /over-ons (nog initialen, Jamiro nu klaar)

## Key context (voor nieuwe sessie)
- Webhook activeert membership async; success_url /dashboard?welcome=true kan kort niet-actief tonen tot webhook landt
- create-checkout negeert body-email, gebruikt session.user.email (security)
- COMMISSIES id 'servo' in constants.ts vs 'servco' in moederbord.ts (los, registratie gebruikt constants)
- Anti-slop: NOOIT dashes/emojis in UI, alleen Lucide icons. Caveman mode actief (full)
- Supabase ref plgcqkbfvzwkqzkggmfh. Repo Bloody-BadAim/svsit-site
