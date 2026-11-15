import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal
from app.models.models import Profile, Farmland, FarmPlot, SavedSimulation
from app.authentication.auth import hash_password, verify_password, create_access_token, decode_access_token
from app.api.auth import register, login, RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest, LanguageUpdateRequest, OnboardingRequest, complete_onboarding
from app.api.plots import list_plots, create_plot, update_plot, delete_plot, PlotCreateRequest, PlotUpdateRequest
from app.api.simulation_world import (
    run_climate_change_simulation, ClimateSimulationRequest,
    run_irrigation_simulation, IrrigationSimulationRequest,
    run_rotation_simulation, RotationSimulationRequest,
    run_extreme_weather, ExtremeWeatherRequest,
    run_crop_stress, CropStressRequest,
    save_simulation_scenario, SaveScenarioRequest,
    list_saved_scenarios, compare_saved_scenarios, CompareScenariosRequest
)

def test_full_upgrade_suite():
    db = SessionLocal()
    try:
        print("\n--- 1. Testing Password Hashing & JWT ---")
        pwd = "TestSecretPassword#2026"
        hashed = hash_password(pwd)
        assert verify_password(pwd, hashed) is True, "Password verification failed"
        assert verify_password("WrongPassword", hashed) is False, "Wrong password was accepted"
        print("✓ PBKDF2 Password hashing and verification verified.")

        token = create_access_token({"sub": "user_123", "role": "farmer", "name": "Muthu"})
        payload = decode_access_token(token)
        assert payload is not None, "Token decoding failed"
        assert payload["sub"] == "user_123"
        assert payload["role"] == "farmer"
        print("✓ Cryptographic JWT token generation and verification passed.")

        print("\n--- 2. Testing Auth Endpoints (Register & Login) ---")
        test_email = "muthu_farmer@tnau.edu.in"
        # Clean up if existed from prior run
        existing = db.query(Profile).filter(Profile.email == test_email).first()
        if existing:
            db.delete(existing)
            db.commit()

        reg_req = RegisterRequest(
            full_name="Muthu Vel (முத்து வேல்)",
            email=test_email,
            password="farmersecret",
            confirm_password="farmersecret",
            phone="+91 98765 43210",
            preferred_language="ta",
            role="farmer",
            district="Madurai",
            village="Usilampatti"
        )
        reg_res = register(reg_req, db)
        assert reg_res["status"] == "success"
        user_id = reg_res["user"]["id"]
        print(f"✓ Registered farmer: {reg_res['user']['full_name']} (ID: {user_id})")

        # Test login
        login_res = login(LoginRequest(email=test_email, password="farmersecret"), db)
        assert login_res["status"] == "success"
        assert "access_token" in login_res
        print("✓ Login successful with token returned.")

        # Test Demo account login (seeded account)
        demo_login = login(LoginRequest(email="farmer@nilampesum.tn.gov.in", password="farmer123"), db)
        assert demo_login["status"] == "success"
        print("✓ Seeded farmer demo account login successful.")

        print("\n--- 3. Testing 8-Step Farmer Onboarding Wizard ---")
        onboard_req = OnboardingRequest(
            farm_name="Muthu Organic Fields (முத்து இயற்கை பண்ணை)",
            survey_number="88/2C",
            state="Tamil Nadu",
            district="Madurai",
            village="Usilampatti",
            latitude=9.9673,
            longitude=77.7942,
            area_acres=4.5,
            area_unit="acres",
            current_crop="Cotton (பருத்தி)",
            previous_crop="Paddy (நெல்)",
            irrigation_type="drip",
            soil_type="black_cotton",
            water_availability="medium",
            farming_goal="maximize_profit"
        )
        farmer_profile = db.query(Profile).filter(Profile.id == user_id).first()
        onboard_res = complete_onboarding(onboard_req, farmer_profile, db)
        assert onboard_res["status"] == "success"
        new_farm_id = onboard_res["farmland_id"]
        print(f"✓ Onboarding completed! Farmland created with ID: {new_farm_id}")

        print("\n--- 4. Testing Farm Plot Sub-Division CRUD ---")
        plot_list = list_plots(new_farm_id, db)
        assert plot_list["status"] == "success"
        assert plot_list["plots_count"] >= 1
        print(f"✓ Initial auto-generated main plot found: {plot_list['plots'][0]['plot_name']}")

        # Add second plot
        plot_req = PlotCreateRequest(
            plot_name="வடகரை பகுதி (North Plot - Pulses)",
            area_acres=1.5,
            current_crop="Black Gram (உளுந்து)",
            soil_type="black_cotton",
            irrigation_method="drip"
        )
        new_plot = create_plot(new_farm_id, plot_req, db)
        plot_id = new_plot["plot"]["id"]
        print(f"✓ Sub-divided plot created: {new_plot['plot']['plot_name']}")

        # Update plot
        update_res = update_plot(plot_id, PlotUpdateRequest(current_crop="Green Gram (பாசிப்பயறு)"), db)
        assert update_res["plot"]["current_crop"] == "Green Gram (பாசிப்பயறு)"
        print("✓ Plot updated successfully.")

        print("\n--- 5. Testing Simulation World Calculations ---")
        # 5.1 Climate Change Simulator
        climate_res = run_climate_change_simulation(
            ClimateSimulationRequest(farmland_id=new_farm_id, temp_delta_c=2.5, rain_delta_pct=-20.0, dry_spell_days=18),
            db
        )
        assert climate_res["simulation_type"] == "climate_change"
        assert "yield_impact_pct" in climate_res["simulated"]
        print(f"✓ Climate Simulation: Yield impact = {climate_res['simulated']['yield_impact_pct']}% | Risk: {climate_res['simulated']['risk_level']}")

        # 5.2 Smart Irrigation Simulator
        irrig_res = run_irrigation_simulation(
            IrrigationSimulationRequest(farmland_id=new_farm_id, method="drip", application_depth_mm=30.0),
            db
        )
        assert irrig_res["simulation_type"] == "smart_irrigation"
        print(f"✓ Irrigation Simulation: Water saved vs flood = {irrig_res['water_saved_pct']}% ({irrig_res['water_saved_vs_flood_m3']} m³), Saved: ₹{irrig_res['estimated_savings_inr']}")

        # 5.3 Crop Rotation Simulator
        rotation_res = run_rotation_simulation(
            RotationSimulationRequest(
                farmland_id=new_farm_id,
                crop_sequence=["Paddy (நெல்)", "Black Gram (உளுந்து)", "Sesame (எள்)", "Groundnut (நிலக்கடலை)"]
            ),
            db
        )
        assert rotation_res["sustainability_score"] > 70
        print(f"✓ Crop Rotation Simulation: N balance = {rotation_res['net_nitrogen_balance_kg_ha']} kg/ha | Soil OC final = {rotation_res['final_organic_carbon_pct']}% | Sustainability: {rotation_res['sustainability_score']}/100")

        # 5.4 Extreme Weather (Flood & Drought)
        flood_res = run_extreme_weather(
            ExtremeWeatherRequest(farmland_id=new_farm_id, event_type="flood", severity="high", interventions=["drainage_trenches"]),
            db
        )
        assert flood_res["crop_survival_pct"] > 50
        print(f"✓ Flood Simulation: Ponding = {flood_res['ponding_depth_cm']} cm | Crop survival = {flood_res['crop_survival_pct']}%")

        # 5.5 Crop Stress & Survival
        stress_res = run_crop_stress(
            CropStressRequest(stress_type="drought", stress_duration_days=25)
        )
        assert len(stress_res["comparison_data"]) >= 4
        print(f"✓ Crop Stress Simulation: Compared {len(stress_res['comparison_data'])} crops under drought stress.")

        print("\n--- 6. Testing Saved Simulations & Comparison ---")
        save_req = SaveScenarioRequest(
            farmland_id=new_farm_id,
            user_id=user_id,
            title="Drip Irrigation vs Flood Baseline 2026",
            simulation_type="smart_irrigation",
            input_parameters={"method": "drip", "application_depth_mm": 30.0},
            baseline_data={"flood_efficiency": 42.0},
            calculated_results=irrig_res,
            educational_notes="Drip saves 49% water in black cotton soil"
        )
        save_res = save_simulation_scenario(save_req, db)
        scenario_id1 = save_res["scenario_id"]
        print(f"✓ Scenario 1 saved with ID: {scenario_id1}")

        # Save a second scenario for comparison
        save_req2 = SaveScenarioRequest(
            farmland_id=new_farm_id,
            user_id=user_id,
            title="Climate Change +2.5C Drought Stress",
            simulation_type="climate_change",
            input_parameters={"temp_delta_c": 2.5, "rain_delta_pct": -20.0},
            baseline_data={"mean_temp": 29.8},
            calculated_results=climate_res,
            educational_notes="Sowing window shift needed"
        )
        save_res2 = save_simulation_scenario(save_req2, db)
        scenario_id2 = save_res2["scenario_id"]

        # List saved scenarios
        saved_list = list_saved_scenarios(new_farm_id, db)
        assert saved_list["count"] >= 2
        print(f"✓ Retrieved {saved_list['count']} saved simulation scenarios.")

        # Compare scenarios
        compare_res = compare_saved_scenarios(CompareScenariosRequest(scenario_ids=[scenario_id1, scenario_id2]), db)
        assert compare_res["comparison_count"] == 2
        print("✓ Side-by-side scenario comparison succeeded.")

        print("\n========================================================")
        print(" ALL 6 MODULE UPGRADE TESTS PASSED WITH 100% SUCCESS! ")
        print("========================================================\n")
    finally:
        db.close()

if __name__ == "__main__":
    test_full_upgrade_suite()

