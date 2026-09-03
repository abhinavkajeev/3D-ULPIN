const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/parcels — List all parcels
router.get('/', async (req, res) => {
  try {
    const { zone, status, search } = req.query;
    let sql = `
      SELECT p.*, z.name AS zone_name, z.code AS zone_code,
        ST_Y(p.center::geometry) AS lat, ST_X(p.center::geometry) AS lon
      FROM parcels p
      LEFT JOIN zones z ON p.zone_id = z.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (zone) {
      sql += ` AND z.name ILIKE $${idx}`;
      params.push(`%${zone}%`);
      idx++;
    }
    if (status) {
      sql += ` AND p.status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (search) {
      sql += ` AND (p.survey_number ILIKE $${idx} OR p.owner ILIKE $${idx} OR p.address ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    sql += ' ORDER BY p.id';
    const result = await db.query(sql, params);

    res.json({
      total: result.rows.length,
      parcels: result.rows.map(r => ({
        id: r.id,
        surveyNumber: r.survey_number,
        zoneId: r.zone_id,
        zoneName: r.zone_name,
        address: r.address,
        owner: r.owner,
        area: parseFloat(r.area),
        areaUnit: r.area_unit,
        registrationDate: r.registration_date,
        marketValue: parseFloat(r.market_value),
        status: r.status,
        landUse: r.land_use,
        center: { lat: r.lat, lon: r.lon },
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/parcels/:id — Get single parcel
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, z.name AS zone_name, z.code AS zone_code,
        ST_Y(p.center::geometry) AS lat, ST_X(p.center::geometry) AS lon
      FROM parcels p
      LEFT JOIN zones z ON p.zone_id = z.id
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Parcel not found' });

    const r = result.rows[0];
    res.json({
      id: r.id,
      surveyNumber: r.survey_number,
      zoneId: r.zone_id,
      zoneName: r.zone_name,
      address: r.address,
      owner: r.owner,
      area: parseFloat(r.area),
      areaUnit: r.area_unit,
      registrationDate: r.registration_date,
      marketValue: parseFloat(r.market_value),
      status: r.status,
      landUse: r.land_use,
      center: { lat: r.lat, lon: r.lon },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/parcels/:id/nearby — Spatial query: find parcels within radius
router.get('/:id/nearby', async (req, res) => {
  try {
    const radius = parseInt(req.query.radius) || 500; // meters
    const result = await db.query(`
      SELECT p2.id, p2.survey_number, p2.owner, p2.land_use,
        ST_Distance(p1.center, p2.center) AS distance_meters
      FROM parcels p1, parcels p2
      WHERE p1.id = $1 AND p2.id != $1
        AND ST_DWithin(p1.center, p2.center, $2)
      ORDER BY distance_meters
    `, [req.params.id, radius]);

    res.json({ radius, parcels: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
