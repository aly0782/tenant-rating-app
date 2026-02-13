require('dotenv').config();
const { pool } = require('./db');

async function loadSeed() {
  try {
    console.log('Loading seed data...');
    
    await pool.query(`
      INSERT INTO users (name, email, user_type, city, avg_rating, review_count) VALUES
      ('Sarah Mitchell', 'sarah@example.com', 'landlord', 'lisbon', 4.9, 32),
      ('Marcus Johnson', 'marcus@example.com', 'tenant', 'lisbon', 4.7, 15),
      ('Elena Rodriguez', 'elena@example.com', 'landlord', 'lisbon', 4.8, 24),
      ('Tom Bennett', 'tom@example.com', 'tenant', 'lisbon', 4.5, 8)
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Seed data loaded!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

loadSeed();
