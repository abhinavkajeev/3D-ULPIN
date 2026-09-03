-- ============================================
-- 3D ULPIN Cadastral Database Schema
-- PostgreSQL 16 + PostGIS 3.4
-- SIH 2026 — Problem Statement SIH26011
-- ============================================

-- Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ============================================
-- ZONES — Administrative zones of Chennai
-- ============================================
CREATE TABLE IF NOT EXISTS zones (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  ward VARCHAR(20),
  type VARCHAR(50),
  color VARCHAR(10),
  center GEOGRAPHY(Point, 4326)
);

-- ============================================
-- PARCELS — Land parcels (2D survey plots)
-- ============================================
CREATE TABLE IF NOT EXISTS parcels (
  id VARCHAR(30) PRIMARY KEY,
  survey_number VARCHAR(30) NOT NULL UNIQUE,
  zone_id VARCHAR(20) REFERENCES zones(id),
  address TEXT,
  owner VARCHAR(200) NOT NULL,
  area NUMERIC(12,2),
  area_unit VARCHAR(10) DEFAULT 'sq.ft',
  registration_date DATE,
  market_value NUMERIC(15,2),
  status VARCHAR(20) DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'disputed')),
  land_use VARCHAR(30),
  boundary GEOGRAPHY(Polygon, 4326),
  center GEOGRAPHY(Point, 4326),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- BUILDINGS — 3D building structures on parcels
-- ============================================
CREATE TABLE IF NOT EXISTS buildings (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  parcel_id VARCHAR(30) REFERENCES parcels(id),
  type VARCHAR(30) CHECK (type IN ('residential', 'commercial', 'mixed', 'institutional', 'industrial')),
  height NUMERIC(8,2),
  floors INTEGER,
  total_units INTEGER,
  units_per_floor INTEGER,
  floor_height NUMERIC(5,2) DEFAULT 3.5,
  construction_year INTEGER,
  status VARCHAR(30) DEFAULT 'active',
  footprint_width NUMERIC(8,2),
  footprint_depth NUMERIC(8,2),
  -- 3D geometry: PolyhedralSurface Z for volumetric representation
  footprint GEOGRAPHY(Polygon, 4326),
  location GEOGRAPHY(Point, 4326),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- UNITS — Individual property units (3D volumes)
-- ============================================
CREATE TABLE IF NOT EXISTS units (
  id VARCHAR(50) PRIMARY KEY,
  building_id VARCHAR(30) REFERENCES buildings(id),
  unit_number VARCHAR(10) NOT NULL,
  floor INTEGER NOT NULL,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'disputed')),
  owner VARCHAR(200),
  area NUMERIC(10,2),
  elevation NUMERIC(8,2),
  height NUMERIC(5,2) DEFAULT 3.5,
  registration_date DATE,
  market_value NUMERIC(15,2),
  ulpin VARCHAR(60),
  -- 3D bounding box for volumetric property rights
  min_elevation NUMERIC(8,2),
  max_elevation NUMERIC(8,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INFRASTRUCTURE — Underground utilities
-- ============================================
CREATE TABLE IF NOT EXISTS infrastructure_underground (
  id VARCHAR(40) PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('water', 'sewer', 'electrical', 'gas')),
  name VARCHAR(200),
  depth NUMERIC(6,2),
  diameter NUMERIC(5,2),
  length NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'active',
  installed_year INTEGER,
  path GEOGRAPHY(LineString, 4326)
);

-- ============================================
-- ELEVATED STRUCTURES — Metro, flyovers
-- ============================================
CREATE TABLE IF NOT EXISTS infrastructure_elevated (
  id VARCHAR(40) PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  name VARCHAR(200),
  elevation NUMERIC(8,2),
  width NUMERIC(8,2),
  path GEOGRAPHY(LineString, 4326)
);

-- ============================================
-- AIR RIGHTS — Volumetric airspace allocations
-- ============================================
CREATE TABLE IF NOT EXISTS air_rights (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(200),
  type VARCHAR(50),
  elevation_min NUMERIC(8,2),
  elevation_max NUMERIC(8,2),
  status VARCHAR(20),
  bounds GEOGRAPHY(Polygon, 4326)
);

-- ============================================
-- ULPIN REGISTRY — Generated ULPINs
-- ============================================
CREATE TABLE IF NOT EXISTS ulpin_registry (
  ulpin VARCHAR(60) PRIMARY KEY,
  unit_id VARCHAR(50) REFERENCES units(id),
  building_id VARCHAR(30) REFERENCES buildings(id),
  parcel_id VARCHAR(30) REFERENCES parcels(id),
  state_code VARCHAR(5) DEFAULT 'TN',
  district_code VARCHAR(5) DEFAULT 'CHN',
  zone_code VARCHAR(5),
  generated_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT false
);

-- ============================================
-- VALIDATION LOG — Topology validation results
-- ============================================
CREATE TABLE IF NOT EXISTS validation_log (
  id SERIAL PRIMARY KEY,
  building_id VARCHAR(30) REFERENCES buildings(id),
  overall_status VARCHAR(20),
  score INTEGER,
  checks JSONB,
  issues JSONB,
  validated_at TIMESTAMP DEFAULT NOW(),
  engine VARCHAR(100) DEFAULT 'PostGIS Topology Validator v2.1'
);

-- ============================================
-- INDEXES for spatial queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_parcels_center ON parcels USING GIST(center);
CREATE INDEX IF NOT EXISTS idx_parcels_boundary ON parcels USING GIST(boundary);
CREATE INDEX IF NOT EXISTS idx_buildings_location ON buildings USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_buildings_footprint ON buildings USING GIST(footprint);
CREATE INDEX IF NOT EXISTS idx_infra_underground_path ON infrastructure_underground USING GIST(path);
CREATE INDEX IF NOT EXISTS idx_infra_elevated_path ON infrastructure_elevated USING GIST(path);
CREATE INDEX IF NOT EXISTS idx_air_rights_bounds ON air_rights USING GIST(bounds);
CREATE INDEX IF NOT EXISTS idx_units_building ON units(building_id);
CREATE INDEX IF NOT EXISTS idx_units_floor ON units(building_id, floor);
CREATE INDEX IF NOT EXISTS idx_ulpin_unit ON ulpin_registry(unit_id);
CREATE INDEX IF NOT EXISTS idx_ulpin_building ON ulpin_registry(building_id);
