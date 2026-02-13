-- TrustNest profile fields for users (bio, stats for UI).
-- Run after 003-people-only.sql. Safe to run multiple times.

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_active INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rentals_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS response_time_hours INTEGER;
