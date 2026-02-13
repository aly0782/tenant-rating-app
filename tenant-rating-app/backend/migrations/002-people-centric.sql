-- PIVOT: From properties to people. Run after 001 and main schema.
-- People = users (we add city, avg_rating, review_count for profile display).

-- 1. Add profile fields to users (people)
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 2. Rental history: proof that landlord + tenant rented together
CREATE TABLE IF NOT EXISTS rental_history (
  id SERIAL PRIMARY KEY,
  landlord_id INTEGER NOT NULL REFERENCES users(id),
  tenant_id INTEGER NOT NULL REFERENCES users(id),
  property_address VARCHAR(255),
  rental_start_date DATE,
  rental_end_date DATE,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT different_parties CHECK (landlord_id != tenant_id)
);

-- 3. Reviews: now about PEOPLE (reviewed_user_id), with proof (rental_history_id)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewed_user_id INTEGER REFERENCES users(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rental_history_id INTEGER REFERENCES rental_history(id);
-- Keep property_id nullable for backward compatibility; new reviews use reviewed_user_id + rental_history_id
ALTER TABLE reviews ALTER COLUMN property_id DROP NOT NULL;

-- Index for search
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_rental_history_landlord_tenant ON rental_history(landlord_id, tenant_id);
