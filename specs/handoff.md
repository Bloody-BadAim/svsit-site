# Handoff — SIT website (svsit.nl) — 2026-05-31

## Doel
Post-launch onderhoud SIT-verenigingssite. Live op main, Vercel auto-deploy.

## Status
- Fase: 4 Implement (post-launch, live op main)
- Sessie 28 AFGESLOTEN: security-scan repo (schoon) + NOTION_API_KEY-audit (niet in code)
- Gate: launch APPROVED (svsit.nl live)
- Working tree schoon, niks open in code

## Gewijzigde files (deze sessie)
- `specs/handoff.md` — security-scan + NOTION-audit genoteerd, sessie afgerond

## Wat werkt
- Repo secret-clean: geen secrets in tracked files/history, .env* gitignored, 18 secrets via process.env
- NOTION_API_KEY niet in code (alleen notion_id DB-kolom = legit member-sync)
- Vorige sessie 27 (afe08c6): events-recap inline + signup-guard + Moederbord wheel-scroll, gepusht

## Wat niet werkte / geleerde lessen
- Grep-tool kapot (ripgrep binary ENOENT in pnpm-path) — fallback: `git grep` via Bash
- Stripe rk_live key staat plaintext in ~/.config/stripe/live-restricted.key (perms 600, NIET in repo) — alleen lokaal

## Blokkades
- Geen (code af). Resterende items vereisen externe input/dashboards

## Volgende stappen (allemaal extern, geen code)
1. Visueel verifieren live svsit.nl: /events recaps + completed /events/[id] + Moederbord scroll
2. Foto's Thijmen/Yusuf/Liam (nu photo:null in moederbord.ts)
3. HHR PDF na ALV-bekrachtiging -> public/documenten + status "beschikbaar"
4. Stripe rk_live roteren via Stripe-dashboard (OPTIONEEL, lage urgentie, restricted scope)
5. NOTION_API_KEY weg uit Vercel-env (Settings > Environment Variables) — niet in code

## Key context (voor nieuwe sessie)
- CAVEMAN MODE full actief (terse prose, normale code/commits)
- Commit/push ALLEEN op expliciet "commit en push"
- Lenis-les: modals/drawers met eigen overflow in smooth-scroll pagina vereisen data-lenis-prevent
- Recap-data: events kolommen recap_description, recap_photos[], recap_published. Upload via /api/events/[id]/recap-photos (admin, service client, bucket 'recaps' public)
- Codebase strip diacritics in NL tekst (echt niet echt)
- Repo Bloody-BadAim/svsit-site, branch main. Supabase ref plgcqkbfvzwkqzkggmfh
- Sessie 28 commits: 12179c5, de3c936, e57d752 (allemaal docs, gepusht)
