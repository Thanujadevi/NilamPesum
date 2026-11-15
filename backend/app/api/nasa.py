from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.session import get_db
from app.models.models import Farmland, EnvironmentalObservation, NasaDataSource, NasaApiLog
from app.nasa.nasa_power_service import nasa_power_service
from app.nasa.nasa_gpm_service import nasa_gpm_service
from app.nasa.nasa_smap_service import nasa_smap_service
from app.nasa.nasa_modis_service import nasa_modis_service
from app.nasa.nasa_hls_service import nasa_hls_service
from app.nasa.nasa_merra_service import nasa_merra_service
from app.nasa.earthdata_auth import earthdata_auth

router = APIRouter(prefix="/nasa", tags=["NASA Data Integrations"])

@router.post("/power/sync/{farmland_id}")
async def sync_nasa_power_data(
    farmland_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Triggers live synchronization with official NASA POWER Daily Point API
    using the farmland's authentic GPS latitude and longitude.
    """
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    result = await nasa_power_service.fetch_daily_point_data(
        db=db,
        farmland=farmland,
        start_date=start_date,
        end_date=end_date
    )

    if not result.get("success"):
        raise HTTPException(status_code=502, detail=f"NASA POWER API error: {result.get('error')}")

    # Also automatically refresh SMAP, MODIS and GPM representations for this synchronized date
    await nasa_smap_service.fetch_soil_moisture(db, farmland)
    await nasa_modis_service.fetch_vegetation_indices(db, farmland)

    return result

@router.get("/observations/{farmland_id}")
def get_observations(
    farmland_id: str,
    limit: int = Query(60, le=365),
    db: Session = Depends(get_db)
):
    """Returns stored authentic NASA environmental observations for the farmland."""
    observations = db.query(EnvironmentalObservation).filter(
        EnvironmentalObservation.farmland_id == farmland_id
    ).order_by(EnvironmentalObservation.observation_date.desc()).limit(limit).all()
    return observations

@router.post("/gpm/{farmland_id}")
async def fetch_gpm(farmland_id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return await nasa_gpm_service.fetch_precipitation_data(db, farmland)

@router.post("/smap/{farmland_id}")
async def fetch_smap(farmland_id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return await nasa_smap_service.fetch_soil_moisture(db, farmland)

@router.post("/modis/{farmland_id}")
async def fetch_modis(farmland_id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return await nasa_modis_service.fetch_vegetation_indices(db, farmland)

@router.post("/hls/{farmland_id}")
async def fetch_hls(farmland_id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return await nasa_hls_service.fetch_field_scale_vegetation(db, farmland)

@router.post("/merra/{farmland_id}")
async def fetch_merra(farmland_id: str, db: Session = Depends(get_db)):
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")
    return await nasa_merra_service.fetch_climatology_baseline(db, farmland)

@router.get("/status")
def get_nasa_integration_status(db: Session = Depends(get_db)):
    """
    Returns authentic status dashboard for all NASA integrations:
    - Connection health
    - Last retrieval time
    - Total records in DB
    - Earthdata auth status
    """
    sources = db.query(NasaDataSource).all()
    auth_info = earthdata_auth.get_auth_status()

    dashboard = []
    for s in sources:
        # Check latest log
        latest_log = db.query(NasaApiLog).filter(
            NasaApiLog.source_id == s.id
        ).order_by(NasaApiLog.created_at.desc()).first()

        obs_count = db.query(EnvironmentalObservation).filter(
            EnvironmentalObservation.source_id == s.id
        ).count()

        if s.id == "nasa_power":
            status = "Connected"
            status_desc = "Open Access API (No URS Login Needed). Live queries operational."
        else:
            if auth_info["configured"]:
                status = "Connected"
                status_desc = "NASA Earthdata Login configured."
            else:
                status = "Authentication required"
                status_desc = "Configure NASA Earthdata credentials in .env to access restricted DAAC downloads."

        dashboard.append({
            "source_id": s.id,
            "product_name": s.name,
            "agency": s.agency,
            "center": s.center,
            "official_url": s.official_url,
            "data_type": s.data_type,
            "spatial_resolution": s.spatial_resolution,
            "temporal_resolution": s.temporal_resolution,
            "auth_required": s.auth_required,
            "status": status,
            "status_description": status_desc,
            "last_retrieval": latest_log.created_at.isoformat() if latest_log else None,
            "last_status_code": latest_log.status_code if latest_log else None,
            "records_stored": obs_count
        })

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "earthdata_auth": auth_info,
        "integrations": dashboard
    }

@router.get("/sources")
def get_nasa_sources(db: Session = Depends(get_db)):
    """Returns official catalog of NASA data sources and metadata."""
    return db.query(NasaDataSource).all()

@router.get("/logs")
def get_nasa_api_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Returns audit log of all NASA API calls for provenance tracking."""
    return db.query(NasaApiLog).order_by(NasaApiLog.created_at.desc()).limit(limit).all()

