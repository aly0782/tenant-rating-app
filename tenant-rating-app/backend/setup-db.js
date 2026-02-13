require('dotenv').config();
const { pool } = require('./db');

async function setupDB() {
  try {
    console.log('Setting up database...');
    
    // Add city column if it doesn't exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
    `);
    console.log('✅ City column added');
    
    // Add other columns if needed
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,1) DEFAULT 0;
    `);
    console.log('✅ Rating column added');
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
    `);
    console.log('✅ Review count column added');
    
    // Load seed data
    console.log('Loading seed data...');
    await pool.query(`
      INSERT INTO users (name, email, user_type, city, avg_rating, review_count) VALUES
      ('Sarah Mitchell', 'sarah@example.com', 'landlord', 'lisbon', 4.9, 32),
      ('Marcus Johnson', 'marcus@example.com', 'tenant', 'lisbon', 4.7, 15),
      ('Elena Rodriguez', 'elena@example.com', 'landlord', 'lisbon', 4.8, 24),
      ('Tom Bennett', 'tom@example.com', 'tenant', 'lisbon', 4.5, 8)
      ON CONFLICT (email) DO NOTHING;
    `);
    
    console.log('✅ Seed data loaded!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupDB();
