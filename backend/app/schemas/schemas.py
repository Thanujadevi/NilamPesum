from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime

# Profile Schemas
class ProfileBase(BaseModel):
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str = "farmer"
    preferred_language: str = "ta"
    village: Optional[str] = None
    taluk: Optional[str] = None
    district: Optional[str] = None
    state: str = "Tamil Nadu"

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

# Farmland Schemas
class FarmlandBase(BaseModel):
    name: str
    survey_number: Optional[str] = None
    state: str = "Tamil Nadu"
    district: str
    taluk: Optional[str] = None
    village: str
    latitude: float
    longitude: float
    area_acres: float
    area_hectares: float
    irrigation_type: str = "borewell"
    soil_type: str = "alluvial"
    water_availability: str = "medium"
    boundary_geojson: Optional[Dict[str, Any]] = None
    current_crop: Optional[str] = None
    farming_goal: str = "balanced"

class FarmlandCreate(FarmlandBase):
    user_id: Optional[str] = None

class FarmlandUpdate(BaseModel):
    name: Optional[str] = None
    irrigation_type: Optional[str] = None
    soil_type: Optional[str] = None
    water_availability: Optional[str] = None
    current_crop: Optional[str] = None
    farming_goal: Optional[str] = None
    boundary_geojson: Optional[Dict[str, Any]] = None

class FarmlandResponse(FarmlandBase):
    id: str
    user_id: str
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# NASA Observation Schemas
class ObservationResponse(BaseModel):
    id: str
    observation_date: date
    source_id: str
    temperature_avg_c: Optional[float] = None
    temperature_max_c: Optional[float] = None
    temperature_min_c: Optional[float] = None
    precipitation_mm: Optional[float] = None
    relative_humidity_pct: Optional[float] = None
    solar_radiation_mj_m2: Optional[float] = None
    soil_moisture_surface: Optional[float] = None
    soil_moisture_rootzone: Optional[float] = None
    ndvi: Optional[float] = None
    evi: Optional[float] = None
    cloud_mask_pct: Optional[float] = None
    provenance_metadata: Optional[Dict[str, Any]] = None
    class Config:
        from_attributes = True

class WeatherAnalyticsResponse(BaseModel):
    farmland_id: str
    district: str
    latest_observation_date: Optional[date] = None
    current_temp_avg: Optional[float] = None
    current_temp_max: Optional[float] = None
    current_temp_min: Optional[float] = None
    current_humidity: Optional[float] = None
    current_solar_radiation: Optional[float] = None
    total_rainfall_last_30_days: float = 0.0
    total_rainfall_last_90_days: float = 0.0
    rainfall_anomaly_status: str # normal, deficit, excess
    daily_records: List[Dict[str, Any]] = []
    monthly_rainfall_records: List[Dict[str, Any]] = []
    data_provenance: Dict[str, Any]

class SoilMoistureAnalyticsResponse(BaseModel):
    farmland_id: str
    latest_observation_date: Optional[date] = None
    surface_moisture_volumetric: Optional[float] = None # cm3/cm3
    surface_moisture_percentage: Optional[float] = None # %
    rootzone_moisture_volumetric: Optional[float] = None
    moisture_status: str # Optimal, Adequate, Moderate Stress, Severe Deficit
    dryness_index: float # 0 to 100
    timeseries: List[Dict[str, Any]] = []
    data_provenance: Dict[str, Any]

class VegetationAnalyticsResponse(BaseModel):
    farmland_id: str
    latest_observation_date: Optional[date] = None
    current_ndvi: Optional[float] = None
    current_evi: Optional[float] = None
    vegetation_health_status: str # Vigorous, Healthy, Moderate, Sparse / Stress, Fallow
    ndvi_anomaly_vs_historical: Optional[float] = None
    cloud_masked_observations: int = 0
    valid_observations: int = 0
    timeseries: List[Dict[str, Any]] = []
    data_provenance: Dict[str, Any]

class FarmHealthScoreResponse(BaseModel):
    farmland_id: str
    overall_health_score: float # 0 - 100
    health_status: str # Excellent, Good, Fair, Attention Required
    indicator_scores: Dict[str, float] # rainfall, temperature, soil_moisture, vegetation
    weights_applied: Dict[str, float]
    data_sufficiency_pct: float
    historical_benchmark_comparison: str
    explanation_en: str
    explanation_ta: str
    data_provenance: Dict[str, Any]

# Recommendation Schemas
class RecommendationRequest(BaseModel):
    farmland_id: str
    target_season: Optional[str] = "Next Season"
    prioritize_goal: Optional[str] = None # save_water, improve_soil, reduce_risk, maximize_profit

class CropRotationPlanResponse(BaseModel):
    id: str
    farmland_id: str
    plan_name: str
    plan_type: str
    rotation_sequence: List[Dict[str, Any]]
    overall_suitability_score: float
    climate_score: float
    water_score: float
    soil_score: float
    soil_health_benefit: str
    water_requirement_desc: str
    environmental_risk: str
    explanation_en: str
    explanation_ta: str
    supporting_nasa_indicators: Optional[Dict[str, Any]] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Scenario Simulation Schemas
class SimulationRequest(BaseModel):
    farmland_id: str
    simulation_name: str = "Custom Drought & Climate Scenario"
    rainfall_change_pct: float = Field(-20.0, description="Percentage change in rainfall, e.g. -20% for drought")
    temp_change_c: float = Field(1.5, description="Temperature change in Celsius, e.g. +1.5C")
    irrigation_constraint: str = Field("restricted", description="normal, restricted, critical")

class SimulationResponse(BaseModel):
    id: str
    farmland_id: str
    simulation_name: str
    rainfall_change_pct: float
    temp_change_c: float
    irrigation_constraint: str
    baseline_observations: Dict[str, Any]
    simulated_impact: Dict[str, Any]
    recommended_adaptations: List[Dict[str, Any]]
    disclaimer: str
    created_at: datetime
    class Config:
        from_attributes = True

# Soil Health & Nitrogen Tracking
class SoilHealthCreate(BaseModel):
    farmland_id: str
    test_date: date
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    organic_carbon_pct: Optional[float] = None
    available_nitrogen_kg_ha: Optional[float] = None
    available_phosphorus_kg_ha: Optional[float] = None
    available_potassium_kg_ha: Optional[float] = None
    notes: Optional[str] = None

class SoilHealthResponse(BaseModel):
    id: str
    farmland_id: str
    test_date: date
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    organic_carbon_pct: Optional[float] = None
    available_nitrogen_kg_ha: Optional[float] = None
    available_phosphorus_kg_ha: Optional[float] = None
    available_potassium_kg_ha: Optional[float] = None
    indicative_n_balance_kg_ha: Optional[float] = None
    npk_status_desc: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Farming Calendar Activities
class FarmingActivityCreate(BaseModel):
    farmland_id: str
    activity_type: str
    crop_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    scheduled_date: date

class FarmingActivityUpdate(BaseModel):
    completed: Optional[bool] = None
    completion_date: Optional[date] = None
    title: Optional[str] = None
    description: Optional[str] = None

class FarmingActivityResponse(BaseModel):
    id: str
    farmland_id: str
    activity_type: str
    crop_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    scheduled_date: date
    completed: bool
    completion_date: Optional[date] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Farm Economics (Expenses & Profit)
class FarmExpenseCreate(BaseModel):
    farmland_id: str
    season: str
    year: int
    category: str
    amount_inr: float
    expense_date: date
    description: Optional[str] = None

class FarmExpenseResponse(BaseModel):
    id: str
    farmland_id: str
    season: str
    year: int
    category: str
    amount_inr: float
    expense_date: date
    description: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class HarvestRecordCreate(BaseModel):
    farmland_id: str
    season: str
    year: int
    crop_name: str
    quantity_quintals: float
    selling_price_per_quintal: float
    harvest_date: date
    buyer_type: Optional[str] = None

class HarvestRecordResponse(BaseModel):
    id: str
    farmland_id: str
    season: str
    year: int
    crop_name: str
    quantity_quintals: float
    selling_price_per_quintal: float
    total_revenue_inr: float
    harvest_date: date
    buyer_type: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Voice Assistant Schemas
class VoiceQueryRequest(BaseModel):
    query_text: str
    farmland_id: Optional[str] = None
    language: str = "ta" # ta, en

class VoiceQueryResponse(BaseModel):
    query_text: str
    language: str
    response_text: str
    audio_transcript_tamil: Optional[str] = None
    related_indicators: Optional[Dict[str, Any]] = None
    recommended_action: Optional[str] = None
    confidence_level: str = "High"

# Notification Schemas
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    farmland_id: Optional[str] = None
    title_en: str
    title_ta: str
    message_en: str
    message_ta: str
    category: str
    severity: str
    data_source_id: Optional[str] = None
    observation_date: Optional[date] = None
    read: bool
    created_at: datetime
    class Config:
        from_attributes = True

