-- Migration: partial composite index voor de leaderboard-query
--
-- /leaderboard filtert op membership_active + is_admin + leaderboard_visible en
-- sorteert op total_xp DESC. Zonder index = sequential scan (ok bij 95 leden,
-- merkbaar bij 200+ na introweek). Partial index dekt WHERE + ORDER BY in 1 pass.

CREATE INDEX IF NOT EXISTS idx_members_leaderboard
ON members (total_xp DESC)
WHERE membership_active = true AND is_admin = false AND leaderboard_visible = true;
