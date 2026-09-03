-- ============================================
-- Seed Data — Chennai Cadastral Records
-- ============================================

-- ZONES
INSERT INTO zones (id, name, code, ward, type, color, center) VALUES
  ('zone-1', 'T. Nagar', 'TNR', 'Ward 125', 'residential-dense', '#00d4ff', ST_GeogFromText('POINT(80.2341 13.0418)')),
  ('zone-2', 'Mylapore', 'MYL', 'Ward 119', 'mixed', '#a855f7', ST_GeogFromText('POINT(80.2699 13.0337)')),
  ('zone-3', 'Anna Nagar', 'ANN', 'Ward 96', 'residential-modern', '#14b8a6', ST_GeogFromText('POINT(80.2101 13.0850)')),
  ('zone-4', 'Adyar', 'ADY', 'Ward 173', 'institutional', '#f59e0b', ST_GeogFromText('POINT(80.2572 13.0067)')),
  ('zone-5', 'Guindy', 'GND', 'Ward 155', 'commercial', '#f43f5e', ST_GeogFromText('POINT(80.2206 13.0067)'))
ON CONFLICT (id) DO NOTHING;

-- PARCELS
INSERT INTO parcels (id, survey_number, zone_id, address, owner, area, registration_date, market_value, status, land_use, center) VALUES
  ('parcel-001', 'TS-42/3', 'zone-1', '23, Pondy Bazaar, T. Nagar, Chennai - 600017', 'Rajesh Kumar Sharma', 4800, '2018-03-15', 28500000, 'verified', 'residential', ST_GeogFromText('POINT(80.2348 13.0425)')),
  ('parcel-002', 'TS-43/1', 'zone-1', '45, GN Chetty Road, T. Nagar, Chennai - 600017', 'Lakshmi Devi Ramanathan', 6200, '2019-07-22', 35200000, 'verified', 'commercial', ST_GeogFromText('POINT(80.2355 13.0412)')),
  ('parcel-003', 'TS-44/2', 'zone-1', '12, Ranganathan Street, T. Nagar, Chennai - 600017', 'Suresh Babu Iyer', 3200, '2020-01-10', 22000000, 'verified', 'commercial', ST_GeogFromText('POINT(80.2340 13.0435)')),
  ('parcel-004', 'MY-12/1', 'zone-2', '78, Kutchery Road, Mylapore, Chennai - 600004', 'Meenakshi Sundaram', 5500, '2017-11-05', 42000000, 'verified', 'residential', ST_GeogFromText('POINT(80.2699 13.0337)')),
  ('parcel-005', 'MY-15/3', 'zone-2', '34, Luz Church Road, Mylapore, Chennai - 600004', 'Anand Krishnamurthy', 7800, '2016-06-18', 55000000, 'pending', 'mixed', ST_GeogFromText('POINT(80.2710 13.0345)')),
  ('parcel-006', 'AN-08/2', 'zone-3', '56, 2nd Avenue, Anna Nagar, Chennai - 600040', 'Priya Venkatesh', 4200, '2021-03-25', 31000000, 'verified', 'residential', ST_GeogFromText('POINT(80.2101 13.0850)')),
  ('parcel-007', 'AN-11/5', 'zone-3', '89, Shanti Colony, Anna Nagar, Chennai - 600040', 'Karthik Rajan', 9500, '2015-09-14', 68000000, 'verified', 'commercial', ST_GeogFromText('POINT(80.2115 13.0860)')),
  ('parcel-008', 'AD-05/1', 'zone-4', '23, Gandhi Nagar, Adyar, Chennai - 600020', 'Deepa Mahadevan', 3800, '2022-01-08', 27500000, 'verified', 'residential', ST_GeogFromText('POINT(80.2572 13.0067)')),
  ('parcel-009', 'AD-09/3', 'zone-4', '67, Lattice Bridge Road, Adyar, Chennai - 600020', 'Ramesh Padmanabhan', 6100, '2019-04-30', 45000000, 'disputed', 'institutional', ST_GeogFromText('POINT(80.2580 13.0075)')),
  ('parcel-010', 'GN-03/2', 'zone-5', '112, Mount Road, Guindy, Chennai - 600032', 'Vijay Industrial Corp', 12000, '2014-08-20', 95000000, 'verified', 'commercial', ST_GeogFromText('POINT(80.2206 13.0067)')),
  ('parcel-011', 'GN-07/1', 'zone-5', '45, SIDCO Industrial Estate, Guindy, Chennai - 600032', 'Tamil Nadu IT Parks', 25000, '2013-02-12', 180000000, 'verified', 'industrial', ST_GeogFromText('POINT(80.2220 13.0080)')),
  ('parcel-012', 'TS-50/4', 'zone-1', '99, Usman Road, T. Nagar, Chennai - 600017', 'Saravanan Textiles Pvt Ltd', 8500, '2020-11-28', 72000000, 'verified', 'commercial', ST_GeogFromText('POINT(80.2320 13.0440)'))
ON CONFLICT (id) DO NOTHING;

-- BUILDINGS (20 buildings across parcels)
INSERT INTO buildings (id, name, parcel_id, type, height, floors, total_units, units_per_floor, floor_height, construction_year, status, footprint_width, footprint_depth, location) VALUES
  ('BLDG-001', 'Pondy Heights', 'parcel-001', 'residential', 28.0, 8, 32, 4, 3.5, 2018, 'active', 22, 18, ST_GeogFromText('POINT(80.2348 13.0425)')),
  ('BLDG-002', 'GN Chetty Towers', 'parcel-002', 'commercial', 42.0, 12, 48, 4, 3.5, 2019, 'active', 25, 22, ST_GeogFromText('POINT(80.2355 13.0412)')),
  ('BLDG-003', 'Ranganathan Plaza', 'parcel-003', 'mixed', 17.5, 5, 15, 3, 3.5, 2015, 'active', 20, 16, ST_GeogFromText('POINT(80.2340 13.0435)')),
  ('BLDG-004', 'Thyagaraya Complex', 'parcel-001', 'commercial', 21.0, 6, 24, 4, 3.5, 2020, 'active', 18, 20, ST_GeogFromText('POINT(80.2350 13.0428)')),
  ('BLDG-005', 'Usman Square', 'parcel-012', 'commercial', 35.0, 10, 40, 4, 3.5, 2021, 'active', 30, 25, ST_GeogFromText('POINT(80.2320 13.0440)')),
  ('BLDG-006', 'T Nagar Grand', 'parcel-001', 'residential', 24.5, 7, 21, 3, 3.5, 2017, 'active', 16, 18, ST_GeogFromText('POINT(80.2345 13.0420)')),
  ('BLDG-007', 'Mylapore Heritage', 'parcel-004', 'residential', 14.0, 4, 12, 3, 3.5, 2010, 'active', 20, 15, ST_GeogFromText('POINT(80.2699 13.0337)')),
  ('BLDG-008', 'Luz Corner Complex', 'parcel-005', 'mixed', 31.5, 9, 36, 4, 3.5, 2022, 'active', 24, 20, ST_GeogFromText('POINT(80.2710 13.0345)')),
  ('BLDG-009', 'Anna Grand Tower', 'parcel-006', 'residential', 49.0, 14, 56, 4, 3.5, 2023, 'active', 28, 22, ST_GeogFromText('POINT(80.2101 13.0850)')),
  ('BLDG-010', 'Shanti Enclave', 'parcel-007', 'commercial', 38.5, 11, 44, 4, 3.5, 2016, 'active', 26, 24, ST_GeogFromText('POINT(80.2115 13.0860)')),
  ('BLDG-011', 'Adyar Gateway', 'parcel-008', 'residential', 21.0, 6, 18, 3, 3.5, 2019, 'active', 18, 16, ST_GeogFromText('POINT(80.2572 13.0067)')),
  ('BLDG-012', 'Guindy Tech Park', 'parcel-010', 'commercial', 45.5, 13, 52, 4, 3.5, 2014, 'active', 35, 30, ST_GeogFromText('POINT(80.2206 13.0067)')),
  ('BLDG-013', 'Dev Heights', 'parcel-002', 'residential', 28.0, 8, 24, 3, 3.5, 2020, 'active', 20, 18, ST_GeogFromText('POINT(80.2358 13.0415)')),
  ('BLDG-014', 'Murugan Enclave', 'parcel-004', 'residential', 17.5, 5, 15, 3, 3.5, 2016, 'active', 16, 14, ST_GeogFromText('POINT(80.2695 13.0340)')),
  ('BLDG-015', 'Sri Lakshmi Residency', 'parcel-006', 'residential', 24.5, 7, 28, 4, 3.5, 2021, 'active', 22, 18, ST_GeogFromText('POINT(80.2105 13.0855)')),
  ('BLDG-016', 'Padma Apartments', 'parcel-008', 'residential', 14.0, 4, 16, 4, 3.5, 2018, 'active', 18, 16, ST_GeogFromText('POINT(80.2575 13.0070)')),
  ('BLDG-017', 'Kamakshi Towers', 'parcel-009', 'institutional', 31.5, 9, 27, 3, 3.5, 2017, 'active', 24, 20, ST_GeogFromText('POINT(80.2580 13.0075)')),
  ('BLDG-018', 'Meenakshi Complex', 'parcel-011', 'industrial', 10.5, 3, 9, 3, 3.5, 2013, 'active', 40, 35, ST_GeogFromText('POINT(80.2220 13.0080)')),
  ('BLDG-019', 'Nandini Heights', 'parcel-003', 'mixed', 35.0, 10, 30, 3, 3.5, 2022, 'under-construction', 22, 20, ST_GeogFromText('POINT(80.2342 13.0438)')),
  ('BLDG-020', 'Saravana Stores Annex', 'parcel-012', 'commercial', 28.0, 8, 32, 4, 3.5, 2020, 'active', 28, 25, ST_GeogFromText('POINT(80.2325 13.0442)'))
ON CONFLICT (id) DO NOTHING;

-- UNDERGROUND INFRASTRUCTURE
INSERT INTO infrastructure_underground (id, type, name, depth, diameter, length, status, installed_year, path) VALUES
  ('UTIL-CHN-WATER-001', 'water', 'T. Nagar Main Water Line', -3.5, 0.6, 340, 'active', 2015, ST_GeogFromText('LINESTRING(80.2300 13.0400, 80.2320 13.0410, 80.2340 13.0420, 80.2360 13.0430, 80.2380 13.0440)')),
  ('UTIL-CHN-WATER-002', 'water', 'Mylapore Distribution Line', -2.8, 0.4, 280, 'active', 2018, ST_GeogFromText('LINESTRING(80.2680 13.0320, 80.2690 13.0330, 80.2700 13.0340, 80.2710 13.0350)')),
  ('UTIL-CHN-SEWER-001', 'sewer', 'T. Nagar Sewer Trunk', -5.0, 0.8, 420, 'active', 2012, ST_GeogFromText('LINESTRING(80.2295 13.0395, 80.2315 13.0405, 80.2335 13.0415, 80.2355 13.0425, 80.2375 13.0435)')),
  ('UTIL-CHN-ELEC-001', 'electrical', 'TNEB HT Cable - Zone 1', -1.5, 0.15, 500, 'active', 2020, ST_GeogFromText('LINESTRING(80.2290 13.0410, 80.2310 13.0415, 80.2330 13.0420, 80.2350 13.0425, 80.2370 13.0430, 80.2390 13.0435)')),
  ('UTIL-CHN-GAS-001', 'gas', 'IGL Gas Pipeline', -2.0, 0.2, 350, 'active', 2021, ST_GeogFromText('LINESTRING(80.2305 13.0390, 80.2325 13.0400, 80.2345 13.0410, 80.2365 13.0420, 80.2385 13.0430)'))
ON CONFLICT (id) DO NOTHING;

-- ELEVATED STRUCTURES
INSERT INTO infrastructure_elevated (id, type, name, elevation, width, path) VALUES
  ('ELEV-CHN-METRO-001', 'metro', 'Chennai Metro Blue Line', 12.0, 8, ST_GeogFromText('LINESTRING(80.2200 13.0400, 80.2250 13.0410, 80.2300 13.0420, 80.2350 13.0430, 80.2400 13.0440, 80.2450 13.0430, 80.2500 13.0420)')),
  ('ELEV-CHN-FLY-001', 'flyover', 'Kathipara Flyover', 8.0, 12, ST_GeogFromText('LINESTRING(80.2250 13.0350, 80.2300 13.0360, 80.2340 13.0365, 80.2380 13.0360, 80.2420 13.0350)'))
ON CONFLICT (id) DO NOTHING;

-- AIR RIGHTS
INSERT INTO air_rights (id, name, type, elevation_min, elevation_max, status, bounds) VALUES
  ('AIR-CHN-001', 'T. Nagar Metro Airspace', 'transit-corridor', 10.0, 18.0, 'allocated', ST_GeogFromText('POLYGON((80.2290 13.0415, 80.2310 13.0415, 80.2310 13.0430, 80.2290 13.0430, 80.2290 13.0415))')),
  ('AIR-CHN-002', 'Commercial Air Rights - Pondy Bazaar', 'development-rights', 14.0, 45.0, 'available', ST_GeogFromText('POLYGON((80.2335 13.0420, 80.2355 13.0420, 80.2355 13.0440, 80.2335 13.0440, 80.2335 13.0420))'))
ON CONFLICT (id) DO NOTHING;

-- GENERATE UNITS for all buildings
DO $$
DECLARE
  bldg RECORD;
  f INTEGER;
  u INTEGER;
  unit_num TEXT;
  unit_id TEXT;
  owner_first TEXT[];
  owner_last TEXT[];
  statuses TEXT[];
  types TEXT[];
BEGIN
  owner_first := ARRAY['Rajesh', 'Priya', 'Anand', 'Lakshmi', 'Suresh', 'Meena', 'Karthik', 'Deepa', 'Vijay', 'Kavitha', 'Srinivasan', 'Nalini'];
  owner_last := ARRAY['Sharma', 'Iyer', 'Kumar', 'Devi', 'Rajan', 'Nair', 'Pillai', 'Murugan', 'Krishnan', 'Sundaram', 'Padmanabhan', 'Raghavan'];
  statuses := ARRAY['verified', 'verified', 'verified', 'pending', 'disputed'];
  types := ARRAY['Residential Apt', 'Commercial Space', 'Office Suite', 'Retail Unit'];

  FOR bldg IN SELECT * FROM buildings LOOP
    FOR f IN 1..bldg.floors LOOP
      FOR u IN 1..bldg.units_per_floor LOOP
        unit_num := f::TEXT || LPAD(u::TEXT, 2, '0');
        unit_id := bldg.id || '-U' || unit_num;

        INSERT INTO units (id, building_id, unit_number, floor, type, status, owner, area, elevation, height, registration_date, market_value, min_elevation, max_elevation)
        VALUES (
          unit_id,
          bldg.id,
          unit_num,
          f,
          CASE WHEN bldg.type = 'commercial' THEN 'Commercial Space' WHEN bldg.type = 'industrial' THEN 'Industrial Unit' ELSE 'Residential Apt' END,
          statuses[1 + (random() * 4)::int % 5],
          owner_first[1 + (random() * 11)::int % 12] || ' ' || owner_last[1 + (random() * 11)::int % 12],
          (500 + random() * 1500)::numeric(10,2),
          ((f - 1) * bldg.floor_height),
          bldg.floor_height,
          ('2020-01-01'::date + (random() * 2000)::int),
          (5000000 + random() * 25000000)::numeric(15,2),
          ((f - 1) * bldg.floor_height),
          (f * bldg.floor_height)
        )
        ON CONFLICT (id) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Count seeded data
SELECT 'Zones: ' || COUNT(*) FROM zones
UNION ALL SELECT 'Parcels: ' || COUNT(*) FROM parcels
UNION ALL SELECT 'Buildings: ' || COUNT(*) FROM buildings
UNION ALL SELECT 'Units: ' || COUNT(*) FROM units
UNION ALL SELECT 'Underground: ' || COUNT(*) FROM infrastructure_underground
UNION ALL SELECT 'Elevated: ' || COUNT(*) FROM infrastructure_elevated
UNION ALL SELECT 'Air Rights: ' || COUNT(*) FROM air_rights;
