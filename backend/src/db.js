const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'infixstore',
  user: process.env.POSTGRES_USER || 'infixuser',
  password: process.env.POSTGRES_PASSWORD || 'changeme'
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
