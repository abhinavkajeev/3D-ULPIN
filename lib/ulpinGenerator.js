// 3D ULPIN Generator
// Proposed format: TN-CHN-XXX-PPPPPP-BNN-FNN-UNNN

import { zones } from '@/data/zones';
import { parcels } from '@/data/parcels';
import { buildings } from '@/data/buildings';

/**
 * Generate a 3D ULPIN for a specific property unit
 */
export function generateULPIN({ parcelId, buildingId, floor, unitNumber, buildingObj, unitObj }) {
  const building = buildingObj || buildings.find(b => b.id === buildingId);
  if (!building) return null;
  
  const parcel = parcels.find(p => p.id === (parcelId || building.parcelId)) || { id: 'P000', surveyNumber: 'PRC001', owner: 'Govt', polygon: [], area: 0, center: {x:0, z:0} };
  const zone = zones.find(z => z.id === (parcel?.zoneId || building?.zoneId)) || { id: 'Z1', code: 'CEN', name: 'Central District' };

  const stateCode = 'TN';
  const districtCode = 'CHN';
  const zoneCode = zone.code;
  const parcelCode = parcel.surveyNumber.replace(/[^a-zA-Z0-9]/g, '').padStart(6, '0').slice(0, 6);
  const buildingCode = `B${String(building.id.split('-').pop()).padStart(2, '0')}`;
  const floorCode = `F${String(floor).padStart(2, '0')}`;
  const unitCode = `U${String(unitNumber).padStart(3, '0')}`;

  const ulpin = `${stateCode}-${districtCode}-${zoneCode}-${parcelCode}-${buildingCode}-${floorCode}-${unitCode}`;

  const unit = unitObj || building.units?.find(u => u.floor === floor && u.unitNumber === unitNumber);

  return {
    ulpin,
    segments: {
      state: { code: stateCode, label: 'Tamil Nadu', color: '#00d4ff' },
      district: { code: districtCode, label: 'Chennai', color: '#a855f7' },
      zone: { code: zoneCode, label: zone.name, color: '#14b8a6' },
      parcel: { code: parcelCode, label: `Survey ${parcel.surveyNumber}`, color: '#f59e0b' },
      building: { code: buildingCode, label: building.name, color: '#22c55e' },
      floor: { code: floorCode, label: `Floor ${floor}`, color: '#3b82f6' },
      unit: { code: unitCode, label: `Unit ${unitNumber}`, color: '#f43f5e' },
    },
    spatial: {
      parcel: {
        polygon: parcel.polygon,
        area: parcel.area,
        center: parcel.center,
      },
      building: {
        footprint: building.footprint || {width: 0, depth: 0},
        height: building.height,
        coordinates: building.coordinates,
      },
      floor: {
        number: floor,
        elevation: (floor - 1) * (building.floorHeight || 3.5),
        height: building.floorHeight || 3.5,
      },
      unit: {
        number: unitNumber,
        area: unit?.area || 0,
        boundingBox: {
          minElevation: (floor - 1) * (building.floorHeight || 3.5),
          maxElevation: floor * (building.floorHeight || 3.5),
          center: building.coordinates,
        },
      },
      coordinates: {
        lat: Array.isArray(building.coordinates) ? building.coordinates[1] : (building.coordinates?.lat ?? 13.04),
        lon: Array.isArray(building.coordinates) ? building.coordinates[0] : (building.coordinates?.lon ?? 80.23),
        elevation: (floor - 1) * (building.floorHeight || 3.5),
      },
    },
    metadata: {
      owner: unit?.owner || parcel.owner,
      status: unit?.status || 'pending',
      registrationDate: unit?.registrationDate || new Date().toISOString().split('T')[0],
      marketValue: unit?.marketValue || 0,
      landUse: building.type,
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a parcel-level ULPIN (without building/floor/unit)
 */
export function generateParcelULPIN(parcelId) {
  const parcel = parcels.find(p => p.id === parcelId);
  const zone = zones.find(z => z.id === parcel?.zoneId);
  if (!parcel || !zone) return null;

  const parcelCode = parcel.surveyNumber.replace(/[^a-zA-Z0-9]/g, '').padStart(6, '0').slice(0, 6);
  return `TN-CHN-${zone.code}-${parcelCode}`;
}

/**
 * Generate a building-level ULPIN
 */
export function generateBuildingULPIN(buildingId, buildingObj) {
  const building = buildingObj || buildings.find(b => b.id === buildingId);
  if (!building) return null;
  const parcel = parcels.find(p => p.id === building?.parcelId) || { surveyNumber: 'PRC001' };
  const zone = zones.find(z => z.id === building?.zoneId) || { code: 'CEN' };

  const parcelCode = parcel.surveyNumber.replace(/[^a-zA-Z0-9]/g, '').padStart(6, '0').slice(0, 6);
  const buildingCode = `B${String(building.id.split('-').pop()).padStart(2, '0')}`;
  return `TN-CHN-${zone.code}-${parcelCode}-${buildingCode}`;
}

/**
 * Validate a ULPIN format
 */
export function validateULPIN(ulpin) {
  const pattern = /^[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-[A-Z0-9]{6}-B\d{2}-F\d{2}-U\d{3}$/;
  return pattern.test(ulpin);
}

/**
 * Parse ULPIN into components
 */
export function parseULPIN(ulpin) {
  const parts = ulpin.split('-');
  if (parts.length !== 7) return null;
  return {
    state: parts[0],
    district: parts[1],
    zone: parts[2],
    parcel: parts[3],
    building: parts[4],
    floor: parts[5],
    unit: parts[6],
  };
}
