const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/buildings — List all buildings
router.get('/', async (req, res) => {
  try {
    const { parcelId, type, search } = req.query;
    let sql = `
      SELECT b.*, p.survey_number, p.owner AS parcel_owner,
        ST_Y(b.location::geometry) AS lat, ST_X(b.location::geometry) AS lon
      FROM buildings b
      LEFT JOIN parcels p ON b.parcel_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (parcelId) { sql += ` AND b.parcel_id = $${idx}`; params.push(parcelId); idx++; }
    if (type) { sql += ` AND b.type = $${idx}`; params.push(type); idx++; }
    if (search) { sql += ` AND (b.name ILIKE $${idx} OR b.id ILIKE $${idx})`; params.push(`%${search}%`); idx++; }

    sql += ' ORDER BY b.id';
    const result = await db.query(sql, params);

    res.json({
      total: result.rows.length,
      buildings: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        parcelId: r.parcel_id,
        type: r.type,
        height: parseFloat(r.height),
        floors: r.floors,
        totalUnits: r.total_units,
        unitsPerFloor: r.units_per_floor,
        floorHeight: parseFloat(r.floor_height),
        constructionYear: r.construction_year,
        status: r.status,
        footprint: { width: parseFloat(r.footprint_width), depth: parseFloat(r.footprint_depth) },
        coordinates: { lat: r.lat, lon: r.lon },
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/buildings/:id — Get building with all units
router.get('/:id', async (req, res) => {
  try {
    const bResult = await db.query(`
      SELECT b.*, ST_Y(b.location::geometry) AS lat, ST_X(b.location::geometry) AS lon
      FROM buildings b WHERE b.id = $1
    `, [req.params.id]);

    if (bResult.rows.length === 0) return res.status(404).json({ error: 'Building not found' });

    const b = bResult.rows[0];

    const uResult = await db.query(`
      SELECT * FROM units WHERE building_id = $1 ORDER BY floor, unit_number
    `, [req.params.id]);

    res.json({
      id: b.id,
      name: b.name,
      parcelId: b.parcel_id,
      type: b.type,
      height: parseFloat(b.height),
      floors: b.floors,
      totalUnits: b.total_units,
      unitsPerFloor: b.units_per_floor,
      floorHeight: parseFloat(b.floor_height),
      constructionYear: b.construction_year,
      status: b.status,
      footprint: { width: parseFloat(b.footprint_width), depth: parseFloat(b.footprint_depth) },
      coordinates: { lat: b.lat, lon: b.lon },
      units: uResult.rows.map(u => ({
        id: u.id,
        unitNumber: u.unit_number,
        floor: u.floor,
        type: u.type,
        status: u.status,
        owner: u.owner,
        area: parseFloat(u.area),
        elevation: parseFloat(u.elevation),
        height: parseFloat(u.height),
        registrationDate: u.registration_date,
        marketValue: parseFloat(u.market_value),
        minElevation: parseFloat(u.min_elevation),
        maxElevation: parseFloat(u.max_elevation),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/buildings/:id/floors/:floor/units — Get units for a floor
router.get('/:id/floors/:floor/units', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM units WHERE building_id = $1 AND floor = $2 ORDER BY unit_number
    `, [req.params.id, parseInt(req.params.floor)]);

    res.json({
      buildingId: req.params.id,
      floor: parseInt(req.params.floor),
      totalUnits: result.rows.length,
      units: result.rows.map(u => ({
        id: u.id,
        unitNumber: u.unit_number,
        floor: u.floor,
        type: u.type,
        status: u.status,
        owner: u.owner,
        area: parseFloat(u.area),
        elevation: parseFloat(u.elevation),
        marketValue: parseFloat(u.market_value),
        minElevation: parseFloat(u.min_elevation),
        maxElevation: parseFloat(u.max_elevation),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
