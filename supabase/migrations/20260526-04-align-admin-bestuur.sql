-- Migration: Align is_admin with bestuur role
-- T010: Ensure all bestuur members have admin access

UPDATE members SET is_admin = true WHERE role = 'bestuur' AND is_admin = false;
