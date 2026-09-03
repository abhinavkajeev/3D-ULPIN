const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'cadastre_3d',
  user: process.env.DB_USER || 'ulpin_admin',
  password: process.env.DB_PASSWORD || 'ulpin2026sih',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT PostGIS_Version() AS version');
    console.log(`   ├─ PostGIS:   v${result.rows[0].version}`);
    client.release();
    return true;
  } catch (err) {
    console.error('   ├─ Database:  ❌ Connection failed:', err.message);
    return false;
  }
}

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 100) {
    console.log(`[SLOW QUERY] ${duration}ms: ${text.substring(0, 80)}...`);
  }
  return result;
}

module.exports = { pool, query, testConnection };
