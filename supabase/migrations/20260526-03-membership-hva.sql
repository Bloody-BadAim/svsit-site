-- Migration: HvA email + membership improvements
-- T017: Add hva_email column
-- T051: Add ticket_number uniqueness

-- 1. Add hva_email column
ALTER TABLE members ADD COLUMN IF NOT EXISTS hva_email TEXT;

-- 2. Ensure ticket_number is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tickets_ticket_number_key'
  ) THEN
    -- Clean up any existing duplicates first
    UPDATE tickets t1
    SET ticket_number = ticket_number || '-dup-' || t1.id
    WHERE EXISTS (
      SELECT 1 FROM tickets t2
      WHERE t2.ticket_number = t1.ticket_number
      AND t2.id < t1.id
    );
    ALTER TABLE tickets ADD CONSTRAINT tickets_ticket_number_key UNIQUE (ticket_number);
  END IF;
END $$;
