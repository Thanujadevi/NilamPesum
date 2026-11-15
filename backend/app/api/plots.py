import logging
from typing import Optional, List
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Farmland, FarmPlot

logger = logging.getLogger("nilam_pesum.plots")
router = APIRouter(tags=["Farm Plots & Sub-Divided Land Management"])

class PlotCreateRequest(BaseModel):
    plot_name: str
    area_acres: float
    current_crop: Optional[str] = "Paddy (நெல்)"
    sowing_date: Optional[date] = None
    soil_type: Optional[str] = "alluvial"
    irrigation_method: Optional[str] = "drip"
    boundary_geojson: Optional[dict] = None
    status: Optional[str] = "active"

class PlotUpdateRequest(BaseModel):
    plot_name: Optional[str] = None
    area_acres: Optional[float] = None
    current_crop: Optional[str] = None
    sowing_date: Optional[date] = None
    soil_type: Optional[str] = None
    irrigation_method: Optional[str] = None
    boundary_geojson: Optional[dict] = None
    status: Optional[str] = None

@router.get("/farmlands/{farmland_id}/plots")
def list_plots(farmland_id: str, db: Session = Depends(get_db)):
    """Fetches all sub-divided plots for a specific farmland."""
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    plots = db.query(FarmPlot).filter(FarmPlot.farmland_id == farmland_id).all()
    # If no plots exist yet, generate default primary plot matching farmland to ensure zero empty state
    if not plots:
        default_plot = FarmPlot(
            farmland_id=farmland_id,
            plot_name=f"{farmland.name} - முதன்மை பகுதி (Main Plot)",
            area_acres=farmland.area_acres,
            current_crop=farmland.current_crop or "Paddy (நெல்)",
            sowing_date=date.today(),
            soil_type=farmland.soil_type,
            irrigation_method=farmland.irrigation_type,
            boundary_geojson=farmland.boundary_geojson,
            status="active"
        )
        db.add(default_plot)
        db.commit()
        db.refresh(default_plot)
        plots = [default_plot]

    return {
        "status": "success",
        "farmland_id": farmland_id,
        "farmland_name": farmland.name,
        "total_farmland_area": farmland.area_acres,
        "plots_count": len(plots),
        "plots": [
            {
                "id": p.id,
                "plot_name": p.plot_name,
                "area_acres": p.area_acres,
                "current_crop": p.current_crop,
                "sowing_date": p.sowing_date.isoformat() if p.sowing_date else None,
                "soil_type": p.soil_type,
                "irrigation_method": p.irrigation_method,
                "boundary_geojson": p.boundary_geojson,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in plots
        ]
    }

@router.post("/farmlands/{farmland_id}/plots", status_code=status.HTTP_201_CREATED)
def create_plot(farmland_id: str, req: PlotCreateRequest, db: Session = Depends(get_db)):
    """Creates a new sub-divided plot on a farmland."""
    farmland = db.query(Farmland).filter(Farmland.id == farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    plot = FarmPlot(
        farmland_id=farmland_id,
        plot_name=req.plot_name,
        area_acres=req.area_acres,
        current_crop=req.current_crop,
        sowing_date=req.sowing_date or date.today(),
        soil_type=req.soil_type or farmland.soil_type,
        irrigation_method=req.irrigation_method or farmland.irrigation_type,
        boundary_geojson=req.boundary_geojson,
        status=req.status or "active"
    )
    db.add(plot)
    db.commit()
    db.refresh(plot)

    return {
        "status": "success",
        "message": "Farm plot created / புதிய நிலப்பகுதி சேர்க்கப்பட்டது",
        "plot": {
            "id": plot.id,
            "plot_name": plot.plot_name,
            "area_acres": plot.area_acres,
            "current_crop": plot.current_crop,
            "sowing_date": plot.sowing_date.isoformat() if plot.sowing_date else None,
            "soil_type": plot.soil_type,
            "irrigation_method": plot.irrigation_method,
            "boundary_geojson": plot.boundary_geojson,
            "status": plot.status
        }
    }

@router.put("/plots/{plot_id}")
def update_plot(plot_id: str, req: PlotUpdateRequest, db: Session = Depends(get_db)):
    """Updates an existing plot's details, crop or boundaries."""
    plot = db.query(FarmPlot).filter(FarmPlot.id == plot_id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    if req.plot_name is not None:
        plot.plot_name = req.plot_name
    if req.area_acres is not None:
        plot.area_acres = req.area_acres
    if req.current_crop is not None:
        plot.current_crop = req.current_crop
    if req.sowing_date is not None:
        plot.sowing_date = req.sowing_date
    if req.soil_type is not None:
        plot.soil_type = req.soil_type
    if req.irrigation_method is not None:
        plot.irrigation_method = req.irrigation_method
    if req.boundary_geojson is not None:
        plot.boundary_geojson = req.boundary_geojson
    if req.status is not None:
        plot.status = req.status

    db.commit()
    db.refresh(plot)

    return {
        "status": "success",
        "message": "Plot updated / நிலப்பகுதி புதுப்பிக்கப்பட்டது",
        "plot": {
            "id": plot.id,
            "plot_name": plot.plot_name,
            "area_acres": plot.area_acres,
            "current_crop": plot.current_crop,
            "status": plot.status
        }
    }

@router.delete("/plots/{plot_id}")
def delete_plot(plot_id: str, db: Session = Depends(get_db)):
    """Deletes a sub-divided plot."""
    plot = db.query(FarmPlot).filter(FarmPlot.id == plot_id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    db.delete(plot)
    db.commit()
    return {"status": "success", "message": "Plot deleted / நிலப்பகுதி நீக்கப்பட்டது"}

