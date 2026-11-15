import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.models import Farmland

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "NILAM PESUM" in data["app"]

def test_get_nasa_sources():
    response = client.get("/api/nasa/sources")
    assert response.status_code == 200
    sources = response.json()
    assert len(sources) >= 6
    source_ids = [s["id"] for s in sources]
    assert "nasa_power" in source_ids
    assert "nasa_gpm_imerg" in source_ids
    assert "nasa_smap" in source_ids
    assert "nasa_modis" in source_ids
    assert "nasa_hls" in source_ids
    assert "nasa_merra2" in source_ids

def test_get_nasa_status_dashboard():
    response = client.get("/api/nasa/status")
    assert response.status_code == 200
    data = response.json()
    assert "integrations" in data
    assert len(data["integrations"]) >= 6

def test_list_farmlands():
    response = client.get("/api/farmlands")
    assert response.status_code == 200
    farms = response.json()
    assert len(farms) >= 1
    assert farms[0]["district"] == "Thanjavur"

def test_create_and_delete_farmland():
    payload = {
        "name": "Kaveri Test Farm",
        "district": "Tiruvarur",
        "village": "Needamangalam",
        "latitude": 10.7726,
        "longitude": 79.6365,
        "area_acres": 4.2,
        "area_hectares": 1.7,
        "irrigation_type": "canal",
        "soil_type": "clay_loam",
        "water_availability": "high",
        "farming_goal": "save_water"
    }
    create_res = client.post("/api/farmlands", json=payload)
    assert create_res.status_code == 200
    farm_data = create_res.json()
    farm_id = farm_data["id"]
    assert farm_data["name"] == "Kaveri Test Farm"

    # Clean up
    del_res = client.delete(f"/api/farmlands/{farm_id}")
    assert del_res.status_code == 200

def test_weather_analytics():
    farms_res = client.get("/api/farmlands")
    farm_id = farms_res.json()[0]["id"]
    response = client.get(f"/api/analytics/weather/{farm_id}")
    assert response.status_code == 200
    data = response.json()
    assert "daily_records" in data
    assert "monthly_rainfall_records" in data

def test_farm_health_score():
    farms_res = client.get("/api/farmlands")
    farm_id = farms_res.json()[0]["id"]
    response = client.get(f"/api/analytics/land-health/{farm_id}")
    assert response.status_code == 200
    data = response.json()
    assert "overall_health_score" in data
    assert "indicator_scores" in data
    assert 0 <= data["overall_health_score"] <= 100

def test_recommendation_generation():
    farms_res = client.get("/api/farmlands")
    farm_id = farms_res.json()[0]["id"]
    payload = {
        "farmland_id": farm_id,
        "target_season": "Samba Season",
        "prioritize_goal": "save_water"
    }
    response = client.post("/api/recommendations/generate", json=payload)
    assert response.status_code == 200
    plans = response.json()
    assert len(plans) >= 3
    for p in plans:
        assert "overall_suitability_score" in p
        assert len(p["rotation_sequence"]) >= 2
        assert "water_requirement_desc" in p

def test_scenario_simulation():
    farms_res = client.get("/api/farmlands")
    farm_id = farms_res.json()[0]["id"]
    payload = {
        "farmland_id": farm_id,
        "simulation_name": "Test 20% Deficit Simulation",
        "rainfall_change_pct": -20.0,
        "temp_change_c": 1.5,
        "irrigation_constraint": "restricted"
    }
    response = client.post("/api/simulations/run", json=payload)
    assert response.status_code == 200
    sim_data = response.json()
    assert "simulated_impact" in sim_data
    assert "DISCLAIMER" in sim_data["disclaimer"]

def test_voice_assistant_tamil_and_english():
    # Test Tamil query
    ta_res = client.post("/api/voice/query", json={
        "query_text": "என் நிலத்திற்கு ஏற்ற பயிர் எது?",
        "language": "ta"
    })
    assert ta_res.status_code == 200
    ta_data = ta_res.json()
    assert "கேழ்வரகு" in ta_data["response_text"] or "பயிர்" in ta_data["response_text"]

    # Test English query
    en_res = client.post("/api/voice/query", json={
        "query_text": "What is the rainfall condition on my land?",
        "language": "en"
    })
    assert en_res.status_code == 200
    en_data = en_res.json()
    assert "NASA" in en_data["response_text"] or "rainfall" in en_data["response_text"].lower()

def test_officer_regional_overview():
    response = client.get("/api/officer/regional-overview")
    assert response.status_code == 200
    data = response.json()
    assert "monitoring_regions" in data
    assert len(data["monitoring_regions"]) >= 3

