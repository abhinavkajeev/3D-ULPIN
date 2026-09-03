// Cadastral Topology Validation Engine

/**
 * Check if two 2D polygons overlap (simplified rectangle check)
 */
export function checkOverlap2D(polyA, polyB) {
  const boundsA = getBounds(polyA);
  const boundsB = getBounds(polyB);
  
  const overlapX = Math.max(0, Math.min(boundsA.maxX, boundsB.maxX) - Math.max(boundsA.minX, boundsB.minX));
  const overlapY = Math.max(0, Math.min(boundsA.maxY, boundsB.maxY) - Math.max(boundsA.minY, boundsB.minY));
  
  if (overlapX > 0 && overlapY > 0) {
    return {
      hasOverlap: true,
      area: overlapX * overlapY,
      percentage: (overlapX * overlapY) / Math.min(getArea(boundsA), getArea(boundsB)) * 100,
    };
  }
  return { hasOverlap: false, area: 0, percentage: 0 };
}

/**
 * Check if two 3D volumes overlap (elevation range check)
 */
export function checkOverlap3D(volumeA, volumeB) {
  const has2D = checkOverlap2D(
    volumeA.polygon || volumeA.footprint,
    volumeB.polygon || volumeB.footprint
  );
  
  if (!has2D.hasOverlap) return { hasOverlap: false };

  const overlapZ = Math.max(0,
    Math.min(volumeA.maxElevation, volumeB.maxElevation) -
    Math.max(volumeA.minElevation, volumeB.minElevation)
  );

  if (overlapZ > 0) {
    return {
      hasOverlap: true,
      overlap2D: has2D.area,
      overlapZ,
      volume: has2D.area * overlapZ,
    };
  }
  return { hasOverlap: false };
}

/**
 * Check for gaps between adjacent units on a floor
 */
export function checkGaps(units, floorArea) {
  const totalUnitArea = units.reduce((sum, u) => sum + u.area, 0);
  const commonArea = floorArea * 0.15; // 15% for corridors, stairs, etc.
  const expectedUnitArea = floorArea - commonArea;
  const gap = expectedUnitArea - totalUnitArea;

  if (gap > 10) { // more than 10 sq.ft gap
    return {
      hasGap: true,
      gapArea: gap,
      percentage: (gap / floorArea) * 100,
    };
  }
  return { hasGap: false, gapArea: 0 };
}

/**
 * Check if building footprint is within parcel boundary
 */
export function checkBuildingInParcel(building, parcel) {
  if (!building || !parcel) return { isContained: true };
  
  // Simplified: check if building center is within parcel bounds
  const parcelBounds = getBounds(parcel.polygon);
  const bldCenter = building.coordinates;
  
  const isContained = (
    bldCenter.lon >= parcelBounds.minX &&
    bldCenter.lon <= parcelBounds.maxX &&
    bldCenter.lat >= parcelBounds.minY &&
    bldCenter.lat <= parcelBounds.maxY
  );

  return {
    isContained,
    buildingCenter: bldCenter,
    parcelBounds,
  };
}

/**
 * Check for duplicate ULPINs
 */
export function checkDuplicateULPIN(ulpins) {
  const seen = new Set();
  const duplicates = [];
  
  for (const ulpin of ulpins) {
    if (seen.has(ulpin)) {
      duplicates.push(ulpin);
    }
    seen.add(ulpin);
  }

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
    count: duplicates.length,
  };
}

/**
 * Check floor number consistency
 */
export function checkFloorConsistency(building) {
  const issues = [];
  const floors = [...new Set(building.units.map(u => u.floor))].sort((a, b) => a - b);
  
  for (let i = 0; i < floors.length - 1; i++) {
    if (floors[i + 1] - floors[i] !== 1) {
      issues.push({
        type: 'missing-floor',
        expected: floors[i] + 1,
        between: [floors[i], floors[i + 1]],
      });
    }
  }

  if (floors[0] !== 1) {
    issues.push({
      type: 'no-ground-floor',
      firstFloor: floors[0],
    });
  }

  return {
    isConsistent: issues.length === 0,
    issues,
  };
}

/**
 * Run full validation on a building and its parcel
 */
export function runFullValidation(building, parcel, allBuildings = []) {
  const results = {
    timestamp: new Date().toISOString(),
    buildingId: building.id,
    buildingName: building.name,
    issues: [],
    summary: { critical: 0, warning: 0, info: 0 },
  };

  // 1. Building in parcel check
  const containment = checkBuildingInParcel(building, parcel);
  if (!containment.isContained) {
    results.issues.push({
      id: `val-${Date.now()}-1`,
      severity: 'critical',
      type: 'building-outside-parcel',
      title: 'Building Outside Parcel Boundary',
      description: `${building.name} extends beyond parcel ${parcel?.surveyNumber || 'unknown'}`,
      affected: [building.id, parcel?.id],
      suggestion: 'Verify building footprint against parcel boundary survey',
    });
  }

  // 2. Floor consistency
  const floorCheck = checkFloorConsistency(building);
  if (!floorCheck.isConsistent) {
    floorCheck.issues.forEach(issue => {
      results.issues.push({
        id: `val-${Date.now()}-2-${issue.expected || issue.firstFloor}`,
        severity: 'warning',
        type: 'floor-inconsistency',
        title: issue.type === 'missing-floor' 
          ? `Missing Floor ${issue.expected}` 
          : 'No Ground Floor',
        description: issue.type === 'missing-floor'
          ? `Floor ${issue.expected} is missing between floors ${issue.between[0]} and ${issue.between[1]}`
          : `Building starts at floor ${issue.firstFloor} instead of floor 1`,
        affected: [building.id],
        suggestion: 'Verify floor numbering with building plan',
      });
    });
  }

  // 3. Unit gap check per floor
  for (let f = 1; f <= building.floors; f++) {
    const floorUnits = building.units.filter(u => u.floor === f);
    const floorArea = building.footprint.width * building.footprint.depth * 10.764; // m² to sq.ft
    const gapCheck = checkGaps(floorUnits, floorArea);
    
    if (gapCheck.hasGap && gapCheck.percentage > 5) {
      results.issues.push({
        id: `val-${Date.now()}-3-${f}`,
        severity: gapCheck.percentage > 15 ? 'warning' : 'info',
        type: 'unregistered-space',
        title: `Unregistered Space on Floor ${f}`,
        description: `${Math.round(gapCheck.gapArea)} sq.ft (${gapCheck.percentage.toFixed(1)}%) of floor ${f} is unaccounted for`,
        affected: [building.id, `floor-${f}`],
        suggestion: 'Check for common areas, corridors, or unreported units',
      });
    }
  }

  // 4. Simulated overlap with other buildings
  for (const other of allBuildings) {
    if (other.id === building.id) continue;
    
    const dx = Math.abs(building.position.x - other.position.x);
    const dz = Math.abs(building.position.z - other.position.z);
    const minDist = (building.footprint.width + other.footprint.width) / 2;
    const minDepth = (building.footprint.depth + other.footprint.depth) / 2;
    
    if (dx < minDist && dz < minDepth) {
      const overlapArea = (minDist - dx) * (minDepth - dz);
      results.issues.push({
        id: `val-${Date.now()}-4-${other.id}`,
        severity: 'critical',
        type: '3d-overlap',
        title: 'Building Footprint Overlap',
        description: `${building.name} overlaps with ${other.name} by approximately ${overlapArea.toFixed(1)} m²`,
        affected: [building.id, other.id],
        suggestion: 'Conduct boundary re-survey for both buildings',
        overlapArea,
      });
    }
  }

  // 5. Simulated topology issues (add some demo issues)
  if (building.status === 'disputed') {
    results.issues.push({
      id: `val-${Date.now()}-5`,
      severity: 'critical',
      type: 'ownership-conflict',
      title: 'Ownership Dispute Active',
      description: `${building.name} has an active ownership dispute. Multiple claimants registered.`,
      affected: [building.id],
      suggestion: 'Refer to Sub-Registrar office for dispute resolution',
    });
  }

  if (building.occupancy < 0.7) {
    results.issues.push({
      id: `val-${Date.now()}-6`,
      severity: 'info',
      type: 'low-occupancy',
      title: 'Low Occupancy Rate',
      description: `${building.name} has only ${(building.occupancy * 100).toFixed(0)}% occupancy. ${Math.round(building.totalUnits * (1 - building.occupancy))} units unregistered.`,
      affected: [building.id],
      suggestion: 'Verify unoccupied units and update records',
    });
  }

  // Count severities
  results.issues.forEach(issue => {
    results.summary[issue.severity]++;
  });

  results.totalIssues = results.issues.length;
  results.status = results.summary.critical > 0 ? 'FAILED' : 
                   results.summary.warning > 0 ? 'WARNINGS' : 'PASSED';

  return results;
}

// ─── Helpers ───

function getBounds(polygon) {
  if (!polygon || polygon.length === 0) {
    return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  }
  const xs = polygon.map(p => p[0]);
  const ys = polygon.map(p => p[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function getArea(bounds) {
  return (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
}
