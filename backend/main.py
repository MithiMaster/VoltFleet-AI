import os
import sys
from datetime import datetime, timedelta

# Ensure the parent directory is in python path to allow imports of 'backend' when run from inside backend/
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

import contextlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.config import settings
from backend.database import init_db, SessionLocal
from backend.models import Company, Admin, DriverGroup, Driver, Vehicle, AlertLog, MaintenanceLog, TripLog, RevenueLog, DriverRealtimeData, BatteryLog, SpeedLog
from backend.auth import get_password_hash
from backend.routers import auth, vehicles, drivers, alerts, analytics, dashboard, maintenance, charging, route_optimizer, reports
from backend.simulator import simulator

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables and seed if empty
    init_db()
    seed_database()
    
    # Start the telemetry simulator
    if settings.SIMULATION_ACTIVE:
        simulator.start_simulation()
        
    yield
    
    # Shutdown: Stop the telemetry simulator
    if settings.SIMULATION_ACTIVE:
        simulator.stop_simulation()

app = FastAPI(
    title="Voltgrid EV Fleet Management API",
    description="Backend API for managing electric vehicle fleets, battery telemetry, and driver analytics.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Register routers
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(drivers.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(dashboard.router)
app.include_router(maintenance.router)
app.include_router(charging.router)
app.include_router(reports.router)
app.include_router(route_optimizer.router)


@app.get("/")
def read_root():
    return {
        "message": "Voltgrid EV Fleet Management API is running.",
        "docs_url": "/docs",
        "simulation_active": settings.SIMULATION_ACTIVE
    }

def seed_database():
    db = SessionLocal()
    is_seeded = False
    try:
        if db.query(Vehicle).first() is not None:
            is_seeded = True
    except Exception as query_err:
        print(f"[DATABASE SEED] Query failed due to schema mismatch ({query_err}). Re-initializing schema...")
    finally:
        db.close()

    if is_seeded:
        print("[DATABASE SEED] Already seeded. Skipping.")
        return

    print("[DATABASE SEED] Seeding database from unified_ev_fleet_dataset_final.xlsx...")
    
    # Drop and recreate tables to register the new schema in MySQL/SQLite
    from backend.database import Base, engine
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    import pandas as pd
    
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    xlsx_path = os.path.join(parent_dir, "unified_ev_fleet_dataset_final.xlsx")
    
    if not os.path.exists(xlsx_path):
        print(f"[DATABASE SEED ERROR] Excel file not found at {xlsx_path}")
        return
        
    df = pd.read_excel(xlsx_path)
    
    db = SessionLocal()
    try:
        # Create Company
        company = Company(name="Voltgrid Logistics")
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # Create Admin
        admin = Admin(
            company_id=company.company_id,
            email="you@fleet.com",
            password_hash=get_password_hash("password"),
            is_verified=True
        )
        db.add(admin)
        
        # Create groups
        group_north = DriverGroup(company_id=company.company_id, group_name="Hub North")
        group_south = DriverGroup(company_id=company.company_id, group_name="Hub South")
        db.add(group_north)
        db.add(group_south)
        db.commit()
        db.refresh(group_north)
        db.refresh(group_south)
        
        # Create unique drivers
        unique_driver_ids = df['driver_id'].unique()
        driver_names = {
            "DRV_001": ("Maya", "Chen", "DL-112233", "maya@voltgrid.com"),
            "DRV_002": ("Diego", "Alvarez", "DL-001122", "diego@voltgrid.com"),
            "DRV_003": ("Jordan", "Park", "DL-445566", "jordan@voltgrid.com"),
            "DRV_004": ("Sam", "Rivera", "DL-778899", "sam@voltgrid.com"),
            "DRV_005": ("Priya", "Shah", "DL-889900", "priya@voltgrid.com"),
            "DRV_006": ("Alex", "Carter", "DL-556677", "alex@voltgrid.com"),
            "DRV_007": ("Taylor", "Vance", "DL-990011", "taylor@voltgrid.com"),
            "DRV_008": ("Casey", "Morgan", "DL-334455", "casey@voltgrid.com"),
            "DRV_009": ("Robin", "Lee", "DL-223344", "robin@voltgrid.com"),
            "DRV_010": ("Morgan", "Smith", "DL-667788", "morgan@voltgrid.com"),
        }
        
        import random
        for d_id in unique_driver_ids:
            first, last, lic, email = driver_names.get(d_id, (f"Driver", d_id, f"DL-{d_id}", f"{d_id.lower()}@voltgrid.com"))
            drv = Driver(
                driver_id=d_id,
                group_id=group_north.group_id if random.random() > 0.5 else group_south.group_id,
                first_name=first,
                last_name=last,
                license_number=lic,
                email=email,
                is_active=True,
                is_verified=True
            )
            db.add(drv)
        db.commit()
        
        # Create unique vehicles
        unique_vehicle_ids = df['vehicle_id'].unique()
        for v_id in unique_vehicle_ids:
            spec_row = df[df['vehicle_id'] == v_id].iloc[0]
            last_row = df[df['vehicle_id'] == v_id].sort_values(by='timestamp').iloc[-1]
            
            brand = spec_row['manufacturer']
            model = spec_row['car_model']
            car_name = f"{brand} {model}"
            
            soc = float(last_row['state_of_charge_soc']) * 100.0 if float(last_row['state_of_charge_soc']) <= 1.0 else float(last_row['state_of_charge_soc'])
            soh = float(last_row['state_of_health_soh']) * 100.0 if float(last_row['state_of_health_soh']) <= 1.0 else float(last_row['state_of_health_soh'])
            
            if int(last_row['charging_status']) == 1:
                status = "charging"
            elif int(last_row.get('maintenance_required', 0)) == 1:
                status = "maintenance"
            elif last_row['in_garage_or_running'] == "Garage":
                status = "idle"
            elif float(last_row['current_speed_kmph']) > 0:
                status = "driving"
            else:
                status = "idle"
                
            vh = Vehicle(
                vehicle_id=v_id,
                group_id=group_north.group_id if random.random() > 0.5 else group_south.group_id,
                vin=v_id,
                brand=brand,
                model=model,
                battery_capacity_kwh=float(spec_row['battery_capacity_kwh']),
                current_soc=soc,
                battery_health=soh,
                status=status,
                car_name=car_name,
                charging_time_spec=f"{int(spec_row.get('charging_duration_min', 240))} min",
                max_power_bhp=float(spec_row['max_power_bhp']),
                claimed_range_km=float(spec_row['max_range_km']),
                motor_power_kw=float(spec_row['motor_power_kw']),
                vehicle_weight_kg=float(spec_row['vehicle_weight_kg']),
                initial_battery_health_pct=soh
            )
            db.add(vh)
        db.commit()
        
        # Seed telemetry and time-series logs
        count = 0
        for idx, row in df.iterrows():
            ts = pd.to_datetime(row['timestamp'])
            v_id = row['vehicle_id']
            d_id = row['driver_id']
            trip_id = row['trip_id']
            
            soc = float(row['state_of_charge_soc']) * 100.0 if float(row['state_of_charge_soc']) <= 1.0 else float(row['state_of_charge_soc'])
            soh = float(row['state_of_health_soh']) * 100.0 if float(row['state_of_health_soh']) <= 1.0 else float(row['state_of_health_soh'])
            
            # Seeding DriverRealtimeData (last log for each vehicle is best, or we seed all)
            telemetry = DriverRealtimeData(
                trip_log_id=f"TRIP_LOG_{idx}",
                driver_id=d_id,
                vehicle_id=v_id,
                car_name=f"{row['manufacturer']} {row['car_model']}",
                current_battery_pct=soc,
                battery_capacity_kwh=float(row['battery_capacity_kwh']),
                current_speed_kmh=float(row['current_speed_kmph']),
                ac_status=int(row['air_conditioning_usage']),
                route_type=row['road_type'],
                outside_temperature_c=float(row['outside_temperature_c']),
                elevation_ahead=f"{int(row['elevation_gain_m'])}m",
                driver_efficiency_score=float(row['driver_behavior_score']) * 100.0 if float(row['driver_behavior_score']) <= 1.0 else float(row['driver_behavior_score']),
                distance_to_destination_km=float(row['estimated_remaining_range_km']) * 0.3,
                actual_remaining_range_km=float(row['estimated_remaining_range_km']),
                timestamp=ts
            )
            db.add(telemetry)
            
            # Seeding TripLog
            trip = TripLog(
                time=ts,
                trip_id=trip_id,
                vehicle_id=v_id,
                driver_id=d_id,
                end_time=ts + timedelta(minutes=float(row['trip_duration_min'])),
                distance_covered_km=float(row['trip_distance_km']),
                energy_consumed_kwh=float(row['energy_consumed_kwh']),
                overspeeding_events_count=int(row['harsh_braking_count'])
            )
            db.add(trip)
            
            # Seeding BatteryLog
            battery = BatteryLog(
                time=ts,
                vehicle_id=v_id,
                battery_percentage=soc,
                voltage=float(row['battery_voltage']),
                current_draw=float(row['charging_power_kw']) if int(row['charging_status']) == 1 else float(row['current_speed_kmph']) * 0.4,
                temperature_celsius=float(row['battery_temperature_c']),
                soh_percentage=soh,
                degradation_factor=float(row['failure_risk_score'])
            )
            db.add(battery)
            
            # Seeding SpeedLog
            speed = SpeedLog(
                time=ts,
                vehicle_id=v_id,
                speed_kmh=float(row['current_speed_kmph']),
                latitude=12.9716 + (idx * 0.0001) % 0.1,
                longitude=77.5946 + (idx * 0.0001) % 0.1,
                total_distance_km=float(row['odometer_km'])
            )
            db.add(speed)
            
            # Seeding RevenueLog
            if row['in_garage_or_running'] == "Running":
                revenue = RevenueLog(
                    driver_id=d_id,
                    trip_id=trip_id,
                    amount=float(row['trip_distance_km']) * 2.5,
                    logged_at=ts
                )
                db.add(revenue)
                
            # Seeding Alerts
            if int(row['anomaly_flag']) == 1 or int(row['maintenance_required']) == 1:
                alert = AlertLog(
                    time=ts,
                    vehicle_id=v_id,
                    alert_type="Battery Health Degradation" if soh < 75.0 else "Low Battery" if soc < 20.0 else "Maintenance Due" if int(row['maintenance_required']) == 1 else "Overspeeding",
                    message=f"Alert: anomaly detected on route {row['road_type']}. Risk Score: {row['failure_risk_score']}",
                    resolved=False
                )
                db.add(alert)
                
            # Seeding Maintenance
            if int(row['maintenance_required']) == 1:
                maint = MaintenanceLog(
                    vehicle_id=v_id,
                    description=f"Automated alert: last service {int(row['last_service_days'])} days ago. status: {row['maintenance_status']}",
                    cost=float(150.0 + int(row['last_service_days']) * 1.5),
                    performed_at=ts
                )
                db.add(maint)
                
            count += 1
            if count % 1000 == 0:
                db.commit()
                
        db.commit()
        print(f"[DATABASE SEED] Successfully seeded database with {count} entries from Excel.")
    except Exception as e:
        db.rollback()
        print(f"[DATABASE SEED ERROR] Failed to seed database: {e}")
    finally:
        db.close()
