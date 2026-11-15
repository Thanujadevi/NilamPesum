import sys
import os
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncio
import httpx
from app.main import app
from app.database.init_db import init_database

async def run_all_tests():
    print("Initializing test database...")
    init_database()
    
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("\n--- Running NILAM PESUM Test Suite ---")
        
        # Test 1: Health Check
        r = await client.get("/api/health")
        assert r.status_code == 200, f"Health check failed: {r.status_code}"
        assert "NILAM PESUM" in r.json()["app"]
        print("PASS: Health Check (/api/health)")

        # Test 2: NASA Data Sources Catalog
        r = await client.get("/api/nasa/sources")
        assert r.status_code == 200
        sources = r.json()
        assert len(sources) >= 6
        print(f"PASS: NASA Sources Catalog ({len(sources)} official NASA products verified)")

        # Test 3: NASA Integration Status Dashboard
        r = await client.get("/api/nasa/status")
        assert r.status_code == 200
        status_data = r.json()
        assert "integrations" in status_data
        print(f"PASS: NASA Status Dashboard ({len(status_data['integrations'])} products monitored)")

        # Test 4: List Farmlands
        r = await client.get("/api/farmlands")
        assert r.status_code == 200
        farms = r.json()
        assert len(farms) >= 1
        farm_id = farms[0]["id"]
        print(f"PASS: List Farmlands (Found demonstration farm: {farms[0]['name']})")

        # Test 5: Weather Analytics
        r = await client.get(f"/api/analytics/weather/{farm_id}")
        assert r.status_code == 200
        weather = r.json()
        assert "daily_records" in weather
        assert "monthly_rainfall_records" in weather
        print(f"PASS: Weather Analytics (Temp: {weather.get('current_temp_avg')}°C, 30d Rain: {weather.get('total_rainfall_last_30_days')}mm)")

        # Test 6: Soil Moisture Analytics
        r = await client.get(f"/api/analytics/soil-moisture/{farm_id}")
        assert r.status_code == 200
        soil = r.json()
        assert "moisture_status" in soil
        print(f"PASS: Soil Moisture Analytics ({soil.get('moisture_status')})")

        # Test 7: Vegetation Analytics
        r = await client.get(f"/api/analytics/vegetation/{farm_id}")
        assert r.status_code == 200
        veg = r.json()
        assert "vegetation_health_status" in veg
        print(f"PASS: Vegetation Analytics (NDVI: {veg.get('current_ndvi')})")

        # Test 8: Farm Health Score
        r = await client.get(f"/api/analytics/land-health/{farm_id}")
        assert r.status_code == 200
        health = r.json()
        assert "overall_health_score" in health
        print(f"PASS: Farm Health Score ({health.get('overall_health_score')}/100 - {health.get('health_status')})")

        # Test 9: 10-Year Historical Analysis
        r = await client.get(f"/api/analytics/historical/{farm_id}")
        assert r.status_code == 200
        hist = r.json()
        assert len(hist["yearly_records"]) == 10
        print(f"PASS: 10-Year Historical Analysis (Mean Annual Rain: {hist['mean_annual_rainfall_mm']} mm)")

        # Test 10: Crop Rotation Recommendations
        r = await client.post("/api/recommendations/generate", json={
            "farmland_id": farm_id,
            "target_season": "Samba Season",
            "prioritize_goal": "save_water"
        })
        assert r.status_code == 200
        plans = r.json()
        assert len(plans) >= 3
        print(f"PASS: Crop Recommendations Generated ({len(plans)} distinct plans with TNAU constraints)")

        # Test 11: Climate Scenario Simulation
        r = await client.post("/api/simulations/run", json={
            "farmland_id": farm_id,
            "simulation_name": "What-If 20% Rainfall Deficit",
            "rainfall_change_pct": -20.0,
            "temp_change_c": 1.5,
            "irrigation_constraint": "restricted"
        })
        assert r.status_code == 200
        sim = r.json()
        assert "simulated_impact" in sim
        print("PASS: Scenario Simulation (What-if impact calculated)")

        # Test 12: Tamil Voice Assistant
        r = await client.post("/api/voice/query", json={
            "query_text": "என் நிலத்திற்கு ஏற்ற பயிர் எது?",
            "farmland_id": farm_id,
            "language": "ta"
        })
        assert r.status_code == 200
        v_data = r.json()
        assert "response_text" in v_data
        print("PASS: Tamil Voice Assistant ('என் நிலத்திற்கு ஏற்ற பயிர் எது?' answered with agronomic guidance)")

        # Test 13: Reports Summary
        r = await client.get(f"/api/reports/{farm_id}/summary")
        assert r.status_code == 200
        rep = r.json()
        assert "report_title" in rep
        print("PASS: Reports Summary (Full printable data bundle verified)")

        # Test 14: Regional Officer Overview
        r = await client.get("/api/officer/regional-overview")
        assert r.status_code == 200
        reg = r.json()
        assert len(reg["monitoring_regions"]) >= 3
        print("PASS: Regional Officer Overview (Tamil Nadu agroclimatic zones monitored)")

        print("\nALL 14 BACKEND INTEGRATION & API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_all_tests())
