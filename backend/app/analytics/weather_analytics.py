import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import EnvironmentalObservation, Farmland

logger = logging.getLogger("nilam_pesum.analytics.weather")

def get_weather_analytics(db: Session, farmland: Farmland) -> Dict[str, Any]:
    """
    Computes weather analytics from NASA POWER observations:
    - Latest observation values (T2M, T2M_MAX, T2M_MIN, RH2M, Solar)
    - 30-day and 90-day rainfall totals
    - Daily records timeseries
    - Monthly aggregated rainfall bars
    - Rainfall anomaly status (deficit, normal, excess)
    """
    observations = db.query(EnvironmentalObservation).filter(
        EnvironmentalObservation.farmland_id == farmland.id,
        EnvironmentalObservation.source_id == "nasa_power"
    ).order_by(EnvironmentalObservation.observation_date.asc()).all()

    if not observations:
        # Return structured empty response with provenance guidance
        return {
            "farmland_id": farmland.id,
            "district": farmland.district,
            "latest_observation_date": None,
            "current_temp_avg": None,
            "current_temp_max": None,
            "current_temp_min": None,
            "current_humidity": None,
            "current_solar_radiation": None,
            "total_rainfall_last_30_days": 0.0,
            "total_rainfall_last_90_days": 0.0,
            "rainfall_anomaly_status": "insufficient_data",
            "daily_records": [],
            "monthly_rainfall_records": [],
            "data_provenance": {
                "source": "NASA POWER Daily API",
                "status": "No observations synced yet. Click 'Sync NASA Data' to fetch live observations.",
                "data_category": "CATEGORY 1 - NASA SOURCE DATA"
            }
        }

    latest = observations[-1]
    
    # Calculate 30-day and 90-day rainfall totals
    today = latest.observation_date
    date_30d_ago = today - timedelta(days=30)
    date_90d_ago = today - timedelta(days=90)

    rain_30d = sum(o.precipitation_mm for o in observations if o.precipitation_mm and o.observation_date >= date_30d_ago)
    rain_90d = sum(o.precipitation_mm for o in observations if o.precipitation_mm and o.observation_date >= date_90d_ago)

    # Anomaly status based on Tamil Nadu seasonal normals (~60-120mm/month outside monsoon)
    if rain_30d < 15.0:
        anomaly = "Rainfall Deficit / Dry Spell Alert"
    elif rain_30d > 160.0:
        anomaly = "Excess Rainfall / Inundation Watch"
    else:
        anomaly = "Normal Seasonal Rainfall"

    # Daily records for chart
    daily_records = []
    for obs in observations[-30:]: # Last 30 observations
        daily_records.append({
            "date": obs.observation_date.strftime("%b %d"),
            "full_date": obs.observation_date.isoformat(),
            "temp_avg": obs.temperature_avg_c,
            "temp_max": obs.temperature_max_c,
            "temp_min": obs.temperature_min_c,
            "rainfall_mm": obs.precipitation_mm or 0.0,
            "humidity_pct": obs.relative_humidity_pct,
            "solar_radiation": obs.solar_radiation_mj_m2
        })

    # Monthly aggregation
    monthly_map = {}
    for obs in observations:
        month_key = obs.observation_date.strftime("%Y-%m")
        if month_key not in monthly_map:
            monthly_map[month_key] = {"month": obs.observation_date.strftime("%b %Y"), "rainfall_mm": 0.0, "days": 0}
        if obs.precipitation_mm:
            monthly_map[month_key]["rainfall_mm"] += obs.precipitation_mm
        monthly_map[month_key]["days"] += 1

    monthly_records = [
        {"month": v["month"], "rainfall_mm": round(v["rainfall_mm"], 1)}
        for k, v in sorted(monthly_map.items())[-12:] # Last 12 months
    ]

    return {
        "farmland_id": farmland.id,
        "district": farmland.district,
        "latest_observation_date": latest.observation_date.isoformat(),
        "current_temp_avg": latest.temperature_avg_c,
        "current_temp_max": latest.temperature_max_c,
        "current_temp_min": latest.temperature_min_c,
        "current_humidity": latest.relative_humidity_pct,
        "current_solar_radiation": latest.solar_radiation_mj_m2,
        "total_rainfall_last_30_days": round(rain_30d, 1),
        "total_rainfall_last_90_days": round(rain_90d, 1),
        "rainfall_anomaly_status": anomaly,
        "daily_records": daily_records,
        "monthly_rainfall_records": monthly_records,
        "data_provenance": {
            "source": "NASA POWER Agroclimatology (T2M, PRECTOTCORR, RH2M, ALLSKY_SFC_SW_DWN)",
            "community": "AG",
            "resolution": "0.5° x 0.625°",
            "time_standard": "LST",
            "data_category": "CATEGORY 1 - NASA SOURCE DATA"
        }
    }

