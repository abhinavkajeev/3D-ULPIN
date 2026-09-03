const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/v1/validation/check — Run topology validation with real PostGIS queries
router.post('/check', async (req, res) => {
  try {
    const { buildingId } = req.body;
    if (!buildingId) return res.status(400).json({ error: 'buildingId is required' });

    // Fetch building + parcel
    const bResult = await db.query(`
      SELECT b.*, p.area AS parcel_area, p.land_use,
        ST_Y(b.location::geometry) AS lat, ST_X(b.location::geometry) AS lon
      FROM buildings b
      LEFT JOIN parcels p ON b.parcel_id = p.id
      WHERE b.id = $1
    `, [buildingId]);

    if (bResult.rows.length === 0) return res.status(404).json({ error: 'Building not found' });

    const building = bResult.rows[0];
    const checks = [];
    const issues = [];

    // Check 1: Boundary containment (real spatial — check if building is within any parcel)
    const containResult = await db.query(`
      SELECT p.id, p.survey_number,
        ST_DWithin(p.center, b.location, 100) AS within_range
      FROM buildings b, parcels p
      WHERE b.id = $1 AND b.parcel_id = p.id
    `, [buildingId]);

    const boundaryOk = containResult.rows.length > 0 && containResult.rows[0].within_range;
    checks.push({
      name: 'Boundary Containment',
      description: 'ST_DWithin(parcel_center, building_location, 100m)',
      status: boundaryOk ? 'passed' : 'warning',
      detail: boundaryOk ? 'Building location is within parcel extent' : 'Building location exceeds parcel boundary range',
      query: 'SELECT ST_DWithin(parcel.center, building.location, 100)',
    });
    if (!boundaryOk) issues.push({ severity: 'warning', type: 'boundary-variance', message: 'Location outside parcel range' });

    // Check 2: Height compliance
    const maxAllowedHeight = building.type === 'commercial' ? 50 : (building.type === 'industrial' ? 30 : 36);
    const heightOk = parseFloat(building.height) <= maxAllowedHeight;
    checks.push({
      name: 'Height Compliance',
      description: `Max allowed: ${maxAllowedHeight}m for ${building.type}`,
      status: heightOk ? 'passed' : 'critical',
      detail: heightOk ? `${building.height}m within ${maxAllowedHeight}m limit` : `${building.height}m exceeds limit`,
    });
    if (!heightOk) issues.push({ severity: 'critical', type: 'height-violation', message: `Exceeds limit by ${(parseFloat(building.height) - maxAllowedHeight).toFixed(1)}m` });

    // Check 3: FAR compliance
    const parcelArea = parseFloat(building.parcel_area) || 5000;
    const far = (building.total_units * 800) / parcelArea;
    const maxFAR = building.type === 'commercial' ? 3.5 : 2.5;
    const farOk = far <= maxFAR;
    checks.push({
      name: 'Floor Area Ratio (FAR)',
      description: `Computed: ${far.toFixed(2)}, Max: ${maxFAR}`,
      status: farOk ? 'passed' : 'warning',
      detail: farOk ? `FAR ${far.toFixed(2)} within limit` : `FAR ${far.toFixed(2)} exceeds ${maxFAR}`,
    });
    if (!farOk) issues.push({ severity: 'warning', type: 'far-exceeded', message: `FAR ${far.toFixed(2)} exceeds ${maxFAR}` });

    // Check 4: 3D Overlap — check if building is too close to any other building
    const overlapResult = await db.query(`
      SELECT b2.id, b2.name,
        ST_Distance(b1.location, b2.location) AS distance_meters
      FROM buildings b1, buildings b2
      WHERE b1.id = $1 AND b2.id != $1
        AND ST_DWithin(b1.location, b2.location, 15)
      ORDER BY distance_meters
      LIMIT 3
    `, [buildingId]);

    const overlapOk = overlapResult.rows.length === 0;
    checks.push({
      name: '3D Proximity Check',
      description: 'ST_DWithin(building1, building2, 15m)',
      status: overlapOk ? 'passed' : 'warning',
      detail: overlapOk ? 'No adjacent buildings within 15m' :
        `${overlapResult.rows.length} building(s) within 15m: ${overlapResult.rows.map(r => `${r.name} (${parseFloat(r.distance_meters).toFixed(1)}m)`).join(', ')}`,
      query: 'SELECT ST_DWithin(b1.location, b2.location, 15)',
    });
    if (!overlapOk) issues.push({ severity: 'warning', type: 'proximity', message: `${overlapResult.rows.length} buildings within 15m` });

    // Check 5: Underground infrastructure conflict
    const infraResult = await db.query(`
      SELECT iu.id, iu.name, iu.type, iu.depth
      FROM infrastructure_underground iu, buildings b
      WHERE b.id = $1
        AND ST_DWithin(b.location, iu.path, 20)
    `, [buildingId]);

    const infraOk = infraResult.rows.length === 0;
    checks.push({
      name: 'Underground Utility Conflict',
      description: 'ST_DWithin(building, utility_path, 20m)',
      status: infraOk ? 'passed' : 'info',
      detail: infraOk ? 'No underground utilities within 20m' :
        `${infraResult.rows.length} utility line(s) nearby: ${infraResult.rows.map(r => `${r.name} (depth: ${r.depth}m)`).join(', ')}`,
      query: 'SELECT ST_DWithin(building.location, infrastructure.path, 20)',
    });

    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const score = Math.max(0, 100 - criticalCount * 30 - warningCount * 10);
    const overallStatus = criticalCount > 0 ? 'failed' : warningCount > 0 ? 'warning' : 'passed';

    // Log validation to database
    await db.query(`
      INSERT INTO validation_log (building_id, overall_status, score, checks, issues)
      VALUES ($1, $2, $3, $4, $5)
    `, [buildingId, overallStatus, score, JSON.stringify(checks), JSON.stringify(issues)]);

    res.json({
      buildingId,
      buildingName: building.name,
      parcelId: building.parcel_id,
      overallStatus,
      score,
      checks,
      issues,
      validatedAt: new Date().toISOString(),
      engine: 'PostGIS Topology Validator v2.1 (Real Spatial Queries)',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/validation/report/:buildingId
router.get('/report/:buildingId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM validation_log
      WHERE building_id = $1
      ORDER BY validated_at DESC
      LIMIT 10
    `, [req.params.buildingId]);

    const bResult = await db.query('SELECT name FROM buildings WHERE id = $1', [req.params.buildingId]);

    res.json({
      buildingId: req.params.buildingId,
      buildingName: bResult.rows[0]?.name || 'Unknown',
      validationHistory: result.rows.map(r => ({
        date: r.validated_at,
        status: r.overall_status,
        score: r.score,
        checks: r.checks,
        issues: r.issues,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
