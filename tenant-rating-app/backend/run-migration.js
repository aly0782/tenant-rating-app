/**
 * Run a single migration file.
 * Usage: node run-migration.js migrations/004-profile-fields.sql
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const file = process.argv[2];
if (!file) {
  console.error('Usage: node run-migration.js <migration-file>');
  console.error('Example: node run-migration.js migrations/004-profile-fields.sql');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

async function run() {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }
  const sql = fs.readFileSync(filePath, 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Migration ran:', file);
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

run();
