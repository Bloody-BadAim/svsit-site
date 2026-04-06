-- Fix: source_id was UUID but badge IDs are TEXT strings (e.g. 'badge_first_event')
-- This caused silent insert failures when grantXp() was called from badge unlocks
ALTER TABLE xp_transactions ALTER COLUMN source_id TYPE text USING source_id::text;
