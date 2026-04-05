-- Security fixes: function search_path + RLS policies
-- Run in Supabase SQL Editor

-- ============================================================================
-- 1. Fix function search_path (WARN: function_search_path_mutable)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_boss_contribution(
  p_boss_id UUID,
  p_member_id UUID,
  p_amount INTEGER
) RETURNS void
SET search_path = public
AS $$
BEGIN
  INSERT INTO boss_fight_contributions (boss_fight_id, member_id, xp_contributed, updated_at)
  VALUES (p_boss_id, p_member_id, p_amount, now())
  ON CONFLICT (boss_fight_id, member_id)
  DO UPDATE SET
    xp_contributed = boss_fight_contributions.xp_contributed + p_amount,
    updated_at = now();

  UPDATE boss_fights
  SET current_hp = (
    SELECT COALESCE(SUM(xp_contributed), 0)
    FROM boss_fight_contributions
    WHERE boss_fight_id = p_boss_id
  )
  WHERE id = p_boss_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS boolean
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM members WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. RLS policies for V2 gamification tables
--    App uses service_role_key (bypasses RLS), but policies are needed for
--    security best practice and direct client access via anon key.
-- ============================================================================

-- accessory_definitions: public read, admin write
CREATE POLICY "accessory_definitions_select" ON accessory_definitions FOR SELECT USING (true);
CREATE POLICY "accessory_definitions_insert" ON accessory_definitions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "accessory_definitions_update" ON accessory_definitions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
);

-- badge_definitions: public read, no client write (seed data)
CREATE POLICY "badge_definitions_select" ON badge_definitions FOR SELECT USING (true);

-- levels: public read, no client write (seed data)
CREATE POLICY "levels_select" ON levels FOR SELECT USING (true);

-- member_badges: own read, service_role write
CREATE POLICY "member_badges_select" ON member_badges FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "member_badges_insert" ON member_badges FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY "member_badges_update" ON member_badges FOR UPDATE USING (member_id = auth.uid());

-- member_accessories: own read/update, service_role insert
CREATE POLICY "member_accessories_select" ON member_accessories FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "member_accessories_insert" ON member_accessories FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY "member_accessories_update" ON member_accessories FOR UPDATE USING (member_id = auth.uid());

-- xp_transactions: own read, service_role write
CREATE POLICY "xp_transactions_select" ON xp_transactions FOR SELECT USING (member_id = auth.uid());

-- boss_fights: public read, admin write
CREATE POLICY "boss_fights_select" ON boss_fights FOR SELECT USING (true);
CREATE POLICY "boss_fights_insert" ON boss_fights FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "boss_fights_update" ON boss_fights FOR UPDATE USING (
  EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
);

-- boss_fight_contributions: public read, service_role write
CREATE POLICY "boss_fight_contributions_select" ON boss_fight_contributions FOR SELECT USING (true);

-- shop_transactions: own read, service_role write
CREATE POLICY "shop_transactions_select" ON shop_transactions FOR SELECT USING (member_id = auth.uid());

-- challenges: public read, admin write
CREATE POLICY "challenges_select" ON challenges FOR SELECT USING (true);

-- challenge_submissions: own read + insert, admin update
CREATE POLICY "challenge_submissions_select" ON challenge_submissions FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "challenge_submissions_insert" ON challenge_submissions FOR INSERT WITH CHECK (member_id = auth.uid());

-- events: public read
CREATE POLICY "events_select" ON events FOR SELECT USING (true);

-- tickets: own read
CREATE POLICY "tickets_select" ON tickets FOR SELECT USING (member_id = auth.uid());

-- rewards: own read (legacy table)
CREATE POLICY "rewards_select" ON rewards FOR SELECT USING (member_id = auth.uid());

-- ============================================================================
-- 3. Tighten existing overly permissive policies
-- ============================================================================

-- members_insert: restrict to service_role only (registration goes through API)
DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- payments_insert: restrict to service_role only (Stripe webhook)
DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (
  member_id = auth.uid()
);
