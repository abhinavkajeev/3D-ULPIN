const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/infrastructure/underground — Get all underground utilities
router.get('/underground', async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT *, ST_AsGeoJSON(path) AS path_geojson FROM infrastructure_underground WHERE 1=1';
    const params = [];
    if (type) { sql += ' AND type = $1'; params.push(type); }
    sql += ' ORDER BY id';

    const result = await db.query(sql, params);

    res.json({
      total: result.rows.length,
      utilities: result.rows.map(r => ({
        id: r.id,
        type: r.type,
        name: r.name,
        depth: parseFloat(r.depth),
        diameter: parseFloat(r.diameter),
        length: parseFloat(r.length),
        status: r.status,
        installedYear: r.installed_year,
        pathGeoJSON: JSON.parse(r.path_geojson),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/infrastructure/elevated — Get elevated structures
router.get('/elevated', async (req, res) => {
  try {
    const result = await db.query('SELECT *, ST_AsGeoJSON(path) AS path_geojson FROM infrastructure_elevated ORDER BY id');

    res.json({
      total: result.rows.length,
      structures: result.rows.map(r => ({
        id: r.id,
        type: r.type,
        name: r.name,
        elevation: parseFloat(r.elevation),
        width: parseFloat(r.width),
        pathGeoJSON: JSON.parse(r.path_geojson),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/infrastructure/air-rights — Get air rights
router.get('/air-rights', async (req, res) => {
  try {
    const result = await db.query('SELECT *, ST_AsGeoJSON(bounds) AS bounds_geojson FROM air_rights ORDER BY id');

    res.json({
      total: result.rows.length,
      airRights: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        elevationMin: parseFloat(r.elevation_min),
        elevationMax: parseFloat(r.elevation_max),
        status: r.status,
        boundsGeoJSON: JSON.parse(r.bounds_geojson),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/infrastructure/all — Complete summary with counts
router.get('/all', async (req, res) => {
  try {
    const [underground, elevated, airRights] = await Promise.all([
      db.query('SELECT COUNT(*) AS count FROM infrastructure_underground'),
      db.query('SELECT COUNT(*) AS count FROM infrastructure_elevated'),
      db.query('SELECT COUNT(*) AS count FROM air_rights'),
    ]);

    res.json({
      underground: { total: parseInt(underground.rows[0].count) },
      elevated: { total: parseInt(elevated.rows[0].count) },
      airRights: { total: parseInt(airRights.rows[0].count) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
