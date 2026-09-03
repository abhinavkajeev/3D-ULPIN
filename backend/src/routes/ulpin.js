const express = require('express');
const router = express.Router();
const db = require('../db');

// ULPIN format: TN-CHN-ZON-SURVEY-BNN-FNN-UNNN
function buildULPIN({ zoneCode, surveyNumber, buildingId, floor, unitNumber }) {
  const stateCode = 'TN';
  const districtCode = 'CHN';
  const parcelCode = (surveyNumber || 'PRC001').replace(/[^a-zA-Z0-9]/g, '').padStart(6, '0').slice(0, 6);
  const buildingCode = `B${String(buildingId.split('-').pop()).padStart(2, '0')}`;
  const floorCode = `F${String(floor).padStart(2, '0')}`;
  const unitCode = `U${String(unitNumber).padStart(3, '0')}`;
  return `${stateCode}-${districtCode}-${zoneCode || 'CEN'}-${parcelCode}-${buildingCode}-${floorCode}-${unitCode}`;
}

// POST /api/v1/ulpin/generate — Generate ULPIN for a property
router.post('/generate', async (req, res) => {
  try {
    const { buildingId, floor, unitNumber } = req.body;
    if (!buildingId || !floor || !unitNumber) {
      return res.status(400).json({ error: 'buildingId, floor, and unitNumber are required' });
    }

    const result = await db.query(`
      SELECT b.*, p.survey_number, p.zone_id, z.code AS zone_code,
        ST_Y(b.location::geometry) AS lat, ST_X(b.location::geometry) AS lon
      FROM buildings b
      LEFT JOIN parcels p ON b.parcel_id = p.id
      LEFT JOIN zones z ON p.zone_id = z.id
      WHERE b.id = $1
    `, [buildingId]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Building not found' });

    const b = result.rows[0];
    const ulpin = buildULPIN({
      zoneCode: b.zone_code,
      surveyNumber: b.survey_number,
      buildingId: b.id,
      floor,
      unitNumber,
    });

    // Store in registry
    await db.query(`
      INSERT INTO ulpin_registry (ulpin, building_id, parcel_id, zone_code, generated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (ulpin) DO UPDATE SET generated_at = NOW()
    `, [ulpin, buildingId, b.parcel_id, b.zone_code]);

    res.json({
      ulpin,
      spatial: {
        coordinates: { lat: b.lat, lon: b.lon },
        elevation: (floor - 1) * parseFloat(b.floor_height),
        floor,
        unit: unitNumber,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/ulpin/search?q=... — Search by ULPIN, owner, building name
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ results: [] });

    const results = [];

    // Search buildings
    const bResult = await db.query(`
      SELECT b.id, b.name, b.parcel_id, b.type, b.floors,
        ST_Y(b.location::geometry) AS lat, ST_X(b.location::geometry) AS lon
      FROM buildings b
      WHERE b.name ILIKE $1 OR b.id ILIKE $1
      LIMIT 10
    `, [`%${q}%`]);

    bResult.rows.forEach(b => {
      results.push({
        type: 'building', id: b.id, name: b.name,
        parcelId: b.parcel_id, coordinates: { lat: b.lat, lon: b.lon },
      });
    });

    // Search parcels
    const pResult = await db.query(`
      SELECT p.id, p.survey_number, p.owner, z.name AS zone_name
      FROM parcels p
      LEFT JOIN zones z ON p.zone_id = z.id
      WHERE p.survey_number ILIKE $1 OR p.owner ILIKE $1 OR p.address ILIKE $1
      LIMIT 10
    `, [`%${q}%`]);

    pResult.rows.forEach(p => {
      results.push({
        type: 'parcel', id: p.id, surveyNumber: p.survey_number,
        owner: p.owner, zoneName: p.zone_name,
      });
    });

    // Search units by owner
    const uResult = await db.query(`
      SELECT u.id, u.owner, u.unit_number, u.floor, b.id AS building_id, b.name AS building_name
      FROM units u
      JOIN buildings b ON u.building_id = b.id
      WHERE u.owner ILIKE $1
      LIMIT 10
    `, [`%${q}%`]);

    uResult.rows.forEach(u => {
      results.push({
        type: 'unit', id: u.id, owner: u.owner,
        buildingId: u.building_id, buildingName: u.building_name,
        unit: u.unit_number, floor: u.floor,
      });
    });

    // Search ULPIN registry
    if (q.includes('-')) {
      const ulpinResult = await db.query(`
        SELECT * FROM ulpin_registry WHERE ulpin ILIKE $1 LIMIT 5
      `, [`%${q}%`]);
      ulpinResult.rows.forEach(r => {
        results.push({ type: 'ulpin', ulpin: r.ulpin, buildingId: r.building_id });
      });
    }

    res.json({ total: results.length, results: results.slice(0, 20) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/ulpin/validate/:ulpin — Validate ULPIN format
router.get('/validate/:ulpin', async (req, res) => {
  const { ulpin } = req.params;
  const isValid = /^[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-[A-Z0-9]{6}-B\d{2,3}-F\d{2}-U\d{3}$/.test(ulpin);
  const parts = ulpin.split('-');

  // Check if exists in registry
  let registered = false;
  if (isValid) {
    const result = await db.query('SELECT 1 FROM ulpin_registry WHERE ulpin = $1', [ulpin]);
    registered = result.rows.length > 0;
  }

  res.json({
    ulpin,
    isValid,
    registered,
    format: isValid ? {
      state: parts[0], district: parts[1], zone: parts[2],
      parcel: parts[3], building: parts[4], floor: parts[5], unit: parts[6],
    } : null,
  });
});

module.exports = router;
