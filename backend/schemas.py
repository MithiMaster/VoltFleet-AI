from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    admin_id: Optional[str] = None

# Company Schemas
class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)

class CompanyResponse(BaseModel):
    company_id: str
    name: str
    created_at: datetime
    class Config:
        from_attributes = True

# Admin Schemas
class AdminCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    company_name: str = Field(..., min_length=2, max_length=255)

class AdminResponse(BaseModel):
    admin_id: str
    company_id: str
    email: EmailStr
    is_verified: bool
    created_at: datetime
    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

# DriverGroup Schemas
class DriverGroupCreate(BaseModel):
    group_name: str = Field(..., min_length=2, max_length=100)

class DriverGroupResponse(BaseModel):
    group_id: str
    company_id: str
    group_name: str
    created_at: datetime
    class Config:
        from_attributes = True

# Driver Schemas
class DriverCreate(BaseModel):
    first_name: str
    last_name: str
    license_number: str
    email: Optional[EmailStr] = None
    group_id: Optional[str] = None

class DriverSignUp(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    license_number: str = Field(..., min_length=1)
    company_id: str

class DriverUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    license_number: Optional[str] = None
    email: Optional[EmailStr] = None
    group_id: Optional[str] = None
    is_active: Optional[bool] = None

class DriverResponse(BaseModel):
    driver_id: str
    group_id: Optional[str]
    first_name: str
    last_name: str
    license_number: str
    email: Optional[EmailStr]
    is_active: bool
    is_verified: bool
    created_at: datetime
    class Config:
        from_attributes = True

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)


# Vehicle Schemas
class VehicleCreate(BaseModel):
    vin: str = Field(..., min_length=17, max_length=17)
    brand: str
    model: str
    battery_capacity_kwh: float
    group_id: Optional[str] = None

class VehicleUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    battery_capacity_kwh: Optional[float] = None
    current_soc: Optional[float] = None
    battery_health: Optional[float] = None
    status: Optional[str] = None
    group_id: Optional[str] = None

class VehicleResponse(BaseModel):
    vehicle_id: str
    group_id: Optional[str]
    vin: str
    brand: str
    model: str
    battery_capacity_kwh: float
    current_soc: float
    battery_health: float
    status: str
    created_at: datetime
    
    # specifications from vehicles.csv
    car_name: Optional[str] = None
    charging_time_spec: Optional[str] = None
    max_power_bhp: Optional[float] = None
    claimed_range_km: Optional[float] = None
    motor_power_kw: Optional[float] = None
    vehicle_weight_kg: Optional[float] = None
    initial_battery_health_pct: Optional[float] = None
    
    class Config:
        from_attributes = True

# Telemetry Schemas
class BatteryLogCreate(BaseModel):
    battery_percentage: float
    voltage: Optional[float] = None
    current_draw: Optional[float] = None
    temperature_celsius: Optional[float] = None
    soh_percentage: Optional[float] = None

class SpeedLogCreate(BaseModel):
    speed_kmh: float
    latitude: float
    longitude: float
    total_distance_km: Optional[float] = None

# Alert Schemas
class AlertLogResponse(BaseModel):
    time: datetime
    alert_id: str
    vehicle_id: str
    alert_type: str
    message: Optional[str]
    resolved: bool
    class Config:
        from_attributes = True

# Maintenance Schemas
class MaintenanceLogCreate(BaseModel):
    vehicle_id: str
    description: str
    cost: float

class MaintenanceLogResponse(BaseModel):
    maintenance_id: str
    vehicle_id: str
    description: str
    cost: float
    performed_at: datetime
    class Config:
        from_attributes = True

# Dashboard Analytics response schemas
class FleetPulseSummary(BaseModel):
    active: int
    charging: int
    idle: int
    maintenance: int
    total: int

class EnergyTrendPoint(BaseModel):
    day: str
    kwh: float
    cost: float

class DriverScoreResponse(BaseModel):
    name: str
    score: int
    trips: int
    efficiency: float
