import asyncio
from app.database.session import SessionLocal
from app.models.models import Farmland, EnvironmentalObservation
from app.nasa.nasa_power_service import nasa_power_service
from app.analytics.weather_analytics import get_weather_analytics
from app.analytics.soil_analytics import get_soil_moisture_analytics
from app.analytics.farm_health import calculate_farm_health_score
from app.recommendations.engine import recommendation_engine

async def main():
    db = SessionLocal()
    farm = db.query(Farmland).first()
    print(f"Testing live sync for Farmland: {farm.name} ({farm.district}) at Lat: {farm.latitude}, Lon: {farm.longitude}")
    
    # 1. Fetch live NASA POWER daily data
    result = await nasa_power_service.fetch_daily_point_data(
        db=db,
        farmland=farm,
        start_date="20240101",
        end_date="20240114"
    )
    print("NASA POWER Sync Result:", result["success"], "Records count:", result.get("records_count"))
    
    # 2. Check observations in DB
    obs_count = db.query(EnvironmentalObservation).filter(EnvironmentalObservation.farmland_id == farm.id).count()
    print(f"Total Environmental Observations in DB for farm: {obs_count}")
    
    # 3. Test Weather Analytics
    weather = get_weather_analytics(db, farm)
    print("Weather Analytics Current Temp:", weather.get("current_temp_avg"), "30d Rain:", weather.get("total_rainfall_last_30_days"))
    
    # 4. Test Soil Moisture Analytics
    soil = get_soil_moisture_analytics(db, farm)
    print("Soil Moisture Status:", soil.get("moisture_status"), "Surface SM%:", soil.get("surface_moisture_percentage"))
    
    # 5. Test Farm Health Score
    health = calculate_farm_health_score(db, farm)
    print("Farm Health Score:", health.get("overall_health_score"), "Status:", health.get("health_status"))
    
    # 6. Test Recommendation Engine
    plans = recommendation_engine.generate_rotation_plans(db, farm)
    print(f"Generated {len(plans)} Crop Rotation Plans:")
    for p in plans:
        print(f"  - [{p.plan_type}] {p.plan_name}: Score {p.overall_suitability_score}/100, Water: {p.water_requirement_desc}")
    
    db.close()

if __name__ == "__main__":
    asyncio.run(main())

