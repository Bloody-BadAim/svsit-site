-- Migration: Add notion_id to events table + recap fields
-- T012: Prevent duplicate events from Notion sync
-- T036: Add recap fields for event recaps feature

-- 1. Add notion_id column with unique constraint
ALTER TABLE events ADD COLUMN IF NOT EXISTS notion_id TEXT UNIQUE;

-- 2. Add recap fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS recap_description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recap_photos TEXT[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS recap_published BOOLEAN DEFAULT false;

-- 3. Cleanup orphan duplicate events (T015)
-- Keep the oldest event for each title+date combo, delete newer duplicates
DELETE FROM events
WHERE id NOT IN (
  SELECT MIN(id)
  FROM events
  GROUP BY title, date
);
