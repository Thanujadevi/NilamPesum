import sys
import os
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal
from app.models.models import Profile, Farmland
from app.authentication.auth import decode_access_token
from app.api.auth import (
    register_farmer_voice, VoiceFarmerRegisterRequest, VoiceFarmlandItem,
    login, LoginRequest, get_me, update_language, LanguageUpdateRequest
)
from app.api.farmlands import list_farmlands

def run_tests():
    db = SessionLocal()
    try:
        print("\n--- 1. Testing Conversational Voice Registration with Credentials ---")
        unique_phone = f"98765{random.randint(10000, 99999)}"
        farmer_name = "கந்தசாமி முருகன் (Kanthasamy Murugan)"

        req = VoiceFarmerRegisterRequest(
            full_name=farmer_name,
            phone=unique_phone,
            village="கபிஸ்தலம்",
            district="Thanjavur",
            state="Tamil Nadu",
            preferred_language="ta",
            password="mypassword123",
            farmlands=[
                VoiceFarmlandItem(
                    name="கந்தசாமி மருதநிலம்",
                    area_acres=3.5,
                    current_crop="Paddy (நெல்)",
                    previous_crop="Black Gram (உளுந்து)",
                    latitude=10.92,
                    longitude=79.25,
                    irrigation_type="borewell",
                    soil_type="clay_loam",
                    water_availability="medium",
                    farming_goal="high_yield"
                )
            ]
        )

        reg_res = register_farmer_voice(req, db)
        assert reg_res["status"] == "success"
        token = reg_res["access_token"]
        token_payload = decode_access_token(token)
        user_id = token_payload["sub"]
        print(f"✓ Voice registration completed: {farmer_name}, ID: {user_id}")
        assert len(reg_res['farmlands']) >= 1
        print(f"✓ Farmland automatically provisioned with ID: {reg_res['farmlands'][0]['id']}")

        print("\n--- 2. Testing Farmer Login via Mobile Number ---")
        phone_login_res = login(LoginRequest(email=unique_phone, password="mypassword123"), db)
        assert phone_login_res["status"] == "success"
        assert phone_login_res["user"]["full_name"] == farmer_name
        print(f"✓ Mobile number login verified for: {unique_phone}")

        print("\n--- 3. Testing Farmer Login via Auto-Generated Email ---")
        gen_email = f"farmer_{unique_phone[-10:]}@nilampesum.tn.gov.in"
        email_login_res = login(LoginRequest(email=gen_email, password="mypassword123"), db)
        assert email_login_res["status"] == "success"
        print(f"✓ Email login verified for: {gen_email}")

        print("\n--- 4. Testing Profile Retrieval & Scoped Farmlands ---")
        user = db.query(Profile).filter(Profile.id == user_id).first()
        profile_data = get_me(user=user)
        assert profile_data["full_name"] == farmer_name
        assert profile_data["preferred_language"] == "ta"
        assert profile_data["village"] == "கபிஸ்தலம்"
        print(f"✓ Scoped profile retrieved: {profile_data['full_name']} in {profile_data['village']}, {profile_data['district']}")

        # Verify scoped farmlands
        farmer_farms = list_farmlands(user_id=user_id, db=db)
        assert len(farmer_farms) == 1
        assert farmer_farms[0].name == "கந்தசாமி மருதநிலம்"
        assert farmer_farms[0].area_acres == 3.5
        print(f"✓ Scoped farmland loaded correctly: {farmer_farms[0].name} ({farmer_farms[0].area_acres} ac)")

        print("\n--- 5. Testing Language Preference Update & Persistence ---")
        lang_res = update_language(LanguageUpdateRequest(preferred_language="en"), user=user, db=db)
        assert lang_res["status"] == "success"
        assert lang_res["preferred_language"] == "en"
        assert user.preferred_language == "en"
        print("✓ Language updated to English and persisted in DB.")

        print("\n--- 6. Testing Demo Farmer Standard Login ---")
        demo_login_res = login(LoginRequest(email="farmer@nilampesum.tn.gov.in", password="farmer123"), db)
        assert demo_login_res["status"] == "success"
        assert demo_login_res["user"]["role"] == "farmer"
        print("✓ Demo farmer login verified with default credentials.")

        print("\n=======================================================")
        print(" ALL AUTH & ARCHITECTURE TESTS PASSED WITH 100% SUCCESS! ")
        print("=======================================================\n")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
