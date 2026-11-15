import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal
from app.api.voice import interpret_farmer_voice, ConversationalInterpretRequest
from app.api.auth import register_farmer_voice, VoiceFarmerRegisterRequest, VoiceFarmlandItem
from app.models.models import Profile, Farmland, FarmPlot

def test_conversational_voice_registration():
    print("\n--- 1. Testing Intelligent Conversational Voice Interpret & Follow-Ups ---")

    # Step 1: Name
    res1 = interpret_farmer_voice(ConversationalInterpretRequest(
        step_id="personal_name",
        spoken_text="என் பெயர் செல்வம் ராமசாமி"
    ))
    assert res1["extracted_entities"]["full_name"] == "செல்வம் ராமசாமி"
    print(f"✓ Step 1 (Name): Extracted '{res1['extracted_entities']['full_name']}' -> Next Q: {res1['spoken_response_ta']}")

    # Step 2: Location
    res2 = interpret_farmer_voice(ConversationalInterpretRequest(
        step_id="personal_location",
        spoken_text="தஞ்சாவூர் மாவட்டம் திருவையாறு கிராமம்"
    ))
    assert res2["extracted_entities"]["district"] == "Thanjavur"
    print(f"✓ Step 2 (Location): Extracted District '{res2['extracted_entities']['district']}'")

    # Step 3: Acres (Example A Follow-up)
    res3 = interpret_farmer_voice(ConversationalInterpretRequest(
        step_id="acres",
        spoken_text="என்னிடம் இரண்டு ஏக்கர் நிலம் உள்ளது"
    ))
    assert res3["extracted_entities"]["area_acres"] == 2.0
    assert "ஒரே பயிர்" in res3["spoken_response_ta"]
    print(f"✓ Step 3 (Acres & Follow-up A): Extracted 2.0 Acres -> Follow-up generated: '{res3['spoken_response_ta']}'")

    # Step 4: Crops (Example B Follow-up: Multiple crops)
    res4 = interpret_farmer_voice(ConversationalInterpretRequest(
        step_id="acres_crop_split",
        spoken_text="நெல் மற்றும் வாழை பயிரிடுகிறேன்"
    ))
    assert len(res4["extracted_entities"]["crops"]) >= 2
    print(f"✓ Step 4 (Crops & Follow-up B): Detected crops {res4['extracted_entities']['crops']}")

    # Step 5: Irrigation (Example C Follow-up: Well water summer shortage)
    res5 = interpret_farmer_voice(ConversationalInterpretRequest(
        step_id="irrigation",
        spoken_text="கிணற்று நீர் பயன்படுத்துகிறேன்"
    ))
    assert res5["extracted_entities"]["irrigation_type"] == "open_well"
    assert "கோடை காலத்திலும்" in res5["spoken_response_ta"]
    print(f"✓ Step 5 (Irrigation & Follow-up C): Open Well detected -> Follow-up: '{res5['spoken_response_ta']}'")

    # Step 6: Soil with Unknown Answer (Example D Follow-up)
    res6 = interpret_farmer_voice(ConversationalInterpretRequest(
        step_id="soil",
        spoken_text="எனக்கு மண் வகை தெரியாது"
    ))
    assert res6["extracted_entities"]["soil_known"] is False
    assert "பரவாயில்லை" in res6["spoken_response_ta"]
    print(f"✓ Step 6 (Unknown Soil & Follow-up D): Detected unknown response -> Reassurance generated: '{res6['spoken_response_ta'][:60]}...'")

    # Step 7: Multiple Farms (Example E Follow-up)
    res7 = interpret_farmer_voice(ConversationalInterpretRequest(
        step_id="multiple_farms",
        spoken_text="ஆம் எனக்கு இன்னொரு நிலமும் உள்ளது"
    ))
    assert res7["extracted_entities"]["has_additional_farms"] is True
    print(f"✓ Step 7 (Multiple Farms & Map Trigger): Transitioned to '{res7['next_step']}'")

    # Step 8: Dynamic Rainfall Dependency Follow-Up
    res8 = interpret_farmer_voice(ConversationalInterpretRequest(
        step_id="irrigation",
        spoken_text="மழை நம்பிதான் விவசாயம் செய்கிறேன் மானாவாரி நிலம்"
    ))
    assert res8["extracted_entities"]["irrigation_type"] == "rainfed"
    assert "மானாவாரி விவசாயமா" in res8["spoken_response_ta"]
    print(f"✓ Step 8 (Rainfall Dependency Follow-Up): Detected Rainfed -> Follow-up: '{res8['spoken_response_ta']}'")

    # Step 9: Farming Practices
    res9 = interpret_farmer_voice(ConversationalInterpretRequest(
        step_id="farming_practices",
        spoken_text="நாங்கள் இயற்கை விவசாயம் செய்கிறோம் ஜீவாமிர்தம் பயன்படுத்துகிறோம்"
    ))
    assert res9["extracted_entities"]["farming_practice"] == "organic"
    print(f"✓ Step 9 (Farming Practices): Detected Organic -> Practice: '{res9['extracted_entities']['farming_practice']}'")

    # Step 10: Unclear / Rephrase Handling
    res10 = interpret_farmer_voice(ConversationalInterpretRequest(
        step_id="acres",
        spoken_text=""
    ))
    assert res10["status"] == "unclear"
    assert "மன்னிக்கவும்" in res10["spoken_response_ta"]
    print(f"✓ Step 10 (Unclear Response Rephrasing): Handled gracefully with rephrase: '{res10['spoken_response_ta']}'")

    print("\n--- 2. Testing Conversational Voice Registration & Account Provisioning ---")
    db = SessionLocal()
    try:
        reg_payload = VoiceFarmerRegisterRequest(
            full_name="மருதுபாண்டி (Marudhu Pandi)",
            phone="+91 94422 99881",
            village="மயிலாடுதுறை",
            district="Mayiladuthurai",
            state="Tamil Nadu",
            preferred_language="ta",
            password="farmersecret",
            farmlands=[
                VoiceFarmlandItem(
                    name="மருதுபாண்டி நன்செய்",
                    area_acres=3.0,
                    current_crop="Paddy (நெல்)",
                    irrigation_type="canal",
                    soil_type="alluvial"
                )
            ]
        )
        reg_res = register_farmer_voice(reg_payload, db)
        assert reg_res["status"] == "success"
        assert "access_token" in reg_res
        user_id = reg_res["user"]["id"]

        # Verify database record
        user_profile = db.query(Profile).filter(Profile.id == user_id).first()
        assert user_profile is not None
        assert user_profile.role == "farmer"
        assert len(user_profile.farmlands) >= 1
        assert len(user_profile.farmlands[0].plots) >= 1
        print(f"✓ Farmer registered: {user_profile.full_name}, Farmland: {user_profile.farmlands[0].name} ({user_profile.farmlands[0].area_acres} ac), Plots: {len(user_profile.farmlands[0].plots)}")

        print("\n===================================================================")
        print(" ALL CONVERSATIONAL VOICE REGISTRATION VERIFICATIONS PASSED 100%! ")
        print("===================================================================\n")
    finally:
        db.close()

if __name__ == "__main__":
    test_conversational_voice_registration()

