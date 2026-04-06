ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_number TEXT;
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
