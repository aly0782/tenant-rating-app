-- People-based pivot: USERS + REVIEWS only (no properties for reviews).
-- Run after schema.sql (and 001 if you have it). Safe to run multiple times.

-- 1. USERS: ensure profile fields exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
-- user_type already in schema

-- 2. REVIEWS: reference PEOPLE (reviewed_user_id); property_id optional for legacy
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewed_user_id INTEGER REFERENCES users(id);
ALTER TABLE reviews ALTER COLUMN property_id DROP NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user ON reviews(reviewed_user_id);
