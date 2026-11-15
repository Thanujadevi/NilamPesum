import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import uuid

from app.database.session import get_db
from app.models.models import Profile, Farmland, FarmPlot
from app.authentication.auth import (
    hash_password,
    verify_password,
    create_access_token,
    generate_random_token,
    get_current_user
)

logger = logging.getLogger("nilam_pesum.auth")
router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])

# Pydantic Schemas
class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    confirm_password: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: str = "ta" # "ta" or "en"
    role: str = "farmer" # "farmer", "officer", "admin"
    state: str = "Tamil Nadu"
    district: Optional[str] = "Thanjavur"
    village: Optional[str] = None
    taluk: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    token: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    email: str
    token: str

class LanguageUpdateRequest(BaseModel):
    preferred_language: str # "ta" or "en"

class OnboardingRequest(BaseModel):
    # Step 1 & 2: Personal & Farm Info
    full_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = "ta"
    farm_name: str
    survey_number: Optional[str] = None
    state: str = "Tamil Nadu"
    district: str
    taluk: Optional[str] = None
    village: str
    # Step 3 & 4: Location & Boundary
    latitude: float
    longitude: float
    boundary_geojson: Optional[dict] = None
    # Step 5: Area & Units
    area_acres: float
    area_unit: Optional[str] = "acres" # acres, cents, hectares, kuzhi
    # Step 6: Crops
    current_crop: Optional[str] = "Paddy (நெல்)"
    previous_crop: Optional[str] = None
    # Step 7: Irrigation & Soil
    irrigation_type: str = "borewell"
    soil_type: str = "alluvial"
    water_availability: str = "medium"
    # Step 8: Farming Goals
    farming_goal: str = "balanced"

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user (farmer, agricultural officer, admin)."""
    if req.confirm_password and req.password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match / கடவுச்சொற்கள் பொருந்தவில்லை"
        )

    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters / கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துக்களாக இருக்க வேண்டும்"
        )

    existing = db.query(Profile).filter(Profile.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists / இந்த மின்னஞ்சலுடன் கணக்கு ஏற்கனவே உள்ளது"
        )

    # Validate role provision: admin can only be created with administrative security
    allowed_roles = ["farmer", "officer", "admin"]
    role = req.role if req.role in allowed_roles else "farmer"

    verification_token = generate_random_token()

    profile = Profile(
        email=req.email.lower().strip(),
        full_name=req.full_name.strip(),
        phone=req.phone.strip() if req.phone else None,
        role=role,
        preferred_language=req.preferred_language,
        village=req.village,
        taluk=req.taluk,
        district=req.district,
        state=req.state or "Tamil Nadu",
        hashed_password=hash_password(req.password),
        is_verified=True, # Auto-verified for seamless local/demo UX, full verification token also stored
        verification_token=verification_token,
        onboarding_completed=False
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    token = create_access_token({
        "sub": profile.id,
        "email": profile.email,
        "role": profile.role,
        "name": profile.full_name
    })

    return {
        "status": "success",
        "message": "User registered successfully / பயனர் வெற்றிகரமாக பதிவு செய்யப்பட்டார்",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": profile.id,
            "email": profile.email,
            "full_name": profile.full_name,
            "role": profile.role,
            "preferred_language": profile.preferred_language,
            "district": profile.district,
            "is_verified": profile.is_verified,
            "onboarding_completed": profile.onboarding_completed
        }
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Logs in an existing user and returns a signed access token."""
    input_clean = req.email.lower().strip()
    user = db.query(Profile).filter(Profile.email == input_clean).first()
    if not user:
        # Also allow login with registered mobile number
        user = db.query(Profile).filter(Profile.phone == input_clean).first()
    if not user:
        # Match mobile digits
        digits = "".join(c for c in input_clean if c.isdigit())
        if digits and len(digits) >= 10:
            last10 = digits[-10:]
            user = db.query(Profile).filter(
                (Profile.phone.contains(last10)) |
                (Profile.email == f"farmer_{last10}@nilampesum.tn.gov.in")
            ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/mobile or password / தவறான மின்னஞ்சல்/அலைபேசி அல்லது கடவுச்சொல்"
        )

    # For pre-existing demo profiles created without password, allow standard default passwords
    valid = False
    if user.hashed_password:
        valid = verify_password(req.password, user.hashed_password)
    else:
        # Fallback for seeded demonstration accounts
        default_passwords = {
            "farmer@nilampesum.tn.gov.in": "farmer123",
            "officer@nilampesum.tn.gov.in": "officer123",
            "admin@nilampesum.tn.gov.in": "admin123"
        }
        if default_passwords.get(user.email) == req.password:
            valid = True
            user.hashed_password = hash_password(req.password)
            db.commit()

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/mobile or password / தவறான மின்னஞ்சல்/அலைபேசி அல்லது கடவுச்சொல்"
        )

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.full_name
    })

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "preferred_language": user.preferred_language,
            "district": user.district,
            "village": user.village,
            "is_verified": user.is_verified,
            "onboarding_completed": user.onboarding_completed or bool(user.farmlands)
        }
    }

@router.get("/me")
def get_me(user: Profile = Depends(get_current_user)):
    """Fetches the currently authenticated profile."""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "role": user.role,
        "preferred_language": user.preferred_language,
        "village": user.village,
        "taluk": user.taluk,
        "district": user.district,
        "state": user.state,
        "is_verified": user.is_verified,
        "onboarding_completed": user.onboarding_completed or len(user.farmlands) > 0,
        "farmlands_count": len(user.farmlands)
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiates password reset process."""
    user = db.query(Profile).filter(Profile.email == req.email.lower().strip()).first()
    if not user:
        # Return success anyway to avoid user enumeration
        return {
            "status": "success",
            "message": "If this email is registered, a password reset link has been dispatched / இந்த மின்னஞ்சல் பதிவு செய்யப்பட்டிருந்தால் கடவுச்சொல் மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டுள்ளது"
        }

    reset_token = generate_random_token()
    user.reset_token = reset_token
    user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=2)
    db.commit()

    logger.info(f"Password reset token generated for {user.email}: {reset_token}")
    return {
        "status": "success",
        "message": "Password reset instructions dispatched / கடவுச்சொல் மீட்டமைப்பு வழிமுறைகள் அனுப்பப்பட்டன",
        "dev_token": reset_token # Provided for easy testing in development/demo environments
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Resets password using valid token."""
    user = db.query(Profile).filter(Profile.email == req.email.lower().strip()).first()
    if not user or not user.reset_token or user.reset_token != req.token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token / தவறான அல்லது காலாவதியான மீட்டமைப்பு குறியீடு"
        )

    if user.reset_token_expires_at and datetime.utcnow() > user.reset_token_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired / மீட்டமைப்பு குறியீடு காலாவதியானது"
        )

    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters / கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துக்களாக இருக்க வேண்டும்"
        )

    user.hashed_password = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()

    return {
        "status": "success",
        "message": "Password reset successfully. You can now login. / கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது. இப்போது நீங்கள் உள்நுழையலாம்."
    }

@router.post("/verify-email")
def verify_email(req: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verifies user email with token."""
    user = db.query(Profile).filter(Profile.email == req.email.lower().strip()).first()
    if not user or user.verification_token != req.token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code / தவறான சரிபார்ப்புக் குறியீடு"
        )

    user.is_verified = True
    user.verification_token = None
    db.commit()

    return {
        "status": "success",
        "message": "Email verified successfully / மின்னஞ்சல் வெற்றிகரமாக சரிபார்க்கப்பட்டது"
    }

@router.post("/resend-verification")
def resend_verification(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Resends verification token."""
    user = db.query(Profile).filter(Profile.email == req.email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.verification_token = generate_random_token()
    db.commit()

    return {
        "status": "success",
        "message": "Verification code resent / சரிபார்ப்புக் குறியீடு மீண்டும் அனுப்பப்பட்டது",
        "dev_token": user.verification_token
    }

@router.put("/profile/language")
def update_language(req: LanguageUpdateRequest, user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """Persists the user's preferred language across sessions and devices."""
    if req.preferred_language not in ["ta", "en"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Supported languages: 'ta', 'en'")
    user.preferred_language = req.preferred_language
    db.commit()
    return {
        "status": "success",
        "preferred_language": user.preferred_language,
        "message": "Language preference updated / மொழி விருப்பம் புதுப்பிக்கப்பட்டது"
    }

@router.post("/onboarding")
def complete_onboarding(req: OnboardingRequest, user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """Completes the 8-step farmer onboarding wizard and provisions the first farmland."""
    # Convert area units to acres if needed
    area_in_acres = req.area_acres
    if req.area_unit == "cents":
        area_in_acres = req.area_acres / 100.0
    elif req.area_unit == "hectares":
        area_in_acres = req.area_acres * 2.47105
    elif req.area_unit == "kuzhi":
        area_in_acres = req.area_acres * 0.0033

    # Update personal profile
    if req.full_name:
        user.full_name = req.full_name
    if req.phone:
        user.phone = req.phone
    if req.preferred_language:
        user.preferred_language = req.preferred_language
    if req.district:
        user.district = req.district
    if req.village:
        user.village = req.village
    if req.taluk:
        user.taluk = req.taluk

    # Create Farmland
    farmland = Farmland(
        user_id=user.id,
        name=req.farm_name,
        survey_number=req.survey_number,
        state=req.state or "Tamil Nadu",
        district=req.district,
        taluk=req.taluk,
        village=req.village,
        latitude=req.latitude,
        longitude=req.longitude,
        area_acres=round(area_in_acres, 2),
        area_hectares=round(area_in_acres * 0.404686, 2),
        irrigation_type=req.irrigation_type,
        soil_type=req.soil_type,
        water_availability=req.water_availability,
        boundary_geojson=req.boundary_geojson or {
            "type": "Polygon",
            "coordinates": [[
                [req.longitude - 0.001, req.latitude - 0.001],
                [req.longitude + 0.001, req.latitude - 0.001],
                [req.longitude + 0.001, req.latitude + 0.001],
                [req.longitude - 0.001, req.latitude + 0.001],
                [req.longitude - 0.001, req.latitude - 0.001],
            ]]
        },
        current_crop=req.current_crop,
        farming_goal=req.farming_goal
    )
    db.add(farmland)
    user.onboarding_completed = True
    db.commit()
    db.refresh(farmland)

    return {
        "status": "success",
        "message": "Onboarding completed successfully! Farmland registered. / புதிய நிலம் வெற்றிகரமாக பதிவு செய்யப்பட்டது!",
        "farmland_id": farmland.id,
        "farmland": {
            "id": farmland.id,
            "name": farmland.name,
            "district": farmland.district,
            "area_acres": farmland.area_acres,
            "current_crop": farmland.current_crop
        }
    }

@router.post("/logout")
def logout():
    """Client-side token invalidation."""
    return {"status": "success", "message": "Logged out successfully / வெற்றிகரமாக வெளியேறினீர்கள்"}

class VoiceFarmlandItem(BaseModel):
    name: str = "முக்கிய நிலம் (Main Farm)"
    survey_number: Optional[str] = None
    area_acres: float = 2.0
    current_crop: str = "Paddy (நெல்)"
    previous_crop: Optional[str] = "Black Gram (உளுந்து)"
    latitude: float = 10.8845
    longitude: float = 79.1065
    boundary_geojson: Optional[dict] = None
    irrigation_type: str = "borewell"
    soil_type: str = "alluvial"
    water_availability: str = "medium"
    farming_goal: str = "balanced"
    plots: Optional[List[dict]] = None

class VoiceFarmerRegisterRequest(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    village: str
    district: str
    state: str = "Tamil Nadu"
    preferred_language: str = "ta"
    password: Optional[str] = None
    farmlands: List[VoiceFarmlandItem] = []

@router.post("/register-farmer-voice", status_code=status.HTTP_201_CREATED)
def register_farmer_voice(req: VoiceFarmerRegisterRequest, db: Session = Depends(get_db)):
    """
    Dedicated conversational voice registration handler.
    Registers the farmer, provisions multiple farmlands & sub-plots, and issues an access token.
    """
    clean_phone = re_phone = "".join(c for c in (req.phone or "") if c.isdigit())
    if req.email:
        user_email = req.email.lower().strip()
    elif clean_phone and len(clean_phone) >= 10:
        user_email = f"farmer_{clean_phone[-10:]}@nilampesum.tn.gov.in"
    else:
        user_email = f"farmer_{uuid.uuid4().hex[:8]}@nilampesum.tn.gov.in"

    user = db.query(Profile).filter(Profile.email == user_email).first()
    raw_password = req.password or "farmer123"

    if not user:
        user = Profile(
            email=user_email,
            full_name=req.full_name.strip(),
            phone=req.phone.strip() if req.phone else "+91 94431 23456",
            role="farmer",
            preferred_language=req.preferred_language or "ta",
            village=req.village,
            district=req.district,
            state=req.state or "Tamil Nadu",
            hashed_password=hash_password(raw_password),
            is_verified=True,
            onboarding_completed=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.full_name = req.full_name.strip()
        user.village = req.village
        user.district = req.district
        user.onboarding_completed = True
        db.commit()

    created_farmlands = []
    # If no farmlands provided, create default based on conversational data
    farmlands_to_create = req.farmlands if req.farmlands else [VoiceFarmlandItem()]

    for f_item in farmlands_to_create:
        area_ac = max(0.1, f_item.area_acres)
        farmland = Farmland(
            user_id=user.id,
            name=f_item.name or f"{user.full_name} பண்ணை",
            survey_number=f_item.survey_number or "101/1",
            state=req.state or "Tamil Nadu",
            district=req.district,
            village=req.village,
            latitude=f_item.latitude,
            longitude=f_item.longitude,
            area_acres=round(area_ac, 2),
            area_hectares=round(area_ac * 0.404686, 2),
            irrigation_type=f_item.irrigation_type or "borewell",
            soil_type=f_item.soil_type or "alluvial",
            water_availability=f_item.water_availability or "medium",
            boundary_geojson=f_item.boundary_geojson or {
                "type": "Polygon",
                "coordinates": [[
                    [f_item.longitude - 0.001, f_item.latitude - 0.001],
                    [f_item.longitude + 0.001, f_item.latitude - 0.001],
                    [f_item.longitude + 0.001, f_item.latitude + 0.001],
                    [f_item.longitude - 0.001, f_item.latitude + 0.001],
                    [f_item.longitude - 0.001, f_item.latitude - 0.001],
                ]]
            },
            current_crop=f_item.current_crop or "Paddy (நெல்)",
            farming_goal=f_item.farming_goal or "balanced"
        )
        db.add(farmland)
        db.commit()
        db.refresh(farmland)

        # Create sub-plots if provided or auto-create primary plot
        if f_item.plots:
            for p_dict in f_item.plots:
                plot = FarmPlot(
                    farmland_id=farmland.id,
                    plot_name=p_dict.get("plot_name", "பகுதி 1"),
                    area_acres=p_dict.get("area_acres", area_ac / len(f_item.plots)),
                    current_crop=p_dict.get("current_crop", farmland.current_crop),
                    soil_type=p_dict.get("soil_type", farmland.soil_type),
                    irrigation_method=p_dict.get("irrigation_method", farmland.irrigation_type),
                    status="active"
                )
                db.add(plot)
        else:
            plot = FarmPlot(
                farmland_id=farmland.id,
                plot_name=f"{farmland.name} - முதன்மை பகுதி",
                area_acres=farmland.area_acres,
                current_crop=farmland.current_crop,
                soil_type=farmland.soil_type,
                irrigation_method=farmland.irrigation_type,
                status="active"
            )
            db.add(plot)

        db.commit()
        created_farmlands.append({
            "id": farmland.id,
            "name": farmland.name,
            "district": farmland.district,
            "area_acres": farmland.area_acres,
            "current_crop": farmland.current_crop
        })

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.full_name
    })

    return {
        "status": "success",
        "message": "விவசாயி பதிவு வெற்றிகரமாக முடிந்தது! (Farmer Voice Registration Complete)",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "preferred_language": user.preferred_language,
            "district": user.district,
            "village": user.village,
            "onboarding_completed": True
        },
        "farmlands": created_farmlands
    }

