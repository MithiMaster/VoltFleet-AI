from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Union
from datetime import datetime, timedelta
from backend.database import get_db
from backend.models import Vehicle, Driver, AlertLog, BatteryLog, SpeedLog, TripLog, RevenueLog, MaintenanceLog, DriverRealtimeData
from backend.schemas import FleetPulseSummary, EnergyTrendPoint, DriverScoreResponse, AlertLogResponse
from backend.auth import get_current_admin, get_current_admin_or_driver

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary", response_model=FleetPulseSummary)
def get_fleet_summary(db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    vehicles = db.query(Vehicle).all()
    
    active = sum(1 for v in vehicles if v.status == "driving")
    charging = sum(1 for v in vehicles if v.status == "charging")
    idle = sum(1 for v in vehicles if v.status == "idle")
    maintenance = sum(1 for v in vehicles if v.status == "maintenance")
    total = len(vehicles)
    
    return {
        "active": active,
        "charging": charging,
        "idle": idle,
        "maintenance": maintenance,
        "total": total
    }

@router.get("/energy-trends", response_model=List[EnergyTrendPoint])
def get_energy_trends(db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    # Calculate energy drawn per day for the last 7 days
    # For simplicity, if we don't have enough time-series database data, 
    # we return a standard trend seeded with historical data combined with today's real trip logs.
    end_date = datetime.utcnow()
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    # Base mock configuration matching the requirements
    base_kwh = [412, 388, 502, 471, 540, 298, 224]
    base_cost = [58, 54, 70, 66, 76, 42, 31]
    
    # Calculate current day of the week to replace today's value with actual trip log sums
    today_weekday = datetime.utcnow().weekday() # 0 is Monday, 6 is Sunday
    
    # Sum today's energy consumption from trip logs
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_trips_energy = db.query(func.sum(TripLog.energy_consumed_kwh)).filter(TripLog.time >= today_start).scalar() or 0.0
    
    if today_trips_energy > 0:
        base_kwh[today_weekday] = int(today_trips_energy)
        base_cost[today_weekday] = int(today_trips_energy * 0.14) # assuming $0.14 per kWh
        
    return [
        {"day": days[i], "kwh": float(base_kwh[i]), "cost": float(base_cost[i])}
        for i in range(7)
    ]

@router.get("/driver-leaderboard", response_model=List[DriverScoreResponse])
def get_driver_leaderboard(db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    drivers = db.query(Driver).filter(Driver.is_active == True).all()
    
    leaderboard = []
    for driver in drivers:
        # Calculate driver metrics
        trips_count = db.query(TripLog).filter(TripLog.driver_id == driver.driver_id).count()
        total_dist = db.query(func.sum(TripLog.distance_covered_km)).filter(TripLog.driver_id == driver.driver_id).scalar() or 0.0
        total_energy = db.query(func.sum(TripLog.energy_consumed_kwh)).filter(TripLog.driver_id == driver.driver_id).scalar() or 0.0
        overspeeding = db.query(func.sum(TripLog.overspeeding_events_count)).filter(TripLog.driver_id == driver.driver_id).scalar() or 0
        
        # Default starting values to match original dashboard if no real trips logged yet
        if trips_count == 0:
            default_map = {
                "Maya Chen": {"score": 94, "trips": 128, "efficiency": 6.2},
                "Jordan Park": {"score": 81, "trips": 96, "efficiency": 5.4},
                "Sam Rivera": {"score": 76, "trips": 142, "efficiency": 5.1},
                "Priya Shah": {"score": 88, "trips": 74, "efficiency": 5.9},
                "Diego Alvarez": {"score": 69, "trips": 110, "efficiency": 4.6}
            }
            name = f"{driver.first_name} {driver.last_name}"
            stats = default_map.get(name, {"score": 80, "trips": 10, "efficiency": 5.0})
            
            leaderboard.append({
                "name": name,
                "score": stats["score"],
                "trips": stats["trips"],
                "efficiency": stats["efficiency"]
            })
        else:
            # Calculate dynamic metrics
            # Efficiency is km / kWh
            efficiency = round(total_dist / total_energy, 1) if total_energy > 0 else 5.0
            
            # Base safety score is 100, deduct points for overspeeding events
            score = max(50, 100 - (overspeeding * 5))
            
            leaderboard.append({
                "name": f"{driver.first_name} {driver.last_name}",
                "score": int(score),
                "trips": trips_count,
                "efficiency": float(efficiency)
            })
            
    # Sort leaderboard by score descending
    leaderboard.sort(key=lambda x: x["score"], reverse=True)
    return leaderboard

@router.get("/vehicle/{vehicle_id}/telemetry")
def get_vehicle_telemetry(
    vehicle_id: str, 
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_admin_or_driver)
):
    # Query logs from DriverRealtimeData table
    logs = db.query(DriverRealtimeData)\
        .filter(DriverRealtimeData.vehicle_id == vehicle_id)\
        .order_by(DriverRealtimeData.trip_log_id.desc())\
        .limit(100)\
        .all()
    
    # Chronological sort for UI charts
    logs = list(reversed(logs))
    
    battery_history = []
    speed_history = []
    
    for log in logs:
        # Base simulated voltage & current draw
        voltage = 360.0 + (log.current_battery_pct * 0.4)
        current_draw = log.current_speed_kmh * 0.35 + (15.0 if log.ac_status else 0)
        
        battery_history.append({
            "time": log.timestamp,
            "battery_percentage": log.current_battery_pct,
            "voltage": float(voltage),
            "current_draw": float(current_draw),
            "temperature_celsius": log.outside_temperature_c + 4.0,
            "soh_percentage": 98.0
        })
        
        speed_history.append({
            "time": log.timestamp,
            "speed_kmh": log.current_speed_kmh,
            "latitude": 12.9716 + (log.distance_to_destination_km * 0.001),
            "longitude": 77.5946 + (log.distance_to_destination_km * 0.001),
            "total_distance_km": 150.0 - log.distance_to_destination_km
        })
        
    return {
        "battery_history": battery_history,
        "speed_history": speed_history,
        "realtime_logs": [
            {
                "trip_log_id": log.trip_log_id,
                "driver_id": log.driver_id,
                "current_battery_pct": log.current_battery_pct,
                "current_speed_kmh": log.current_speed_kmh,
                "ac_status": log.ac_status,
                "route_type": log.route_type,
                "outside_temperature_c": log.outside_temperature_c,
                "elevation_ahead": log.elevation_ahead,
                "driver_efficiency_score": log.driver_efficiency_score,
                "distance_to_destination_km": log.distance_to_destination_km,
                "actual_remaining_range_km": log.actual_remaining_range_km,
                "timestamp": log.timestamp
            }
            for log in logs
        ]
    }

@router.get("/vehicles-realtime")
def get_vehicles_realtime(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_admin_or_driver)
):
    vehicles = db.query(Vehicle).all()
    results = []
    
    for idx, v in enumerate(vehicles):
        # Find latest realtime telemetry log for this vehicle
        last_log = db.query(DriverRealtimeData)\
            .filter(DriverRealtimeData.vehicle_id == v.vehicle_id)\
            .order_by(DriverRealtimeData.trip_log_id.desc())\
            .first()
            
        driver_name = "Unassigned"
        speed = 0.0
        location = "In Garage"
        battery_level = v.current_soc
        status = v.status
        range_left = v.claimed_range_km or 250.0
        
        if last_log:
            driver = db.query(Driver).filter(Driver.driver_id == last_log.driver_id).first()
            if driver:
                driver_name = f"{driver.first_name} {driver.last_name}"
            speed = last_log.current_speed_kmh
            location = f"Route {last_log.route_type}"
            battery_level = last_log.current_battery_pct
            status = "driving" if speed > 0 else "idle"
            range_left = last_log.actual_remaining_range_km
            
        # Odometer is simulated using index & elapsed distance
        odometer = 12000.0 + (idx * 450)
        
        results.append({
            "id": v.vehicle_id,
            "name": v.car_name or f"{v.brand} {v.model}",
            "make": v.brand,
            "model": v.model,
            "batteryLevel": float(battery_level),
            "batteryCapacity": float(v.battery_capacity_kwh),
            "batteryHealth": float(v.battery_health),
            "status": status,
            "range": float(range_left),
            "driver": driver_name,
            "charging_time_spec": v.charging_time_spec,
            "max_power_bhp": v.max_power_bhp,
            "claimed_range_km": v.claimed_range_km,
            "motor_power_kw": v.motor_power_kw,
            "vehicle_weight_kg": v.vehicle_weight_kg,
            "initial_battery_health_pct": v.initial_battery_health_pct,
            "odometer": odometer,
            "location": location,
            "speed": float(speed)
        })
        
    return results

@router.get("/reports-data")
def get_reports_data(db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    three_months_ago = datetime.utcnow() - timedelta(days=90)
    
    # 1. Income generated by vehicles in last 3 months
    vehicle_incomes_query = db.query(
        Vehicle.vehicle_id,
        Vehicle.brand,
        Vehicle.model,
        func.sum(RevenueLog.amount).label("total_income")
    ).select_from(Vehicle)\
     .outerjoin(TripLog, Vehicle.vehicle_id == TripLog.vehicle_id)\
     .outerjoin(RevenueLog, TripLog.trip_id == RevenueLog.trip_id)\
     .filter((RevenueLog.logged_at >= three_months_ago) | (RevenueLog.logged_at == None))\
     .group_by(Vehicle.vehicle_id, Vehicle.brand, Vehicle.model)\
     .all()
     
    vehicle_incomes = [
        {
            "vehicle_id": v_id,
            "name": f"{brand} {model}",
            "income": float(total_income or 0.0)
        }
        for v_id, brand, model, total_income in vehicle_incomes_query
    ]
    
    # 2. Charging amount for the last 3 months
    trips_3m = db.query(TripLog).filter(TripLog.time >= three_months_ago).all()
    charging_by_month = {}
    for trip in trips_3m:
        month_str = trip.time.strftime("%b %Y") # e.g. "Jun 2026"
        charging_by_month[month_str] = charging_by_month.get(month_str, 0.0) + (trip.energy_consumed_kwh or 0.0)
        
    charging_history = [
        {
            "month": month,
            "kwh": float(kwh),
            "amount": float(kwh * 0.14) # Assuming $0.14 per kWh electricity cost
        }
        for month, kwh in charging_by_month.items()
    ]
    
    # 3. Maintenance logs (including separate cost column)
    maintenance_query = db.query(
        MaintenanceLog.maintenance_id,
        MaintenanceLog.vehicle_id,
        Vehicle.brand,
        Vehicle.model,
        MaintenanceLog.description,
        MaintenanceLog.cost,
        MaintenanceLog.performed_at
    ).join(Vehicle, MaintenanceLog.vehicle_id == Vehicle.vehicle_id)\
     .order_by(MaintenanceLog.performed_at.desc())\
     .all()
    
    maintenance_list = [
        {
            "maintenance_id": m_id,
            "vehicle_id": v_id,
            "vehicle_name": f"{brand} {model}",
            "description": desc,
            "cost": float(cost),
            "date": performed_at.strftime("%Y-%m-%d")
        }
        for m_id, v_id, brand, model, desc, cost, performed_at in maintenance_query
    ]
    
    # 4. Overspeed violations per driver
    drivers_violations = []
    for driver in db.query(Driver).all():
        violations_count = db.query(func.sum(TripLog.overspeeding_events_count))\
                            .filter(TripLog.driver_id == driver.driver_id)\
                            .scalar() or 0
        drivers_violations.append({
            "driver_id": driver.driver_id,
            "name": f"{driver.first_name} {driver.last_name}",
            "license": driver.license_number,
            "violations": int(violations_count)
        })
        
    # 5. Selected car info
    total_company_income = db.query(func.sum(RevenueLog.amount))\
                            .filter(RevenueLog.logged_at >= three_months_ago)\
                            .scalar() or 0.0
                            
    vehicle_details = {}
    db_vehicles = db.query(Vehicle).all()
    for vehicle in db_vehicles:
        group_name = vehicle.group.group_name if vehicle.group else "Unassigned Group"
        group_id = vehicle.group_id
        
        car_income = db.query(func.sum(RevenueLog.amount))\
                      .select_from(RevenueLog)\
                      .join(TripLog, RevenueLog.trip_id == TripLog.trip_id)\
                      .filter(TripLog.vehicle_id == vehicle.vehicle_id)\
                      .filter(RevenueLog.logged_at >= three_months_ago)\
                      .scalar() or 0.0
                      
        agency_income = 0.0
        if group_id:
            agency_income = db.query(func.sum(RevenueLog.amount))\
                             .select_from(RevenueLog)\
                             .join(TripLog, RevenueLog.trip_id == TripLog.trip_id)\
                             .join(Vehicle, TripLog.vehicle_id == Vehicle.vehicle_id)\
                             .filter(Vehicle.group_id == group_id)\
                             .filter(RevenueLog.logged_at >= three_months_ago)\
                             .scalar() or 0.0
                             
        car_maintenance = db.query(func.sum(MaintenanceLog.cost))\
                           .filter(MaintenanceLog.vehicle_id == vehicle.vehicle_id)\
                           .scalar() or 0.0
                           
        car_energy = db.query(func.sum(TripLog.energy_consumed_kwh))\
                      .filter(TripLog.vehicle_id == vehicle.vehicle_id)\
                      .filter(TripLog.time >= three_months_ago)\
                      .scalar() or 0.0
        car_charging_cost = car_energy * 0.14
        
        total_expenses = car_charging_cost + car_maintenance
        
        vehicle_details[vehicle.vehicle_id] = {
            "vehicle_id": vehicle.vehicle_id,
            "name": f"{vehicle.brand} {vehicle.model}",
            "vin": vehicle.vin,
            "group_name": group_name,
            "car_income": float(car_income),
            "agency_income": float(agency_income),
            "company_income": float(total_company_income),
            "maintenance_cost": float(car_maintenance),
            "charging_cost": float(car_charging_cost),
            "total_expenses": float(total_expenses)
        }
        
    return {
        "vehicle_incomes": vehicle_incomes,
        "charging_history": charging_history,
        "maintenance_logs": maintenance_list,
        "driver_violations": drivers_violations,
        "vehicle_details": vehicle_details
    }

@router.get("/vehicle/{vehicle_id}/financials")
def get_vehicle_financials(
    vehicle_id: str, 
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_admin_or_driver)
):
    three_months_ago = datetime.utcnow() - timedelta(days=90)
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    total_company_income = db.query(func.sum(RevenueLog.amount))\
                            .filter(RevenueLog.logged_at >= three_months_ago)\
                            .scalar() or 0.0
                            
    car_income = db.query(func.sum(RevenueLog.amount))\
                  .select_from(RevenueLog)\
                  .join(TripLog, RevenueLog.trip_id == TripLog.trip_id)\
                  .filter(TripLog.vehicle_id == vehicle_id)\
                  .filter(RevenueLog.logged_at >= three_months_ago)\
                  .scalar() or 0.0
                  
    agency_income = 0.0
    group_name = vehicle.group.group_name if vehicle.group else "Unassigned Group"
    if vehicle.group_id:
        agency_income = db.query(func.sum(RevenueLog.amount))\
                         .select_from(RevenueLog)\
                         .join(TripLog, RevenueLog.trip_id == TripLog.trip_id)\
                         .join(Vehicle, TripLog.vehicle_id == Vehicle.vehicle_id)\
                         .filter(Vehicle.group_id == vehicle.group_id)\
                         .filter(RevenueLog.logged_at >= three_months_ago)\
                         .scalar() or 0.0
                         
    car_maintenance = db.query(func.sum(MaintenanceLog.cost))\
                       .filter(MaintenanceLog.vehicle_id == vehicle_id)\
                       .scalar() or 0.0
                       
    car_energy = db.query(func.sum(TripLog.energy_consumed_kwh))\
                  .filter(TripLog.vehicle_id == vehicle_id)\
                  .filter(TripLog.time >= three_months_ago)\
                  .scalar() or 0.0
    car_charging_cost = car_energy * 0.14
    total_expenses = car_charging_cost + car_maintenance
    
    maintenance_records = db.query(MaintenanceLog)\
                            .filter(MaintenanceLog.vehicle_id == vehicle_id)\
                            .order_by(MaintenanceLog.performed_at.desc())\
                            .all()
                            
    return {
        "vehicle_id": vehicle_id,
        "name": vehicle.car_name or f"{vehicle.brand} {vehicle.model}",
        "vin": vehicle.vin,
        "group_name": group_name,
        "car_income": float(car_income),
        "agency_income": float(agency_income),
        "company_income": float(total_company_income),
        "maintenance_cost": float(car_maintenance),
        "charging_cost": float(car_charging_cost),
        "total_expenses": float(total_expenses),
        "maintenance_logs": [
            {
                "description": record.description,
                "cost": float(record.cost),
                "date": record.performed_at.strftime("%Y-%m-%d")
            }
            for record in maintenance_records
        ]
    }

@router.get("/driver-performance")
def get_driver_performance_analysis(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    from backend.ml_model import predict_driver_score
    
    drivers = db.query(Driver).filter(Driver.is_active == True).all()
    results = []
    
    gradients = [
        "from-sky-500 to-emerald-500",
        "from-emerald-500 to-teal-500",
        "from-purple-500 to-sky-500",
        "from-pink-500 to-orange-500",
        "from-amber-500 to-rose-500",
        "from-teal-500 to-cyan-500"
    ]
    
    for d in drivers:
        name = f"{d.first_name} {d.last_name}"
        grad_idx = sum(ord(c) for c in d.first_name) % len(gradients)
        avatar_color = gradients[grad_idx]
        group_name = d.group.group_name if d.group else "General"
        
        # Run ML model prediction
        ml_data = predict_driver_score(d.driver_id, db)
        
        # Calculate derived metrics for display
        # Safety score: dynamic baseline from ML score and harsh braking
        safety_score = max(50, min(100, int(ml_data["score"] + 2 - ml_data["harsh_braking_instances"] * 1.2)))
        
        # Efficiency score: based on distance and speed
        efficiency_score = max(50, min(100, int(ml_data["score"] - 1 + (ml_data["daily_distance_km"] / 100.0) * 1.5)))
        
        # Battery friendly score
        battery_friendly = max(60, min(100, int(ml_data["end_of_day_charge_percentage"] * 0.8 + 50 - ml_data["harsh_acceleration_instances"] * 2)))
        
        # Route compliance
        seed = sum(ord(c) for c in d.driver_id)
        route_compliance = 85 + (seed % 13)
        
        # Generate custom AI recommendations
        recommendations = []
        if ml_data["harsh_braking_instances"] > 3.0:
            recommendations.append(f"Coach {name} on smooth deceleration — projected to save $25/month in brake maintenance.")
        if ml_data["harsh_acceleration_instances"] > 3.5:
            recommendations.append(f"Discuss aggressive acceleration patterns with {name} to extend battery lifecycle.")
        if ml_data["average_speed_kmh"] > 65.0:
            recommendations.append(f"{name} exceeds optimal speed thresholds on highways — schedule a safety briefing.")
        if ml_data["end_of_day_charge_percentage"] < 35.0:
            recommendations.append(f"Advise {name} to optimize opportunity charging to keep battery SOC above 35%.")
            
        # Add default positive recommendations if few issues found
        if not recommendations:
            recommendations.append(f"{name}'s acceleration and braking stability remained excellent this week.")
            recommendations.append(f"Recognize {name} for achieving top-tier energy efficiency on urban routes.")
        elif len(recommendations) < 2:
            recommendations.append(f"{name} showed consistent overall route compliance of {route_compliance}%.")
            
        results.append({
            "id": d.driver_id,
            "name": name,
            "group": group_name,
            "avatar_color": avatar_color,
            "trips": ml_data["trips"],
            "distance": ml_data["total_distance_km"] * 1000, # return in meters
            "daily_distance_km": round(ml_data["daily_distance_km"], 1),
            "revenue": float(db.query(func.sum(RevenueLog.amount)).filter(RevenueLog.driver_id == d.driver_id).scalar() or 0.0),
            "ai_score": int(ml_data["score"]),
            "safety_score": int(safety_score),
            "efficiency_score": int(efficiency_score),
            "battery_friendly": int(battery_friendly),
            "route_compliance": int(route_compliance),
            "harsh_braking": round(ml_data["harsh_braking_instances"], 2),
            "harsh_acceleration": round(ml_data["harsh_acceleration_instances"], 2),
            "avg_speed": round(ml_data["average_speed_kmh"], 1),
            "end_of_day_charge": round(ml_data["end_of_day_charge_percentage"], 1),
            "daily_income": round(ml_data["daily_income"], 1),
            "maintenance_charges": round(ml_data["maintenance_charges"], 1),
            "recommendations": recommendations
        })
        
    # Sort by ML performance score descending
    results.sort(key=lambda x: x["ai_score"], reverse=True)
    return results

from pydantic import BaseModel

class ScorePredictionInput(BaseModel):
    daily_distance_km: float
    average_speed_kmh: float
    harsh_braking_instances: float
    harsh_acceleration_instances: float
    end_of_day_charge_percentage: float
    daily_income: float
    maintenance_charges: float

@router.post("/predict")
def predict_score_manually(
    payload: ScorePredictionInput,
    current_admin=Depends(get_current_admin)
):
    from backend.ml_model import get_performance_model
    try:
        model = get_performance_model()
        X = [[
            payload.daily_distance_km,
            payload.average_speed_kmh,
            payload.harsh_braking_instances,
            payload.harsh_acceleration_instances,
            payload.end_of_day_charge_percentage,
            payload.daily_income,
            payload.maintenance_charges
        ]]
        pred_score = model.predict(X)[0]
        # Clamp between 0 and 100
        pred_score = max(0.0, min(100.0, pred_score))
        return {"score": round(pred_score, 1)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

class RangePredictionInput(BaseModel):
    current_battery_pct: float
    distance_to_destination_km: float
    current_speed_kmh: float
    ac_status: int
    outside_temperature_c: float
    route_type: str
    elevation_ahead: Union[float, int, str] = 0.0
    battery_capacity_kwh: float

@router.post("/predict-range")
def predict_range_endpoint(
    payload: RangePredictionInput,
    current_user=Depends(get_current_admin_or_driver)
):
    from backend.ml_model import predict_range
    try:
        range_km = predict_range(
            battery_pct=payload.current_battery_pct,
            dist_to_dest=payload.distance_to_destination_km,
            speed=payload.current_speed_kmh,
            ac_status=payload.ac_status,
            temp=payload.outside_temperature_c,
            route_type=payload.route_type,
            elevation=payload.elevation_ahead,
            battery_capacity_kwh=payload.battery_capacity_kwh
        )
        return {"predicted_range_km": range_km}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Range prediction failed: {e}")




