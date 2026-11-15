from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import date, datetime
from app.database.session import get_db
from app.models.models import (
    Farmland, FarmingActivity, CropRotationHistory, SoilHealthRecord,
    FarmExpense, HarvestRecord, Notification, Profile
)
from app.schemas.schemas import (
    FarmingActivityCreate, FarmingActivityUpdate, FarmingActivityResponse,
    SoilHealthCreate, SoilHealthResponse,
    FarmExpenseCreate, FarmExpenseResponse,
    HarvestRecordCreate, HarvestRecordResponse,
    NotificationResponse
)

router = APIRouter(prefix="", tags=["Farm Operations & Economics"])

# --- Farming Calendar Activities ---
@router.get("/calendar/{farmland_id}", response_model=List[FarmingActivityResponse])
def get_calendar_activities(farmland_id: str, db: Session = Depends(get_db)):
    return db.query(FarmingActivity).filter(
        FarmingActivity.farmland_id == farmland_id
    ).order_by(FarmingActivity.scheduled_date.asc()).all()

@router.post("/calendar", response_model=FarmingActivityResponse)
def create_calendar_activity(payload: FarmingActivityCreate, db: Session = Depends(get_db)):
    activity = FarmingActivity(
        farmland_id=payload.farmland_id,
        activity_type=payload.activity_type,
        crop_name=payload.crop_name,
        title=payload.title,
        description=payload.description,
        scheduled_date=payload.scheduled_date
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

@router.put("/calendar/{id}", response_model=FarmingActivityResponse)
def update_calendar_activity(id: str, payload: FarmingActivityUpdate, db: Session = Depends(get_db)):
    act = db.query(FarmingActivity).filter(FarmingActivity.id == id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    if payload.completed is not None:
        act.completed = payload.completed
        act.completion_date = date.today() if payload.completed else None
    if payload.title:
        act.title = payload.title
    if payload.description:
        act.description = payload.description
    db.commit()
    db.refresh(act)
    return act

# --- Crop History ---
@router.get("/crop-history/{farmland_id}")
def get_crop_history(farmland_id: str, db: Session = Depends(get_db)):
    return db.query(CropRotationHistory).filter(
        CropRotationHistory.farmland_id == farmland_id
    ).order_by(CropRotationHistory.year.desc()).all()

@router.post("/crop-history")
def record_crop_history(payload: Dict[str, Any], db: Session = Depends(get_db)):
    history = CropRotationHistory(
        farmland_id=payload["farmland_id"],
        crop_name=payload["crop_name"],
        season=payload["season"],
        year=payload["year"],
        sowing_date=datetime.strptime(payload["sowing_date"], "%Y-%m-%d").date() if payload.get("sowing_date") else None,
        harvest_date=datetime.strptime(payload["harvest_date"], "%Y-%m-%d").date() if payload.get("harvest_date") else None,
        yield_quintals=payload.get("yield_quintals"),
        fertilizer_applied=payload.get("fertilizer_applied"),
        irrigation_frequency=payload.get("irrigation_frequency"),
        observations=payload.get("observations")
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return history

# --- Soil Health and Nitrogen Tracking ---
@router.get("/soil-health/{farmland_id}", response_model=List[SoilHealthResponse])
def get_soil_health(farmland_id: str, db: Session = Depends(get_db)):
    records = db.query(SoilHealthRecord).filter(
        SoilHealthRecord.farmland_id == farmland_id
    ).order_by(SoilHealthRecord.test_date.desc()).all()
    
    result = []
    for r in records:
        # Determine status description
        n_val = r.available_nitrogen_kg_ha or 180.0
        n_status = "Optimal" if 200 <= n_val <= 350 else ("Low / Deficient" if n_val < 200 else "High")
        ph_val = r.soil_ph or 7.0
        ph_status = "Neutral" if 6.5 <= ph_val <= 7.5 else ("Acidic" if ph_val < 6.5 else "Alkaline / Saline tendency")
        
        result.append({
            "id": r.id,
            "farmland_id": r.farmland_id,
            "test_date": r.test_date,
            "soil_type": r.soil_type,
            "soil_ph": r.soil_ph,
            "organic_carbon_pct": r.organic_carbon_pct,
            "available_nitrogen_kg_ha": r.available_nitrogen_kg_ha,
            "available_phosphorus_kg_ha": r.available_phosphorus_kg_ha,
            "available_potassium_kg_ha": r.available_potassium_kg_ha,
            "indicative_n_balance_kg_ha": r.indicative_n_balance_kg_ha or 35.0,
            "npk_status_desc": f"pH: {ph_status} ({ph_val}), Available N: {n_status} ({n_val} kg/ha)",
            "notes": r.notes,
            "created_at": r.created_at
        })
    return result

@router.post("/soil-health", response_model=SoilHealthResponse)
def add_soil_health(payload: SoilHealthCreate, db: Session = Depends(get_db)):
    # Calculate indicative nitrogen balance
    n_in = payload.available_nitrogen_kg_ha or 200.0
    indicative_bal = round(n_in - 140.0, 1) # Estimated net balance after average seasonal extraction

    rec = SoilHealthRecord(
        farmland_id=payload.farmland_id,
        test_date=payload.test_date,
        soil_type=payload.soil_type,
        soil_ph=payload.soil_ph,
        organic_carbon_pct=payload.organic_carbon_pct,
        available_nitrogen_kg_ha=payload.available_nitrogen_kg_ha,
        available_phosphorus_kg_ha=payload.available_phosphorus_kg_ha,
        available_potassium_kg_ha=payload.available_potassium_kg_ha,
        indicative_n_balance_kg_ha=indicative_bal,
        notes=payload.notes
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return {
        "id": rec.id,
        "farmland_id": rec.farmland_id,
        "test_date": rec.test_date,
        "soil_type": rec.soil_type,
        "soil_ph": rec.soil_ph,
        "organic_carbon_pct": rec.organic_carbon_pct,
        "available_nitrogen_kg_ha": rec.available_nitrogen_kg_ha,
        "available_phosphorus_kg_ha": rec.available_phosphorus_kg_ha,
        "available_potassium_kg_ha": rec.available_potassium_kg_ha,
        "indicative_n_balance_kg_ha": rec.indicative_n_balance_kg_ha,
        "npk_status_desc": f"Indicative N Balance: {indicative_bal} kg/ha (Application Estimate)",
        "notes": rec.notes,
        "created_at": rec.created_at
    }

# --- Farm Economics (Expenses & Profit) ---
@router.get("/expenses/{farmland_id}", response_model=List[FarmExpenseResponse])
def get_expenses(farmland_id: str, db: Session = Depends(get_db)):
    return db.query(FarmExpense).filter(
        FarmExpense.farmland_id == farmland_id
    ).order_by(FarmExpense.expense_date.desc()).all()

@router.post("/expenses", response_model=FarmExpenseResponse)
def add_expense(payload: FarmExpenseCreate, db: Session = Depends(get_db)):
    exp = FarmExpense(
        farmland_id=payload.farmland_id,
        season=payload.season,
        year=payload.year,
        category=payload.category,
        amount_inr=payload.amount_inr,
        expense_date=payload.expense_date,
        description=payload.description
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.get("/harvests/{farmland_id}", response_model=List[HarvestRecordResponse])
def get_harvests(farmland_id: str, db: Session = Depends(get_db)):
    return db.query(HarvestRecord).filter(
        HarvestRecord.farmland_id == farmland_id
    ).order_by(HarvestRecord.harvest_date.desc()).all()

@router.post("/harvests", response_model=HarvestRecordResponse)
def record_harvest(payload: HarvestRecordCreate, db: Session = Depends(get_db)):
    total_rev = round(payload.quantity_quintals * payload.selling_price_per_quintal, 2)
    harv = HarvestRecord(
        farmland_id=payload.farmland_id,
        season=payload.season,
        year=payload.year,
        crop_name=payload.crop_name,
        quantity_quintals=payload.quantity_quintals,
        selling_price_per_quintal=payload.selling_price_per_quintal,
        total_revenue_inr=total_rev,
        harvest_date=payload.harvest_date,
        buyer_type=payload.buyer_type
    )
    db.add(harv)
    db.commit()
    db.refresh(harv)
    return harv

@router.get("/economics/{farmland_id}")
def get_farm_economics_summary(farmland_id: str, db: Session = Depends(get_db)):
    """Computes exact Profit = Total Revenue - Total Recorded Expenses."""
    expenses = db.query(FarmExpense).filter(FarmExpense.farmland_id == farmland_id).all()
    harvests = db.query(HarvestRecord).filter(HarvestRecord.farmland_id == farmland_id).all()

    total_expense = sum(e.amount_inr for e in expenses)
    total_revenue = sum(h.total_revenue_inr for h in harvests)
    net_profit = total_revenue - total_expense

    # Breakdown by category
    cat_breakdown = {}
    for e in expenses:
        cat_breakdown[e.category] = cat_breakdown.get(e.category, 0.0) + e.amount_inr

    return {
        "farmland_id": farmland_id,
        "total_expenses_inr": round(total_expense, 2),
        "total_revenue_inr": round(total_revenue, 2),
        "net_profit_inr": round(net_profit, 2),
        "expense_breakdown": [{"category": k.capitalize(), "amount": round(v, 2)} for k, v in cat_breakdown.items()],
        "profit_margin_pct": round((net_profit / total_revenue * 100), 1) if total_revenue > 0 else 0.0,
        "notes": "Calculated strictly from farmer-entered records. Nilam Pesum does not fabricate market prices."
    }

# --- Notifications & Alerts ---
@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Notification)
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    return query.order_by(Notification.created_at.desc()).limit(20).all()

@router.put("/notifications/{id}/read")
def mark_notification_read(id: str, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == id).first()
    if notif:
        notif.read = True
        db.commit()
    return {"status": "ok"}

