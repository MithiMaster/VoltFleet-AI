import os
import sys

# Add directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal
from backend.models import OTPVerification

def get_otp():
    db = SessionLocal()
    try:
        otp = db.query(OTPVerification).filter(
            OTPVerification.email == "you@fleet.com"
        ).order_by(OTPVerification.created_at.desc()).first()
        
        if otp:
            print(f"LATEST OTP CODE: {otp.otp_code}")
        else:
            print("No OTP code found for you@fleet.com")
    except Exception as e:
        print(f"Error querying OTP: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    get_otp()
