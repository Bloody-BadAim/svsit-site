# Handoff — SIT Website (svsit.nl) — 2026-05-31

## Doel
2 taken: (A) member-pas-scannen-voor-punten werkt niet goed met XP -> opgeruimd. (B) leden kunnen XP zichtbaar/verborgen zetten, geldt voor email EN leaderboard.

## Status
- Fase: 4 Implement (post-launch onderhoud, live op main)
- Taak: T-scan-cleanup (A) + T-xp-visibility (B), MIDDEN IN UITVOERING
- Gate: launch APPROVED (svsit.nl live)
- Vorige taak T-leesbaarheid AF + gepusht (commit b67ce30)

## Diagnose (waarom A "werkt niet goed")
- MyCardTab QR -> `svsit.nl/scan/{id}` = 404 (geen /scan route bestaat)
- MemberCard `showQR` ({id,email} JSON) = nergens gerenderd (MyCardTab gaf showQR nooit door)
- QRScanner ledenpas-modus verwacht JSON, getoonde QR is URL -> altijd invalid
- /api/scans XP-bug: admin typt points 1-10, maar grant = FLAT calculateXpReward (5/10/25), points genegeerd
- Event-XP dubbelt: self check-in (25) + admin scan
- BESLISSING (wees artist): broken scan-flow + QR HELEMAAL WEG. Event-XP = enkel self check-in code. Admin handmatige punten (MemberDetailModal) blijft, maar XP = points fixen.

## Gewijzigde files (deze sessie) — A deels klaar
- `src/components/MemberCard.tsx` — KLAAR: showQR prop + QR render + qrData + react-qr-code import weg. Avatar = sticker/initialen.
- `src/components/dashboard/tabs/MyCardTab.tsx` — KLAAR: FlipCard QR-back weg, showQR state + QR-knop weg, QRCode import weg. Card direct gerenderd (data-card div), 3 knoppen (EDIT/SAVE/SHARE). useEffect import behouden (ActivityRow gebruikt het).

## Volgende stappen (NOG TE DOEN)
1. Commit (2 atomic: A scan-cleanup, B xp-visibility). NIET pushen zonder user OK.

## AF deze sessie (A + B code KLAAR, tsc + build groen)
- A1 `QRScanner.tsx`: ledenpas-modus weg, alleen ticket check-in (parseTicketId + handleTicketCheckin + handmatige ticket-invoer). KLAAR.
- A2 `api/scans/route.ts` POST: `const xpAmount = points` (was calculateXpReward), import weg. KLAAR.
- B `api/members/[id]/route.ts`: leaderboard_visible in GET select + beide PATCH allowlists. KLAAR.
- B `dashboard/profiel/page.tsx`: toggle xp.visibility (optimistic PATCH). KLAAR.
- B `api/leaderboard/route.ts`: filter op 4 queries + isHidden flag. KLAAR.
- B `leaderboard/page.tsx` (server, eigen queries): filter op top10 + bubble + isHidden. KLAAR.
- B `leaderboard/LeaderboardContent.tsx`: isHidden prop + verborgen-melding. KLAAR.
- B `api/cron/weekly-digest/route.ts`: top5 leaderboard `.eq('leaderboard_visible', true)`. KLAAR.

## Blokkades
- Geen

## Key context
- Anti-slop: NOOIT dashes/emojis in UI, alleen Lucide icons. Caveman mode actief (prose terse, code normaal).
- /api/scans ook gebruikt door MemberDetailModal (handmatig punten, geen event_id) + EventDetailPanel GET (lijst). Niet verwijderen.
- MemberCardData.memberId/email velden blijven (share-link gebruikt memberId). Geen consument meer voor QR.
- Supabase ref plgcqkbfvzwkqzkggmfh. ENIGE andere open punt: live Stripe e2e (user zelf).
