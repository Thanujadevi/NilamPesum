import io
import csv
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Farmland, EnvironmentalObservation, CropRotationPlan
from app.analytics.farm_health import calculate_farm_health_score
from app.analytics.weather_analytics import get_weather_analytics
from app.recommendations.engine import recommendation_engine

router = APIRouter(prefix="/reports", tags=["Reports & Provenance Exports"])

@router.get("/{farmland_id}/summary")
def get_report_summary(farmland_id: str, db: Session = Depends(get_db)):
    """
    Returns full printable structured report data including:
    - Farmland identity and GPS bounds
    - Weather analytics & 30-day NASA observations
    - SMAP soil moisture
    - MODIS vegetation health
    - Farm Health Score
    - Crop Rotation Recommendations
    - Scientific limitations & NASA data source references
    """
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    health = calculate_farm_health_score(db, farmland)
    weather = get_weather_analytics(db, farmland)
    plans = db.query(CropRotationPlan).filter(CropRotationPlan.farmland_id == farmland_id).all()
    if not plans:
        plans = recommendation_engine.generate_rotation_plans(db, farmland)

    return {
        "report_title": "NILAM PESUM (நிலம் பேசும்) - Land Environmental & Crop Advisory Report",
        "tagline": "Let Your Land Speak. Let Data Guide Your Farming.",
        "farmland": {
            "name": farmland.name,
            "district": farmland.district,
            "village": farmland.village,
            "latitude": farmland.latitude,
            "longitude": farmland.longitude,
            "area_acres": farmland.area_acres,
            "area_hectares": farmland.area_hectares,
            "soil_type": farmland.soil_type,
            "irrigation_type": farmland.irrigation_type,
            "water_availability": farmland.water_availability
        },
        "farm_health": health,
        "weather_summary": {
            "current_temp": weather.get("current_temp_avg"),
            "rainfall_last_30d": weather.get("total_rainfall_last_30_days"),
            "rainfall_anomaly": weather.get("rainfall_anomaly_status")
        },
        "recommended_plans": [
            {
                "name": p.plan_name,
                "suitability_score": p.overall_suitability_score,
                "water_req": p.water_requirement_desc,
                "risk": p.environmental_risk,
                "soil_benefit": p.soil_health_benefit,
                "explanation_en": p.explanation_en,
                "explanation_ta": p.explanation_ta
            }
            for p in plans[:3]
        ],
        "scientific_provenance_and_limitations": {
            "primary_provider": "NASA Earth Science Data Systems (POWER, GPM, SMAP, MODIS, HLS, MERRA-2)",
            "agronomic_references": "Tamil Nadu Agricultural University (TNAU) Agritech Portal & ICAR",
            "spatial_resolution_notice": "NASA POWER has 0.5°x0.625° resolution; SMAP has 9km resolution; MODIS has 250m resolution. Individual point measurements reflect spatial pixel aggregation and not micro-laboratory ground sampling.",
            "disclaimer": "Suitability scores are decision-support indicators, not guarantees of yield or market pricing."
        }
    }

@router.get("/{farmland_id}/csv")
def export_observations_csv(farmland_id: str, db: Session = Depends(get_db)):
    """Exports all stored NASA observations in structured CSV format with data provenance headers."""
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    observations = db.query(EnvironmentalObservation).filter(
        EnvironmentalObservation.farmland_id == farmland_id
    ).order_by(EnvironmentalObservation.observation_date.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Provenance Header comments
    writer.writerow(["# NILAM PESUM - Authentic NASA Environmental Observations Export"])
    writer.writerow([f"# Farmland: {farmland.name}, District: {farmland.district}, Lat: {farmland.latitude}, Lon: {farmland.longitude}"])
    writer.writerow(["# Data Categories: Category 1 (NASA Observations)"])
    writer.writerow([])

    # Table columns
    writer.writerow([
        "Observation_Date",
        "Data_Source",
        "Temperature_Avg_C",
        "Temperature_Max_C",
        "Temperature_Min_C",
        "Precipitation_mm",
        "Relative_Humidity_Pct",
        "Solar_Radiation_MJ_m2",
        "Soil_Moisture_Surface_cm3_cm3",
        "Soil_Moisture_Rootzone_cm3_cm3",
        "NDVI",
        "EVI",
        "Cloud_Mask_Pct"
    ])

    for obs in observations:
        writer.writerow([
            obs.observation_date.isoformat(),
            obs.source_id,
            obs.temperature_avg_c,
            obs.temperature_max_c,
            obs.temperature_min_c,
            obs.precipitation_mm,
            obs.relative_humidity_pct,
            obs.solar_radiation_mj_m2,
            obs.soil_moisture_surface,
            obs.soil_moisture_rootzone,
            obs.ndvi,
            obs.evi,
            obs.cloud_mask_pct
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=nilam_pesum_nasa_obs_{farmland.id[:8]}.csv"}
    )
