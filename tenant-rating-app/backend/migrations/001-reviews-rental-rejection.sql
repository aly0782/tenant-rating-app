-- Add optional columns for reviews (rental period + reject reason)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rental_start_date DATE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rental_end_date DATE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);
