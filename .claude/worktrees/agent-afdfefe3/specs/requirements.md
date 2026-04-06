# Requirements — SIT Leden Portaal

**Status**: APPROVED
**Laatst bijgewerkt**: 2026-03-30
**Auteur**: Matin Khajehfard

## 1. Samenvatting

Ledenportaal voor SIT: registratie, login, digitale ledenpas met QR code, puntensysteem en admin panel — geintegreerd in de bestaande Next.js site met Supabase, NextAuth.js v5 en Stripe (SEPA recurring).

## 2. Doelgroep

- **Primair**: HBO-ICT studenten HvA — lid worden, ledenpas gebruiken, punten(XP) verzamelen, events bijwonen , custom avatar bouwen als profiel 
- **Secundair**: Bestuur en commissieleden — admin panel, QR scanner, ledenbeheer, statistieken
- **Tertiair**: Docenten/mentoren — support rol, lid worden als mentor

## 3. Must Have (MoSCoW)

- **US-01**: Als student wil ik me registreren via een 4-stappen flow (welkom → commissie kiezen → wachtwoord → betalen) zodat ik lid word van SIT
- **US-02**: Als student wil ik inloggen met mijn HvA Microsoft account (1 klik) zodat ik snel toegang heb
- **US-03**: Als student wil ik inloggen met email + wachtwoord als fallback (alumni, externe leden)
- **US-04**: Als student wil ik 10 euro/jaar betalen via Stripe (SEPA recurring, iDEAL, card) zodat mijn lidmaatschap automatisch verlengt
- **US-05**: Als lid wil ik een dashboard zien met mijn stats, punten(XP), rank en recente activiteit
- **US-06**: Als lid wil ik een digitale ledenpas met QR code, mijn naam, rol en rank zodat ik me kan identificeren bij events
- **US-07**: Als lid wil ik mijn profiel bewerken (studentnummer, commissie, wachtwoord)
- **US-08**: Als bestuurslid wil ik een admin panel met ledenlijst, zoekbalk, filters en statistieken
- **US-09**: Als bestuurslid wil ik QR codes scannen om punten(XP) toe te kennen bij events
- **US-10**: Als lid wil ik dat alleen ik mijn eigen data kan zien (Supabase RLS)
- **US-11**: Als bestuurslid wil ik Stripe webhooks die lidmaatschappen automatisch activeren/deactiveren

## 4. Should Have

- **SH-01**: Welkomstmail na registratie
- **SH-02**: Stripe Customer Portal (leden beheren zelf abonnement/betaalmethode)
- **SH-03**: Admin event beheer (events aanmaken voor scanning)
- **SH-04**: Ledenpas downloaden als PNG
- **SH-05**: Rank systeem (Starter → Bronze → Silver → Gold → Platinum → Diamond, elke 5 punten(XP) level up)

## 5. Out of Scope

- Geen eigen CMS voor events (komt in Fase 3 met Notion)
- Geen welkomstmail in v1 (should-have voor later)
- Geen openbaar ledenprofiel of social features
- Geen chat/messaging tussen leden
- Geen data migratie script (ledenlijst wordt apart aangeleverd)
- Geen Excel export

## 6. Constraints

- **Framework**: Next.js 16 App Router (bestaande codebase, niet migreren)
- **Database**: Supabase (PostgreSQL + RLS), niet eigen server
- **Auth**: NextAuth.js v5 met Microsoft Azure AD + credentials
- **Betalingen**: Stripe (SEPA recurring, iDEAL, card)
- **Hosting**: Vercel (bestaande deploy pipeline)
- **Design**: Zelfde dark theme en developer aesthetic als de homepage, brand kit kleuren in figma 
- **Mobile first**: Dashboard voor studenten op telefoon, admin panel desktop first

## 7. Success Criteria

- Studenten kunnen zich registreren en betalen via de site (volledige flow werkt)
- Leden kunnen inloggen en hun QR ledenpas tonen bij events
- Bestuur kan leden beheren en punten scannen via admin panel
- Stripe subscriptions verlopen automatisch (webhook-driven, idempotent)
- sitlid.nl is niet meer nodig — alles draait op svsit.nl
