-- Seed test users and reviews for TrustNest.
-- Run after schema + migrations (002/003). Run: psql "$DATABASE_URL" -f seed-data.sql (from /backend)

-- 1. Test users (Lisbon and Porto)
INSERT INTO users (name, email, user_type, city, avg_rating, review_count) VALUES
('Sarah Mitchell', 'sarah@example.com', 'landlord', 'lisbon', 4.9, 32),
('Marcus Johnson', 'marcus@example.com', 'tenant', 'lisbon', 4.7, 15),
('Elena Rodriguez', 'elena@example.com', 'landlord', 'lisbon', 4.8, 24),
('Tom Bennett', 'tom@example.com', 'tenant', 'lisbon', 4.5, 8),
('Aisha Thompson', 'aisha@example.com', 'landlord', 'porto', 4.6, 19),
('Daniel Park', 'daniel@example.com', 'tenant', 'porto', 4.9, 21)
ON CONFLICT (email) DO NOTHING;

-- 2. Sample reviews (reviewer_id → reviewed_user_id; ids resolved by email)
-- Reviews for Sarah Mitchell (landlord)
INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 5, 'Best landlord I have ever had', 'Sarah was incredibly responsive and professional throughout my entire tenancy. She fixed issues within hours, kept the property in great shape, and was always fair with deposits. Highly recommend.', true
FROM users u1, users u2 WHERE u1.email = 'marcus@example.com' AND u2.email = 'sarah@example.com';

INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 5, 'Responsive and fair', 'Very easy to work with. Quick to respond and always fair with deposit returns.', true
FROM users u1, users u2 WHERE u1.email = 'elena@example.com' AND u2.email = 'sarah@example.com';

INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 4, 'Great overall experience', 'Good communication. Minor delay on one repair but otherwise smooth tenancy.', true
FROM users u1, users u2 WHERE u1.email = 'tom@example.com' AND u2.email = 'sarah@example.com';

-- Reviews for Marcus Johnson (tenant)
INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 5, 'Ideal tenant', 'Marcus paid on time every month and left the flat spotless. Would rent to him again.', true
FROM users u1, users u2 WHERE u1.email = 'sarah@example.com' AND u2.email = 'marcus@example.com';

INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 5, 'Very reliable', 'No issues at all. Quiet and respectful.', true
FROM users u1, users u2 WHERE u1.email = 'elena@example.com' AND u2.email = 'marcus@example.com';

-- Reviews for Elena Rodriguez (landlord)
INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 5, 'Excellent landlord', 'Elena was professional and the apartment was exactly as described. Very happy.', true
FROM users u1, users u2 WHERE u1.email = 'marcus@example.com' AND u2.email = 'elena@example.com';

INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 4, 'Good experience', 'Smooth rental process. Property well maintained.', true
FROM users u1, users u2 WHERE u1.email = 'tom@example.com' AND u2.email = 'elena@example.com';

-- Reviews for Tom Bennett (tenant)
INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 5, 'Great tenant', 'Tom was respectful and paid on time. Recommended.', true
FROM users u1, users u2 WHERE u1.email = 'sarah@example.com' AND u2.email = 'tom@example.com';

-- Reviews for Aisha Thompson (landlord, Porto)
INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 5, 'Fantastic landlord in Porto', 'Aisha made moving to Porto stress-free. Property was clean and she was very helpful.', true
FROM users u1, users u2 WHERE u1.email = 'daniel@example.com' AND u2.email = 'aisha@example.com';

INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 4, 'Very good', 'Good communication and fair terms.', true
FROM users u1, users u2 WHERE u1.email = 'elena@example.com' AND u2.email = 'aisha@example.com';

-- Reviews for Daniel Park (tenant, Porto)
INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
SELECT u1.id, u2.id, 5, 'Perfect tenant', 'Daniel is the kind of tenant every landlord wants. Highly recommend.', true
FROM users u1, users u2 WHERE u1.email = 'aisha@example.com' AND u2.email = 'daniel@example.com';
