// Backend-compatible buildings data
const parcelIds = [
  'parcel-001','parcel-002','parcel-003','parcel-004','parcel-005','parcel-006',
  'parcel-007','parcel-008','parcel-009','parcel-010','parcel-011','parcel-012',
];

const buildingNames = [
  'Pondy Heights', 'GN Chetty Towers', 'Ranganathan Plaza', 'Thyagaraya Complex',
  'Usman Square', 'T Nagar Grand', 'Mylapore Heritage', 'Luz Corner Complex',
  'Anna Grand Tower', 'Shanti Enclave', 'Adyar Gateway', 'Guindy Tech Park',
  'Dev Heights', 'Murugan Enclave', 'Sri Lakshmi Residency', 'Padma Apartments',
  'Kamakshi Towers', 'Meenakshi Complex', 'Nandini Heights', 'Saravana Stores Annex',
];

const buildingTypes = ['residential', 'commercial', 'mixed', 'institutional'];

const buildings = Array.from({ length: 20 }, (_, i) => {
  const id = `BLDG-${String(i + 1).padStart(3, '0')}`;
  const height = 12 + Math.floor(Math.random() * 40);
  const floors = Math.max(2, Math.floor(height / 3.5));
  const unitsPerFloor = Math.max(2, Math.floor(Math.random() * 4) + 2);
  const type = buildingTypes[i % buildingTypes.length];

  return {
    id,
    name: buildingNames[i] || `Building ${i + 1}`,
    height,
    type,
    floors,
    totalUnits: floors * unitsPerFloor,
    unitsPerFloor,
    parcelId: parcelIds[i % parcelIds.length],
    coordinates: {
      lat: 13.04 + (Math.random() - 0.5) * 0.01,
      lon: 80.23 + (Math.random() - 0.5) * 0.01,
    },
    footprint: {
      width: 15 + Math.floor(Math.random() * 20),
      depth: 15 + Math.floor(Math.random() * 20),
    },
    floorHeight: 3.5,
    constructionYear: 2010 + Math.floor(Math.random() * 14),
    status: ['active', 'active', 'active', 'under-construction'][Math.floor(Math.random() * 4)],
  };
});

function generateUnitsForBuilding(building) {
  const units = [];
  const statuses = ['verified', 'pending', 'disputed'];
  const firstNames = ['Rajesh', 'Priya', 'Anand', 'Lakshmi', 'Suresh', 'Meena', 'Karthik', 'Deepa', 'Vijay', 'Kavitha'];
  const lastNames = ['Sharma', 'Iyer', 'Kumar', 'Devi', 'Rajan', 'Nair', 'Pillai', 'Murugan', 'Krishnan', 'Sundaram'];

  for (let f = 1; f <= building.floors; f++) {
    for (let u = 1; u <= building.unitsPerFloor; u++) {
      const unitNum = `${f}${String(u).padStart(2, '0')}`;
      const owner = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      units.push({
        id: `${building.id}-U${unitNum}`,
        unitNumber: unitNum,
        floor: f,
        type: building.type === 'commercial' ? 'Commercial Space' : 'Residential Apt',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        owner,
        area: Math.floor(500 + Math.random() * 1500),
        elevation: (f - 1) * 3.5,
        height: 3.5,
        registrationDate: `202${Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        marketValue: Math.floor(5000000 + Math.random() * 25000000),
        ulpin: null, // Generated on demand
      });
    }
  }
  return units;
}

module.exports = { buildings, generateUnitsForBuilding };
