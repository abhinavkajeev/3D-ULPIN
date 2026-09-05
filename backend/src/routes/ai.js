const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/v1/ai/extract
router.post('/extract', (req, res) => {
  // Simulate AI extraction response
  const demoDetections = [
    { id: 1, name: 'Pondy Heights', confidence: 97.2, floors: 8, height: '28.5m', area: '4,200 sq.ft', type: 'Residential', x: 15, y: 20, w: 22, h: 18 },
    { id: 2, name: 'GN Chetty Towers', confidence: 94.8, floors: 12, height: '42.0m', area: '6,800 sq.ft', type: 'Commercial', x: 45, y: 15, w: 25, h: 22 },
    { id: 3, name: 'Ranganathan Plaza', confidence: 91.5, floors: 5, height: '17.5m', area: '3,100 sq.ft', type: 'Mixed Use', x: 60, y: 50, w: 18, h: 15 },
    { id: 4, name: 'Thyagaraya Complex', confidence: 88.9, floors: 6, height: '21.0m', area: '5,500 sq.ft', type: 'Commercial', x: 20, y: 55, w: 20, h: 16 },
    { id: 5, name: 'Underground Parking P1', confidence: 85.3, floors: -2, height: '-7.0m', area: '8,000 sq.ft', type: 'Underground', x: 35, y: 40, w: 28, h: 12 },
  ];
  
  res.json({ success: true, detections: demoDetections });
});

// POST /api/v1/ai/import
router.post('/import', async (req, res) => {
  const { buildings } = req.body;
  if (!buildings || !Array.isArray(buildings)) {
    return res.status(400).json({ success: false, error: 'buildings array is required' });
  }

  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // We will assign these to a random existing parcel in T. Nagar (zone-1)
    // For simplicity in the demo, let's use 'parcel-001'
    const parcelId = 'parcel-001';
    
    let totalUnitsInserted = 0;
    
    for (const b of buildings) {
      // Map frontend type to database type constraints
      let dbType = 'mixed';
      const fType = (b.type || '').toLowerCase();
      if (fType.includes('residential')) dbType = 'residential';
      if (fType.includes('commercial')) dbType = 'commercial';
      if (fType.includes('underground')) dbType = 'commercial'; // just as fallback
      
      const numFloors = Math.abs(parseInt(b.floors, 10)) || 1;
      const bHeightNum = parseFloat((b.height || '').replace('m', '')) || (numFloors * 3.5);
      const isUnderground = b.floors < 0;
      
      const unitsPerFloor = 3; 
      const totalUnits = numFloors * unitsPerFloor;

      const buildingId = `ai-bldg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Randomize coordinates slightly around T. Nagar parcel so they don't overlap
      const lon = (80.2348 + (Math.random() - 0.5) * 0.001).toFixed(6);
      const lat = (13.0425 + (Math.random() - 0.5) * 0.001).toFixed(6);
      const pt = `POINT(${lon} ${lat})`;

      await client.query(`
        INSERT INTO buildings (
          id, name, parcel_id, type, height, floors, total_units, units_per_floor, status, location, footprint
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'active', 
          ST_GeogFromText($9), 
          ST_Envelope(ST_Buffer(ST_GeogFromText($9)::geometry, 0.0001))::geography
        )
      `, [
        buildingId, 
        b.name, 
        parcelId, 
        dbType, 
        Math.abs(bHeightNum), 
        numFloors, 
        totalUnits, 
        unitsPerFloor,
        pt
      ]);
      
      // Insert units
      for (let f = 1; f <= numFloors; f++) {
        const actualFloor = isUnderground ? -f : f;
        for (let u = 1; u <= unitsPerFloor; u++) {
          const unitId = `ai-unit-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
          const unitNum = isUnderground ? `B${f}0${u}` : `${f}0${u}`;
          const baseElevation = (actualFloor - (isUnderground ? 1 : 0)) * 3.5;
          const marketVal = 2500000 + Math.random() * 5000000;
          
          await client.query(`
            INSERT INTO units (
              id, building_id, unit_number, floor, type, status, owner, 
              area, elevation, height, market_value
            ) VALUES ($1, $2, $3, $4, $5, 'verified', $6, $7, $8, 3.5, $9)
          `, [
            unitId,
            buildingId,
            unitNum,
            actualFloor,
            dbType,
            `AI Assigned Owner ${u}`, // Mock owner
            Math.floor(1000 + Math.random() * 500),
            baseElevation,
            marketVal
          ]);
          totalUnitsInserted++;
        }
      }
    }

    await client.query('COMMIT');
    res.json({ 
      success: true, 
      message: `Imported ${buildings.length} buildings and ${totalUnitsInserted} units to Cadastre.`
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('AI Import Error:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
