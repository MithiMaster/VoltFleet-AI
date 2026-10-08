from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import math
import random
from typing import List

from backend.database import get_db
from backend.models import Vehicle, TripLog, RevenueLog
from backend.auth import get_current_admin, get_current_admin_or_driver

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db), current_user=Depends(get_current_admin_or_driver)):
    vehicles = db.query(Vehicle).all()
    total_vehicles = len(vehicles)
    
    active = sum(1 for v in vehicles if v.status in ["driving", "active"])
    charging = sum(1 for v in vehicles if v.status == "charging")
    offline = sum(1 for v in vehicles if v.status == "offline")
    
    # Average battery health
    avg_battery_health = 0
    if total_vehicles > 0:
        avg_battery_health = int(sum(v.battery_health for v in vehicles) / total_vehicles)
    
    fleet_health_score = avg_battery_health if avg_battery_health > 0 else 94
    
    # Calculate MTD Revenue
    now = datetime.utcnow()
    start_of_month = datetime(now.year, now.month, 1)
    revenue_sum = db.query(func.sum(RevenueLog.amount)).filter(RevenueLog.logged_at >= start_of_month).scalar() or 0.0
    # Seed with some realistic baseline if db has no current month data
    if revenue_sum == 0.0:
        revenue_sum = 24800.0  # Seed value
    revenue_mtd = f"${revenue_sum / 1000:.1f}K"
    
    # Calculate energy today
    start_of_today = datetime(now.year, now.month, now.day)
    energy_sum = db.query(func.sum(TripLog.energy_consumed_kwh)).filter(TripLog.time >= start_of_today).scalar() or 0.0
    if energy_sum == 0.0:
        energy_sum = 4820.0  # Seed value
    energy_today = f"{int(energy_sum):,} kWh"
    
    return {
        "total_vehicles": total_vehicles if total_vehicles > 0 else 12,
        "active": active if active > 0 else 8,
        "charging": charging if charging > 0 else 2,
        "offline": offline if offline > 0 else 1,
        "fleet_health_score": fleet_health_score,
        "revenue_mtd": revenue_mtd,
        "energy_today": energy_today,
        "avg_battery_health": avg_battery_health if avg_battery_health > 0 else 92
    }

@router.get("/energy-trend")
def get_energy_trend(db: Session = Depends(get_db), current_user=Depends(get_current_admin_or_driver)):
    # Return 24 hourly points
    trend = []
    random.seed(42)  # For consistent mock behavior
    for i in range(24):
        # Base formula matching original mock-data.ts
        base_energy = 40 + math.sin(i / 3) * 18 + random.random() * 12
        base_cost = 8 + math.sin(i / 3) * 4 + random.random() * 3
        trend.append({
            "hour": f"{i:02d}:00",
            "energy": round(base_energy),
            "cost": round(base_cost)
        })
    return trend

@router.get("/fleet-activity")
def get_fleet_activity(db: Session = Depends(get_db), current_user=Depends(get_current_admin_or_driver)):
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    random.seed(10)
    activity = []
    for i, d in enumerate(days):
        activity.append({
            "day": d,
            "active": 32 + round(random.random() * 8),
            "charging": 6 + round(random.random() * 4),
            "offline": 2 + round(random.random() * 3)
        })
    return activity
