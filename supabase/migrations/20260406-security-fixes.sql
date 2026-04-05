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
  member_id = (select auth.uid())
);

-- ============================================================================
-- 4. Fix auth_rls_initplan: wrap auth.uid() in (select ...) for performance
--    Prevents re-evaluation per row, evaluates once per query instead
-- ============================================================================

-- members: fix existing policies
DROP POLICY IF EXISTS "members_select_own" ON members;
CREATE POLICY "members_select_own" ON members FOR SELECT USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "members_update_own" ON members;
CREATE POLICY "members_update_own" ON members FOR UPDATE USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "members_delete_admin" ON members;
CREATE POLICY "members_delete_admin" ON members FOR DELETE USING (
  EXISTS (SELECT 1 FROM members WHERE id = (select auth.uid()) AND is_admin = true)
);

-- scans: fix existing policies
DROP POLICY IF EXISTS "scans_select" ON scans;
CREATE POLICY "scans_select" ON scans FOR SELECT USING (member_id = (select auth.uid()));

DROP POLICY IF EXISTS "scans_insert_admin" ON scans;
CREATE POLICY "scans_insert_admin" ON scans FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM members WHERE id = (select auth.uid()) AND is_admin = true)
);

-- payments: fix existing policies
DROP POLICY IF EXISTS "payments_select" ON payments;
CREATE POLICY "payments_select" ON payments FOR SELECT USING (member_id = (select auth.uid()));

DROP POLICY IF EXISTS "payments_update" ON payments;
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (member_id = (select auth.uid()));

-- Also fix the new V2 policies to use (select auth.uid())
-- (Re-create them with optimized auth calls)

DROP POLICY IF EXISTS "member_badges_select" ON member_badges;
CREATE POLICY "member_badges_select" ON member_badges FOR SELECT USING (member_id = (select auth.uid()));
DROP POLICY IF EXISTS "member_badges_insert" ON member_badges;
CREATE POLICY "member_badges_insert" ON member_badges FOR INSERT WITH CHECK (member_id = (select auth.uid()));
DROP POLICY IF EXISTS "member_badges_update" ON member_badges;
CREATE POLICY "member_badges_update" ON member_badges FOR UPDATE USING (member_id = (select auth.uid()));

DROP POLICY IF EXISTS "member_accessories_select" ON member_accessories;
CREATE POLICY "member_accessories_select" ON member_accessories FOR SELECT USING (member_id = (select auth.uid()));
DROP POLICY IF EXISTS "member_accessories_insert" ON member_accessories;
CREATE POLICY "member_accessories_insert" ON member_accessories FOR INSERT WITH CHECK (member_id = (select auth.uid()));
DROP POLICY IF EXISTS "member_accessories_update" ON member_accessories;
CREATE POLICY "member_accessories_update" ON member_accessories FOR UPDATE USING (member_id = (select auth.uid()));

DROP POLICY IF EXISTS "xp_transactions_select" ON xp_transactions;
CREATE POLICY "xp_transactions_select" ON xp_transactions FOR SELECT USING (member_id = (select auth.uid()));

DROP POLICY IF EXISTS "shop_transactions_select" ON shop_transactions;
CREATE POLICY "shop_transactions_select" ON shop_transactions FOR SELECT USING (member_id = (select auth.uid()));

DROP POLICY IF EXISTS "challenge_submissions_select" ON challenge_submissions;
CREATE POLICY "challenge_submissions_select" ON challenge_submissions FOR SELECT USING (member_id = (select auth.uid()));
DROP POLICY IF EXISTS "challenge_submissions_insert" ON challenge_submissions;
CREATE POLICY "challenge_submissions_insert" ON challenge_submissions FOR INSERT WITH CHECK (member_id = (select auth.uid()));

DROP POLICY IF EXISTS "tickets_select" ON tickets;
CREATE POLICY "tickets_select" ON tickets FOR SELECT USING (member_id = (select auth.uid()));

DROP POLICY IF EXISTS "rewards_select" ON rewards;
CREATE POLICY "rewards_select" ON rewards FOR SELECT USING (member_id = (select auth.uid()));

DROP POLICY IF EXISTS "accessory_definitions_insert" ON accessory_definitions;
CREATE POLICY "accessory_definitions_insert" ON accessory_definitions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM members WHERE id = (select auth.uid()) AND is_admin = true)
);
DROP POLICY IF EXISTS "accessory_definitions_update" ON accessory_definitions;
CREATE POLICY "accessory_definitions_update" ON accessory_definitions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM members WHERE id = (select auth.uid()) AND is_admin = true)
);

DROP POLICY IF EXISTS "boss_fights_insert" ON boss_fights;
CREATE POLICY "boss_fights_insert" ON boss_fights FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM members WHERE id = (select auth.uid()) AND is_admin = true)
);
DROP POLICY IF EXISTS "boss_fights_update" ON boss_fights;
CREATE POLICY "boss_fights_update" ON boss_fights FOR UPDATE USING (
  EXISTS (SELECT 1 FROM members WHERE id = (select auth.uid()) AND is_admin = true)
);

-- Also fix members_insert
DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members FOR INSERT WITH CHECK (
  (select auth.uid()) = id
);

-- ============================================================================
-- 5. Add missing foreign key indexes (PERFORMANCE)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_boss_fight_contributions_member ON boss_fight_contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_boss_fights_badge ON boss_fights(base_reward_badge_id);
CREATE INDEX IF NOT EXISTS idx_boss_fights_accessory ON boss_fights(top_reward_accessory_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_member ON challenge_submissions(member_id);
CREATE INDEX IF NOT EXISTS idx_member_accessories_accessory ON member_accessories(accessory_id);
CREATE INDEX IF NOT EXISTS idx_member_badges_badge ON member_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_scans_event ON scans(event_id);
CREATE INDEX IF NOT EXISTS idx_shop_transactions_accessory ON shop_transactions(accessory_id);
CREATE INDEX IF NOT EXISTS idx_shop_transactions_member ON shop_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_member ON tickets(member_id);

-- ============================================================================
-- 6. Drop unused indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_payments_session;
DROP INDEX IF EXISTS idx_member_commissies_commissie;
