-- Voorkom dubbele self-check-ins voor hetzelfde event.
-- De route events/[id]/checkin deed SELECT-dan-INSERT: bij gelijktijdige
-- requests zien beide "nog niet ingecheckt" en kennen beide 25 punten + XP toe
-- (points farming). Een partial unique index maakt de guard atomair in de DB.
--
-- Admin-scans (scanned_by gevuld) blijven ongemoeid: meerdere punttoekenningen
-- per lid/event blijven toegestaan. Alleen self-check-ins (scanned_by IS NULL)
-- worden geunificeerd.

-- 1. Bestaande duplicaat self-check-ins opruimen (hou de vroegste per lid+event)
DELETE FROM public.scans s
USING public.scans dup
WHERE s.scanned_by IS NULL
  AND dup.scanned_by IS NULL
  AND s.event_id IS NOT NULL
  AND dup.event_id IS NOT NULL
  AND s.member_id = dup.member_id
  AND s.event_id = dup.event_id
  AND (
    s.created_at > dup.created_at
    OR (s.created_at = dup.created_at AND s.id > dup.id)
  );

-- 2. Partial unique index: maximaal 1 self-check-in per lid per event
CREATE UNIQUE INDEX IF NOT EXISTS scans_self_checkin_unique
  ON public.scans (member_id, event_id)
  WHERE scanned_by IS NULL AND event_id IS NOT NULL;
