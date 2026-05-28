-- Add missing indexes for commonly queried/joined columns
-- Executed on production 2026-05-28

CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (date);
CREATE INDEX IF NOT EXISTS idx_tickets_member ON tickets (member_id);
CREATE INDEX IF NOT EXISTS idx_scans_event ON scans (event_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_status ON challenge_submissions (status);

-- Cleanup: remove test events with fake dates
DELETE FROM events WHERE title = 'test' AND status = 'cancelled';
