from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import Vehicle
from backend.auth import get_current_admin_or_driver

router = APIRouter(prefix="/api/charging", tags=["Charging"])

@router.get("/schedule")
def get_charging_schedule(db: Session = Depends(get_db), current_user=Depends(get_current_admin_or_driver)):
    vehicles = db.query(Vehicle).all()
    schedule = []
    
    # Pre-populate with realistic mock fallbacks if no vehicles are in DB yet
    if not vehicles:
        mock_schedule = [
            {"id": "SCH-001", "time": "22:00", "station": "Depot A — Charger 1", "vehicle_id": "VF-002", "duration": "4h", "rate": "150 kW"},
            {"id": "SCH-002", "time": "22:30", "station": "Depot A — Charger 2", "vehicle_id": "VF-007", "duration": "3h", "rate": "150 kW"},
            {"id": "SCH-003", "time": "23:00", "station": "Depot B — Charger 1", "vehicle_id": "VF-003", "duration": "5h", "rate": "120 kW"},
            {"id": "SCH-004", "time": "01:00", "station": "Depot A — Charger 3", "vehicle_id": "VF-009", "duration": "6h", "rate": "100 kW"},
            {"id": "SCH-005", "time": "03:00", "station": "Depot B — Charger 2", "vehicle_id": "VF-005", "duration": "4h", "rate": "150 kW"},
        ]
        return mock_schedule
        
    charging_idx = 1
    for idx, v in enumerate(vehicles):
        # We schedule charging for vehicles with low battery or that are charging/idle
        if v.status in ["charging", "idle"] or v.current_soc < 70.0:
            hour = 22 + (charging_idx // 3)
            minute = (charging_idx % 3) * 30
            if hour >= 24:
                hour = hour - 24
            time_str = f"{hour:02d}:{minute:02d}"
            
            rate_str = "150 kW"
            if v.motor_power_kw and v.motor_power_kw < 100:
                rate_str = "120 kW"
                
            schedule.append({
                "id": f"SCH-{v.vehicle_id}",
                "time": time_str,
                "station": f"Depot {'A' if charging_idx % 2 == 0 else 'B'} — Charger {((charging_idx - 1) % 4) + 1}",
                "vehicle_id": v.vehicle_id,
                "duration": v.charging_time_spec or "4h",
                "rate": rate_str
            })
            charging_idx += 1
            
            # Limit schedule length to keep table compact
            if charging_idx > 8:
                break
                
    return schedule
