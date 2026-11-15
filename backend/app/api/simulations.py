from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import Farmland, ScenarioSimulation
from app.schemas.schemas import SimulationRequest, SimulationResponse
from app.analytics.simulation import run_climate_simulation

router = APIRouter(prefix="/simulations", tags=["Scenario Simulation"])

@router.post("/run", response_model=SimulationResponse)
def execute_simulation(payload: SimulationRequest, db: Session = Depends(get_db)):
    """
    Executes what-if agroclimatic scenario (e.g. -20% rainfall deficit, +1.5C temperature rise).
    Compares baseline vs simulated conditions.
    """
    farmland = db.query(Farmland).filter(Farmland.id == payload.farmland_id).first()
    if not farmland:
        raise HTTPException(status_code=404, detail="Farmland not found")

    result = run_climate_simulation(
        db=db,
        farmland=farmland,
        simulation_name=payload.simulation_name,
        rainfall_change_pct=payload.rainfall_change_pct,
        temp_change_c=payload.temp_change_c,
        irrigation_constraint=payload.irrigation_constraint
    )
    return result

@router.get("/{farmland_id}", response_model=List[SimulationResponse])
def get_simulations_for_farm(farmland_id: str, db: Session = Depends(get_db)):
    """Returns saved scenario simulations for this farmland."""
    return db.query(ScenarioSimulation).filter(
        ScenarioSimulation.farmland_id == farmland_id
    ).order_by(ScenarioSimulation.created_at.desc()).all()

