# NILAM PESUM - Database Data Dictionary

| Table Name | Primary Key | Key Fields | Purpose |
|---|---|---|---|
| `profiles` | `id` (UUID/Str) | `email`, `full_name`, `role`, `preferred_language`, `district`, `village` | User accounts and farmer profiles with bilingual preferences |
| `farmlands` | `id` (UUID/Str) | `user_id`, `name`, `district`, `village`, `latitude`, `longitude`, `area_acres`, `area_hectares`, `soil_type`, `irrigation_type`, `boundary_geojson` | Farmlands with GPS coordinates and boundary polygons |
| `farmland_zones` | `id` (UUID/Str) | `farmland_id`, `zone_name`, `zone_area_acres`, `soil_variation`, `relative_elevation` | Micro-zones within farmlands for spatial heterogeneity |
| `nasa_data_sources` | `id` (Str) | `name`, `agency`, `center`, `official_url`, `spatial_resolution`, `temporal_resolution`, `auth_required` | Provenance catalog of official NASA products |
| `nasa_api_logs` | `id` (UUID/Str) | `source_id`, `farmland_id`, `endpoint_called`, `status_code`, `response_time_ms`, `records_retrieved` | Audit logs of all NASA API requests and retrievals |
| `environmental_observations` | `id` (UUID/Str) | `farmland_id`, `observation_date`, `temperature_avg_c`, `precipitation_mm`, `soil_moisture_surface`, `ndvi`, `evi` | Category 1 authentic NASA observations |
| `crop_knowledge_base` | `id` (Str) | `crop_name_en`, `crop_name_ta`, `suitable_seasons`, `water_req_mm_min`, `water_req_mm_max`, `temp_optimal_c_min`, `soil_preference`, `nitrogen_fixing` | TNAU / ICAR grounded agronomic reference repository |
| `crop_rotation_plans` | `id` (UUID/Str) | `farmland_id`, `plan_name`, `plan_type`, `rotation_sequence`, `overall_suitability_score`, `soil_health_benefit` | Category 3 explainable crop rotation alternatives |
| `scenario_simulations` | `id` (UUID/Str) | `farmland_id`, `simulation_name`, `rainfall_change_pct`, `temp_change_c`, `baseline_observations`, `simulated_impact` | Category 4 hypothetical what-if scenario simulations |
| `soil_health_records` | `id` (UUID/Str) | `farmland_id`, `test_date`, `soil_ph`, `organic_carbon_pct`, `available_nitrogen_kg_ha`, `indicative_n_balance_kg_ha` | Farmer soil health card records and Nitrogen tracking |
| `farming_activities` | `id` (UUID/Str) | `farmland_id`, `activity_type`, `title`, `scheduled_date`, `completed` | Farm management calendar and task reminders |
| `farm_expenses` | `id` (UUID/Str) | `farmland_id`, `season`, `category`, `amount_inr`, `expense_date` | Input expenses (seeds, fertilizer, labor, machinery) |
| `harvest_records` | `id` (UUID/Str) | `farmland_id`, `crop_name`, `quantity_quintals`, `selling_price_per_quintal`, `total_revenue_inr` | Actual crop harvest sales and revenue |
| `notifications` | `id` (UUID/Str) | `user_id`, `title_en`, `title_ta`, `message_ta`, `category`, `severity`, `read` | Environmental risk notifications and calendar alerts |

