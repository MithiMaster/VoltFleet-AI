import time
import random
import threading
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.config import settings
from backend.database import SessionLocal
from backend.models import Vehicle, Driver, BatteryLog, SpeedLog, TripLog, AlertLog, RevenueLog

class FleetSimulator(threading.Thread):
    def __init__(self):
        super().__init__()
        self.daemon = True
        self.running = False
        
    def start_simulation(self):
        self.running = True
        self.start()
        print("[SIMULATOR] Telemetry simulator started in background thread.")
        
    def stop_simulation(self):
        self.running = False
        print("[SIMULATOR] Stopping telemetry simulator...")
        
    def run(self):
        while self.running:
            try:
                self.tick()
            except Exception as e:
                print(f"[SIMULATOR ERROR] Error in simulation tick: {e}")
            time.sleep(settings.SIMULATION_INTERVAL_SECONDS)
            
    def tick(self):
        db: Session = SessionLocal()
        try:
            vehicles = db.query(Vehicle).all()
            drivers = db.query(Driver).filter(Driver.is_active == True).all()
            
            if not vehicles or not drivers:
                # No data to simulate yet
                return
                
            for vehicle in vehicles:
                self.simulate_vehicle(db, vehicle, drivers)
                
            db.commit()
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
            
    def simulate_vehicle(self, db: Session, vehicle: Vehicle, drivers: list):
        now = datetime.utcnow()
        
        # 1. Handle Charging State
        if vehicle.status == "charging":
            # Increment battery
            charge_increase = random.uniform(3.0, 6.0)  # charge rate per tick
            vehicle.current_soc = min(100.0, vehicle.current_soc + charge_increase)
            
            # Log battery status
            battery_log = BatteryLog(
                time=now,
                vehicle_id=vehicle.vehicle_id,
                battery_percentage=round(vehicle.current_soc, 2),
                voltage=380.0 + random.uniform(-5, 5),
                current_draw=-40.0,  # Negative means charging
                temperature_celsius=35.0 + random.uniform(-2, 2),
                soh_percentage=round(vehicle.battery_health, 2),
                degradation_factor=0.0001
            )
            db.add(battery_log)
            
            if vehicle.current_soc >= 100.0:
                vehicle.status = "idle"
                # If there's an active trip, complete it
                active_trip = db.query(TripLog).filter(
                    TripLog.vehicle_id == vehicle.vehicle_id,
                    TripLog.end_time == None
                ).first()
                if active_trip:
                    active_trip.end_time = now
                    
        # 2. Handle Driving State
        elif vehicle.status == "driving":
            # Decrement battery
            discharge = random.uniform(1.0, 3.0)  # battery drain per tick
            vehicle.current_soc = max(0.0, vehicle.current_soc - discharge)
            
            # Degrade battery health slightly
            vehicle.battery_health = max(50.0, vehicle.battery_health - 0.005)
            
            # Update location (simulate moving around a baseline)
            # Center near a dummy city coordinate
            lat_base = 12.9716 # Bengaluru base
            lng_base = 77.5946
            lat = lat_base + random.uniform(-0.08, 0.08)
            lng = lng_base + random.uniform(-0.08, 0.08)
            
            speed = random.uniform(30.0, 95.0)
            
            # Log Speed & Location
            speed_log = SpeedLog(
                time=now,
                vehicle_id=vehicle.vehicle_id,
                speed_kmh=round(speed, 1),
                latitude=round(lat, 6),
                longitude=round(lng, 6),
                total_distance_km=random.uniform(5.0, 15.0)
            )
            db.add(speed_log)
            
            # Log Battery status
            battery_log = BatteryLog(
                time=now,
                vehicle_id=vehicle.vehicle_id,
                battery_percentage=round(vehicle.current_soc, 2),
                voltage=360.0 + random.uniform(-10, 10),
                current_draw=random.uniform(15.0, 45.0), # Positive means discharging
                temperature_celsius=40.0 + random.uniform(-3, 5),
                soh_percentage=round(vehicle.battery_health, 2),
                degradation_factor=0.0005
            )
            db.add(battery_log)
            
            # Update active trip metrics
            active_trip = db.query(TripLog).filter(
                TripLog.vehicle_id == vehicle.vehicle_id,
                TripLog.end_time == None
            ).first()
            
            if active_trip:
                active_trip.distance_covered_km += round(speed * (settings.SIMULATION_INTERVAL_SECONDS / 3600.0), 2)
                active_trip.energy_consumed_kwh += round(discharge * (vehicle.battery_capacity_kwh / 100.0), 2)
                
                # Overspeeding Alert Trigger
                if speed > 85.0:
                    active_trip.overspeeding_events_count += 1
                    # Trigger alert log
                    alert = AlertLog(
                        time=now,
                        vehicle_id=vehicle.vehicle_id,
                        alert_type="Overspeeding",
                        message=f"Vehicle exceeded speed limit: {round(speed, 1)} km/h",
                        resolved=False
                    )
                    db.add(alert)
            
            # Check for Low Battery Alert
            if vehicle.current_soc < 15.0:
                alert_exists = db.query(AlertLog).filter(
                    AlertLog.vehicle_id == vehicle.vehicle_id,
                    AlertLog.alert_type == "Low Battery",
                    AlertLog.resolved == False
                ).first()
                if not alert_exists:
                    alert = AlertLog(
                        time=now,
                        vehicle_id=vehicle.vehicle_id,
                        alert_type="Low Battery",
                        message=f"Battery level critical: {round(vehicle.current_soc, 1)}%",
                        resolved=False
                    )
                    db.add(alert)
                    
            # Check for Battery Health Degradation Alert
            if vehicle.battery_health < 75.0:
                alert_exists = db.query(AlertLog).filter(
                    AlertLog.vehicle_id == vehicle.vehicle_id,
                    AlertLog.alert_type == "Battery Health Degradation",
                    AlertLog.resolved == False
                ).first()
                if not alert_exists:
                    alert = AlertLog(
                        time=now,
                        vehicle_id=vehicle.vehicle_id,
                        alert_type="Battery Health Degradation",
                        message=f"State of Health degraded below 75%: {round(vehicle.battery_health, 1)}%",
                        resolved=False
                    )
                    db.add(alert)
                    vehicle.status = "maintenance"
                    
            # Check if trip should end
            if vehicle.current_soc <= 10.0 or random.random() < 0.05:
                # End trip
                if active_trip:
                    active_trip.end_time = now
                    # Log driver revenue
                    driver_revenue = RevenueLog(
                        driver_id=active_trip.driver_id,
                        trip_id=active_trip.trip_id,
                        amount=round(active_trip.distance_covered_km * random.uniform(1.5, 2.5), 2)
                    )
                    db.add(driver_revenue)
                
                # Change vehicle status
                if vehicle.current_soc <= 15.0:
                    vehicle.status = "charging"
                else:
                    vehicle.status = "idle"
                    
        # 3. Handle Idle / Maintenance State
        else:
            # Randomly trigger driving or charging
            if vehicle.status == "idle":
                if vehicle.current_soc < 30.0:
                    vehicle.status = "charging"
                elif random.random() < 0.15:
                    # Assign a random driver
                    driver = random.choice(drivers)
                    
                    # Make sure the driver doesn't have an active trip
                    active_driver_trip = db.query(TripLog).filter(
                        TripLog.driver_id == driver.driver_id,
                        TripLog.end_time == None
                    ).first()
                    
                    if not active_driver_trip:
                        vehicle.status = "driving"
                        # Start new trip
                        new_trip = TripLog(
                            time=now,
                            vehicle_id=vehicle.vehicle_id,
                            driver_id=driver.driver_id,
                            distance_covered_km=0.0,
                            energy_consumed_kwh=0.0,
                            overspeeding_events_count=0
                        )
                        db.add(new_trip)
            elif vehicle.status == "maintenance":
                # Randomly complete maintenance
                if random.random() < 0.03:
                    vehicle.battery_health = 100.0  # restored
                    vehicle.status = "idle"

# Global simulator instance
simulator = FleetSimulator()
