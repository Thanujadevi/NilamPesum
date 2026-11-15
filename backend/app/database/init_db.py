import logging
from datetime import date, datetime, timedelta
from sqlalchemy import text
from app.database.session import engine, Base, SessionLocal
from app.models.models import (
    Profile, Farmland, FarmlandZone, NasaDataSource, CropKnowledgeBase,
    EnvironmentalObservation, FarmingActivity, SoilHealthRecord, Notification
)
from app.recommendations.knowledge_base import TNAU_CROPS_CATALOG

logger = logging.getLogger("nilam_pesum.init_db")

NASA_SOURCES_CATALOG = [
    {
        "id": "nasa_power",
        "name": "NASA Prediction Of Worldwide Energy Resources (POWER)",
        "agency": "NASA",
        "center": "NASA Langley Research Center (LaRC)",
        "official_url": "https://power.larc.nasa.gov/docs/services/api/",
        "data_type": "Meteorological & Agroclimatological Parameters (Solar, Temp, Precip, RH)",
        "spatial_resolution": "0.5° x 0.625° (~50km)",
        "temporal_resolution": "Daily",
        "historical_coverage": "1981 to Present (~43 years)",
        "auth_required": False,
        "description": "NASA POWER provides solar and meteorological datasets derived from NASA assimilation models and satellite observations specifically tailored for agricultural and renewable energy modeling."
    },
    {
        "id": "nasa_gpm_imerg",
        "name": "NASA Global Precipitation Measurement (GPM) - IMERG",
        "agency": "NASA / JAXA",
        "center": "NASA Goddard Space Flight Center (GSFC)",
        "official_url": "https://gpm.nasa.gov/data/imerg",
        "data_type": "Satellite-Derived Precipitation Monitoring (IMERG Final Run)",
        "spatial_resolution": "0.1° x 0.1° (~10km)",
        "temporal_resolution": "Daily & Monthly Summaries",
        "historical_coverage": "2000 to Present",
        "auth_required": True,
        "description": "The Integrated Multi-satellitE Retrievals for GPM (IMERG) combines precipitation estimates from an international constellation of satellites with surface gauge analyses."
    },
    {
        "id": "nasa_smap",
        "name": "NASA Soil Moisture Active Passive (SMAP)",
        "agency": "NASA",
        "center": "Jet Propulsion Laboratory (JPL) / GSFC",
        "official_url": "https://nsidc.org/data/smap",
        "data_type": "Satellite Radiometer Surface (0-5cm) & Root-Zone (0-100cm) Soil Moisture",
        "spatial_resolution": "9km / 36km",
        "temporal_resolution": "2-3 days revisit",
        "historical_coverage": "2015 to Present",
        "auth_required": True,
        "description": "NASA SMAP measures the amount of water in topsoil globally using L-band microwave radiometry, with Level-4 data assimilation providing root-zone soil moisture estimates."
    },
    {
        "id": "nasa_modis",
        "name": "NASA MODIS (Moderate Resolution Imaging Spectroradiometer)",
        "agency": "NASA",
        "center": "NASA GSFC / Land Processes DAAC",
        "official_url": "https://modis.gsfc.nasa.gov/data/",
        "data_type": "Vegetation Indices (NDVI, EVI) from Terra & Aqua satellites",
        "spatial_resolution": "250m / 500m",
        "temporal_resolution": "16-Day Composite",
        "historical_coverage": "2000 to Present",
        "auth_required": True,
        "description": "MODIS MOD13Q1/MYD13Q1 provides global Normalized Difference Vegetation Index (NDVI) and Enhanced Vegetation Index (EVI) with rigorous cloud masking and quality assurance flags."
    },
    {
        "id": "nasa_hls",
        "name": "NASA Harmonized Landsat and Sentinel-2 (HLS)",
        "agency": "NASA / USGS / ESA",
        "center": "NASA GSFC / LP DAAC (Earthdata Cloud)",
        "official_url": "https://hls.gsfc.nasa.gov/data-access-and-tools/",
        "data_type": "High-Resolution Surface Reflectance and Multi-Spectral Vegetation Indices",
        "spatial_resolution": "30 meters",
        "temporal_resolution": "2 to 3 days revisit",
        "historical_coverage": "2013 to Present",
        "auth_required": True,
        "description": "NASA HLS seamlessly harmonizes optical surface reflectance measurements from Landsat 8/9 and Copernicus Sentinel-2A/2B into a consistent 30-meter gridded dataset for field-scale monitoring."
    },
    {
        "id": "nasa_merra2",
        "name": "NASA MERRA-2 Atmospheric Reanalysis",
        "agency": "NASA",
        "center": "NASA GSFC GMAO",
        "official_url": "https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/",
        "data_type": "Atmospheric Reanalysis & Long-Term Climate Baseline",
        "spatial_resolution": "0.5° x 0.625°",
        "temporal_resolution": "Hourly, Daily, Monthly",
        "historical_coverage": "1980 to Present",
        "auth_required": True,
        "description": "MERRA-2 is a modern atmospheric reanalysis coupling atmospheric dynamics with space-based observations of aerosol, temperature, moisture, and wind fields."
    }
]

def init_database():
    """Initializes tables and seeds reference data."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # Ensure backward-compatible schema migration for SQLite columns
    with engine.connect() as conn:
        try:
            res = conn.execute(text("PRAGMA table_info(profiles)"))
            existing_cols = {row[1] for row in res.fetchall()}
            missing_cols = [
                ("hashed_password", "VARCHAR"),
                ("reset_token", "VARCHAR"),
                ("reset_token_expires_at", "DATETIME"),
                ("verification_token", "VARCHAR"),
                ("is_verified", "BOOLEAN DEFAULT 1"),
                ("onboarding_completed", "BOOLEAN DEFAULT 0")
            ]
            for col_name, col_type in missing_cols:
                if col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE profiles ADD COLUMN {col_name} {col_type}"))
            conn.commit()
        except Exception as mig_err:
            logger.warning(f"Schema migration check: {mig_err}")

    db = SessionLocal()

    try:
        # 1. Seed NASA Data Sources
        for s in NASA_SOURCES_CATALOG:
            existing = db.query(NasaDataSource).filter(NasaDataSource.id == s["id"]).first()
            if not existing:
                db.add(NasaDataSource(**s))
        db.commit()

        # 2. Seed TNAU Crop Knowledge Base
        for c in TNAU_CROPS_CATALOG:
            existing_crop = db.query(CropKnowledgeBase).filter(CropKnowledgeBase.id == c["id"]).first()
            if not existing_crop:
                db.add(CropKnowledgeBase(
                    id=c["id"],
                    crop_name_en=c["crop_name_en"],
                    crop_name_ta=c["crop_name_ta"],
                    scientific_name=c.get("scientific_name"),
                    category=c["category"],
                    duration_days_min=c["duration_days_min"],
                    duration_days_max=c["duration_days_max"],
                    suitable_seasons=c["suitable_seasons"],
                    water_req_mm_min=c["water_req_mm_min"],
                    water_req_mm_max=c["water_req_mm_max"],
                    temp_optimal_c_min=c["temp_optimal_c_min"],
                    temp_optimal_c_max=c["temp_optimal_c_max"],
                    soil_preference=c["soil_preference"],
                    ph_min=c["ph_min"],
                    ph_max=c["ph_max"],
                    drought_tolerance=c.get("drought_tolerance", "medium"),
                    nitrogen_fixing=c.get("nitrogen_fixing", False),
                    estimated_n_req_kg_ha=c.get("estimated_n_req_kg_ha"),
                    estimated_p_req_kg_ha=c.get("estimated_p_req_kg_ha"),
                    estimated_k_req_kg_ha=c.get("estimated_k_req_kg_ha"),
                    compatible_preceding_crops=c.get("compatible_preceding_crops"),
                    incompatible_preceding_crops=c.get("incompatible_preceding_crops"),
                    soil_health_benefit=c.get("soil_health_benefit"),
                    reference_institution=c.get("reference_institution"),
                    reference_url=c.get("reference_url")
                ))
        db.commit()

        # 3. Create Default Demonstration Farmer Profile & Farmland in Tamil Nadu
        farmer = db.query(Profile).filter(Profile.email == "farmer@nilampesum.tn.gov.in").first()
        if not farmer:
            farmer = Profile(
                email="farmer@nilampesum.tn.gov.in",
                full_name="Selvam Ramasamy (செல்வம் ராமசாமி)",
                phone="+91 94431 23456",
                role="farmer",
                preferred_language="ta",
                village="Thiruvaiyaru (திருவையாறு)",
                taluk="Thiruvaiyaru",
                district="Thanjavur",
                state="Tamil Nadu"
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

        # Demonstration Farmland in Cauvery Delta (Thanjavur)
        farm = db.query(Farmland).filter(Farmland.user_id == farmer.id).first()
        if not farm:
            farm = Farmland(
                user_id=farmer.id,
                name="Semmozhi Nilam (செம்மொழி நன்செய் நிலம்)",
                survey_number="142/3A",
                state="Tamil Nadu",
                district="Thanjavur",
                taluk="Thiruvaiyaru",
                village="Thiruvaiyaru",
                latitude=10.8845,
                longitude=79.1065,
                area_acres=3.5,
                area_hectares=1.42,
                irrigation_type="canal",
                soil_type="alluvial",
                water_availability="medium",
                boundary_geojson={
                    "type": "Polygon",
                    "coordinates": [[
                        [79.1055, 10.8840],
                        [79.1075, 10.8842],
                        [79.1072, 10.8855],
                        [79.1052, 10.8852],
                        [79.1055, 10.8840]
                    ]]
                },
                current_crop="நெல் (Paddy - Samba)",
                farming_goal="save_water"
            )
            db.add(farm)
            db.commit()
            db.refresh(farm)

            # Seed zones
            zone1 = FarmlandZone(
                farmland_id=farm.id,
                zone_name="North Wet Sector (வடக்கு நன்செய் பகுதி)",
                zone_area_acres=2.0,
                relative_elevation="Low-lying",
                soil_variation="Heavy Alluvial Clay",
                boundary_geojson=None
            )
            zone2 = FarmlandZone(
                farmland_id=farm.id,
                zone_name="South High Sector (தெற்கு மேட்டு பகுதி)",
                zone_area_acres=1.5,
                relative_elevation="Slightly Elevated",
                soil_variation="Sandy Clay Loam",
                boundary_geojson=None
            )
            db.add_all([zone1, zone2])

            # Seed activities in farming calendar
            today = date.today()
            act1 = FarmingActivity(
                farmland_id=farm.id,
                activity_type="sowing",
                crop_name="கேழ்வரகு (Ragi)",
                title="Sowing & Nursery Bed Preparation",
                description="Broadcast seeds with 5kg/acre Azospirillum bio-fertilizer treatment.",
                scheduled_date=today + timedelta(days=3),
                completed=False
            )
            act2 = FarmingActivity(
                farmland_id=farm.id,
                activity_type="irrigation",
                crop_name="நெல் (Paddy)",
                title="Field Drainage for Intermittent Aeration",
                description="Alternate wetting and drying (AWD) cycle to conserve water.",
                scheduled_date=today + timedelta(days=8),
                completed=False
            )
            db.add_all([act1, act2])

            # Seed soil health record
            soil_rec = SoilHealthRecord(
                farmland_id=farm.id,
                test_date=today - timedelta(days=45),
                soil_type="Alluvial Loam",
                soil_ph=7.1,
                organic_carbon_pct=0.68,
                available_nitrogen_kg_ha=235.0,
                available_phosphorus_kg_ha=18.5,
                available_potassium_kg_ha=260.0,
                indicative_n_balance_kg_ha=42.0,
                notes="Tested by District Soil Testing Laboratory, Thanjavur. Balanced pH, moderate organic carbon."
            )
            db.add(soil_rec)

            # Seed Notifications
            notif1 = Notification(
                user_id=farmer.id,
                farmland_id=farm.id,
                title_en="NASA Observations Ready for Analysis",
                title_ta="நாசா செயற்கைக்கோள் தரவுகள் புதுப்பிக்கப்பட்டன",
                message_en="NASA POWER and SMAP observations for Thanjavur are synchronized.",
                message_ta="தஞ்சாவூர் பகுதிக்கான நாசா வானிலை மற்றும் மண் ஈரப்பதத் தரவுகள் வெற்றிகரமாக பதிவிறக்கப்பட்டன.",
                category="system",
                severity="info",
                data_source_id="nasa_power",
                observation_date=today
            )
            notif2 = Notification(
                user_id=farmer.id,
                farmland_id=farm.id,
                title_en="Residual Moisture Crop Rotation Recommended",
                title_ta="மழைக்காலத்திற்கு பிந்தைய பயிர் சுழற்சி பரிந்துரை",
                message_en="TNAU Black Gram / Green Gram rotation suggested to capture residual root-zone moisture.",
                message_ta="மண்ணில் உள்ள ஈரப்பதத்தை பயன்படுத்தி உளுந்து அல்லது பாசிப்பயறு விதைக்க பரிந்துரைக்கப்படுகிறது.",
                category="rainfall_anomaly",
                severity="warning",
                data_source_id="nasa_smap",
                observation_date=today
            )
            db.add_all([notif1, notif2])
            db.commit()

        logger.info("Database initialized successfully with authentic reference data.")

    finally:
        db.close()

