import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Farmland, EnvironmentalObservation, CropRotationPlan
from app.recommendations.knowledge_base import TNAU_CROPS_CATALOG, get_crop_by_id
from app.recommendations.scoring import calculate_crop_suitability

logger = logging.getLogger("nilam_pesum.recommendations.engine")

class RecommendationEngine:
    """
    Transparent & Explainable Crop Rotation Engine.
    Grounded in Tamil Nadu Agricultural University (TNAU) agronomic practices and NASA environmental data.
    Generates 3 to 5 distinct multi-season rotation alternatives with transparent scoring.
    """

    def generate_rotation_plans(
        self,
        db: Session,
        farmland: Farmland,
        target_season: str = "Upcoming Season",
        prioritize_goal: Optional[str] = None
    ) -> List[CropRotationPlan]:
        """
        Evaluates farmland environmental indicators and produces 3-5 distinct rotation plans.
        Persists generated plans in database and returns them.
        """
        # Fetch latest NASA observations for this land
        latest_obs = db.query(EnvironmentalObservation).filter(
            EnvironmentalObservation.farmland_id == farmland.id
        ).order_by(EnvironmentalObservation.observation_date.desc()).first()

        goal = prioritize_goal or farmland.farming_goal or "balanced"

        # Candidate rotation archetypes suited for Tamil Nadu agroclimatic zones
        plans_definitions = [
            {
                "name": "Water-Resilient Millet & Pulse Rotation (நீர் சேமிப்பு சிறுதானிய சுழற்சி)",
                "type": "water_saver",
                "crops": ["finger_millet", "black_gram", "sesame"],
                "seasons": ["Adipattam (Kharif)", "Purattasipattam (Rabi)", "Chithiraipattam (Summer)"],
                "risk": "Low",
                "soil_benefit": "Reduces farm water extraction by 65% compared to continuous paddy; black gram adds 35 kg biological nitrogen per hectare.",
                "expl_en": "Designed to preserve groundwater and resist seasonal rainfall deficits using drought-hardy finger millet followed by nitrogen-fixing black gram and low-water sesame.",
                "expl_ta": "நிலத்தடி நீர் பற்றாக்குறையை சமாளிக்கும் வகையில் குறைந்த நீர் தேவைப்படும் கேழ்வரகு, உளுந்து மற்றும் எள் பயிர் சுழற்சி பரிந்துரைக்கப்படுகிறது. இது நிலத்தின் ஈரப்பதத்தை பாதுகாக்கும்."
            },
            {
                "name": "Soil Restoring Legume-Centric Cycle (மண் வளம் பெருக்கும் பயறு சுழற்சி)",
                "type": "soil_builder",
                "crops": ["groundnut", "green_gram", "finger_millet"],
                "seasons": ["Chithiraipattam", "Adipattam", "Karthigaipattam"],
                "risk": "Low",
                "soil_benefit": "Double legume sequence fixes up to 70 kg N/ha, stimulating beneficial mycorrhizal activity and improving soil aggregation.",
                "expl_en": "Prioritizes rapid soil regeneration through nitrogen-fixing groundnut and green gram, concluding with millet to scavenge residual nutrients.",
                "expl_ta": "வேர்க்கடலை மற்றும் பாசிப்பயறு மூலம் காற்றில் உள்ள தழைச்சத்தை நிலத்தில் நிலைநிறுத்தி, மண்ணின் நுண்ணுயிர் பெருக்கத்தை அதிகரித்து மண் வளத்தை மீட்கிறது."
            },
            {
                "name": "Cauvery Delta Traditional Paddy-Fallow Rotation (பாரம்பரிய சம்பா நெல் - உளுந்து சுழற்சி)",
                "type": "balanced",
                "crops": ["paddy_rice", "black_gram"],
                "seasons": ["Samba (Sep-Jan)", "Rice Fallow (Feb-Apr)"],
                "risk": "Moderate" if farmland.irrigation_type in ["canal", "borewell"] else "High",
                "soil_benefit": "Deep puddle cultivation followed by zero-tillage relay pulse utilizes residual soil moisture without extra irrigation.",
                "expl_en": "The classic Tamil Nadu wetland rotation: Samba season paddy followed by zero-till broadcast black gram to capture residual soil moisture.",
                "expl_ta": "சம்பா பருவத்தில் நெல் சாகுபடி செய்தபின், வயலில் உள்ள எஞ்சிய ஈரப்பதத்தைப் பயன்படுத்தி உழவின்றி உளுந்து விதைக்கும் பாரம்பரிய சிறந்த பயிர் முறை."
            },
            {
                "name": "Climate-Resilient Dryland Plan (வறட்சி தாங்கும் சிறுதானிய பாதுகாப்புத் திட்டம்)",
                "type": "risk_minimizer",
                "crops": ["pearl_millet", "sorghum", "black_gram"],
                "seasons": ["Chithiraipattam", "Adipattam", "Purattasipattam"],
                "risk": "Low",
                "soil_benefit": "Pearl millet and sorghum provide massive fibrous biomass residue, preventing topsoil erosion and wind desiccation.",
                "expl_en": "Tailored for rainfed or water-scarce tracts: Pearl millet and sorghum resist high ambient temperatures and dry spells.",
                "expl_ta": "குறைந்த மழைப்பொழிவு மற்றும் கடும் வெப்பநிலையைத் தாங்கி வளரக்கூடிய கம்பு மற்றும் சோளம் சாகுபடி, வறட்சி அபாயத்தை முற்றிலும் குறைக்கிறது."
            },
            {
                "name": "Diversified Commercial & Oilseed Strategy (வருவாய் பெருக்கும் எண்ணெய்வித்து சுழற்சி)",
                "type": "profit_optimizer",
                "crops": ["groundnut", "cotton", "sesame"],
                "seasons": ["Adipattam", "Purattasipattam", "Chithiraipattam"],
                "risk": "Moderate",
                "soil_benefit": "Alternates deep taprooted cotton with shallow rooted oilseeds, breaking pest cycles while diversifying income.",
                "expl_en": "Balances high market value with agronomic sustainability by alternating nitrogen-fixing groundnut with deep-rooted cotton and low-cost sesame.",
                "expl_ta": "அதிக சந்தை மதிப்புடைய வேர்க்கடலை மற்றும் பருத்தியை பயிர் செய்து, இடைக்காலத்தில் எள் பயிரிட்டு பூச்சி தாக்கத்தைக் குறைத்து நல்ல வருவாய் ஈட்டும் முறை."
            }
        ]

        # Delete previous plans for fresh recommendation
        db.query(CropRotationPlan).filter(CropRotationPlan.farmland_id == farmland.id).delete()

        created_plans = []
        for defn in plans_definitions:
            # Score each crop in the rotation
            crop_scores = []
            rotation_sequence = []
            
            for idx, c_id in enumerate(defn["crops"]):
                crop_info = get_crop_by_id(c_id)
                overall, clim, wat, soil, _ = calculate_crop_suitability(crop_info, farmland, latest_obs, goal)
                crop_scores.append((overall, clim, wat, soil))
                rotation_sequence.append({
                    "step": idx + 1,
                    "crop_id": c_id,
                    "crop_name_en": crop_info["crop_name_en"],
                    "crop_name_ta": crop_info["crop_name_ta"],
                    "season": defn["seasons"][idx % len(defn["seasons"])],
                    "duration_days": f"{crop_info['duration_days_min']}-{crop_info['duration_days_max']} days",
                    "water_req_mm": f"{crop_info['water_req_mm_min']}-{crop_info['water_req_mm_max']} mm",
                    "nitrogen_fixing": crop_info["nitrogen_fixing"],
                    "suitability_score": overall
                })

            avg_overall = sum(s[0] for s in crop_scores) / len(crop_scores)
            avg_clim = sum(s[1] for s in crop_scores) / len(crop_scores)
            avg_wat = sum(s[2] for s in crop_scores) / len(crop_scores)
            avg_soil = sum(s[3] for s in crop_scores) / len(crop_scores)

            water_desc = "Low Water (~300-500mm)" if avg_wat > 80 else ("Moderate Water (~500-800mm)" if avg_wat > 60 else "High Water (>1000mm)")

            plan = CropRotationPlan(
                farmland_id=farmland.id,
                plan_name=defn["name"],
                plan_type=defn["type"],
                rotation_sequence=rotation_sequence,
                overall_suitability_score=round(avg_overall, 1),
                climate_score=round(avg_clim, 1),
                water_score=round(avg_wat, 1),
                soil_score=round(avg_soil, 1),
                soil_health_benefit=defn["soil_benefit"],
                water_requirement_desc=water_desc,
                environmental_risk=defn["risk"],
                explanation_en=defn["expl_en"],
                explanation_ta=defn["expl_ta"],
                supporting_nasa_indicators={
                    "recent_temp_c": latest_obs.temperature_avg_c if latest_obs else 28.5,
                    "recent_precip_mm": latest_obs.precipitation_mm if latest_obs else 12.0,
                    "surface_soil_moisture": latest_obs.soil_moisture_surface if latest_obs else 0.22,
                    "data_source": "NASA POWER & SMAP"
                }
            )
            db.add(plan)
            created_plans.append(plan)

        db.commit()
        return created_plans

recommendation_engine = RecommendationEngine()

