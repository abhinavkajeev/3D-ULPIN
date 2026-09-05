const { pool } = require('./src/db');

async function migrateFootprints() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE buildings 
      SET footprint = ST_Envelope(ST_Buffer(location::geometry, 0.00015))::geography 
      WHERE footprint IS NULL
    `);
    console.log(`Updated ${res.rowCount} buildings with default footprints.`);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

migrateFootprints();
