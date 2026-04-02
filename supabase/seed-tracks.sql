-- Seed: Track Milestones
-- 5 tracks x 5 milestones = 25 rows in challenges table
-- type: 'track_milestone', proof_required: true

-- ============================================================
-- Track: Fullstack Developer (track_id: 'fullstack')
-- ============================================================
INSERT INTO challenges (id, track_id, type, title, description, category, points, proof_type, proof_required, track_order) VALUES
  (gen_random_uuid(), 'fullstack', 'track_milestone', 'Maak een GitHub profiel en pin je beste project', 'Laat zien wat je al gebouwd hebt. Pin minstens 1 project op je GitHub profiel.', 'code', 1, 'link', true, 1),
  (gen_random_uuid(), 'fullstack', 'track_milestone', 'Bouw een simpele website en deploy op Vercel/Netlify', 'Maak een website (HTML/CSS of framework) en zet hem live. Deel de URL.', 'code', 2, 'link', true, 2),
  (gen_random_uuid(), 'fullstack', 'track_milestone', 'Maak een REST API met Node.js of Python', 'Bouw een werkende API met minstens 2 endpoints. Deel de repo link.', 'code', 2, 'link', true, 3),
  (gen_random_uuid(), 'fullstack', 'track_milestone', 'Bouw een fullstack app met database', 'Frontend + backend + database. Kan een simpele CRUD app zijn. Deel de repo.', 'code', 3, 'link', true, 4),
  (gen_random_uuid(), 'fullstack', 'track_milestone', 'Doe mee aan een hackathon', 'Neem deel aan een hackathon (SIT of extern). Beschrijf je ervaring.', 'code', 3, 'text', true, 5);

-- ============================================================
-- Track: AI Engineer (track_id: 'ai_engineer')
-- ============================================================
INSERT INTO challenges (id, track_id, type, title, description, category, points, proof_type, proof_required, track_order) VALUES
  (gen_random_uuid(), 'ai_engineer', 'track_milestone', 'Voltooi een intro ML cursus (Kaggle/Coursera)', 'Rond een beginners ML cursus af en deel je certificaat of profiel link.', 'learn', 2, 'link', true, 1),
  (gen_random_uuid(), 'ai_engineer', 'track_milestone', 'Train je eerste model en deel resultaten', 'Train een ML model (classificatie, regressie, etc) en deel je notebook of repo.', 'code', 2, 'link', true, 2),
  (gen_random_uuid(), 'ai_engineer', 'track_milestone', 'Bouw een chatbot of classifier', 'Maak een werkende AI applicatie. Kan een chatbot, image classifier, of recommender zijn.', 'code', 3, 'link', true, 3),
  (gen_random_uuid(), 'ai_engineer', 'track_milestone', 'Presenteer je AI project bij een SIT event', 'Geef een korte presentatie of demo van je AI project bij een SIT event.', 'impact', 2, 'text', true, 4),
  (gen_random_uuid(), 'ai_engineer', 'track_milestone', 'Behaal een AI certificaat', 'Haal een AI/ML certificaat (Google, AWS, Coursera, etc). Deel het bewijs.', 'learn', 3, 'link', true, 5);

-- ============================================================
-- Track: Cyber Security (track_id: 'security')
-- ============================================================
INSERT INTO challenges (id, track_id, type, title, description, category, points, proof_type, proof_required, track_order) VALUES
  (gen_random_uuid(), 'security', 'track_milestone', 'Maak een TryHackMe/HackTheBox account', 'Maak een account aan en deel je profiel link.', 'code', 1, 'link', true, 1),
  (gen_random_uuid(), 'security', 'track_milestone', 'Los 5 beginner CTF challenges op', 'Los minstens 5 easy/medium challenges op. Deel je profiel met bewijs.', 'code', 2, 'link', true, 2),
  (gen_random_uuid(), 'security', 'track_milestone', 'Doe mee aan een CTF competitie', 'Neem deel aan een CTF (SIT of extern). Beschrijf je ervaring en resultaat.', 'code', 3, 'text', true, 3),
  (gen_random_uuid(), 'security', 'track_milestone', 'Geef een korte presentatie over een security topic', 'Presenteer bij een SIT event over een security onderwerp naar keuze.', 'impact', 2, 'text', true, 4),
  (gen_random_uuid(), 'security', 'track_milestone', 'Behaal een security certificaat (CompTIA/CEH/etc)', 'Haal een erkend security certificaat. Deel het bewijs.', 'learn', 3, 'link', true, 5);

-- ============================================================
-- Track: Feestbeest (track_id: 'feestbeest')
-- ============================================================
INSERT INTO challenges (id, track_id, type, title, description, category, points, proof_type, proof_required, track_order) VALUES
  (gen_random_uuid(), 'feestbeest', 'track_milestone', 'Ga naar je eerste SIT borrel', 'Scan je QR code bij je eerste borrel. Proost!', 'social', 1, 'scan', true, 1),
  (gen_random_uuid(), 'feestbeest', 'track_milestone', 'Ga naar 3 verschillende events', 'Bezoek minstens 3 verschillende SIT events. Scans tellen als bewijs.', 'social', 2, 'scan', true, 2),
  (gen_random_uuid(), 'feestbeest', 'track_milestone', 'Organiseer of help bij een event', 'Help mee met de organisatie van een SIT event. Beschrijf wat je gedaan hebt.', 'impact', 2, 'text', true, 3),
  (gen_random_uuid(), 'feestbeest', 'track_milestone', 'Ga mee op kroegentocht', 'Doe mee aan een SIT kroegentocht door Amsterdam. Scan bij aankomst.', 'social', 2, 'scan', true, 4),
  (gen_random_uuid(), 'feestbeest', 'track_milestone', 'Bezoek 10 events in totaal', 'Bereik 10 event scans. Je bent een echte stamgast.', 'social', 3, 'scan', true, 5);

-- ============================================================
-- Track: Community Builder (track_id: 'community')
-- ============================================================
INSERT INTO challenges (id, track_id, type, title, description, category, points, proof_type, proof_required, track_order) VALUES
  (gen_random_uuid(), 'community', 'track_milestone', 'Help een eerstejaars met een vraag', 'Help iemand uit een lager jaar met een studie- of techvraag. Beschrijf kort.', 'impact', 1, 'text', true, 1),
  (gen_random_uuid(), 'community', 'track_milestone', 'Word actief in een SIT commissie', 'Sluit je aan bij een commissie en draag actief bij. Beschrijf je rol.', 'impact', 2, 'text', true, 2),
  (gen_random_uuid(), 'community', 'track_milestone', 'Organiseer een workshop of presentatie', 'Organiseer zelf een workshop, talk, of demo voor SIT leden.', 'impact', 3, 'text', true, 3),
  (gen_random_uuid(), 'community', 'track_milestone', 'Mentor een nieuw lid voor een maand', 'Begeleid een nieuw SIT lid gedurende minstens een maand. Beschrijf je aanpak.', 'impact', 3, 'text', true, 4),
  (gen_random_uuid(), 'community', 'track_milestone', 'Draag bij aan een SIT project (website, tools, etc)', 'Lever een bijdrage aan een SIT project. Deel de PR of commit link.', 'code', 3, 'link', true, 5);
