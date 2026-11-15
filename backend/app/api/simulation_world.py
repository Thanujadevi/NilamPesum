import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Farmland, SavedSimulation, Profile
from app.nasa.nasa_power_service import nasa_power_service

logger = logging.getLogger("nilam_pesum.simulation_world")
router = APIRouter(prefix="/simulations/world", tags=["Interactive Visual Farm Simulation World"])

# --- Request Models ---
class ClimateSimulationRequest(BaseModel):
    farmland_id: str
    temp_delta_c: float = 2.0        # -2.0 to +6.0 °C
    rain_delta_pct: float = -15.0    # -50% to +50%
    dry_spell_days: int = 14         # 0 to 45 days
    rain_intensity: str = "moderate" # light, moderate, heavy, extreme

class IrrigationSimulationRequest(BaseModel):
    farmland_id: str
    method: str = "drip"             # flood, drip, sprinkler, scheduled
    soil_type: str = "alluvial"      # alluvial, red_loam, black_cotton, sandy_loam
    crop_type: str = "Paddy"
    irrigation_interval_days: int = 3
    application_depth_mm: float = 25.0

class RotationSimulationRequest(BaseModel):
    farmland_id: str
    crop_sequence: List[str]         # e.g. ["Paddy (நெல்)", "Black Gram (உளுந்து)", "Sesame (எள்)"]
    soil_initial_oc: float = 0.55    # Organic carbon %

class ExtremeWeatherRequest(BaseModel):
    farmland_id: str
    event_type: str = "flood"        # flood or drought
    severity: str = "high"           # moderate, high, catastrophic
    interventions: List[str] = []    # e.g. ["raised_beds", "drainage_trenches", "mulching", "drip_relief"]

class CropStressRequest(BaseModel):
    crops: List[str] = ["Paddy (நெல்)", "Finger Millet / Ragi (கேழ்வரகு)", "Groundnut (நிலக்கடலை)", "Cotton (பருத்தி)"]
    stress_type: str = "drought"     # drought, heatwave, waterlogging, salinity
    stress_duration_days: int = 21

class SaveScenarioRequest(BaseModel):
    farmland_id: str
    title: str
    simulation_type: str             # climate_change, smart_irrigation, crop_rotation, flood_drought, crop_stress, full_season
    input_parameters: Dict[str, Any]
    baseline_data: Dict[str, Any]
    calculated_results: Dict[str, Any]
    educational_notes: Optional[str] = None
    user_id: Optional[str] = None

class CompareScenariosRequest(BaseModel):
    scenario_ids: List[str]

# --- 1. Climate Change Simulator Calculation ---
@router.post("/run/climate-change")
def run_climate_change_simulation(req: ClimateSimulationRequest, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == req.farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    # Baseline climatology for the location
    baseline_temp = 29.8
    baseline_rain_seasonal = 480.0
    baseline_et0 = 4.8

    sim_temp = baseline_temp + req.temp_delta_c
    sim_rain = max(0.0, baseline_rain_seasonal * (1.0 + req.rain_delta_pct / 100.0))
    et0_increase_pct = req.temp_delta_c * 4.2
    sim_et0 = baseline_et0 * (1.0 + et0_increase_pct / 100.0)

    # Soil moisture depletion factor
    soil_depletion_pct = min(85.0, max(5.0, (req.dry_spell_days * 2.2) + (req.temp_delta_c * 3.5) - (req.rain_delta_pct * 0.4)))
    available_soil_water_pct = max(10.0, 100.0 - soil_depletion_pct)

    # Yield impact calculation based on TNAU agronomic response curves
    temp_penalty = max(0.0, (sim_temp - 32.0) * 4.5) if sim_temp > 32.0 else 0.0
    water_penalty = max(0.0, (400.0 - sim_rain) * 0.08) if sim_rain < 400.0 else 0.0
    dry_spell_penalty = max(0.0, (req.dry_spell_days - 7) * 1.5)

    total_yield_impact_pct = -min(75.0, round(temp_penalty + water_penalty + dry_spell_penalty, 1))

    # Risk level classification
    if total_yield_impact_pct > -10.0:
        risk_level = "Low Risk (குறைந்த ஆபத்து)"
        risk_color = "emerald"
    elif total_yield_impact_pct > -25.0:
        risk_level = "Moderate Risk (மிதமான ஆபத்து)"
        risk_color = "amber"
    else:
        risk_level = "High / Severe Risk (அதிக ஆபத்து)"
        risk_color = "rose"

    # Actionable scientific adaptations
    adaptations = [
        {
            "practice_en": "Shift Sowing Window by 10-14 days to escape peak summer flowering heat",
            "practice_ta": "பூக்கும் தருணத்தில் அதிக வெப்பத்தைத் தவிர்க்க விதைப்பு தேதியை 10-14 நாட்கள் முன்னதாக மாற்றவும்",
            "impact_mitigation": "12-18% Yield Recovery"
        },
        {
            "practice_en": "Adopt Sub-surface Drip Irrigation with Mulching to reduce evaporation",
            "practice_ta": "ஆவியாதலைத் தடுக்க நிலப்போர்வை (Mulch) மற்றும் சொட்டுநீர்ப் பாசனத்தை அமைத்தல்",
            "impact_mitigation": "35-45% Water Conservation"
        },
        {
            "practice_en": "Incorporate Farmyard Manure & Humic Acid to enhance soil water retention capacity",
            "practice_ta": "மண்ணின் ஈரப்பதம் பிடிப்புத்திறனை அதிகரிக்க மட்கிய தொழுவுரம் மற்றும் மண்புழு உரம் இடுதல்",
            "impact_mitigation": "20% Moisture Buffer"
        }
    ]

    return {
        "simulation_type": "climate_change",
        "farmland_name": farmland.name,
        "district": farmland.district,
        "baseline": {
            "mean_temp_c": baseline_temp,
            "seasonal_rainfall_mm": baseline_rain_seasonal,
            "reference_et0_mm_day": baseline_et0,
            "soil_moisture_status": "Adequate (போதுமானது)"
        },
        "simulated": {
            "projected_temp_c": round(sim_temp, 1),
            "projected_rainfall_mm": round(sim_rain, 1),
            "projected_et0_mm_day": round(sim_et0, 2),
            "soil_moisture_remaining_pct": round(available_soil_water_pct, 1),
            "yield_impact_pct": total_yield_impact_pct,
            "risk_level": risk_level,
            "risk_color": risk_color,
            "evapotranspiration_change_pct": round(et0_increase_pct, 1)
        },
        "timeline_stages": [
            {"day": 1, "soil_moisture_pct": 95, "crop_status": "Vigorous Vegetative Growth (செழிப்பான வளர்ச்சி)", "leaf_color": "#22c55e"},
            {"day": 10, "soil_moisture_pct": round(max(30, 95 - (req.dry_spell_days * 1.5)), 1), "crop_status": "Transpiration Stress (ஆவியாதல் சுமை)", "leaf_color": "#84cc16"},
            {"day": 20, "soil_moisture_pct": round(max(20, 95 - (req.dry_spell_days * 2.5)), 1), "crop_status": "Mild Wilting / Curled Leaves (இலைச் சுருக்கம்)", "leaf_color": "#eab308"},
            {"day": 30, "soil_moisture_pct": round(available_soil_water_pct, 1), "crop_status": "Chlorosis & Terminal Stress (கடுமையான வறட்சி சுமை)", "leaf_color": "#f97316"}
        ],
        "recommended_adaptations": adaptations
    }

# --- 2. Smart Irrigation Simulator Calculation ---
@router.post("/run/smart-irrigation")
def run_irrigation_simulation(req: IrrigationSimulationRequest, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == req.farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    area_ha = farmland.area_hectares or 1.4

    # Method benchmarks
    method_data = {
        "flood": {"efficiency": 42.0, "evap_loss_pct": 32.0, "percolation_loss_pct": 26.0, "power_kwh_per_ha": 380},
        "sprinkler": {"efficiency": 72.0, "evap_loss_pct": 18.0, "percolation_loss_pct": 10.0, "power_kwh_per_ha": 260},
        "drip": {"efficiency": 91.0, "evap_loss_pct": 5.0, "percolation_loss_pct": 4.0, "power_kwh_per_ha": 140},
        "scheduled": {"efficiency": 86.0, "evap_loss_pct": 8.0, "percolation_loss_pct": 6.0, "power_kwh_per_ha": 170}
    }
    spec = method_data.get(req.method, method_data["drip"])

    # Water calculations
    gross_water_mm = req.application_depth_mm * (100.0 / spec["efficiency"])
    gross_volume_m3 = round(gross_water_mm * 10.0 * area_ha, 1)
    effective_water_m3 = round(req.application_depth_mm * 10.0 * area_ha, 1)
    wasted_water_m3 = round(gross_volume_m3 - effective_water_m3, 1)

    # Comparison against traditional flood
    flood_spec = method_data["flood"]
    flood_gross_m3 = round(req.application_depth_mm * (100.0 / flood_spec["efficiency"]) * 10.0 * area_ha, 1)
    water_saved_m3 = max(0.0, round(flood_gross_m3 - gross_volume_m3, 1))
    water_saved_pct = round((water_saved_m3 / flood_gross_m3) * 100.0, 1) if flood_gross_m3 > 0 else 0.0

    # Pumping electricity & cost savings
    kwh_saved = round((flood_spec["power_kwh_per_ha"] - spec["power_kwh_per_ha"]) * area_ha, 1)
    cost_saved_inr = round(kwh_saved * 7.5 + (water_saved_m3 * 0.4), 0)

    # Root zone wetting bulb profile (for canvas cross-section rendering)
    wetting_profile = {
        "surface_width_cm": 25 if req.method == "drip" else (120 if req.method == "sprinkler" else 300),
        "root_depth_cm": 45,
        "percolation_depth_cm": 15 if req.method == "drip" else (40 if req.method == "sprinkler" else 90),
        "soil_moisture_uniformity_pct": spec["efficiency"]
    }

    return {
        "simulation_type": "smart_irrigation",
        "method_chosen": req.method,
        "area_hectares": area_ha,
        "efficiency_pct": spec["efficiency"],
        "water_applied_gross_m3": gross_volume_m3,
        "water_effective_m3": effective_water_m3,
        "water_wasted_m3": wasted_water_m3,
        "water_saved_vs_flood_m3": water_saved_m3,
        "water_saved_pct": water_saved_pct,
        "electricity_saved_kwh": kwh_saved,
        "estimated_savings_inr": cost_saved_inr,
        "wetting_profile": wetting_profile,
        "soil_water_breakdown": {
            "effective_root_zone_pct": spec["efficiency"],
            "evaporation_loss_pct": spec["evap_loss_pct"],
            "deep_percolation_loss_pct": spec["percolation_loss_pct"]
        }
    }

# --- 3. Crop Rotation Simulator Calculation ---
@router.post("/run/crop-rotation")
def run_rotation_simulation(req: RotationSimulationRequest, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == req.farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    crop_metrics = {
        "paddy": {"n_fix": 0, "n_deplete": 85, "water_m3": 12500, "carbon_add": 0.08, "profit": 35000, "pest_break": 10},
        "maize": {"n_fix": 0, "n_deplete": 75, "water_m3": 5500, "carbon_add": 0.12, "profit": 32000, "pest_break": 25},
        "groundnut": {"n_fix": 45, "n_deplete": 20, "water_m3": 4500, "carbon_add": 0.15, "profit": 42000, "pest_break": 60},
        "cotton": {"n_fix": 0, "n_deplete": 70, "water_m3": 7000, "carbon_add": 0.06, "profit": 38000, "pest_break": 15},
        "black gram": {"n_fix": 38, "n_deplete": 10, "water_m3": 2800, "carbon_add": 0.14, "profit": 28000, "pest_break": 70},
        "green gram": {"n_fix": 35, "n_deplete": 10, "water_m3": 2600, "carbon_add": 0.13, "profit": 27000, "pest_break": 65},
        "finger millet": {"n_fix": 0, "n_deplete": 40, "water_m3": 3500, "carbon_add": 0.10, "profit": 26000, "pest_break": 50},
        "sesame": {"n_fix": 0, "n_deplete": 30, "water_m3": 2200, "carbon_add": 0.09, "profit": 31000, "pest_break": 55}
    }

    cumulative_n = 0.0
    cumulative_water = 0.0
    cumulative_carbon = req.soil_initial_oc
    total_profit = 0.0
    season_steps = []

    for idx, crop_raw in enumerate(req.crop_sequence):
        # Match crop key
        crop_clean = crop_raw.lower()
        matched_key = "paddy"
        for k in crop_metrics.keys():
            if k in crop_clean:
                matched_key = k
                break

        data = crop_metrics[matched_key]
        n_delta = data["n_fix"] - data["n_deplete"]
        cumulative_n += n_delta
        cumulative_water += data["water_m3"]
        cumulative_carbon += data["carbon_add"]
        total_profit += data["profit"]

        season_steps.append({
            "season_index": idx + 1,
            "crop": crop_raw,
            "nitrogen_balance_kg_ha": round(cumulative_n, 1),
            "water_footprint_m3_ha": round(data["water_m3"], 1),
            "soil_organic_carbon_pct": round(cumulative_carbon, 3),
            "estimated_profit_inr": data["profit"],
            "pest_cycle_break_rating": data["pest_break"]
        })

    has_legume = any("gram" in c.lower() or "groundnut" in c.lower() for c in req.crop_sequence)
    sustainability_score = min(98, max(40, int(60 + (30 if has_legume else -10) + (10 if len(req.crop_sequence) >= 3 else 0))))

    return {
        "simulation_type": "crop_rotation",
        "total_seasons": len(req.crop_sequence),
        "crops": req.crop_sequence,
        "net_nitrogen_balance_kg_ha": round(cumulative_n, 1),
        "final_organic_carbon_pct": round(cumulative_carbon, 2),
        "carbon_increase_pct": round(((cumulative_carbon - req.soil_initial_oc) / req.soil_initial_oc) * 100.0, 1),
        "total_water_consumption_m3": round(cumulative_water, 0),
        "total_profit_inr_ha": round(total_profit, 0),
        "sustainability_score": sustainability_score,
        "season_steps": season_steps,
        "agronomic_verdict_en": "Excellent rotation! Leguminous inclusion restores natural rhizobial nitrogen balance and halts monoculture root-knot nematodes." if has_legume else "Continuous non-legume monoculture severely depletes nitrogen reserves and increases chemical fertilizer dependency.",
        "agronomic_verdict_ta": "சிறந்த பயிர் சுழற்சி! பயறுவகை பயிர்கள் மண்ணில் நைட்ரஜனை நிலைநிறுத்தி வேர் முடிச்சு நூற்புழுக்களை அழிக்கிறது." if has_legume else "பயறுவகைகள் இல்லாத தொடர் சாகுபடி மண்ணின் சத்துக்களைக் குறைத்து அதிக ரசாயன உரத் தேவையை உருவாக்குகிறது."
    }

# --- 4. Extreme Weather Simulator (Flood & Drought) ---
@router.post("/run/extreme-weather")
def run_extreme_weather(req: ExtremeWeatherRequest, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == req.farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    if req.event_type == "flood":
        base_ponding_cm = 45 if req.severity == "catastrophic" else (25 if req.severity == "high" else 12)
        base_asphyxiation_hours = 36
        base_survival = 35.0

        # Intervention buffers
        mitigated_ponding = base_ponding_cm
        survival_boost = 0.0

        if "drainage_trenches" in req.interventions:
            mitigated_ponding -= 15
            survival_boost += 30.0
        if "raised_beds" in req.interventions:
            mitigated_ponding -= 8
            survival_boost += 20.0

        final_ponding_cm = max(2, mitigated_ponding)
        final_survival_pct = min(92.0, base_survival + survival_boost)

        return {
            "simulation_type": "flood_weather",
            "event_type": "flood",
            "severity": req.severity,
            "ponding_depth_cm": final_ponding_cm,
            "submergence_hours_tolerance": 48,
            "crop_survival_pct": round(final_survival_pct, 1),
            "root_zone_aeration_status": "Severe Hypoxia (வேர் ஆக்ஸிஜன் பற்றாக்குறை)" if final_ponding_cm > 15 else "Managed Aeration (பாதுகாக்கப்பட்டது)",
            "recovery_days": 12 if final_survival_pct > 60 else 28,
            "visual_layers": {
                "water_level_pct": min(100, int((final_ponding_cm / 50.0) * 100)),
                "cloud_opacity": 0.95,
                "rain_particle_rate": 80,
                "soil_saturation_pct": 100
            }
        }
    else: # Drought
        base_days_to_wilting = 12 if req.severity == "catastrophic" else 18
        base_survival = 28.0
        soil_crack_depth_cm = 18 if req.severity == "catastrophic" else 10

        survival_boost = 0.0
        crack_reduction = 0

        if "mulching" in req.interventions:
            survival_boost += 25.0
            crack_reduction += 6
        if "drip_relief" in req.interventions:
            survival_boost += 35.0
            crack_reduction += 8

        final_survival_pct = min(90.0, base_survival + survival_boost)
        final_crack_cm = max(1, soil_crack_depth_cm - crack_reduction)

        return {
            "simulation_type": "drought_weather",
            "event_type": "drought",
            "severity": req.severity,
            "soil_crack_depth_cm": final_crack_cm,
            "crop_survival_pct": round(final_survival_pct, 1),
            "leaf_relative_water_content_pct": 42 if final_survival_pct < 50 else 74,
            "recovery_days": 10 if final_survival_pct > 60 else 30,
            "visual_layers": {
                "soil_dryness_pct": 92,
                "sun_heat_glare": 0.9,
                "crack_density_pct": min(100, final_crack_cm * 5),
                "foliage_wilting_angle_deg": 65 if final_survival_pct < 50 else 25
            }
        }

# --- 5. Crop Stress & Survival Simulator ---
@router.post("/run/crop-stress")
def run_crop_stress(req: CropStressRequest):
    stress_profiles = {
        "paddy": {"drought_tol": 35, "heat_tol": 65, "waterlog_tol": 95, "salinity_tol": 40},
        "finger millet": {"drought_tol": 90, "heat_tol": 88, "waterlog_tol": 30, "salinity_tol": 75},
        "groundnut": {"drought_tol": 70, "heat_tol": 75, "waterlog_tol": 25, "salinity_tol": 50},
        "cotton": {"drought_tol": 80, "heat_tol": 90, "waterlog_tol": 35, "salinity_tol": 65}
    }

    results = []
    days = [1, 5, 10, 15, 20, 25, 30]

    for crop_name in req.crops:
        matched_key = "paddy"
        for k in stress_profiles.keys():
            if k in crop_name.lower():
                matched_key = k
                break

        prof = stress_profiles[matched_key]
        base_tolerance = prof.get(f"{req.stress_type[:7]}_tol", 60)

        # Generate survival decay curve
        decay_rate = (100.0 - base_tolerance) / 25.0
        survival_curve = []
        for d in days:
            val = max(5.0, round(100.0 - (d * decay_rate), 1))
            survival_curve.append({"day": d, "survival_pct": val})

        final_survival = survival_curve[-1]["survival_pct"]

        results.append({
            "crop_name": crop_name,
            "base_tolerance_score": base_tolerance,
            "survival_curve": survival_curve,
            "day30_survival_pct": final_survival,
            "expected_yield_loss_pct": round(max(5.0, 100.0 - final_survival * 0.9), 1),
            "resilience_rating": "Superior (உயர் பின்னடைவு)" if base_tolerance >= 75 else ("Moderate (மிதமானது)" if base_tolerance >= 50 else "Vulnerable (பாதிக்கப்படக்கூடியது)")
        })

    return {
        "stress_type": req.stress_type,
        "stress_duration_days": req.stress_duration_days,
        "comparison_data": results
    }

# --- 6. Save, List, Compare & Export Saved Simulations ---
@router.post("/scenarios/save", status_code=status.HTTP_201_CREATED)
def save_simulation_scenario(req: SaveScenarioRequest, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == req.farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    user_id = req.user_id or farmland.user_id

    scenario = SavedSimulation(
        user_id=user_id,
        farmland_id=req.farmland_id,
        title=req.title,
        simulation_type=req.simulation_type,
        input_parameters=req.input_parameters,
        baseline_data=req.baseline_data,
        calculated_results=req.calculated_results,
        educational_notes=req.educational_notes
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)

    return {
        "status": "success",
        "message": "Simulation scenario saved successfully / உருவகப்படுத்துதல் காட்சி வெற்றிகரமாக சேமிக்கப்பட்டது",
        "scenario_id": scenario.id,
        "title": scenario.title
    }

@router.get("/scenarios/{farmland_id}")
def list_saved_scenarios(farmland_id: str, db: Session = Depends(get_db)):
    """Fetches all saved simulation scenarios for a given farmland."""
    scenarios = db.query(SavedSimulation).filter(SavedSimulation.farmland_id == farmland_id).order_by(SavedSimulation.created_at.desc()).all()

    return {
        "status": "success",
        "farmland_id": farmland_id,
        "count": len(scenarios),
        "scenarios": [
            {
                "id": s.id,
                "title": s.title,
                "simulation_type": s.simulation_type,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "input_summary": s.input_parameters,
                "results_summary": s.calculated_results
            }
            for s in scenarios
        ]
    }

@router.get("/scenarios/detail/{scenario_id}")
def get_scenario_detail(scenario_id: str, db: Session = Depends(get_db)):
    """Fetches full details of a saved simulation scenario."""
    s = db.query(SavedSimulation).filter(SavedSimulation.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")

    return {
        "id": s.id,
        "title": s.title,
        "simulation_type": s.simulation_type,
        "farmland_id": s.farmland_id,
        "input_parameters": s.input_parameters,
        "baseline_data": s.baseline_data,
        "calculated_results": s.calculated_results,
        "educational_notes": s.educational_notes,
        "created_at": s.created_at.isoformat() if s.created_at else None
    }

@router.post("/scenarios/compare")
def compare_saved_scenarios(req: CompareScenariosRequest, db: Session = Depends(get_db)):
    """Returns side-by-side comparison payload for 2 or more saved scenarios."""
    scenarios = db.query(SavedSimulation).filter(SavedSimulation.id.in_(req.scenario_ids)).all()
    if not scenarios:
        raise HTTPException(status_code=404, detail="No matching scenarios found")

    return {
        "status": "success",
        "comparison_count": len(scenarios),
        "items": [
            {
                "id": s.id,
                "title": s.title,
                "simulation_type": s.simulation_type,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "inputs": s.input_parameters,
                "baseline": s.baseline_data,
                "results": s.calculated_results
            }
            for s in scenarios
        ]
    }

@router.delete("/scenarios/{scenario_id}")
def delete_saved_scenario(scenario_id: str, db: Session = Depends(get_db)):
    """Deletes a saved simulation scenario."""
    s = db.query(SavedSimulation).filter(SavedSimulation.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")

    db.delete(s)
    db.commit()
    return {"status": "success", "message": "Simulation scenario deleted / காட்சி நீக்கப்பட்டது"}
