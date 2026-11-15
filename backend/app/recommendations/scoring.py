import logging
from typing import Dict, Any, Tuple
from app.models.models import Farmland, EnvironmentalObservation

logger = logging.getLogger("nilam_pesum.recommendations.scoring")

def calculate_crop_suitability(
    crop: Dict[str, Any],
    farmland: Farmland,
    latest_obs: EnvironmentalObservation,
    prioritize_goal: str = "balanced"
) -> Tuple[float, float, float, float, Dict[str, Any]]:
    """
    Computes transparent multi-factor suitability scores (0-100).
    Returns:
      overall_score, climate_score, water_score, soil_score, details_dict
    """
    # 1. Climate Suitability (Temperature & Solar Radiation)
    obs_temp = latest_obs.temperature_avg_c if (latest_obs and latest_obs.temperature_avg_c is not None) else 28.0
    temp_min_opt = crop["temp_optimal_c_min"]
    temp_max_opt = crop["temp_optimal_c_max"]

    if temp_min_opt <= obs_temp <= temp_max_opt:
        climate_score = 95.0
    elif obs_temp < temp_min_opt:
        diff = temp_min_opt - obs_temp
        climate_score = max(40.0, 95.0 - (diff * 8.0))
    else:
        diff = obs_temp - temp_max_opt
        climate_score = max(35.0, 95.0 - (diff * 10.0))

    # 2. Water Availability & Rainfall Suitability
    # Combine farm irrigation infrastructure with recent rainfall
    irrigation_multipliers = {
        "canal": 1.0,
        "borewell": 0.85,
        "open_well": 0.70,
        "drip": 0.90,
        "sprinkler": 0.80,
        "rainfed": 0.35
    }
    irr_factor = irrigation_multipliers.get(farmland.irrigation_type, 0.75)
    
    water_req_mid = (crop["water_req_mm_min"] + crop["water_req_mm_max"]) / 2.0

    if farmland.irrigation_type == "rainfed":
        if water_req_mid <= 350:
            water_score = 92.0 # Millets / pulses thrive in rainfed
        elif water_req_mid <= 600:
            water_score = 65.0
        else:
            water_score = 25.0 # High water crops unviable in rainfed
    else:
        # Irrigated
        if farmland.water_availability == "scarce":
            if water_req_mid <= 400:
                water_score = 90.0
            elif water_req_mid <= 700:
                water_score = 60.0
            else:
                water_score = 35.0
        elif farmland.water_availability == "high":
            water_score = 94.0 if water_req_mid > 500 else 85.0
        else:
            water_score = 88.0

    # 3. Soil Suitability
    farm_soil = farmland.soil_type
    preferred_soils = crop["soil_preference"]
    
    if farm_soil in preferred_soils:
        soil_score = 94.0
    elif any(s in farm_soil for s in ["loam", "alluvial"]):
        soil_score = 82.0
    else:
        soil_score = 65.0

    # 4. Rotation Compatibility
    prev_crop = (farmland.current_crop or "").lower()
    compat_score = 80.0
    if prev_crop:
        compat_list = [c.lower() for c in crop.get("compatible_preceding_crops", [])]
        incompat_list = [c.lower() for c in crop.get("incompatible_preceding_crops", [])]
        
        if any(c in prev_crop for c in compat_list):
            compat_score = 98.0
        elif any(c in prev_crop for c in incompat_list):
            compat_score = 45.0

    # 5. Goal Alignment Weighting
    goal = prioritize_goal or farmland.farming_goal or "balanced"
    if goal == "save_water":
        weights = {"climate": 0.20, "water": 0.45, "soil": 0.15, "compat": 0.20}
    elif goal == "improve_soil":
        # Bonus for nitrogen fixers
        if crop["nitrogen_fixing"]:
            soil_score = min(100.0, soil_score + 10.0)
        weights = {"climate": 0.20, "water": 0.20, "soil": 0.35, "compat": 0.25}
    elif goal == "reduce_risk":
        weights = {"climate": 0.30, "water": 0.35, "soil": 0.15, "compat": 0.20}
    else: # balanced / maximize_profit
        weights = {"climate": 0.25, "water": 0.30, "soil": 0.25, "compat": 0.20}

    overall_score = (
        (climate_score * weights["climate"]) +
        (water_score * weights["water"]) +
        (soil_score * weights["soil"]) +
        (compat_score * weights["compat"])
    )

    details = {
        "climate_score": round(climate_score, 1),
        "water_score": round(water_score, 1),
        "soil_score": round(soil_score, 1),
        "compatibility_score": round(compat_score, 1),
        "applied_weights": weights,
        "limiting_factor": "Water Availability" if water_score < 60 else ("Soil Matching" if soil_score < 70 else "None")
    }

    return round(overall_score, 1), round(climate_score, 1), round(water_score, 1), round(soil_score, 1), details

