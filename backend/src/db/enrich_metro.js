#!/usr/bin/env node
/**
 * OSM Metro Data Enrichment Script
 * Reads raw OSM metro data, resolves coordinates,
 * and inserts real metro lines into the PostGIS database.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'cadastre_3d',
  user: 'ulpin_admin',
  password: 'ulpin2026sih',
});

async function run() {
  const rawPath = path.join(__dirname, 'osm_metro_raw.json');
  if (!fs.existsSync(rawPath)) {
    console.error('❌ osm_metro_raw.json not found.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const elements = data.elements;

  // Build node lookup
  const nodes = {};
  elements.filter(e => e.type === 'node').forEach(n => {
    nodes[n.id] = { lat: n.lat, lon: n.lon };
  });

  // Extract metro ways (lines)
  const ways = elements.filter(e => e.type === 'way' && e.tags);

  console.log(`\n🚇 OSM Metro Enrichment`);
  console.log(`   ├─ Total elements: ${elements.length}`);
  console.log(`   ├─ Nodes: ${Object.keys(nodes).length}`);
  console.log(`   ├─ Metro Segments: ${ways.length}`);

  const client = await pool.connect();
  let insertedElevated = 0;
  let insertedUnderground = 0;
  let skipped = 0;

  try {
    await client.query('BEGIN');

    for (let i = 0; i < ways.length; i++) {
      const way = ways[i];
      const tags = way.tags;

      // Resolve coordinates
      const coords = way.nodes
        .map(nid => nodes[nid])
        .filter(Boolean);

      if (coords.length < 2) { skipped++; continue; }

      // Build LINESTRING WKT
      const wkt = `LINESTRING(${coords.map(c => `${c.lon} ${c.lat}`).join(',')})`;
      const name = tags.name || tags['name:en'] || `Metro Line Segment ${way.id}`;
      const isUnderground = tags.tunnel === 'yes' || tags.layer === '-1' || tags.layer === '-2';
      
      const osmId = `OSM-METRO-${way.id}`;

      if (isUnderground) {
        // Insert into underground
        await client.query(`
          INSERT INTO infrastructure_underground (id, type, name, depth, diameter, length, status, installed_year, path)
          VALUES ($1, 'electrical', $2, -15.0, 5.0, ST_Length(ST_GeogFromText($3)), 'active', 2015, ST_GeogFromText($3))
          ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name,
            path = EXCLUDED.path
        `, [osmId, name, wkt]);
        insertedUnderground++;
      } else {
        // Insert into elevated
        await client.query(`
          INSERT INTO infrastructure_elevated (id, type, name, elevation, width, path)
          VALUES ($1, 'metro', $2, 12.0, 8.0, ST_GeogFromText($3))
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            path = EXCLUDED.path
        `, [osmId, name, wkt]);
        insertedElevated++;
      }
    }

    await client.query('COMMIT');

    // Print summary
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM infrastructure_elevated) AS elevated,
        (SELECT COUNT(*) FROM infrastructure_underground) AS underground
    `);
    const c = counts.rows[0];

    console.log(`   ├─ Inserted Elevated:    ${insertedElevated} segments`);
    console.log(`   ├─ Inserted Underground: ${insertedUnderground} segments`);
    console.log(`   ├─ Skipped:              ${skipped} (incomplete geometry)`);
    console.log(`   ├─ Total DB Elevated:    ${c.elevated}`);
    console.log(`   └─ Total DB Underground: ${c.underground}\n`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
