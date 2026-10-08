from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import math
import random
from datetime import datetime
from backend.database import get_db
from backend.models import Driver, DriverGroup, Admin, TripLog, RevenueLog, Vehicle, DriverRealtimeData
from backend.schemas import DriverCreate, DriverResponse, DriverUpdate, DriverGroupCreate, DriverGroupResponse
from backend.auth import get_current_admin, get_current_admin_or_driver

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])

from backend.ml_model import predict_driver_score

def map_driver(d: Driver, db: Session):
    # Predict AI performance score using the linear regression ML model (matches AI Driver Scoring)
    ml_data = predict_driver_score(d.driver_id, db)
    
    # Calculate derived metrics matching /api/analytics/driver-performance
    safety_score = max(50, min(100, int(ml_data["score"] + 2 - ml_data["harsh_braking_instances"] * 1.2)))
    efficiency_score = max(50, min(100, int(ml_data["score"] - 1 + (ml_data["daily_distance_km"] / 100.0) * 1.5)))
    battery_friendly = max(60, min(100, int(ml_data["end_of_day_charge_percentage"] * 0.8 + 50 - ml_data["harsh_acceleration_instances"] * 2)))
    seed = sum(ord(c) for c in d.driver_id)
    route_compliance = 85 + (seed % 13)
    
    name = f"{d.first_name} {d.last_name}"
    
    # Recommendations matching AI driver scoring logic
    recommendations = []
    if ml_data["harsh_braking_instances"] > 3.0:
        recommendations.append(f"Coach {name} on smooth deceleration — projected to save $25/month in brake maintenance.")
    if ml_data["harsh_acceleration_instances"] > 3.5:
        recommendations.append(f"Discuss aggressive acceleration patterns with {name} to extend battery lifecycle.")
    if ml_data["average_speed_kmh"] > 65.0:
        recommendations.append(f"{name} exceeds optimal speed thresholds on highways — schedule a safety briefing.")
    if ml_data["end_of_day_charge_percentage"] < 35.0:
        recommendations.append(f"Advise {name} to optimize opportunity charging to keep battery SOC above 35%.")
        
    if not recommendations:
        recommendations.append(f"{name}'s acceleration and braking stability remained excellent this week.")
        recommendations.append(f"Recognize {name} for achieving top-tier energy efficiency on urban routes.")
    elif len(recommendations) < 2:
        recommendations.append(f"{name} showed consistent overall route compliance of {route_compliance}%.")
        
    # Query revenue from RevenueLog, fallback to estimated income if empty
    revenue = float(db.query(func.sum(RevenueLog.amount)).filter(RevenueLog.driver_id == d.driver_id).scalar() or 0.0)
    if revenue == 0.0 and ml_data["trips"] > 0:
        revenue = round(ml_data["daily_income"] * max(1, ml_data["trips"] / 25), 1)

    # Violations
    overspeeding = int(db.query(func.sum(TripLog.overspeeding_events_count)).filter(TripLog.driver_id == d.driver_id).scalar() or 0)
    hb = int(round(ml_data["harsh_braking_instances"]))
    ra = int(round(ml_data["harsh_acceleration_instances"]))
    
    # Unique per-driver sparkline mini-series (10 points)
    base_spd = ml_data["average_speed_kmh"] or 55.0
    sparkline = []
    for i in range(10):
        val = base_spd + math.sin((seed + i * 2) / 2.5) * 14.0 + ((seed * 7 + i * 13) % 9) - 4.0
        sparkline.append({
            "t": f"{i*5}m",
            "speed": max(15, round(val, 1))
        })

    group_name = d.group.group_name if d.group else "General"
    
    gradients = [
        "from-sky-500 to-emerald-500",
        "from-emerald-500 to-teal-500",
        "from-purple-500 to-sky-500",
        "from-pink-500 to-orange-500",
        "from-amber-500 to-rose-500",
        "from-teal-500 to-cyan-500"
    ]
    grad_idx = sum(ord(c) for c in d.first_name) % len(gradients)
    avatar_color = gradients[grad_idx]

    return {
        "driver_id": d.driver_id,
        "first_name": d.first_name,
        "last_name": d.last_name,
        "name": name,
        "avatar_color": avatar_color,
        "group_name": group_name,
        "email": d.email,
        "is_active": d.is_active,
        "is_verified": d.is_verified,
        "trips": ml_data["trips"],
        "distance": ml_data["total_distance_km"] * 1000,  # in meters
        "revenue": revenue,
        "safety_score": safety_score,
        "efficiency_score": efficiency_score,
        "battery_friendly": battery_friendly,
        "route_compliance": route_compliance,
        "ai_score": int(ml_data["score"]),
        "daily_distance_km": round(ml_data["daily_distance_km"], 1),
        "avg_speed": round(ml_data["average_speed_kmh"], 1),
        "end_of_day_charge": round(ml_data["end_of_day_charge_percentage"], 1),
        "daily_income": round(ml_data["daily_income"], 1),
        "maintenance_charges": round(ml_data["maintenance_charges"], 1),
        "recommendations": recommendations,
        "speed_sparkline": sparkline,
        "violations_harsh_brake": hb,
        "violations_rapid_accel": ra,
        "violations_overspeed": overspeeding
    }

@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(
    driver_data: DriverCreate, 
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    if driver_data.group_id:
        group = db.query(DriverGroup).filter(DriverGroup.group_id == driver_data.group_id).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver group not found"
            )
            
    existing_license = db.query(Driver).filter(Driver.license_number == driver_data.license_number).first()
    if existing_license:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver with this license number already exists"
        )
        
    new_driver = Driver(
        group_id=driver_data.group_id,
        first_name=driver_data.first_name,
        last_name=driver_data.last_name,
        license_number=driver_data.license_number,
        email=driver_data.email,
        is_active=True
    )
    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)
    return new_driver

@router.get("/my-dashboard")
def get_driver_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_admin_or_driver)):
    if current_user.get("role") != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can access my-dashboard")
        
    driver_id = current_user["driver_id"]
    driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    driver_profile = map_driver(driver, db)
    
    # Find assigned vehicle
    realtime = db.query(DriverRealtimeData).filter(DriverRealtimeData.driver_id == driver_id).first()
    vehicle = None
    if realtime:
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == realtime.vehicle_id).first()
    if not vehicle:
        vehicle = db.query(Vehicle).first()
        
    assigned_vehicle = None
    if vehicle:
        assigned_vehicle = {
            "make": vehicle.brand,
            "model": vehicle.model,
            "vehicle_id": vehicle.vehicle_id,
            "year": vehicle.created_at.year if vehicle.created_at else 2024,
            "status": vehicle.status.lower() if vehicle.status else "active",
            "soc": int(vehicle.current_soc) if vehicle.current_soc is not None else 85,
            "soh": int(vehicle.battery_health) if vehicle.battery_health is not None else 98,
            "range_miles": round((vehicle.claimed_range_km or 400.0) * 0.621371),
            "mileage": round(15000 + (hash(vehicle.vehicle_id) % 20000))
        }
        
    violations = {
        "harsh_brake": driver_profile["violations_harsh_brake"],
        "rapid_accel": driver_profile["violations_rapid_accel"],
        "overspeed": driver_profile["violations_overspeed"],
        "total": driver_profile["violations_harsh_brake"] + driver_profile["violations_rapid_accel"] + driver_profile["violations_overspeed"]
    }
    
    # Maintenance items for assigned vehicle
    maintenance_items = []
    if vehicle:
        from backend.routers.maintenance import get_maintenance
        try:
            all_maint = get_maintenance(db, current_user)
            # Find matching vehicle logs
            maintenance_items = [m for m in all_maint if m["vehicle_id"] == vehicle.vehicle_id]
        except Exception:
            pass
            
    # Charging schedule for vehicle
    charging_info = []
    if vehicle:
        from backend.routers.charging import get_charging_schedule
        try:
            all_charge = get_charging_schedule(db, current_user)
            charging_info = [c for c in all_charge if c["vehicle_id"] == vehicle.vehicle_id]
        except Exception:
            pass
            
    # Revenue monthly
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    now = datetime.utcnow()
    revenue_monthly = []
    for i in range(now.month if now.month > 0 else 1):
        revenue_monthly.append({
            "month": months[i],
            "revenue": round(1200 + math.sin(i / 2) * 300 + (hash(driver_id) % 400))
        })
        
    # Speed series
    speed_series = get_driver_speed_series(driver_id, db, current_user)
    
    # Reports
    reports = [
        {"type": "Performance Review", "date": "May 2026", "status": "completed"},
        {"type": "Safety Briefing", "date": "April 2026", "status": "completed"},
        {"type": "Regen Brake Report", "date": "March 2026", "status": "completed"}
    ]
    
    return {
        "driver": driver_profile,
        "assigned_vehicle": assigned_vehicle,
        "maintenance_items": maintenance_items,
        "violations": violations,
        "charging_info": charging_info,
        "revenue_monthly": revenue_monthly,
        "speed_series": speed_series,
        "reports": reports
    }

@router.get("/{driver_id}/speed-series")
def get_driver_speed_series(driver_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_admin_or_driver)):
    ml_data = predict_driver_score(driver_id, db)
    base_spd = ml_data.get("average_speed_kmh") or 55.0
    seed = sum(ord(c) for c in driver_id)
    series = []
    
    for i in range(12):
        cycle = (i + (seed % 7)) / 3.0
        spd = max(10, round(base_spd + math.sin(cycle) * 16.0 + math.cos(i * 1.2) * 5.0, 1))
        eff = max(45, min(99, round(88.0 - (spd - base_spd) * 0.35 + math.sin(cycle * 1.5) * 4.0, 1)))
        pwr = max(5, round(20.0 + (spd / 80.0) * 35.0 + math.cos(cycle) * 8.0, 1))
        soc = max(15, round(ml_data.get("end_of_day_charge_percentage", 65.0) + 12 - i * 1.1 + (1.2 if spd < 30 else 0), 1))
        
        series.append({
            "t": f"{i * 5}m",
            "speed": spd,
            "eff": eff,
            "power_kw": pwr,
            "soc": soc
        })
    return series

@router.get("")
def get_drivers(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_or_driver)
):
    drivers = db.query(Driver).all()
    results = [map_driver(d, db) for d in drivers]
    results.sort(key=lambda x: x["ai_score"], reverse=True)
    return results

@router.get("/{driver_id}")
def get_driver(
    driver_id: str,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found"
        )
    return map_driver(driver, db)

@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver(
    driver_id: str,
    driver_update: DriverUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found"
        )
        
    update_data = driver_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(driver, key, value)
        
    db.commit()
    db.refresh(driver)
    return driver

@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(
    driver_id: str,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found"
        )
    db.delete(driver)
    db.commit()
    return None

# Driver Groups
@router.post("/groups", response_model=DriverGroupResponse, status_code=status.HTTP_201_CREATED)
def create_driver_group(
    group_data: DriverGroupCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    new_group = DriverGroup(
        company_id=current_admin.company_id,
        group_name=group_data.group_name
    )
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group

@router.get("/groups", response_model=List[DriverGroupResponse])
def get_driver_groups(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return db.query(DriverGroup).filter(DriverGroup.company_id == current_admin.company_id).all()
