import logging
from datetime import date, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import EnvironmentalObservation, Farmland

logger = logging.getLogger("nilam_pesum.analytics.soil")

def get_soil_moisture_analytics(db: Session, farmland: Farmland) -> Dict[str, Any]:
    """
    Computes soil moisture indicators from NASA SMAP satellite observations.
    Distinguishes surface moisture (0-5cm) from root-zone moisture (0-100cm).
    """
    observations = db.query(EnvironmentalObservation).filter(
        EnvironmentalObservation.farmland_id == farmland.id
    ).order_by(EnvironmentalObservation.observation_date.asc()).all()

    if not observations:
        return {
            "farmland_id": farmland.id,
            "latest_observation_date": None,
            "surface_moisture_volumetric": None,
            "surface_moisture_percentage": None,
            "rootzone_moisture_volumetric": None,
            "moisture_status": "No satellite observations yet",
            "dryness_index": 50.0,
            "timeseries": [],
            "data_provenance": {
                "source": "NASA SMAP (Soil Moisture Active Passive)",
                "data_category": "CATEGORY 1 - NASA SOURCE DATA"
            }
        }

    latest = observations[-1]
    surf_sm = latest.soil_moisture_surface if latest.soil_moisture_surface is not None else 0.22
    root_sm = latest.soil_moisture_rootzone if latest.soil_moisture_rootzone is not None else 0.25

    # Status classification
    if surf_sm < 0.14:
        status = "Severe Moisture Deficit / Crop Wilt Stress"
        dryness_index = 85.0
    elif surf_sm < 0.20:
        status = "Moderate Deficit - Irrigation Advisable"
        dryness_index = 55.0
    elif surf_sm < 0.32:
        status = "Adequate Moisture - Optimal for Field Operations"
        dryness_index = 25.0
    else:
        status = "Near Saturation / Potential Aeration Limit"
        dryness_index = 10.0

    # Build timeseries
    timeseries = []
    for obs in observations[-30:]:
        s_val = obs.soil_moisture_surface if obs.soil_moisture_surface is not None else surf_sm
        r_val = obs.soil_moisture_rootzone if obs.soil_moisture_rootzone is not None else root_sm
        timeseries.append({
            "date": obs.observation_date.strftime("%b %d"),
            "full_date": obs.observation_date.isoformat(),
            "surface_moisture_volumetric": round(s_val, 3),
            "surface_moisture_pct": round(s_val * 100, 1),
            "rootzone_moisture_volumetric": round(r_val, 3),
            "rootzone_moisture_pct": round(r_val * 100, 1),
            "dryness_threshold": 15.0 # Reference permanent wilting point %
        })

    return {
        "farmland_id": farmland.id,
        "latest_observation_date": latest.observation_date.isoformat(),
        "surface_moisture_volumetric": round(surf_sm, 4),
        "surface_moisture_percentage": round(surf_sm * 100, 1),
        "rootzone_moisture_volumetric": round(root_sm, 4),
        "rootzone_moisture_percentage": round(root_sm * 100, 1),
        "moisture_status": status,
        "dryness_index": dryness_index,
        "timeseries": timeseries,
        "soil_context": {
            "farmland_soil_type": farmland.soil_type,
            "water_holding_capacity": "High" if farmland.soil_type in ["clay_loam", "alluvial", "black_cotton"] else "Moderate to Low",
            "irrigation_type": farmland.irrigation_type
        },
        "data_provenance": {
            "source": "NASA SMAP L3/L4 Global Radiometer Soil Moisture (SPL3SMP_E / SPL4SMGP)",
            "sensor": "L-band Radiometer (1.4 GHz)",
            "spatial_resolution": "9 km / 36 km",
            "distinction": "Satellite volumetric measurement (cm³/cm³), not direct chemical soil testing.",
            "data_category": "CATEGORY 1 - NASA SOURCE DATA"
        }
    }

