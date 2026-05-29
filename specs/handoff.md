# Handoff — SIT Website — 2026-05-29

## Doel
SIT website performance + homepage redesign + content vullen

## Status
- Fase: 4 (Implement) — performance caching DONE, homepage + content in progress
- Gate: Build passing, deployed op svsit.nl
- Commit: `85a48f4` (perf: unstable_cache /events)

## Plan sessie 14

### Technisch (Claude doet)
1. /events/[id] — unstable_cache per event ID (60s revalidate)
2. Leaderboard top10 — unstable_cache (60s), bubble blijft real-time
3. Image audit — next/image, WebP, lazy loading check
4. Dead code scan — unused components/imports
5. Homepage — battle divider (pixel poppetjes) verwijderen
6. Homepage — SponsorShowcase sectie weg, sponsor logos naar EventTicker marquee
7. Claude Design prompt schrijven voor betere homepage

### Content (user input nodig)
8. Event descriptions vullen — 26/38 events missen description
9. Introweek page updaten — planning nog niet rond (Tinka)
10. Recaps publiceren — foto's nodig van user

### Audit (handmatig)
11. Lighthouse via pagespeed.web.dev of Chrome DevTools
12. Vercel env vars check

### Later
13. Sentry error monitoring opzetten
14. JS bundle analyse (1.185 KB, welke chunks zijn groot?)

## Key context
- Supabase ref: plgcqkbfvzwkqzkggmfh
- unstable_cache pattern: import from 'next/cache', wrap query, ['cache-key'], { revalidate: 60 }
- ISR faalt lokaal (geen Supabase env vars in .env.local) — force-dynamic + unstable_cache is de approach
- Homepage flow: Hero > About > WhyJoin > Battle Divider > Events > EventTicker > SponsorShowcase > JoinCta > Footer
- User wil: sponsor logos IN de ticker (marquee), NIET als aparte sectie
- User wil: battle divider (pixel poppetjes) WEG
- Commits: 85a48f4, 5ddbcce, cba32b4, ee5b6a5, e451c66
