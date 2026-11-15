from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.models.models import Farmland, CropRotationPlan
from app.schemas.schemas import RecommendationRequest, CropRotationPlanResponse
from app.recommendations.engine import recommendation_engine
from app.recommendations.knowledge_base import TNAU_CROPS_CATALOG

router = APIRouter(prefix="/recommendations", tags=["Crop Recommendations"])

@router.post("/generate", response_model=List[CropRotationPlanResponse])
def generate_recommendations(payload: RecommendationRequest, db: Session = Depends(get_db)):
    """
    Generates 3 to 5 explainable crop rotation alternatives grounded in
    NASA environmental observations, soil constraints, and TNAU agronomic rules.
    """
    farmland = db.query(Farmland).filter(Farmland.id == payload.farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    plans = recommendation_engine.generate_rotation_plans(
        db=db,
        farmland=farmland,
        target_season=payload.target_season or "Next Season",
        prioritize_goal=payload.prioritize_goal
    )
    return plans

@router.get("/{farmland_id}", response_model=List[CropRotationPlanResponse])
def get_existing_recommendations(farmland_id: str, db: Session = Depends(get_db)):
    """Fetches previously generated crop rotation plans for the farmland."""
    plans = db.query(CropRotationPlan).filter(
        CropRotationPlan.farmland_id == farmland_id
    ).order_by(CropRotationPlan.overall_suitability_score.desc()).all()

    if not plans:
        # If none exist yet, automatically generate them
        farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
        if farmland:
            return recommendation_engine.generate_rotation_plans(db, farmland)
    return plans

@router.get("/knowledge/crops")
def list_crop_knowledge():
    """Returns official TNAU/ICAR crop catalog with agronomic limits."""
    return TNAU_CROPS_CATALOG

