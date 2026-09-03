// Backend-compatible parcels data (mirrors frontend data/parcels.js)
const parcels = [
  {
    id: 'parcel-001', surveyNumber: 'TS-42/3', zoneId: 'zone-1', zoneName: 'T. Nagar',
    address: '23, Pondy Bazaar, T. Nagar, Chennai - 600017', owner: 'Rajesh Kumar Sharma',
    area: 4800, areaUnit: 'sq.ft', registrationDate: '2018-03-15', marketValue: 28500000,
    center: { lat: 13.0425, lon: 80.2348 }, status: 'verified', landUse: 'residential',
  },
  {
    id: 'parcel-002', surveyNumber: 'TS-43/1', zoneId: 'zone-1', zoneName: 'T. Nagar',
    address: '45, GN Chetty Road, T. Nagar, Chennai - 600017', owner: 'Lakshmi Devi Ramanathan',
    area: 6200, areaUnit: 'sq.ft', registrationDate: '2019-07-22', marketValue: 35200000,
    center: { lat: 13.0412, lon: 80.2355 }, status: 'verified', landUse: 'commercial',
  },
  {
    id: 'parcel-003', surveyNumber: 'TS-44/2', zoneId: 'zone-1', zoneName: 'T. Nagar',
    address: '12, Ranganathan Street, T. Nagar, Chennai - 600017', owner: 'Suresh Babu Iyer',
    area: 3200, areaUnit: 'sq.ft', registrationDate: '2020-01-10', marketValue: 22000000,
    center: { lat: 13.0435, lon: 80.2340 }, status: 'verified', landUse: 'commercial',
  },
  {
    id: 'parcel-004', surveyNumber: 'MY-12/1', zoneId: 'zone-2', zoneName: 'Mylapore',
    address: '78, Kutchery Road, Mylapore, Chennai - 600004', owner: 'Meenakshi Sundaram',
    area: 5500, areaUnit: 'sq.ft', registrationDate: '2017-11-05', marketValue: 42000000,
    center: { lat: 13.0337, lon: 80.2699 }, status: 'verified', landUse: 'residential',
  },
  {
    id: 'parcel-005', surveyNumber: 'MY-15/3', zoneId: 'zone-2', zoneName: 'Mylapore',
    address: '34, Luz Church Road, Mylapore, Chennai - 600004', owner: 'Anand Krishnamurthy',
    area: 7800, areaUnit: 'sq.ft', registrationDate: '2016-06-18', marketValue: 55000000,
    center: { lat: 13.0345, lon: 80.2710 }, status: 'pending', landUse: 'mixed',
  },
  {
    id: 'parcel-006', surveyNumber: 'AN-08/2', zoneId: 'zone-3', zoneName: 'Anna Nagar',
    address: '56, 2nd Avenue, Anna Nagar, Chennai - 600040', owner: 'Priya Venkatesh',
    area: 4200, areaUnit: 'sq.ft', registrationDate: '2021-03-25', marketValue: 31000000,
    center: { lat: 13.0850, lon: 80.2101 }, status: 'verified', landUse: 'residential',
  },
  {
    id: 'parcel-007', surveyNumber: 'AN-11/5', zoneId: 'zone-3', zoneName: 'Anna Nagar',
    address: '89, Shanti Colony, Anna Nagar, Chennai - 600040', owner: 'Karthik Rajan',
    area: 9500, areaUnit: 'sq.ft', registrationDate: '2015-09-14', marketValue: 68000000,
    center: { lat: 13.0860, lon: 80.2115 }, status: 'verified', landUse: 'commercial',
  },
  {
    id: 'parcel-008', surveyNumber: 'AD-05/1', zoneId: 'zone-4', zoneName: 'Adyar',
    address: '23, Gandhi Nagar, Adyar, Chennai - 600020', owner: 'Deepa Mahadevan',
    area: 3800, areaUnit: 'sq.ft', registrationDate: '2022-01-08', marketValue: 27500000,
    center: { lat: 13.0067, lon: 80.2572 }, status: 'verified', landUse: 'residential',
  },
  {
    id: 'parcel-009', surveyNumber: 'AD-09/3', zoneId: 'zone-4', zoneName: 'Adyar',
    address: '67, Lattice Bridge Road, Adyar, Chennai - 600020', owner: 'Ramesh Padmanabhan',
    area: 6100, areaUnit: 'sq.ft', registrationDate: '2019-04-30', marketValue: 45000000,
    center: { lat: 13.0075, lon: 80.2580 }, status: 'disputed', landUse: 'institutional',
  },
  {
    id: 'parcel-010', surveyNumber: 'GN-03/2', zoneId: 'zone-5', zoneName: 'Guindy',
    address: '112, Mount Road, Guindy, Chennai - 600032', owner: 'Vijay Industrial Corp',
    area: 12000, areaUnit: 'sq.ft', registrationDate: '2014-08-20', marketValue: 95000000,
    center: { lat: 13.0067, lon: 80.2206 }, status: 'verified', landUse: 'commercial',
  },
  {
    id: 'parcel-011', surveyNumber: 'GN-07/1', zoneId: 'zone-5', zoneName: 'Guindy',
    address: '45, SIDCO Industrial Estate, Guindy, Chennai - 600032', owner: 'Tamil Nadu IT Parks',
    area: 25000, areaUnit: 'sq.ft', registrationDate: '2013-02-12', marketValue: 180000000,
    center: { lat: 13.0080, lon: 80.2220 }, status: 'verified', landUse: 'industrial',
  },
  {
    id: 'parcel-012', surveyNumber: 'TS-50/4', zoneId: 'zone-1', zoneName: 'T. Nagar',
    address: '99, Usman Road, T. Nagar, Chennai - 600017', owner: 'Saravanan Textiles Pvt Ltd',
    area: 8500, areaUnit: 'sq.ft', registrationDate: '2020-11-28', marketValue: 72000000,
    center: { lat: 13.0440, lon: 80.2320 }, status: 'verified', landUse: 'commercial',
  },
];

module.exports = { parcels };
