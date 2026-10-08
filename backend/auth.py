from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.config import settings
from backend.database import get_db
from backend.models import Admin, Driver

# Cryptography setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token_and_get_user(token: str, db: Session):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("id")
        role: str = payload.get("role")
        if email is None or user_id is None or role is None:
            # Fallback for old/seeded token format
            admin_id = payload.get("admin_id")
            if admin_id:
                user_id = admin_id
                role = "manager"
            else:
                raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    if role == "manager":
        admin = db.query(Admin).filter(Admin.admin_id == user_id).first()
        if admin is None:
            raise credentials_exception
        return {
            "admin_id": admin.admin_id,
            "email": admin.email,
            "company_id": admin.company_id,
            "role": "manager",
            "first_name": getattr(admin, "first_name", "Fleet"),
            "last_name": getattr(admin, "last_name", "Manager"),
            "phone": getattr(admin, "phone", "+1 (415) 555-0142"),
            "location": getattr(admin, "location", "San Francisco, California")
        }
    elif role == "driver":
        driver = db.query(Driver).filter(Driver.driver_id == user_id).first()
        if driver is None:
            raise credentials_exception
        return {
            "driver_id": driver.driver_id, 
            "email": driver.email, 
            "role": "driver", 
            "first_name": driver.first_name, 
            "last_name": driver.last_name,
            "phone": getattr(driver, "phone", "+1 (415) 555-0142"),
            "location": getattr(driver, "location", "San Francisco, California")
        }
    
    raise credentials_exception

async def get_current_admin_or_driver(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    return verify_token_and_get_user(token, db)

async def get_current_admin(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> Admin:
    user = await get_current_admin_or_driver(token, db)
    if user.get("role") != "manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin access required"
        )
    return db.query(Admin).filter(Admin.admin_id == user["admin_id"]).first()

