const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/dashboard/stats — Aggregated dashboard analytics
router.get('/stats', async (req, res) => {
  try {
    // Run all queries in parallel for speed
    const [
      parcelStats,
      buildingStats,
      unitStats,
      zoneBreakdown,
      buildingTypeBreakdown,
      parcelStatusBreakdown,
      infraStats,
      monthlyTrends,
      recentValidations,
      recentUnits,
    ] = await Promise.all([
      // 1. Total parcels + market value
      db.query(`
        SELECT 
          COUNT(*) AS total_parcels,
          COALESCE(SUM(market_value), 0) AS total_market_value,
          COALESCE(SUM(area), 0) AS total_area
        FROM parcels
      `),

      // 2. Total buildings
      db.query(`
        SELECT 
          COUNT(*) AS total_buildings,
          COALESCE(SUM(floors), 0) AS total_floors,
          COALESCE(AVG(height), 0) AS avg_height
        FROM buildings
      `),

      // 3. Total units + market value
      db.query(`
        SELECT 
          COUNT(*) AS total_units,
          COALESCE(SUM(market_value), 0) AS total_unit_market_value,
          COUNT(*) FILTER (WHERE status = 'verified') AS verified_units,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_units,
          COUNT(*) FILTER (WHERE status = 'disputed') AS disputed_units
        FROM units
      `),

      // 4. Zone-wise breakdown (parcels, buildings, units, market value per zone)
      db.query(`
        SELECT 
          z.id, z.name, z.code, z.ward, z.type,
          COUNT(DISTINCT p.id) AS parcel_count,
          COUNT(DISTINCT b.id) AS building_count,
          COUNT(DISTINCT u.id) AS unit_count,
          COALESCE(SUM(DISTINCT p.market_value), 0) AS zone_market_value
        FROM zones z
        LEFT JOIN parcels p ON p.zone_id = z.id
        LEFT JOIN buildings b ON b.parcel_id = p.id
        LEFT JOIN units u ON u.building_id = b.id
        GROUP BY z.id, z.name, z.code, z.ward, z.type
        ORDER BY z.name
      `),

      // 5. Building type distribution
      db.query(`
        SELECT type, COUNT(*) AS count, COALESCE(SUM(total_units), 0) AS total_units
        FROM buildings
        GROUP BY type
        ORDER BY count DESC
      `),

      // 6. Parcel status distribution
      db.query(`
        SELECT status, COUNT(*) AS count
        FROM parcels
        GROUP BY status
        ORDER BY count DESC
      `),

      // 7. Infrastructure summary
      db.query(`
        SELECT 
          type, 
          COUNT(*) AS count, 
          COALESCE(SUM(length), 0) AS total_length,
          COALESCE(AVG(depth), 0) AS avg_depth
        FROM infrastructure_underground
        GROUP BY type
        ORDER BY type
      `),

      // 8. Monthly registration trends (last 12 months)
      db.query(`
        SELECT 
          TO_CHAR(registration_date, 'YYYY-MM') AS month,
          COUNT(*) AS registrations,
          COUNT(*) FILTER (WHERE status = 'verified') AS verified,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending,
          COUNT(*) FILTER (WHERE status = 'disputed') AS disputed
        FROM units
        WHERE registration_date IS NOT NULL
        GROUP BY TO_CHAR(registration_date, 'YYYY-MM')
        ORDER BY month
      `),

      // 9. Recent validations
      db.query(`
        SELECT vl.*, b.name AS building_name
        FROM validation_log vl
        LEFT JOIN buildings b ON b.id = vl.building_id
        ORDER BY vl.validated_at DESC
        LIMIT 10
      `),

      // 10. Recently registered units (activity feed)
      db.query(`
        SELECT u.id, u.unit_number, u.floor, u.owner, u.status, u.registration_date, u.market_value,
          b.name AS building_name, b.id AS building_id
        FROM units u
        JOIN buildings b ON u.building_id = b.id
        WHERE u.registration_date IS NOT NULL
        ORDER BY u.registration_date DESC
        LIMIT 10
      `),
    ]);

    // Format infrastructure summary
    const infraSummary = {};
    infraStats.rows.forEach(r => {
      infraSummary[r.type] = {
        count: parseInt(r.count),
        totalLengthKm: (parseFloat(r.total_length) / 1000).toFixed(2),
        avgDepthM: Math.abs(parseFloat(r.avg_depth)).toFixed(1),
      };
    });

    // Get elevated + air rights counts
    const [elevatedCount, airRightsCount] = await Promise.all([
      db.query('SELECT COUNT(*) AS count FROM infrastructure_elevated'),
      db.query('SELECT COUNT(*) AS count FROM air_rights'),
    ]);

    const ps = parcelStats.rows[0];
    const bs = buildingStats.rows[0];
    const us = unitStats.rows[0];

    res.json({
      overview: {
        totalParcels: parseInt(ps.total_parcels),
        totalBuildings: parseInt(bs.total_buildings),
        totalUnits: parseInt(us.total_units),
        totalMarketValue: parseFloat(ps.total_market_value) + parseFloat(us.total_unit_market_value),
        totalFloors: parseInt(bs.total_floors),
        avgBuildingHeight: parseFloat(bs.avg_height).toFixed(1),
        totalLandArea: parseFloat(ps.total_area),
      },
      unitStatus: {
        verified: parseInt(us.verified_units),
        pending: parseInt(us.pending_units),
        disputed: parseInt(us.disputed_units),
      },
      parcelStatus: parcelStatusBreakdown.rows.map(r => ({
        status: r.status,
        count: parseInt(r.count),
      })),
      zoneBreakdown: zoneBreakdown.rows.map(r => ({
        id: r.id,
        name: r.name,
        code: r.code,
        ward: r.ward,
        type: r.type,
        parcels: parseInt(r.parcel_count),
        buildings: parseInt(r.building_count),
        units: parseInt(r.unit_count),
        marketValue: parseFloat(r.zone_market_value),
      })),
      buildingTypes: buildingTypeBreakdown.rows.map(r => ({
        type: r.type,
        count: parseInt(r.count),
        totalUnits: parseInt(r.total_units),
      })),
      infrastructure: {
        underground: infraSummary,
        elevated: parseInt(elevatedCount.rows[0].count),
        airRights: parseInt(airRightsCount.rows[0].count),
      },
      monthlyTrends: monthlyTrends.rows.map(r => ({
        month: r.month,
        registrations: parseInt(r.registrations),
        verified: parseInt(r.verified),
        pending: parseInt(r.pending),
        disputed: parseInt(r.disputed),
      })),
      recentValidations: recentValidations.rows.map(r => ({
        id: r.id,
        buildingId: r.building_id,
        buildingName: r.building_name,
        status: r.overall_status,
        score: r.score,
        validatedAt: r.validated_at,
      })),
      recentActivity: recentUnits.rows.map(r => ({
        id: r.id,
        unitNumber: r.unit_number,
        floor: r.floor,
        owner: r.owner,
        status: r.status,
        registrationDate: r.registration_date,
        marketValue: parseFloat(r.market_value),
        buildingName: r.building_name,
        buildingId: r.building_id,
      })),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
