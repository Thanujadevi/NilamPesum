from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Farmland
from app.analytics.weather_analytics import get_weather_analytics
from app.analytics.soil_analytics import get_soil_moisture_analytics
from app.analytics.vegetation_analytics import get_vegetation_analytics
from app.analytics.farm_health import calculate_farm_health_score
from app.analytics.historical import get_ten_year_historical_analysis

router = APIRouter(prefix="/analytics", tags=["Agricultural & Environmental Analytics"])

@router.get("/weather/{farmland_id}")
def weather_analysis(farmland_id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return get_weather_analytics(db, farmland)

@router.get("/soil-moisture/{farmland_id}")
def soil_moisture_analysis(farmland_id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return get_soil_moisture_analytics(db, farmland)

@router.get("/vegetation/{farmland_id}")
def vegetation_analysis(farmland_id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return get_vegetation_analytics(db, farmland)

@router.get("/land-health/{farmland_id}")
def land_health_score(farmland_id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return calculate_farm_health_score(db, farmland)

@router.get("/historical/{farmland_id}")
def historical_analysis(farmland_id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return get_ten_year_historical_analysis(db, farmland)

