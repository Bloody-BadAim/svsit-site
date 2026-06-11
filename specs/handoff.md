# Handoff — SIT Website (svsit-site) — 2026-06-12

## Doel
Volledige Engelse versie van de site naast het Nederlands, met een NL/EN-toggleknop. Cookie-based, geen taal in de URL.

## Status
- Fase 9 Launch, productie. Branch `feat/i18n-en` gemerged naar `main` (FF), gepusht. HEAD `4da4404`.
- Vercel productie-deploy gestart via `vercel --prod --yes` (loopt bij schrijven). Preview was groen (achter Vercel-auth).
- Build groen, tsc 0 errors, 182 unit-tests groen.

## Gewijzigde files (deze sessie) — kerngebieden
- `src/i18n/{config,request,messages}.ts` — NIEUW: next-intl cookie-setup. `messages.ts` is GEGENEREERD uit `src/messages/` (zie key context).
- `src/messages/{nl,en}/*.json` — 96 namespace-bestanden, NL/EN parity.
- `src/components/LanguageSwitcher.tsx` — NIEUW: NL/EN-knop (zet NEXT_LOCALE-cookie + router.refresh).
- `src/app/layout.tsx` — NextIntlClientProvider, dynamische `lang`, generateMetadata.
- `next.config.ts` — createNextIntlPlugin gewired.
- Vrijwel alle pages/components onder `src/app` en `src/components` + `src/emails/*` + `src/lib/*` consumers omgezet naar `t()`.

## Wat werkt (geverifieerd: build + 182 tests + curl NL/EN)
- Toggle wisselt hele site NL<->EN, cookie blijft hangen. Nieuwe bezoeker = NL (default).
- Publieke site, auth, member-dashboard, admin-panel, error-paginas, en lib-data (Moederbord bestuur/commissie-bios, partner-taglines/tiers, badge-namen, commissie-beschrijvingen) tweetalig. 0 intl-errors.

## Wat niet werkte / geleerde lessen
- Co-located `*Content.tsx`/`*Client.tsx` in route-folders staan los van `src/components` — page-agents misten ze eerst (FaqContent, PrivacyContent, IntroweekClient etc.). Apart opgepakt in wave 2.
- `calendarHelpers.ticketLabel()` gaf NL-strings terug: omgezet naar i18n-keys, alle aanroepers bijgewerkt.
- `pkill -f "next start"` geeft exit 144 en breekt command-chains in deze shell. Kill via poort-PID (`ss -tlnp | grep :PORT`).

## Blokkades
- Geen. Vercel preview-URL geeft 401 voor anonieme curl (Deployment Protection aan) — alleen ingelogd zichtbaar, geen bug.

## Volgende stappen
1. Verifieer svsit.nl na prod-deploy: toggle NL/EN op homepage + over-ons + dashboard.
2. Optioneel intern restwerk: `ROLLEN`-beschrijvingen (constants, admin-tooltips) nog NL; `toLocaleString('nl-NL')` getalnotatie niet locale-aware; transactionele e-mails default NL.
3. Optioneel: e-mails echt tweetalig zodra er een `locale`-kolom op `members` komt (prop staat al klaar).

## Key context (voor nieuwe sessie)
- i18n is **cookie-based** (NEXT_LOCALE), GEEN `[locale]` in de URL. Alle routes zijn nu dynamisch (f) omdat de layout `cookies()` leest.
- `src/i18n/messages.ts` (de barrel) wordt GEGENEREERD: 1 namespace = `src/messages/{nl,en}/<ns>.json`. Nieuwe namespace toevoegen = json maken, dan barrel regenereren (bash-loop staat in de sessie-historie; leest de map en schrijft imports + nl/en maps). Handmatig bewerken mag ook maar regenereren is veiliger.
- Vertaalpatroon voor lib-data: lib blijft de NL-bron, EN komt in message-JSON gekeyed op id, consumer resolvet via t() met de id.
- E-mails gebruiken GEEN next-intl (geen request-context bij verzenden): eigen `locale`-prop + lokaal copy-object, default `nl`.
