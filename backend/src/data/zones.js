const zones = [
  { id: 'zone-1', name: 'T. Nagar', code: 'TNR', ward: 'Ward 125', center: { lat: 13.0418, lon: 80.2341 }, type: 'residential-dense' },
  { id: 'zone-2', name: 'Mylapore', code: 'MYL', ward: 'Ward 119', center: { lat: 13.0337, lon: 80.2699 }, type: 'mixed' },
  { id: 'zone-3', name: 'Anna Nagar', code: 'ANN', ward: 'Ward 96', center: { lat: 13.0850, lon: 80.2101 }, type: 'residential-modern' },
  { id: 'zone-4', name: 'Adyar', code: 'ADY', ward: 'Ward 173', center: { lat: 13.0067, lon: 80.2572 }, type: 'institutional' },
  { id: 'zone-5', name: 'Guindy', code: 'GND', ward: 'Ward 155', center: { lat: 13.0067, lon: 80.2206 }, type: 'commercial' },
];

const infrastructure = {
  underground: [
    { id: 'UTIL-CHN-WATER-001', type: 'water', name: 'T. Nagar Main Water Line', depth: -3.5, diameter: 0.6, status: 'active', installedYear: 2015 },
    { id: 'UTIL-CHN-WATER-002', type: 'water', name: 'Mylapore Distribution Line', depth: -2.8, diameter: 0.4, status: 'active', installedYear: 2018 },
    { id: 'UTIL-CHN-SEWER-001', type: 'sewer', name: 'T. Nagar Sewer Trunk', depth: -5.0, diameter: 0.8, status: 'active', installedYear: 2012 },
    { id: 'UTIL-CHN-ELEC-001', type: 'electrical', name: 'TNEB HT Cable - Zone 1', depth: -1.5, diameter: 0.15, status: 'active', installedYear: 2020 },
    { id: 'UTIL-CHN-GAS-001', type: 'gas', name: 'IGL Gas Pipeline', depth: -2.0, diameter: 0.2, status: 'active', installedYear: 2021 },
  ],
  elevated: [
    { id: 'ELEV-CHN-METRO-001', type: 'metro', name: 'Chennai Metro Blue Line', elevation: 12.0, width: 8, stations: ['T. Nagar Station', 'Mylapore Station'] },
    { id: 'ELEV-CHN-FLY-001', type: 'flyover', name: 'Kathipara Flyover', elevation: 8.0, width: 12 },
  ],
  airRights: [
    { id: 'AIR-CHN-001', name: 'T. Nagar Metro Airspace', type: 'transit-corridor', elevationMin: 10.0, elevationMax: 18.0, status: 'allocated' },
    { id: 'AIR-CHN-002', name: 'Commercial Air Rights - Pondy Bazaar', type: 'development-rights', elevationMin: 14.0, elevationMax: 45.0, status: 'available' },
  ],
};

module.exports = { zones, infrastructure };
