-- Migration: custom aanmeld-velden per event
--
-- Doel: bestuur kan per event zelf bepalen welke extra velden de aanmeld-form
-- toont (bijv. shirtmaat, dieetwens, motivatie). De velddefinities staan op het
-- event; de ingevulde antwoorden op het ticket (geldt voor zowel gratis RSVP als
-- betaalde tickets, want beide gebruiken de tickets-tabel).
--
-- form_fields  = array van velddefinities, vorm:
--   [{ "id": "f1", "label": "Shirtmaat", "type": "select", "required": true,
--      "options": ["S","M","L"], "placeholder": null }]
--   type ∈ text | textarea | select | checkbox | number | date
-- custom_data  = object antwoord-per-veld-id, vorm: { "f1": "M", "f2": "..." }

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS form_fields jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS custom_data jsonb NOT NULL DEFAULT '{}'::jsonb;

-- RPC uitbreiden met p_custom_data. De atomic booking-logica (row-lock op event,
-- capaciteitscheck, pending-telling binnen 30 min) blijft identiek; alleen het
-- custom_data-veld komt erbij in de INSERT.
--
-- Oude 7-arg signatuur droppen: een extra param met DEFAULT zou anders een
-- tweede overload aanmaken i.p.v. de bestaande functie te vervangen.
DROP FUNCTION IF EXISTS book_event_ticket(uuid, uuid, text, text, text, integer, text);

CREATE OR REPLACE FUNCTION book_event_ticket(
  p_event_id uuid,
  p_member_id uuid,
  p_email text,
  p_name text,
  p_status text,
  p_paid_amount integer,
  p_ticket_number text,
  p_custom_data jsonb DEFAULT '{}'::jsonb
)
RETURNS tickets
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_capacity integer;
  v_count integer;
  v_ticket tickets;
BEGIN
  -- Lock de event-rij zodat boekingen voor hetzelfde event serieel verlopen
  SELECT capacity INTO v_capacity
  FROM events
  WHERE id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EVENT_NOT_FOUND';
  END IF;

  IF v_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_count
    FROM tickets
    WHERE event_id = p_event_id
      AND (
        status IN ('paid', 'checked_in')
        OR (status = 'pending' AND created_at > now() - interval '30 minutes')
      );

    IF v_count >= v_capacity THEN
      RAISE EXCEPTION 'EVENT_FULL';
    END IF;
  END IF;

  INSERT INTO tickets (
    event_id, member_id, email, name, status, paid_amount, ticket_number, custom_data
  )
  VALUES (
    p_event_id, p_member_id, p_email, p_name, p_status, p_paid_amount, p_ticket_number,
    COALESCE(p_custom_data, '{}'::jsonb)
  )
  RETURNING * INTO v_ticket;

  RETURN v_ticket;
END;
$$;
