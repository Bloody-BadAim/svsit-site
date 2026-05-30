-- Migration: Atomic ticket booking to prevent capacity race conditions
--
-- Probleem: de oude flow telde tickets en deed daarna een aparte INSERT.
-- Twee gelijktijdige requests konden beide de capaciteitscheck passeren en
-- beide een ticket aanmaken -> overboeking. Bij betaalde events werden
-- 'pending' tickets bovendien niet meegeteld, dus tijdens checkout kon je
-- onbeperkt pending tickets aanmaken die daarna allemaal betaald werden.
--
-- Oplossing: een functie die de event-rij locked (SELECT ... FOR UPDATE),
-- de relevante tickets telt en pas dan insert. Door de row-lock worden
-- boekingen per event geserialiseerd. Pending tickets tellen mee binnen een
-- reserveringsvenster van 30 minuten (Stripe checkout window), zodat
-- afgebroken checkouts geen plekken permanent blokkeren.

CREATE OR REPLACE FUNCTION book_event_ticket(
  p_event_id uuid,
  p_member_id uuid,
  p_email text,
  p_name text,
  p_status text,
  p_paid_amount integer,
  p_ticket_number text
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
    event_id, member_id, email, name, status, paid_amount, ticket_number
  )
  VALUES (
    p_event_id, p_member_id, p_email, p_name, p_status, p_paid_amount, p_ticket_number
  )
  RETURNING * INTO v_ticket;

  RETURN v_ticket;
END;
$$;
