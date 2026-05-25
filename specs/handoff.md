# Handoff — SIT Website — 2026-05-26 (sessie 3)

## Status: MIGRATIES COMPLEET
- Alle 6 migraties succesvol gedraaid op productie Supabase
- Data integriteit geverifieerd
- Branch: `feature/website-overhaul` (5 commits, niet gepusht)

## Migratie resultaten

| # | Migratie | Status |
|---|---|---|
| 1 | remove-boss-fights | DONE — tabellen, functies, constraints verwijderd |
| 2 | events-notion-id | DONE — 4 kolommen toegevoegd, geen duplicates gevonden |
| 3 | membership-hva | DONE — hva_email kolom + ticket uniqueness constraint |
| 4 | align-admin-bestuur | DONE — 4 bestuurders aligned met is_admin |
| 5 | projecten | DONE — tabel aangemaakt (0 rijen) |
| 6 | vacatures | DONE — tabel aangemaakt (0 rijen) |

## Database staat na migraties

| Metric | Waarde |
|---|---|
| Tabellen | 20 (was 20: -2 boss fights, +2 projects/vacatures) |
| Members | 94 |
| Events | 38 |
| Bestuur | 4 (allen is_admin = true) |
| Commissies | 6 (Fun&Events: 5, GameIT/Sponsoring/Educatie/AI4HvA: 4, PR&Socials: 3) |
| Top XP | Matin: 14.135 XP, 30 badges, lvl 12 |
| Tickets | 0 (lege tabel) |
| Projects | 0 (nieuwe tabel) |
| Vacatures | 0 (nieuwe tabel) |

## Opmerkingen
- UUID MIN() werkt niet in PostgreSQL — migratie 02 gefixed met `MIN(id::text)::uuid` cast
- Near-duplicate events bestaan (bijv. 3x Bootfeest varianten, 2x AI hackathon) — worden opgelost door toekomstige Notion sync via notion_id
- Events.tsx is 277 regels (niet 1064 zoals in plan) — al goed gestructureerd, refactor overgeslagen
- Supabase MCP was niet beschikbaar, Management API via curl gebruikt als fallback

## Volgende stappen
- [ ] Push branch naar remote
- [ ] Near-duplicate events opschonen in Notion (bron van waarheid)
- [ ] Notion sync implementeren (notion_id koppeling)
- [ ] Event recaps feature bouwen (recap_description, recap_photos, recap_published)
- [ ] Projects en vacatures vullen met data
- [ ] Commissie pagina's bouwen
- [ ] Introweek landing page
- [ ] Registratie flow versimpelen (4 stappen + 10 euro upfront = drempel)
- [ ] PDF ticket generatie (T043)

## Key context
- Supabase project ref: plgcqkbfvzwkqzkggmfh
- Geen staging, direct op productie
- Build passing (57 pages)
- .env.local bevat alleen AUTH_SECRET
