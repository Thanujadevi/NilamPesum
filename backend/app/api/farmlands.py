import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.models import Farmland, FarmlandZone, Profile
from app.schemas.schemas import (
    FarmlandCreate, FarmlandUpdate, FarmlandResponse
)

router = APIRouter(prefix="/farmlands", tags=["Farmlands"])

def calculate_polygon_area_acres(geojson: dict) -> tuple[float, float]:
    """
    Computes approximate geodesic area in acres and hectares from GeoJSON coordinates.
    Uses spherical polygon area approximation.
    """
    if not geojson or "coordinates" not in geojson:
        return 2.5, 1.01 # Default fallback if only point specified

    try:
        coords = geojson["coordinates"]
        if geojson.get("type") == "Polygon":
            ring = coords[0]
        elif geojson.get("type") == "MultiPolygon":
            ring = coords[0][0]
        else:
            return 2.5, 1.01

        if len(ring) < 3:
            return 2.5, 1.01

        # Shoelace formula with latitude spherical scaling
        area_rad = 0.0
        r_earth = 6378137.0 # Earth radius in meters

        for i in range(len(ring) - 1):
            p1 = ring[i]
            p2 = ring[i + 1]
            lon1, lat1 = math.radians(p1[0]), math.radians(p1[1])
            lon2, lat2 = math.radians(p2[0]), math.radians(p2[1])
            area_rad += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))

        area_sq_meters = abs(area_rad * (r_earth ** 2) / 2.0)
        area_hectares = area_sq_meters / 10000.0
        area_acres = area_hectares * 2.47105

        return round(max(0.1, area_acres), 2), round(max(0.04, area_hectares), 2)
    except Exception:
        return 2.5, 1.01

@router.get("", response_model=List[FarmlandResponse])
def list_farmlands(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Lists all farmlands. If user_id provided, filters by user."""
    query = db.query(Farmland)
    if user_id:
        query = query.filter(Farmland.user_id == user_id)
    return query.order_by(Farmland.created_at.desc()).all()

@router.post("", response_model=FarmlandResponse)
def create_farmland(payload: FarmlandCreate, db: Session = Depends(get_db)):
    """Registers a new farmland with boundary polygon and GPS location."""
    # Ensure a default profile exists if user_id not provided
    user_id = payload.user_id
    if not user_id:
        default_user = db.query(Profile).filter(Profile.role == "farmer").first()
        if not default_user:
            default_user = Profile(
                email="farmer@nilampesum.tn.gov.in",
                full_name="Selvam Ramasamy",
                role="farmer",
                preferred_language="ta",
                district=payload.district,
                village=payload.village
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
        user_id = default_user.id

    # If boundary geojson provided, calculate accurate area
    acres, hectares = payload.area_acres, payload.area_hectares
    if payload.boundary_geojson:
        calc_acres, calc_ha = calculate_polygon_area_acres(payload.boundary_geojson)
        if calc_acres > 0.05:
            acres, hectares = calc_acres, calc_ha

    farmland = Farmland(
        user_id=user_id,
        name=payload.name,
        survey_number=payload.survey_number,
        state=payload.state or "Tamil Nadu",
        district=payload.district,
        taluk=payload.taluk,
        village=payload.village,
        latitude=payload.latitude,
        longitude=payload.longitude,
        area_acres=acres,
        area_hectares=hectares,
        irrigation_type=payload.irrigation_type,
        soil_type=payload.soil_type,
        water_availability=payload.water_availability,
        boundary_geojson=payload.boundary_geojson,
        current_crop=payload.current_crop,
        farming_goal=payload.farming_goal
    )
    db.add(farmland)
    db.commit()
    db.refresh(farmland)
    return farmland

@router.get("/{id}", response_model=FarmlandResponse)
def get_farmland(id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return farmland

@router.put("/{id}", response_model=FarmlandResponse)
def update_farmland(id: str, payload: FarmlandUpdate, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    update_data = payload.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(farmland, k, v)

    db.commit()
    db.refresh(farmland)
    return farmland

@router.delete("/{id}")
def delete_farmland(id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    db.delete(farmland)
    db.commit()
    return {"message": "Farmland deleted successfully", "id": id}

@router.get("/{id}/zones")
def list_zones(id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return farmland.zones

