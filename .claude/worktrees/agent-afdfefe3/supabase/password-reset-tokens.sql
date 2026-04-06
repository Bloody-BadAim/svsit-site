-- Password Reset Tokens
-- Run dit in de Supabase SQL editor

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_member ON password_reset_tokens(member_id);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Alleen service role kan tokens lezen/schrijven (API routes gebruiken service client)
DROP POLICY IF EXISTS "reset_tokens_service_only" ON password_reset_tokens;
CREATE POLICY "reset_tokens_service_only" ON password_reset_tokens
  FOR ALL USING (false);
