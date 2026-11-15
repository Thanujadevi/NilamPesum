import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database.session import SessionLocal
from app.models.models import Farmland, NasaDataSource, EnvironmentalObservation
from app.api.farmlands import list_farmlands, create_farmland, get_farmland, delete_farmland
from app.api.nasa import get_nasa_sources, get_nasa_integration_status
from app.api.analytics import weather_analysis, soil_moisture_analysis, vegetation_analysis, land_health_score, historical_analysis
from app.api.recommendations import list_crop_knowledge
from app.recommendations.engine import recommendation_engine
from app.analytics.simulation import run_climate_simulation
from app.api.voice import handle_voice_query
from app.schemas.schemas import VoiceQueryRequest, FarmlandCreate
from app.api.reports import get_report_summary
from app.api.officer import get_regional_overview

def test_all():
    db = SessionLocal()
    print("\n--- Running Direct Verification Suite for NILAM PESUM ---")

    # 1. Verify NASA Data Sources Catalog
    sources = get_nasa_sources(db=db)
    assert len(sources) >= 6, f"Expected at least 6 NASA sources, got {len(sources)}"
    source_ids = [s.id for s in sources]
    assert "nasa_power" in source_ids
    assert "nasa_gpm_imerg" in source_ids
    assert "nasa_smap" in source_ids
    assert "nasa_modis" in source_ids
    assert "nasa_hls" in source_ids
    assert "nasa_merra2" in source_ids
    print(f"PASS: NASA Sources Catalog Verified ({len(sources)} products: {', '.join(source_ids)})")

    # 2. Verify NASA Status Dashboard
    status_dash = get_nasa_integration_status(db=db)
    assert len(status_dash["integrations"]) >= 6
    power_stat = next(i for i in status_dash["integrations"] if i["source_id"] == "nasa_power")
    assert power_stat["status"] == "Connected"
    print("PASS: NASA Status Dashboard Verified (NASA POWER Connected)")

    # 3. Farmlands CRUD
    farms = list_farmlands(db=db)
    assert len(farms) >= 1
    farm = farms[0]
    print(f"PASS: Farmland retrieved: {farm.name} in {farm.district} ({farm.latitude}, {farm.longitude})")

    # Create temporary farm
    new_farm = create_farmland(FarmlandCreate(
        name="Unit Test Farm",
        district="Madurai",
        village="Melur",
        latitude=9.9252,
        longitude=78.1198,
        area_acres=2.0,
        area_hectares=0.81,
        irrigation_type="rainfed",
        soil_type="red_loam",
        water_availability="scarce",
        farming_goal="reduce_risk"
    ), db=db)
    assert new_farm.id is not None
    assert new_farm.district == "Madurai"
    # Delete temporary farm
    del_res = delete_farmland(new_farm.id, db=db)
    assert del_res["id"] == new_farm.id
    print("PASS: Farmland Create & Delete Verified")

    # 4. Weather Analytics
    weather = weather_analysis(farm.id, db=db)
    assert "daily_records" in weather
    assert "monthly_rainfall_records" in weather
    print(f"PASS: Weather Analytics (Temp: {weather.get('current_temp_avg')}°C, 30d Rain: {weather.get('total_rainfall_last_30_days')} mm)")

    # 5. Soil Moisture Analytics
    soil = soil_moisture_analysis(farm.id, db=db)
    assert "surface_moisture_volumetric" in soil
    assert "moisture_status" in soil
    print(f"PASS: Soil Moisture Analytics ({soil.get('moisture_status')})")

    # 6. Vegetation Analytics
    veg = vegetation_analysis(farm.id, db=db)
    assert "current_ndvi" in veg
    assert "vegetation_health_status" in veg
    print(f"PASS: Vegetation Analytics (NDVI: {veg.get('current_ndvi')})")

    # 7. Farm Health Score
    health = land_health_score(farm.id, db=db)
    assert 0 <= health["overall_health_score"] <= 100
    assert "rainfall" in health["indicator_scores"]
    print(f"PASS: Farm Health Score ({health['overall_health_score']}/100 - {health['health_status']})")

    # 8. 10-Year Historical Analysis
    hist = historical_analysis(farm.id, db=db)
    assert len(hist["yearly_records"]) == 10
    print(f"PASS: 10-Year Historical Analysis ({len(hist['yearly_records'])} years, Annual mean: {hist['mean_annual_rainfall_mm']} mm)")

    # 9. Crop Knowledge Base
    crops = list_crop_knowledge()
    assert len(crops) >= 9
    print(f"PASS: TNAU Crop Knowledge Base ({len(crops)} crops available)")

    # 10. Crop Rotation Recommendation Engine
    plans = recommendation_engine.generate_rotation_plans(db, farm)
    assert len(plans) == 5
    for p in plans:
        assert p.overall_suitability_score > 50.0
        assert len(p.rotation_sequence) >= 2
    print(f"PASS: Recommendation Engine (Generated {len(plans)} distinct plans with TNAU rules)")

    # 11. Climate Scenario Simulation
    sim = run_climate_simulation(
        db=db,
        farmland=farm,
        simulation_name="What-If 20% Deficit",
        rainfall_change_pct=-20.0,
        temp_change_c=1.5,
        irrigation_constraint="restricted"
    )
    assert len(sim["simulated_impact"]["crops_evaluation"]) >= 5
    print("PASS: Scenario Simulation (Evaluated crop impacts under -20% rainfall)")

    # 12. Tamil Voice Assistant
    v_res = handle_voice_query(VoiceQueryRequest(
        query_text="என் நிலத்திற்கு ஏற்ற பயிர் எது?",
        farmland_id=farm.id,
        language="ta"
    ), db=db)
    assert "பயிர்" in v_res["response_text"] or "கேழ்வரகு" in v_res["response_text"]
    print("PASS: Tamil Voice Assistant ('என் நிலத்திற்கு ஏற்ற பயிர் எது?' answered with local agronomic advice)")

    # 13. Reports Summary
    rep = get_report_summary(farm.id, db=db)
    assert "report_title" in rep
    assert len(rep["recommended_plans"]) >= 3
    print("PASS: Reports Summary verified")

    # 14. Regional Officer Overview
    reg = get_regional_overview(db=db)
    assert len(reg["monitoring_regions"]) >= 3
    print(f"PASS: Regional Officer Overview ({len(reg['monitoring_regions'])} monitoring regions)")

    print("\nALL 14 UNIT & INTEGRATION CHECKS PASSED WITH 100% SUCCESS!\n")
    db.close()

if __name__ == "__main__":
    test_all()
