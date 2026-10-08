from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from backend.database import Base

# Helper to generate UUIDs
def generate_uuid():
    return str(uuid.uuid4())

class Company(Base):
    __tablename__ = "companies"
    
    company_id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    admins = relationship("Admin", back_populates="company", cascade="all, delete-orphan")
    driver_groups = relationship("DriverGroup", back_populates="company", cascade="all, delete-orphan")

class Admin(Base):
    __tablename__ = "admins"
    
    admin_id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.company_id", ondelete="CASCADE"))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False)
    first_name = Column(String(100), nullable=True, default="Fleet")
    last_name = Column(String(100), nullable=True, default="Manager")
    phone = Column(String(50), nullable=True, default="+1 (415) 555-0142")
    location = Column(String(255), nullable=True, default="San Francisco, California")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="admins")

class DriverGroup(Base):
    __tablename__ = "driver_groups"
    
    group_id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.company_id", ondelete="CASCADE"))
    group_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="driver_groups")
    drivers = relationship("Driver", back_populates="group")
    vehicles = relationship("Vehicle", back_populates="group")

class Driver(Base):
    __tablename__ = "drivers"
    
    driver_id = Column(String(36), primary_key=True, default=generate_uuid)
    group_id = Column(String(36), ForeignKey("driver_groups.group_id", ondelete="SET NULL"), nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    phone = Column(String(50), nullable=True, default="+1 (415) 555-0142")
    location = Column(String(255), nullable=True, default="San Francisco, California")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    group = relationship("DriverGroup", back_populates="drivers")
    revenue_logs = relationship("RevenueLog", back_populates="driver", cascade="all, delete-orphan")
    trips = relationship("TripLog", back_populates="driver", cascade="all, delete-orphan")
    realtime_data = relationship("DriverRealtimeData", back_populates="driver", cascade="all, delete-orphan")

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    vehicle_id = Column(String(36), primary_key=True, default=generate_uuid)
    group_id = Column(String(36), ForeignKey("driver_groups.group_id", ondelete="SET NULL"), nullable=True)
    vin = Column(String(50), unique=True, nullable=False)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    battery_capacity_kwh = Column(Float, nullable=False)
    current_soc = Column(Float, default=100.0)
    battery_health = Column(Float, default=100.0)
    status = Column(String(50), default="In Garage")  # 'Active', 'Charging', 'In Garage', 'Under Maintenance', 'Offline'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Fields from vehicles.csv
    car_name = Column(String(255), nullable=True)
    charging_time_spec = Column(String(255), nullable=True)
    max_power_bhp = Column(Float, nullable=True)
    claimed_range_km = Column(Float, nullable=True)
    motor_power_kw = Column(Float, nullable=True)
    vehicle_weight_kg = Column(Float, nullable=True)
    initial_battery_health_pct = Column(Float, nullable=True)
    
    group = relationship("DriverGroup", back_populates="vehicles")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle", cascade="all, delete-orphan")
    battery_logs = relationship("BatteryLog", back_populates="vehicle", cascade="all, delete-orphan")
    speed_logs = relationship("SpeedLog", back_populates="vehicle", cascade="all, delete-orphan")
    trips = relationship("TripLog", back_populates="vehicle", cascade="all, delete-orphan")
    alerts = relationship("AlertLog", back_populates="vehicle", cascade="all, delete-orphan")
    realtime_data = relationship("DriverRealtimeData", back_populates="vehicle", cascade="all, delete-orphan")

class DriverRealtimeData(Base):
    __tablename__ = "driver_realtime_data"
    
    trip_log_id = Column(String(50), primary_key=True)
    driver_id = Column(String(36), ForeignKey("drivers.driver_id", ondelete="CASCADE"), nullable=False)
    vehicle_id = Column(String(36), ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"), nullable=False)
    car_name = Column(String(100), nullable=True)
    current_battery_pct = Column(Float, nullable=False)
    battery_capacity_kwh = Column(Float, nullable=False)
    current_speed_kmh = Column(Float, nullable=False)
    ac_status = Column(Integer, nullable=False)
    route_type = Column(String(50), nullable=False)
    outside_temperature_c = Column(Float, nullable=False)
    elevation_ahead = Column(String(50), nullable=False)
    driver_efficiency_score = Column(Float, nullable=False)
    distance_to_destination_km = Column(Float, nullable=False)
    actual_remaining_range_km = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    vehicle = relationship("Vehicle", back_populates="realtime_data")
    driver = relationship("Driver", back_populates="realtime_data")

class RevenueLog(Base):
    __tablename__ = "revenue_logs"
    
    revenue_id = Column(String(36), primary_key=True, default=generate_uuid)
    driver_id = Column(String(36), ForeignKey("drivers.driver_id", ondelete="CASCADE"))
    trip_id = Column(String(36), nullable=True)  # References trip_logs
    amount = Column(Float, nullable=False)
    logged_at = Column(DateTime, default=datetime.utcnow)
    
    driver = relationship("Driver", back_populates="revenue_logs")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    
    maintenance_id = Column(String(36), primary_key=True, default=generate_uuid)
    vehicle_id = Column(String(36), ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"))
    description = Column(Text, nullable=False)
    cost = Column(Float, nullable=False)
    performed_at = Column(DateTime, default=datetime.utcnow)
    
    vehicle = relationship("Vehicle", back_populates="maintenance_logs")

# Time-series tables (hypertables in TimescaleDB)
class BatteryLog(Base):
    __tablename__ = "battery_logs"
    
    time = Column(DateTime, primary_key=True, default=datetime.utcnow)
    vehicle_id = Column(String(36), ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"), primary_key=True)
    battery_percentage = Column(Float, nullable=False)
    voltage = Column(Float, nullable=True)
    current_draw = Column(Float, nullable=True)
    temperature_celsius = Column(Float, nullable=True)
    soh_percentage = Column(Float, nullable=True)
    degradation_factor = Column(Float, nullable=True)
    
    vehicle = relationship("Vehicle", back_populates="battery_logs")

class SpeedLog(Base):
    __tablename__ = "speed_logs"
    
    time = Column(DateTime, primary_key=True, default=datetime.utcnow)
    vehicle_id = Column(String(36), ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"), primary_key=True)
    speed_kmh = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_distance_km = Column(Float, nullable=True)
    
    vehicle = relationship("Vehicle", back_populates="speed_logs")

class TripLog(Base):
    __tablename__ = "trip_logs"
    
    time = Column(DateTime, primary_key=True, default=datetime.utcnow)  # Start time
    trip_id = Column(String(36), primary_key=True, default=generate_uuid)
    vehicle_id = Column(String(36), ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"))
    driver_id = Column(String(36), ForeignKey("drivers.driver_id", ondelete="CASCADE"))
    end_time = Column(DateTime, nullable=True)
    distance_covered_km = Column(Float, default=0.0)
    energy_consumed_kwh = Column(Float, default=0.0)
    overspeeding_events_count = Column(Integer, default=0)
    
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")

class AlertLog(Base):
    __tablename__ = "alerts_logs"
    
    time = Column(DateTime, primary_key=True, default=datetime.utcnow)
    alert_id = Column(String(36), primary_key=True, default=generate_uuid)
    vehicle_id = Column(String(36), ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"))
    alert_type = Column(String(100), nullable=False)  # 'Low Battery', 'Overspeeding', 'Vehicle Offline', 'Maintenance Due', 'Battery Health Degradation'
    message = Column(Text, nullable=True)
    resolved = Column(Boolean, default=False)
    
    vehicle = relationship("Vehicle", back_populates="alerts")

class OTPVerification(Base):
    __tablename__ = "otp_verifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_verified = Column(Boolean, default=False)
    purpose = Column(String(50), default="signup")

