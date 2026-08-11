const fs = require('fs');
const path = require('path');
const db = require('../db');

async function run() {
  try {
    const schemaPath = path.join(__dirname, '..', '..', 'sql', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema statements sequentially
    const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await db.query(stmt + ';');
    }

    console.log('✓ Schema applied. Running seed script...');
    
    // Run the seed script
    require('./seed.js');
  } catch (err) {
    console.error('Failed to init DB:', err);
    process.exit(1);
  }
}

run();
