import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Farmland, ScenarioSimulation, EnvironmentalObservation
from app.recommendations.knowledge_base import TNAU_CROPS_CATALOG

logger = logging.getLogger("nilam_pesum.analytics.simulation")

def run_climate_simulation(
    db: Session,
    farmland: Farmland,
    simulation_name: str,
    rainfall_change_pct: float,
    temp_change_c: float,
    irrigation_constraint: str
) -> Dict[str, Any]:
    """
    Evaluates what-if agricultural resilience under simulated climate scenarios.
    Category 4: Simulated Scenarios.
    Explicitly marked as hypothetical agronomic simulations, not NASA forecasts.
    """
    latest_obs = db.query(EnvironmentalObservation).filter(
        EnvironmentalObservation.farmland_id == farmland.id
    ).order_by(EnvironmentalObservation.observation_date.desc()).first()

    base_temp = latest_obs.temperature_avg_c if (latest_obs and latest_obs.temperature_avg_c) else 28.5
    base_precip = latest_obs.precipitation_mm if (latest_obs and latest_obs.precipitation_mm) else 15.0

    sim_temp = round(base_temp + temp_change_c, 1)
    sim_precip = round(max(0.0, base_precip * (1.0 + (rainfall_change_pct / 100.0))), 1)

    # Evaluate impact on major Tamil Nadu crops
    impact_results = []
    for crop in TNAU_CROPS_CATALOG[:6]:
        crop_name = crop["crop_name_en"]
        water_req = (crop["water_req_mm_min"] + crop["water_req_mm_max"]) / 2.0
        drought_tol = crop["drought_tolerance"]

        # Base vs simulated score
        base_score = 85.0
        if water_req > 1000 and farmland.irrigation_type == "rainfed":
            base_score = 30.0

        score_penalty = 0.0
        # Rainfall reduction penalty
        if rainfall_change_pct < 0:
            deficit_severity = abs(rainfall_change_pct)
            if drought_tol == "very_high":
                score_penalty += deficit_severity * 0.15 # Highly resilient
            elif drought_tol == "high":
                score_penalty += deficit_severity * 0.30
            elif drought_tol == "medium":
                score_penalty += deficit_severity * 0.55
            else: # low
                score_penalty += deficit_severity * 1.10

        # Temperature increase penalty
        if temp_change_c > 0:
            if sim_temp > crop["temp_optimal_c_max"]:
                overheat = sim_temp - crop["temp_optimal_c_max"]
                score_penalty += overheat * 8.0

        # Irrigation constraint penalty
        if irrigation_constraint == "critical":
            if water_req > 600:
                score_penalty += 35.0
            elif water_req > 350:
                score_penalty += 15.0

        sim_score = max(10.0, min(98.0, round(base_score - score_penalty, 1)))

        impact_results.append({
            "crop_id": crop["id"],
            "crop_name_en": crop["crop_name_en"],
            "crop_name_ta": crop["crop_name_ta"],
            "baseline_suitability_score": base_score,
            "simulated_suitability_score": sim_score,
            "score_delta": round(sim_score - base_score, 1),
            "resilience_verdict": "Thrives under stress" if sim_score >= 75 else ("Requires management" if sim_score >= 50 else "High failure risk")
        })

    # Recommended adaptation strategies
    adaptations = [
        {"measure": "Mulching & Residue Retention", "benefit": "Preserves 20-30% of soil moisture from evaporative loss under higher temperatures."},
        {"measure": "Drip Micro-Irrigation Transition", "benefit": "Cuts water consumption by 45% compared to surface flooding, maintaining crop viability."},
        {"measure": "Millet & Pulse Substitution", "benefit": "Replaces high water cereals with pearl millet / black gram to escape terminal drought."}
    ]

    # Save to database
    sim_record = ScenarioSimulation(
        farmland_id=farmland.id,
        simulation_name=simulation_name,
        rainfall_change_pct=rainfall_change_pct,
        temp_change_c=temp_change_c,
        irrigation_constraint=irrigation_constraint,
        baseline_observations={"temperature_avg_c": base_temp, "precipitation_mm": base_precip},
        simulated_impact={"simulated_temperature_c": sim_temp, "simulated_precipitation_mm": sim_precip, "crops_evaluation": impact_results},
        recommended_adaptations=adaptations
    )
    db.add(sim_record)
    db.commit()

    return {
        "id": sim_record.id,
        "farmland_id": farmland.id,
        "simulation_name": simulation_name,
        "rainfall_change_pct": rainfall_change_pct,
        "temp_change_c": temp_change_c,
        "irrigation_constraint": irrigation_constraint,
        "baseline_observations": {"temperature_avg_c": base_temp, "precipitation_mm": base_precip},
        "simulated_impact": {
            "simulated_temperature_c": sim_temp,
            "simulated_precipitation_mm": sim_precip,
            "crops_evaluation": impact_results
        },
        "recommended_adaptations": adaptations,
        "disclaimer": "DISCLAIMER: This analysis represents a hypothetical 'what-if' agroclimatic stress simulation. It is not an official NASA meteorological forecast or harvest guarantee.",
        "created_at": sim_record.created_at
    }

