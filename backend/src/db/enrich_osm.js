#!/usr/bin/env node
/**
 * OSM Data Enrichment Script
 * Reads raw OSM building data, resolves node coordinates,
 * and inserts real buildings into the PostGIS database.
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
  const rawPath = path.join(__dirname, 'osm_buildings_raw.json');
  if (!fs.existsSync(rawPath)) {
    console.error('❌ osm_buildings_raw.json not found. Run the Overpass fetch first.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const elements = data.elements;

  // Build node lookup for resolving way coordinates
  const nodes = {};
  elements.filter(e => e.type === 'node').forEach(n => {
    nodes[n.id] = { lat: n.lat, lon: n.lon };
  });

  // Extract building ways with tags
  const buildings = elements.filter(e => e.type === 'way' && e.tags && e.tags.building);

  console.log(`\n📦 OSM Enrichment`);
  console.log(`   ├─ Total elements: ${elements.length}`);
  console.log(`   ├─ Nodes: ${Object.keys(nodes).length}`);
  console.log(`   ├─ Buildings: ${buildings.length}`);

  // Zone assignment based on coordinates
  const zones = [
    { id: 'zone-1', code: 'TNR', name: 'T. Nagar', lat: 13.0418, lon: 80.2341, radius: 0.008 },
    { id: 'zone-2', code: 'MYL', name: 'Mylapore', lat: 13.0337, lon: 80.2699, radius: 0.008 },
    { id: 'zone-3', code: 'ANN', name: 'Anna Nagar', lat: 13.0850, lon: 80.2101, radius: 0.01 },
    { id: 'zone-4', code: 'ADY', name: 'Adyar', lat: 13.0067, lon: 80.2572, radius: 0.01 },
    { id: 'zone-5', code: 'GND', name: 'Guindy', lat: 13.0067, lon: 80.2206, radius: 0.01 },
  ];

  function findZone(lat, lon) {
    for (const z of zones) {
      const dist = Math.sqrt((lat - z.lat) ** 2 + (lon - z.lon) ** 2);
      if (dist < z.radius) return z;
    }
    return zones[0]; // default to T. Nagar
  }

  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;

  // First names / last names for realistic owner generation
  const firstNames = ['Rajesh', 'Priya', 'Anand', 'Lakshmi', 'Suresh', 'Meena', 'Karthik', 'Deepa',
    'Vijay', 'Kavitha', 'Srinivasan', 'Nalini', 'Gopal', 'Sudha', 'Mohan', 'Revathi',
    'Arun', 'Divya', 'Bala', 'Janaki', 'Senthil', 'Padma', 'Ravi', 'Uma'];
  const lastNames = ['Sharma', 'Iyer', 'Kumar', 'Devi', 'Rajan', 'Nair', 'Pillai', 'Murugan',
    'Krishnan', 'Sundaram', 'Padmanabhan', 'Raghavan', 'Subramanian', 'Natarajan',
    'Venkatesh', 'Ramachandran', 'Balakrishnan', 'Chandrasekaran'];

  function randomOwner() {
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  try {
    await client.query('BEGIN');

    for (let i = 0; i < buildings.length; i++) {
      const bldg = buildings[i];
      const tags = bldg.tags;

      // Resolve node coordinates
      const coords = bldg.nodes
        .map(nid => nodes[nid])
        .filter(Boolean);

      if (coords.length < 3) { skipped++; continue; }

      // Calculate centroid
      const lat = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
      const lon = coords.reduce((s, c) => s + c.lon, 0) / coords.length;

      const zone = findZone(lat, lon);
      const osmId = `OSM-${bldg.id}`;

      // Extract real data from OSM tags
      const name = tags.name || tags['name:en'] || tags['addr:housename'] || null;
      const levels = parseInt(tags['building:levels']) || null;
      const height = parseFloat(tags.height) || (levels ? levels * 3.5 : (3 + Math.random() * 20));
      const floors = levels || Math.max(1, Math.floor(height / 3.5));
      const type = tags.building === 'commercial' ? 'commercial'
        : tags.building === 'residential' ? 'residential'
        : tags.building === 'retail' ? 'commercial'
        : tags.building === 'office' ? 'commercial'
        : tags.building === 'apartments' ? 'residential'
        : tags.building === 'temple' || tags.building === 'church' || tags.building === 'mosque' ? 'institutional'
        : tags.building === 'industrial' || tags.building === 'warehouse' ? 'industrial'
        : tags.building === 'school' || tags.building === 'university' || tags.building === 'hospital' ? 'institutional'
        : tags.amenity === 'hospital' || tags.amenity === 'school' ? 'institutional'
        : tags.shop ? 'commercial'
        : 'mixed';

      const street = tags['addr:street'] || null;
      const houseNo = tags['addr:housenumber'] || null;
      const address = street ? `${houseNo ? houseNo + ', ' : ''}${street}, ${zone.name}, Chennai` : null;

      const unitsPerFloor = type === 'commercial' ? Math.max(2, Math.floor(Math.random() * 5) + 2) : Math.max(2, Math.floor(Math.random() * 3) + 2);
      const totalUnits = floors * unitsPerFloor;

      // Build polygon WKT from coordinates
      const polyCoords = [...coords, coords[0]]; // close the ring
      const wkt = `POLYGON((${polyCoords.map(c => `${c.lon} ${c.lat}`).join(',')}))`;

      // Calculate footprint size (approximate)
      const lats = coords.map(c => c.lat);
      const lons = coords.map(c => c.lon);
      const fWidth = (Math.max(...lons) - Math.min(...lons)) * 111320 * Math.cos(lat * Math.PI / 180);
      const fDepth = (Math.max(...lats) - Math.min(...lats)) * 110574;

      // Find or create parcel for this building
      const parcelId = `parcel-osm-${zone.code}-${String(i + 1).padStart(3, '0')}`;

      // Insert parcel
      await client.query(`
        INSERT INTO parcels (id, survey_number, zone_id, address, owner, area, registration_date, market_value, status, land_use, center)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'verified', $9, ST_GeogFromText($10))
        ON CONFLICT (id) DO UPDATE SET address = COALESCE(EXCLUDED.address, parcels.address)
      `, [
        parcelId,
        `${zone.code}-${String(i + 1).padStart(3, '0')}/${Math.floor(Math.random() * 9) + 1}`,
        zone.id,
        address || `${zone.name}, Chennai`,
        randomOwner(),
        Math.floor(fWidth * fDepth * 10.764), // sq meters to sq.ft
        new Date(2015 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        Math.floor(5000000 + Math.random() * 80000000),
        type === 'commercial' ? 'commercial' : type === 'residential' ? 'residential' : 'mixed',
        `POINT(${lon} ${lat})`,
      ]);

      // Insert building
      await client.query(`
        INSERT INTO buildings (id, name, parcel_id, type, height, floors, total_units, units_per_floor, floor_height, construction_year, status, footprint_width, footprint_depth, footprint, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 3.5, $9, 'active', $10, $11, ST_GeogFromText($12), ST_GeogFromText($13))
        ON CONFLICT (id) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, buildings.name),
          height = EXCLUDED.height,
          floors = EXCLUDED.floors,
          footprint = EXCLUDED.footprint
      `, [
        osmId,
        name || `Building ${zone.code}-${String(i + 1).padStart(3, '0')}`,
        parcelId,
        type,
        height.toFixed(2),
        floors,
        totalUnits,
        unitsPerFloor,
        2010 + Math.floor(Math.random() * 15),
        fWidth.toFixed(2),
        fDepth.toFixed(2),
        wkt,
        `POINT(${lon} ${lat})`,
      ]);

      // Generate units for this building
      const statuses = ['verified', 'verified', 'verified', 'pending', 'disputed'];
      for (let f = 1; f <= floors; f++) {
        for (let u = 1; u <= unitsPerFloor; u++) {
          const unitNum = `${f}${String(u).padStart(2, '0')}`;
          const unitId = `${osmId}-U${unitNum}`;
          await client.query(`
            INSERT INTO units (id, building_id, unit_number, floor, type, status, owner, area, elevation, height, registration_date, market_value, min_elevation, max_elevation)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 3.5, $10, $11, $12, $13)
            ON CONFLICT (id) DO NOTHING
          `, [
            unitId,
            osmId,
            unitNum,
            f,
            type === 'commercial' ? 'Commercial Space' : 'Residential Apt',
            statuses[Math.floor(Math.random() * statuses.length)],
            randomOwner(),
            Math.floor(400 + Math.random() * 1600),
            ((f - 1) * 3.5).toFixed(2),
            new Date(2018 + Math.floor(Math.random() * 7), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            Math.floor(3000000 + Math.random() * 30000000),
            ((f - 1) * 3.5).toFixed(2),
            (f * 3.5).toFixed(2),
          ]);
        }
      }

      inserted++;
    }

    await client.query('COMMIT');

    // Print summary
    const counts = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM parcels) AS parcels,
        (SELECT COUNT(*) FROM buildings) AS buildings,
        (SELECT COUNT(*) FROM units) AS units,
        (SELECT COUNT(*) FROM buildings WHERE name NOT LIKE 'Building%') AS named_buildings
    `);
    const c = counts.rows[0];

    console.log(`   ├─ Inserted: ${inserted} buildings`);
    console.log(`   ├─ Skipped:  ${skipped} (incomplete geometry)`);
    console.log(`   ├─ Total DB parcels:   ${c.parcels}`);
    console.log(`   ├─ Total DB buildings: ${c.buildings}`);
    console.log(`   ├─ Total DB units:     ${c.units}`);
    console.log(`   └─ Named buildings:    ${c.named_buildings} (from OSM)\n`);

    // Show sample of named buildings
    const named = await client.query(`
      SELECT id, name, type, floors, height,
        ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lon
      FROM buildings
      WHERE name NOT LIKE 'Building%'
      ORDER BY name
      LIMIT 15
    `);
    console.log('📍 Sample real buildings from OSM:');
    named.rows.forEach(b => {
      console.log(`   ${b.name} (${b.type}, ${b.floors}F, ${parseFloat(b.height).toFixed(1)}m) @ ${parseFloat(b.lat).toFixed(4)}°N, ${parseFloat(b.lon).toFixed(4)}°E`);
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
