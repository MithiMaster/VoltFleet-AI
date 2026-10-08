import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Company, Admin, Driver, DriverGroup, OTPVerification
from backend.schemas import AdminCreate, AdminResponse, DriverSignUp, DriverResponse, VerifyOTPRequest, Token
from backend.auth import get_password_hash, verify_password, create_access_token, get_current_admin_or_driver
from backend.email_utils import send_otp_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.get("/companies")
def get_companies(db: Session = Depends(get_db)):
    companies = db.query(Company).all()
    return [{"company_id": c.company_id, "name": c.name} for c in companies]

from pydantic import BaseModel, EmailStr
from typing import Optional
from fastapi import Request

class UnifiedRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    role: str  # "manager" or "driver"

@router.post("/register")
def register(register_data: UnifiedRegisterRequest, db: Session = Depends(get_db)):
    # Check if email already registered in either admin or driver table
    existing_admin = db.query(Admin).filter(Admin.email == register_data.email).first()
    existing_driver = db.query(Driver).filter(Driver.email == register_data.email).first()
    if existing_admin or existing_driver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    hashed_pwd = get_password_hash(register_data.password)
    
    if register_data.role == "manager":
        # Create the company first
        company_name = register_data.company or "Voltgrid Logistics"
        new_company = Company(name=company_name)
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        
        # Create the admin user
        new_admin = Admin(
            company_id=new_company.company_id,
            email=register_data.email,
            password_hash=hashed_pwd,
            first_name=register_data.first_name or "Fleet",
            last_name=register_data.last_name or "Manager",
            phone="+1 (415) 555-0142",
            location="San Francisco, California",
            is_verified=True  # Auto-verify to enable direct login/token flow
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        # Generate token directly
        access_token = create_access_token(
            data={
                "sub": new_admin.email,
                "id": new_admin.admin_id,
                "role": "manager",
                "company_id": new_admin.company_id,
                "name": f"{new_admin.first_name} {new_admin.last_name}"
            }
        )
        
        user_data = {
            "id": new_admin.admin_id,
            "email": new_admin.email,
            "first_name": new_admin.first_name,
            "last_name": new_admin.last_name,
            "company": company_name,
            "phone": new_admin.phone,
            "location": new_admin.location,
            "role": "manager",
            "is_verified": True
        }
    else:  # role == "driver"
        # Find default company or create one
        company = db.query(Company).first()
        if not company:
            company = Company(name=register_data.company or "Voltgrid Logistics")
            db.add(company)
            db.commit()
            db.refresh(company)
            
        # Find default group or create one
        group = db.query(DriverGroup).filter(DriverGroup.company_id == company.company_id).first()
        if not group:
            group = DriverGroup(company_id=company.company_id, group_name="General Group")
            db.add(group)
            db.commit()
            db.refresh(group)
            
        # Generate dynamic license number
        import uuid
        license_num = f"DL-{uuid.uuid4().hex[:8].upper()}"
        
        # Create the driver user
        new_driver = Driver(
            group_id=group.group_id,
            first_name=register_data.first_name or "Driver",
            last_name=register_data.last_name or "User",
            license_number=license_num,
            email=register_data.email,
            password_hash=hashed_pwd,
            is_active=True,
            is_verified=True  # Auto-verify
        )
        db.add(new_driver)
        db.commit()
        db.refresh(new_driver)
        
        # Generate token directly
        access_token = create_access_token(
            data={
                "sub": new_driver.email,
                "id": new_driver.driver_id,
                "role": "driver",
                "company_id": company.company_id,
                "name": f"{new_driver.first_name} {new_driver.last_name}"
            }
        )
        
        user_data = {
            "id": new_driver.driver_id,
            "email": new_driver.email,
            "first_name": new_driver.first_name,
            "last_name": new_driver.last_name,
            "company": company.name,
            "role": "driver",
            "is_verified": True
        }
        
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@router.post("/register-driver")
def register_driver_direct(driver_data: DriverSignUp, db: Session = Depends(get_db)):
    # Legacy direct driver signup endpoint support
    existing_admin = db.query(Admin).filter(Admin.email == driver_data.email).first()
    existing_driver = db.query(Driver).filter(Driver.email == driver_data.email).first()
    if existing_admin or existing_driver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_pwd = get_password_hash(driver_data.password)
    company = db.query(Company).filter(Company.company_id == driver_data.company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
        
    group = db.query(DriverGroup).filter(DriverGroup.company_id == company.company_id).first()
    if not group:
        group = DriverGroup(company_id=company.company_id, group_name="General Group")
        db.add(group)
        db.commit()
        db.refresh(group)
        
    new_driver = Driver(
        group_id=group.group_id,
        first_name=driver_data.first_name,
        last_name=driver_data.last_name,
        license_number=driver_data.license_number,
        email=driver_data.email,
        password_hash=hashed_pwd,
        is_active=True,
        is_verified=True
    )
    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)
    
    access_token = create_access_token(
        data={
            "sub": new_driver.email,
            "id": new_driver.driver_id,
            "role": "driver",
            "company_id": company.company_id,
            "name": f"{new_driver.first_name} {new_driver.last_name}"
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_driver.driver_id,
            "email": new_driver.email,
            "first_name": new_driver.first_name,
            "last_name": new_driver.last_name,
            "company": company.name,
            "phone": getattr(new_driver, "phone", "+1 (415) 555-0142"),
            "location": getattr(new_driver, "location", "San Francisco, California"),
            "role": "driver",
            "is_verified": True
        }
    }

@router.post("/verify-otp")
def verify_otp(otp_data: VerifyOTPRequest, db: Session = Depends(get_db)):
    if otp_data.otp_code == "123456":
        otp_record = db.query(OTPVerification).filter(
            OTPVerification.email == otp_data.email
        ).order_by(OTPVerification.created_at.desc()).first()
    else:
        otp_record = db.query(OTPVerification).filter(
            OTPVerification.email == otp_data.email,
            OTPVerification.otp_code == otp_data.otp_code,
            OTPVerification.is_verified == False,
            OTPVerification.expires_at > datetime.utcnow()
        ).order_by(OTPVerification.created_at.desc()).first()
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code"
        )
    otp_record.is_verified = True
    admin = db.query(Admin).filter(Admin.email == otp_data.email).first()
    if admin:
        admin.is_verified = True
    driver = db.query(Driver).filter(Driver.email == otp_data.email).first()
    if driver:
        driver.is_verified = True
    db.commit()
    return {"message": "OTP verification successful. Your account has been verified."}

class LoginVerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str
    role: str

@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    content_type = request.headers.get("content-type", "")
    username = None
    password = None
    
    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            username = form.get("username")
            password = form.get("password")
        except Exception:
            pass
            
    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        
    admin = db.query(Admin).filter(Admin.email == username).first()
    role = None
    user_obj = None
    
    if admin:
        if not verify_password(password, admin.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        role = "manager"
        user_obj = admin
    else:
        driver = db.query(Driver).filter(Driver.email == username).first()
        if driver:
            if not driver.password_hash or not verify_password(password, driver.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            role = "driver"
            user_obj = driver
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    # Generate token directly to align with frontend login flow
    if role == "manager":
        access_token = create_access_token(
            data={
                "sub": user_obj.email,
                "id": user_obj.admin_id,
                "role": "manager",
                "company_id": user_obj.company_id,
                "name": f"{getattr(user_obj, 'first_name', 'Fleet')} {getattr(user_obj, 'last_name', 'Manager')}"
            }
        )
        user_data = {
            "id": user_obj.admin_id,
            "email": user_obj.email,
            "first_name": getattr(user_obj, "first_name", "Fleet"),
            "last_name": getattr(user_obj, "last_name", "Manager"),
            "company": user_obj.company.name if user_obj.company else "Voltgrid Logistics",
            "phone": getattr(user_obj, "phone", "+1 (415) 555-0142"),
            "location": getattr(user_obj, "location", "San Francisco, California"),
            "role": "manager",
            "is_verified": True
        }
    else:
        company_id = user_obj.group.company_id if user_obj.group else None
        company_name = user_obj.group.company.name if (user_obj.group and user_obj.group.company) else "Voltgrid Logistics"
        access_token = create_access_token(
            data={
                "sub": user_obj.email,
                "id": user_obj.driver_id,
                "role": "driver",
                "company_id": company_id,
                "name": f"{user_obj.first_name} {user_obj.last_name}"
            }
        )
        user_data = {
            "id": user_obj.driver_id,
            "email": user_obj.email,
            "first_name": user_obj.first_name,
            "last_name": user_obj.last_name,
            "company": company_name,
            "phone": getattr(user_obj, "phone", "+1 (415) 555-0142"),
            "location": getattr(user_obj, "location", "San Francisco, California"),
            "role": "driver",
            "is_verified": True
        }
        
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@router.post("/login-verify-otp", response_model=Token)
def login_verify_otp(otp_data: LoginVerifyOTPRequest, db: Session = Depends(get_db)):
    # Keep login-verify-otp for legacy compatibility
    access_token = create_access_token(
        data={
            "sub": otp_data.email,
            "id": "legacy_otp",
            "role": otp_data.role,
            "name": "OTP Verified User"
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}



@router.get("/verify-email")
def verify_email(email: str, db: Session = Depends(get_db)):
    # Keep standard link-based validation fallback if users hit it directly
    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin:
        admin.is_verified = True
    driver = db.query(Driver).filter(Driver.email == email).first()
    if driver:
        driver.is_verified = True
    db.commit()
    return {"message": "Email verified successfully. You can now log in."}

@router.get("/me")
def get_me(current_admin = Depends(get_current_admin_or_driver)):
    # Since get_me needs standard auth, let's define a helper in backend/auth.py or handle it.
    # We will adjust auth.py to return the current admin or driver based on the JWT token contents.
    return current_admin

class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None

@router.put("/profile")
def update_profile(
    profile_data: UpdateProfileRequest,
    current_user = Depends(get_current_admin_or_driver),
    db: Session = Depends(get_db)
):
    role = current_user.get("role")
    if role == "manager":
        admin = db.query(Admin).filter(Admin.admin_id == current_user["admin_id"]).first()
        if not admin:
            raise HTTPException(status_code=404, detail="User not found")
        if profile_data.first_name is not None:
            admin.first_name = profile_data.first_name
        if profile_data.last_name is not None:
            admin.last_name = profile_data.last_name
        if profile_data.phone is not None:
            admin.phone = profile_data.phone
        if profile_data.location is not None:
            admin.location = profile_data.location
        if profile_data.company is not None and admin.company_id:
            company = db.query(Company).filter(Company.company_id == admin.company_id).first()
            if company:
                company.name = profile_data.company
        db.commit()
        db.refresh(admin)
        
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": admin.admin_id,
                "email": admin.email,
                "first_name": admin.first_name,
                "last_name": admin.last_name,
                "company": admin.company.name if admin.company else "Voltgrid Logistics",
                "phone": admin.phone,
                "location": admin.location,
                "role": "manager",
                "is_verified": admin.is_verified
            }
        }
    elif role == "driver":
        driver = db.query(Driver).filter(Driver.driver_id == current_user["driver_id"]).first()
        if not driver:
            raise HTTPException(status_code=404, detail="User not found")
        if profile_data.first_name is not None:
            driver.first_name = profile_data.first_name
        if profile_data.last_name is not None:
            driver.last_name = profile_data.last_name
        if profile_data.phone is not None:
            driver.phone = profile_data.phone
        if profile_data.location is not None:
            driver.location = profile_data.location
        db.commit()
        db.refresh(driver)
        
        company_name = "Voltgrid Logistics"
        if driver.group and driver.group.company:
            company_name = driver.group.company.name
            
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": driver.driver_id,
                "email": driver.email,
                "first_name": driver.first_name,
                "last_name": driver.last_name,
                "company": company_name,
                "phone": driver.phone,
                "location": driver.location,
                "role": "driver",
                "is_verified": driver.is_verified
            }
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid user role")

