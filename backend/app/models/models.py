import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime, Date, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="farmer") # farmer, officer, admin
    preferred_language = Column(String(10), default="ta") # ta, en
    village = Column(String(100), nullable=True)
    taluk = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), default="Tamil Nadu")
    hashed_password = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=True)
    verification_token = Column(String(255), nullable=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmlands = relationship("Farmland", back_populates="owner", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    saved_simulations = relationship("SavedSimulation", back_populates="user", cascade="all, delete-orphan")

class Farmland(Base):
    __tablename__ = "farmlands"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    user_id = Column(String(50), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    survey_number = Column(String(100), nullable=True)
    state = Column(String(100), default="Tamil Nadu")
    district = Column(String(100), nullable=False, index=True)
    taluk = Column(String(100), nullable=True)
    village = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_acres = Column(Float, nullable=False)
    area_hectares = Column(Float, nullable=False)
    irrigation_type = Column(String(50), default="borewell") # canal, borewell, open_well, rainfed, drip, sprinkler
    soil_type = Column(String(50), default="alluvial") # alluvial, red_loam, black_cotton, clay_loam, sandy_loam
    water_availability = Column(String(50), default="medium") # high, medium, scarce, seasonal
    boundary_geojson = Column(JSON, nullable=True)
    current_crop = Column(String(100), nullable=True)
    farming_goal = Column(String(100), default="balanced") # save_water, improve_soil, reduce_risk, maximize_profit, balanced
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("Profile", back_populates="farmlands")
    zones = relationship("FarmlandZone", back_populates="farmland", cascade="all, delete-orphan")
    observations = relationship("EnvironmentalObservation", back_populates="farmland", cascade="all, delete-orphan")
    rotation_history = relationship("CropRotationHistory", back_populates="farmland", cascade="all, delete-orphan")
    rotation_plans = relationship("CropRotationPlan", back_populates="farmland", cascade="all, delete-orphan")
    simulations = relationship("ScenarioSimulation", back_populates="farmland", cascade="all, delete-orphan")
    soil_records = relationship("SoilHealthRecord", back_populates="farmland", cascade="all, delete-orphan")
    activities = relationship("FarmingActivity", back_populates="farmland", cascade="all, delete-orphan")
    expenses = relationship("FarmExpense", back_populates="farmland", cascade="all, delete-orphan")
    harvests = relationship("HarvestRecord", back_populates="farmland", cascade="all, delete-orphan")
    plots = relationship("FarmPlot", back_populates="farmland", cascade="all, delete-orphan")
    saved_simulations = relationship("SavedSimulation", back_populates="farmland", cascade="all, delete-orphan")

class FarmlandZone(Base):
    __tablename__ = "farmland_zones"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False)
    zone_name = Column(String(100), nullable=False)
    zone_area_acres = Column(Float, nullable=True)
    relative_elevation = Column(String(50), nullable=True)
    soil_variation = Column(String(100), nullable=True)
    boundary_geojson = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmland = relationship("Farmland", back_populates="zones")

class NasaDataSource(Base):
    __tablename__ = "nasa_data_sources"

    id = Column(String(50), primary_key=True) # nasa_power, nasa_gpm_imerg, nasa_smap, nasa_modis, nasa_hls, nasa_merra2
    name = Column(String(255), nullable=False)
    agency = Column(String(100), default="NASA")
    center = Column(String(100), nullable=True)
    official_url = Column(Text, nullable=False)
    data_type = Column(String(150), nullable=False)
    spatial_resolution = Column(String(100), nullable=False)
    temporal_resolution = Column(String(100), nullable=False)
    historical_coverage = Column(String(100), nullable=False)
    auth_required = Column(Boolean, default=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class NasaApiLog(Base):
    __tablename__ = "nasa_api_logs"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    source_id = Column(String(50), ForeignKey("nasa_data_sources.id"), nullable=False)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="SET NULL"), nullable=True)
    endpoint_called = Column(Text, nullable=False)
    request_params = Column(JSON, nullable=True)
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    records_retrieved = Column(Integer, default=0)
    status = Column(String(50), default="success") # success, error, simulated, fallback
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class EnvironmentalObservation(Base):
    __tablename__ = "environmental_observations"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False, index=True)
    observation_date = Column(Date, nullable=False, index=True)
    source_id = Column(String(50), ForeignKey("nasa_data_sources.id"), nullable=False)
    
    # NASA POWER / MERRA-2 parameters
    temperature_avg_c = Column(Float, nullable=True)
    temperature_max_c = Column(Float, nullable=True)
    temperature_min_c = Column(Float, nullable=True)
    precipitation_mm = Column(Float, nullable=True)
    relative_humidity_pct = Column(Float, nullable=True)
    solar_radiation_mj_m2 = Column(Float, nullable=True)
    
    # NASA SMAP soil moisture
    soil_moisture_surface = Column(Float, nullable=True) # cm³/cm³ (0-5 cm)
    soil_moisture_rootzone = Column(Float, nullable=True) # cm³/cm³ (0-100 cm)
    soil_moisture_quality_flag = Column(String(20), nullable=True)
    
    # NASA MODIS / HLS vegetation indices
    ndvi = Column(Float, nullable=True)
    evi = Column(Float, nullable=True)
    cloud_mask_pct = Column(Float, nullable=True)
    
    provenance_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmland = relationship("Farmland", back_populates="observations")

class CropKnowledgeBase(Base):
    __tablename__ = "crop_knowledge_base"

    id = Column(String(50), primary_key=True)
    crop_name_en = Column(String(100), nullable=False)
    crop_name_ta = Column(String(100), nullable=False)
    scientific_name = Column(String(150), nullable=True)
    category = Column(String(50), nullable=False)
    duration_days_min = Column(Integer, nullable=False)
    duration_days_max = Column(Integer, nullable=False)
    suitable_seasons = Column(JSON, nullable=False) # list of seasons
    water_req_mm_min = Column(Float, nullable=False)
    water_req_mm_max = Column(Float, nullable=False)
    temp_optimal_c_min = Column(Float, nullable=False)
    temp_optimal_c_max = Column(Float, nullable=False)
    soil_preference = Column(JSON, nullable=False) # list of soils
    ph_min = Column(Float, nullable=False)
    ph_max = Column(Float, nullable=False)
    drought_tolerance = Column(String(20), default="medium")
    nitrogen_fixing = Column(Boolean, default=False)
    estimated_n_req_kg_ha = Column(Float, nullable=True)
    estimated_p_req_kg_ha = Column(Float, nullable=True)
    estimated_k_req_kg_ha = Column(Float, nullable=True)
    compatible_preceding_crops = Column(JSON, nullable=True)
    incompatible_preceding_crops = Column(JSON, nullable=True)
    soil_health_benefit = Column(Text, nullable=True)
    reference_institution = Column(String(100), default="Tamil Nadu Agricultural University (TNAU)")
    reference_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CropRotationHistory(Base):
    __tablename__ = "crop_rotation_history"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_name = Column(String(100), nullable=False)
    season = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    sowing_date = Column(Date, nullable=True)
    harvest_date = Column(Date, nullable=True)
    yield_quintals = Column(Float, nullable=True)
    fertilizer_applied = Column(Text, nullable=True)
    irrigation_frequency = Column(String(50), nullable=True)
    observations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmland = relationship("Farmland", back_populates="rotation_history")

class CropRotationPlan(Base):
    __tablename__ = "crop_rotation_plans"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_name = Column(String(255), nullable=False)
    plan_type = Column(String(50), nullable=False) # water_saver, soil_builder, risk_minimizer, profit_optimizer, balanced
    rotation_sequence = Column(JSON, nullable=False) # list of crops with season & duration
    overall_suitability_score = Column(Float, nullable=False)
    climate_score = Column(Float, nullable=False)
    water_score = Column(Float, nullable=False)
    soil_score = Column(Float, nullable=False)
    soil_health_benefit = Column(Text, nullable=False)
    water_requirement_desc = Column(String(100), nullable=False)
    environmental_risk = Column(String(50), nullable=False)
    explanation_en = Column(Text, nullable=False)
    explanation_ta = Column(Text, nullable=False)
    supporting_nasa_indicators = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmland = relationship("Farmland", back_populates="rotation_plans")

class ScenarioSimulation(Base):
    __tablename__ = "scenario_simulations"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False, index=True)
    simulation_name = Column(String(255), nullable=False)
    rainfall_change_pct = Column(Float, default=0.0)
    temp_change_c = Column(Float, default=0.0)
    irrigation_constraint = Column(String(50), default="normal")
    baseline_observations = Column(JSON, nullable=False)
    simulated_impact = Column(JSON, nullable=False)
    recommended_adaptations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmland = relationship("Farmland", back_populates="simulations")

class SoilHealthRecord(Base):
    __tablename__ = "soil_health_records"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False, index=True)
    test_date = Column(Date, nullable=False)
    soil_type = Column(String(50), nullable=True)
    soil_ph = Column(Float, nullable=True)
    organic_carbon_pct = Column(Float, nullable=True)
    available_nitrogen_kg_ha = Column(Float, nullable=True)
    available_phosphorus_kg_ha = Column(Float, nullable=True)
    available_potassium_kg_ha = Column(Float, nullable=True)
    tested_by = Column(String(100), default="Farmer Soil Card / Lab")
    indicative_n_balance_kg_ha = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmland = relationship("Farmland", back_populates="soil_records")

class FarmingActivity(Base):
    __tablename__ = "farming_activities"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type = Column(String(50), nullable=False) # land_prep, sowing, irrigation, fertilization, pest_scouting, weeding, harvest
    crop_name = Column(String(100), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    scheduled_date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    completion_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmland = relationship("Farmland", back_populates="activities")

class FarmExpense(Base):
    __tablename__ = "farm_expenses"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False, index=True)
    season = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False) # seeds, fertilizer, labor, irrigation, machinery, transport, other
    amount_inr = Column(Float, nullable=False)
    expense_date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmland = relationship("Farmland", back_populates="expenses")

class HarvestRecord(Base):
    __tablename__ = "harvest_records"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False, index=True)
    season = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    crop_name = Column(String(100), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    selling_price_per_quintal = Column(Float, nullable=False)
    total_revenue_inr = Column(Float, nullable=False)
    harvest_date = Column(Date, nullable=False)
    buyer_type = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmland = relationship("Farmland", back_populates="harvests")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    user_id = Column(String(50), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="SET NULL"), nullable=True)
    title_en = Column(String(255), nullable=False)
    title_ta = Column(String(255), nullable=False)
    message_en = Column(Text, nullable=False)
    message_ta = Column(Text, nullable=False)
    category = Column(String(50), nullable=False) # rainfall_anomaly, soil_dryness, temperature_stress, vegetation_decline, calendar_task, system
    severity = Column(String(20), default="info") # info, warning, critical
    data_source_id = Column(String(50), ForeignKey("nasa_data_sources.id"), nullable=True)
    observation_date = Column(Date, nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("Profile", back_populates="notifications")

class FarmPlot(Base):
    __tablename__ = "farm_plots"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False, index=True)
    plot_name = Column(String(100), nullable=False)
    area_acres = Column(Float, nullable=False)
    current_crop = Column(String(100), nullable=True)
    sowing_date = Column(Date, nullable=True)
    soil_type = Column(String(50), nullable=True)
    irrigation_method = Column(String(50), default="drip") # drip, sprinkler, flood, rainfed
    boundary_geojson = Column(JSON, nullable=True)
    status = Column(String(50), default="active") # active, fallow, harvested
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmland = relationship("Farmland", back_populates="plots")

class SavedSimulation(Base):
    __tablename__ = "saved_simulations"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    user_id = Column(String(50), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    farmland_id = Column(String(50), ForeignKey("farmlands.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    simulation_type = Column(String(50), nullable=False) # climate_change, smart_irrigation, crop_rotation, flood_drought, crop_stress, full_season
    input_parameters = Column(JSON, nullable=False)
    baseline_data = Column(JSON, nullable=False)
    calculated_results = Column(JSON, nullable=False)
    educational_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("Profile", back_populates="saved_simulations")
    farmland = relationship("Farmland", back_populates="saved_simulations")

