import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend.models import Admin, Driver, Company, DriverGroup, OTPVerification, AlertLog, BatteryLog, SpeedLog, TripLog, RevenueLog, Vehicle

def reset_db():
    print("=== Database Reset Utility ===")
    print(f"Connecting to: {engine.url}")
    
    db = SessionLocal()
    try:
        # Delete logs, telemetry, and vehicles first due to foreign keys
        print("Cleaning up logs, telemetry, and vehicles...")
        db.query(AlertLog).delete()
        db.query(BatteryLog).delete()
        db.query(SpeedLog).delete()
        db.query(TripLog).delete()
        db.query(RevenueLog).delete()
        db.query(OTPVerification).delete()
        db.query(Vehicle).delete()
        
        # Delete drivers, driver groups, admins, and companies
        print("Cleaning up users, drivers, groups, and companies...")
        db.query(Driver).delete()
        db.query(DriverGroup).delete()
        db.query(Admin).delete()
        db.query(Company).delete()
        
        db.commit()
        print("\n[+] Success: All users, companies, drivers, and logs have been cleared.")
        print("[!] The backend will re-seed the default fleet and credentials upon next restart.")
        
    except Exception as e:
        db.rollback()
        print(f"\n[-] ERROR: Failed to reset database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_db()
