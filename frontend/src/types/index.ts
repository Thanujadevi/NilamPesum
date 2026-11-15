export interface Farmland {
  id: string;
  user_id: string;
  name: string;
  survey_number?: string;
  state: string;
  district: string;
  taluk?: string;
  village: string;
  latitude: number;
  longitude: number;
  area_acres: number;
  area_hectares: number;
  irrigation_type: 'canal' | 'borewell' | 'open_well' | 'rainfed' | 'drip' | 'sprinkler';
  soil_type: 'alluvial' | 'red_loam' | 'black_cotton' | 'clay_loam' | 'sandy_loam' | 'saline';
  water_availability: 'high' | 'medium' | 'scarce' | 'seasonal';
  boundary_geojson?: any;
  current_crop?: string;
  farming_goal: 'save_water' | 'improve_soil' | 'reduce_risk' | 'maximize_profit' | 'balanced';
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmlandZone {
  id: string;
  farmland_id: string;
  zone_name: string;
  zone_area_acres?: number;
  relative_elevation?: string;
  soil_variation?: string;
}

export interface NasaDataSource {
  id: string;
  name: string;
  agency: string;
  center?: string;
  official_url: string;
  data_type: string;
  spatial_resolution: string;
  temporal_resolution: string;
  historical_coverage: string;
  auth_required: boolean;
  description: string;
}

export interface NasaIntegrationStatus {
  source_id: string;
  product_name: string;
  agency: string;
  center?: string;
  official_url: string;
  data_type: string;
  spatial_resolution: string;
  temporal_resolution: string;
  auth_required: boolean;
  status: string;
  status_description: string;
  last_retrieval?: string;
  last_status_code?: number;
  records_stored: number;
}

export interface DailyObservation {
  date: string;
  full_date: string;
  temp_avg?: number;
  temp_max?: number;
  temp_min?: number;
  rainfall_mm: number;
  humidity_pct?: number;
  solar_radiation?: number;
}

export interface WeatherAnalytics {
  farmland_id: string;
  district: string;
  latest_observation_date?: string;
  current_temp_avg?: number;
  current_temp_max?: number;
  current_temp_min?: number;
  current_humidity?: number;
  current_solar_radiation?: number;
  total_rainfall_last_30_days: number;
  total_rainfall_last_90_days: number;
  rainfall_anomaly_status: string;
  daily_records: DailyObservation[];
  monthly_rainfall_records: { month: string; rainfall_mm: number }[];
  data_provenance: any;
}

export interface SoilMoistureAnalytics {
  farmland_id: string;
  latest_observation_date?: string;
  surface_moisture_volumetric?: number;
  surface_moisture_percentage?: number;
  rootzone_moisture_volumetric?: number;
  rootzone_moisture_percentage?: number;
  moisture_status: string;
  dryness_index: number;
  timeseries: {
    date: string;
    full_date: string;
    surface_moisture_volumetric: number;
    surface_moisture_pct: number;
    rootzone_moisture_volumetric: number;
    rootzone_moisture_pct: number;
    dryness_threshold: number;
  }[];
  soil_context?: any;
  distinction_notice?: string;
  data_provenance: any;
}

export interface VegetationAnalytics {
  farmland_id: string;
  latest_observation_date?: string;
  current_ndvi?: number;
  current_evi?: number;
  vegetation_health_status: string;
  ndvi_anomaly_vs_historical?: number;
  cloud_masked_observations: number;
  valid_observations: number;
  timeseries: {
    date: string;
    full_date: string;
    ndvi: number;
    evi: number;
    cloud_mask_pct: number;
  }[];
  data_provenance: any;
}

export interface FarmHealthScore {
  farmland_id: string;
  overall_health_score: number;
  health_status: string;
  indicator_scores: {
    rainfall: number;
    temperature: number;
    soil_moisture: number;
    vegetation: number;
  };
  weights_applied: {
    rainfall: number;
    temperature: number;
    soil_moisture: number;
    vegetation: number;
  };
  data_sufficiency_pct: number;
  historical_benchmark_comparison: string;
  explanation_en: string;
  explanation_ta: string;
  data_provenance: any;
}

export interface RotationStep {
  step: number;
  crop_id: string;
  crop_name_en: string;
  crop_name_ta: string;
  season: string;
  duration_days: string;
  water_req_mm: string;
  nitrogen_fixing: boolean;
  suitability_score: number;
}

export interface CropRotationPlan {
  id: string;
  farmland_id: string;
  plan_name: string;
  plan_type: string;
  rotation_sequence: RotationStep[];
  overall_suitability_score: number;
  climate_score: number;
  water_score: number;
  soil_score: number;
  soil_health_benefit: string;
  water_requirement_desc: string;
  environmental_risk: string;
  explanation_en: string;
  explanation_ta: string;
  supporting_nasa_indicators?: any;
  created_at: string;
}

export interface HistoricalYearData {
  year: number;
  annual_rainfall_mm: number;
  ne_monsoon_rainfall_mm: number;
  sw_monsoon_rainfall_mm: number;
  summer_rainfall_mm: number;
  mean_temperature_c: number;
  historical_context: string;
  anomaly: string;
}

export interface HistoricalAnalysis {
  farmland_id: string;
  coordinates: { latitude: number; longitude: number };
  coverage_period: string;
  mean_annual_rainfall_mm: number;
  primary_monsoon: string;
  yearly_records: HistoricalYearData[];
  climatological_insights: string[];
  data_provenance: any;
}

export interface ScenarioSimulation {
  id: string;
  farmland_id: string;
  simulation_name: string;
  rainfall_change_pct: number;
  temp_change_c: number;
  irrigation_constraint: string;
  baseline_observations: any;
  simulated_impact: {
    simulated_temperature_c: number;
    simulated_precipitation_mm: number;
    crops_evaluation: {
      crop_id: string;
      crop_name_en: string;
      crop_name_ta: string;
      baseline_suitability_score: number;
      simulated_suitability_score: number;
      score_delta: number;
      resilience_verdict: string;
    }[];
  };
  recommended_adaptations: { measure: string; benefit: string }[];
  disclaimer: string;
  created_at: string;
}

export interface SoilHealthRecord {
  id: string;
  farmland_id: string;
  test_date: string;
  soil_type?: string;
  soil_ph?: number;
  organic_carbon_pct?: number;
  available_nitrogen_kg_ha?: number;
  available_phosphorus_kg_ha?: number;
  available_potassium_kg_ha?: number;
  indicative_n_balance_kg_ha?: number;
  npk_status_desc?: string;
  notes?: string;
}

export interface FarmingActivity {
  id: string;
  farmland_id: string;
  activity_type: string;
  crop_name?: string;
  title: string;
  description?: string;
  scheduled_date: string;
  completed: boolean;
  completion_date?: string;
}

export interface FarmExpense {
  id: string;
  farmland_id: string;
  season: string;
  year: number;
  category: string;
  amount_inr: number;
  expense_date: string;
  description?: string;
}

export interface HarvestRecord {
  id: string;
  farmland_id: string;
  season: string;
  year: number;
  crop_name: string;
  quantity_quintals: number;
  selling_price_per_quintal: number;
  total_revenue_inr: number;
  harvest_date: string;
  buyer_type?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  farmland_id?: string;
  title_en: string;
  title_ta: string;
  message_en: string;
  message_ta: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  data_source_id?: string;
  observation_date?: string;
  read: boolean;
  created_at: string;
}
