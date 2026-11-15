-- =====================================================================
-- NILAM PESUM (நிலம் பேசும்) - Supabase / PostgreSQL Database Schema
-- NASA-Powered AI Agricultural Intelligence & Satellite Monitoring
-- =====================================================================

-- Enable PostGIS extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS postgis; -- Optional where supported

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'farmer' CHECK (role IN ('farmer', 'officer', 'admin')),
    preferred_language VARCHAR(10) DEFAULT 'ta' CHECK (preferred_language IN ('ta', 'en')),
    village VARCHAR(100),
    taluk VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farmlands Table
CREATE TABLE IF NOT EXISTS farmlands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    survey_number VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    district VARCHAR(100) NOT NULL,
    taluk VARCHAR(100),
    village VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    area_acres DECIMAL(10, 2) NOT NULL,
    area_hectares DECIMAL(10, 2) NOT NULL,
    irrigation_type VARCHAR(50) DEFAULT 'borewell' CHECK (irrigation_type IN ('canal', 'borewell', 'open_well', 'rainfed', 'drip', 'sprinkler')),
    soil_type VARCHAR(50) DEFAULT 'alluvial' CHECK (soil_type IN ('alluvial', 'red_loam', 'black_cotton', 'clay_loam', 'sandy_loam', 'saline')),
    water_availability VARCHAR(50) DEFAULT 'medium' CHECK (water_availability IN ('high', 'medium', 'scarce', 'seasonal')),
    boundary_geojson JSONB,
    current_crop VARCHAR(100),
    farming_goal VARCHAR(100) DEFAULT 'balanced' CHECK (farming_goal IN ('save_water', 'improve_soil', 'reduce_risk', 'maximize_profit', 'balanced')),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Farmland Zones (For within-farm spatial heterogeneity)
CREATE TABLE IF NOT EXISTS farmland_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmland_id UUID REFERENCES farmlands(id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    zone_area_acres DECIMAL(10, 2),
    relative_elevation VARCHAR(50),
    soil_variation VARCHAR(100),
    boundary_geojson JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. NASA Data Sources (Official Provenance Catalog)
CREATE TABLE IF NOT EXISTS nasa_data_sources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    agency VARCHAR(100) DEFAULT 'NASA',
    center VARCHAR(100),
    official_url TEXT NOT NULL,
    data_type VARCHAR(100) NOT NULL,
    spatial_resolution VARCHAR(100) NOT NULL,
    temporal_resolution VARCHAR(100) NOT NULL,
    historical_coverage VARCHAR(100) NOT NULL,
    auth_required BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. NASA API & Data Retrieval Logs
CREATE TABLE IF NOT EXISTS nasa_api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id VARCHAR(50) REFERENCES nasa_data_sources(id),
    farmland_id UUID REFERENCES farmlands(id) ON DELETE SET NULL,
    endpoint_called TEXT NOT NULL,
    request_params JSONB,
    status_code INTEGER,
    response_time_ms INTEGER,
    records_retrieved INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Environmental Observations (Category 1: Genuine NASA data)
CREATE TABLE IF NOT EXISTS environmental_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmland_id UUID REFERENCES farmlands(id) ON DELETE CASCADE,
    observation_date DATE NOT NULL,
    source_id VARCHAR(50) REFERENCES nasa_data_sources(id),
    
    -- NASA POWER / MERRA-2 meteorological parameters
    temperature_avg_c DECIMAL(6, 2),
    temperature_max_c DECIMAL(6, 2),
    temperature_min_c DECIMAL(6, 2),
    precipitation_mm DECIMAL(7, 2),
    relative_humidity_pct DECIMAL(5, 2),
    solar_radiation_mj_m2 DECIMAL(6, 2),
    
    -- NASA SMAP soil moisture
    soil_moisture_surface DECIMAL(5, 4), -- cm³/cm³ (0-5 cm)
    soil_moisture_rootzone DECIMAL(5, 4), -- cm³/cm³ (0-100 cm)
    soil_moisture_quality_flag VARCHAR(20),
    
    -- NASA MODIS / HLS vegetation indices
    ndvi DECIMAL(5, 4),
    evi DECIMAL(5, 4),
    cloud_mask_pct DECIMAL(5, 2),
    
    provenance_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_farmland_date_source UNIQUE (farmland_id, observation_date, source_id)
);

-- 7. Agricultural Knowledge Base (Grounded in TNAU & ICAR)
CREATE TABLE IF NOT EXISTS crop_knowledge_base (
    id VARCHAR(50) PRIMARY KEY,
    crop_name_en VARCHAR(100) NOT NULL,
    crop_name_ta VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    category VARCHAR(50) NOT NULL, -- cereal, pulse, oilseed, millet, fiber, commercial
    duration_days_min INTEGER NOT NULL,
    duration_days_max INTEGER NOT NULL,
    suitable_seasons TEXT[] NOT NULL, -- Kuruvai, Samba, Navarai, Thaladi, Chithirai, Adipattam
    water_req_mm_min DECIMAL(7, 2) NOT NULL,
    water_req_mm_max DECIMAL(7, 2) NOT NULL,
    temp_optimal_c_min DECIMAL(5, 2) NOT NULL,
    temp_optimal_c_max DECIMAL(5, 2) NOT NULL,
    soil_preference TEXT[] NOT NULL,
    ph_min DECIMAL(3, 1) NOT NULL,
    ph_max DECIMAL(3, 1) NOT NULL,
    drought_tolerance VARCHAR(20) DEFAULT 'medium' CHECK (drought_tolerance IN ('low', 'medium', 'high', 'very_high')),
    nitrogen_fixing BOOLEAN DEFAULT FALSE,
    estimated_n_req_kg_ha DECIMAL(6, 2),
    estimated_p_req_kg_ha DECIMAL(6, 2),
    estimated_k_req_kg_ha DECIMAL(6, 2),
    compatible_preceding_crops TEXT[],
    incompatible_preceding_crops TEXT[],
    soil_health_benefit TEXT,
    reference_institution VARCHAR(100) DEFAULT 'Tamil Nadu Agricultural University (TNAU)',
    reference_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Crop Rotation History (Farmer's real field records)
CREATE TABLE IF NOT EXISTS crop_rotation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmland_id UUID REFERENCES farmlands(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    season VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    sowing_date DATE,
    harvest_date DATE,
    yield_quintals DECIMAL(8, 2),
    fertilizer_applied TEXT,
    irrigation_frequency VARCHAR(50),
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Crop Rotation Recommendations (Category 3: Algorithmic recommendations)
CREATE TABLE IF NOT EXISTS crop_rotation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmland_id UUID REFERENCES farmlands(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) NOT NULL, -- 'water_saver', 'soil_builder', 'risk_minimizer', 'profit_optimizer'
    rotation_sequence JSONB NOT NULL, -- array of { crop_id, crop_name, season, duration_days }
    overall_suitability_score DECIMAL(5, 2) NOT NULL, -- 0-100
    climate_score DECIMAL(5, 2) NOT NULL,
    water_score DECIMAL(5, 2) NOT NULL,
    soil_score DECIMAL(5, 2) NOT NULL,
    soil_health_benefit TEXT NOT NULL,
    water_requirement_desc VARCHAR(100) NOT NULL,
    environmental_risk VARCHAR(50) NOT NULL, -- 'low', 'moderate', 'high'
    explanation_en TEXT NOT NULL,
    explanation_ta TEXT NOT NULL,
    supporting_nasa_indicators JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Scenario Simulations (Category 4: Hypothetical simulations)
CREATE TABLE IF NOT EXISTS scenario_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmland_id UUID REFERENCES farmlands(id) ON DELETE CASCADE,
    simulation_name VARCHAR(255) NOT NULL,
    rainfall_change_pct DECIMAL(5, 2) DEFAULT 0.0,
    temp_change_c DECIMAL(4, 2) DEFAULT 0.0,
    irrigation_constraint VARCHAR(50) DEFAULT 'normal',
    baseline_observations JSONB NOT NULL,
    simulated_impact JSONB NOT NULL,
    recommended_adaptations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Soil Health and Nutrient Tracking
CREATE TABLE IF NOT EXISTS soil_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmland_id UUID REFERENCES farmlands(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    soil_type VARCHAR(50),
    soil_ph DECIMAL(3, 1),
    organic_carbon_pct DECIMAL(4, 2),
    available_nitrogen_kg_ha DECIMAL(6, 2),
    available_phosphorus_kg_ha DECIMAL(6, 2),
    available_potassium_kg_ha DECIMAL(6, 2),
    tested_by VARCHAR(100) DEFAULT 'Farmer Soil Card / Lab',
    indicative_n_balance_kg_ha DECIMAL(7, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Farming Calendar Tasks
CREATE TABLE IF NOT EXISTS farming_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmland_id UUID REFERENCES farmlands(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('land_prep', 'sowing', 'irrigation', 'fertilization', 'pest_scouting', 'weeding', 'harvest')),
    crop_name VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Farm Economics (Expenses & Revenue)
CREATE TABLE IF NOT EXISTS farm_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmland_id UUID REFERENCES farmlands(id) ON DELETE CASCADE,
    season VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('seeds', 'fertilizer', 'labor', 'irrigation', 'machinery', 'transport', 'other')),
    amount_inr DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS harvest_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmland_id UUID REFERENCES farmlands(id) ON DELETE CASCADE,
    season VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    quantity_quintals DECIMAL(8, 2) NOT NULL,
    selling_price_per_quintal DECIMAL(10, 2) NOT NULL,
    total_revenue_inr DECIMAL(12, 2) NOT NULL,
    harvest_date DATE NOT NULL,
    buyer_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Notifications & Environmental Alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    farmland_id UUID REFERENCES farmlands(id) ON DELETE SET NULL,
    title_en VARCHAR(255) NOT NULL,
    title_ta VARCHAR(255) NOT NULL,
    message_en TEXT NOT NULL,
    message_ta TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('rainfall_anomaly', 'soil_dryness', 'temperature_stress', 'vegetation_decline', 'calendar_task', 'system')),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    data_source_id VARCHAR(50) REFERENCES nasa_data_sources(id),
    observation_date DATE,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_farmlands_user ON farmlands(user_id);
CREATE INDEX IF NOT EXISTS idx_farmlands_coords ON farmlands(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_env_obs_farmland ON environmental_observations(farmland_id);
CREATE INDEX IF NOT EXISTS idx_env_obs_date ON environmental_observations(observation_date);
CREATE INDEX IF NOT EXISTS idx_crop_plans_farmland ON crop_rotation_plans(farmland_id);
CREATE INDEX IF NOT EXISTS idx_activities_farmland ON farming_activities(farmland_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Row Level Security (RLS) Policies for Supabase
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmlands ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmland_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_rotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_rotation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE farming_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

