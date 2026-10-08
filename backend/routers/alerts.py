from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import AlertLog, Admin, DriverRealtimeData, TripLog, Vehicle
from backend.auth import get_current_admin, get_current_admin_or_driver

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

def map_alert(a: AlertLog):
    alert_type = a.alert_type.lower()
    if "critical" in alert_type or "battery" in alert_type or "overheat" in alert_type:
        type_str = "critical"
    elif "warning" in alert_type or "brake" in alert_type or "tyre" in alert_type or "tire" in alert_type:
        type_str = "warning"
    else:
        type_str = "info"
        
    return {
        "id": a.alert_id,
        "vehicle_id": a.vehicle_id,
        "type": type_str,
        "title": a.message or a.alert_type,
        "created_at": a.time,
        "resolved": a.resolved
    }

@router.get("")
@router.get("/")
def get_alerts(
    resolved: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_or_driver)
):
    query = db.query(AlertLog)
    if current_user.get("role") == "driver":
        driver_id = current_user["driver_id"]
        # Find driver's vehicle
        realtime = db.query(DriverRealtimeData).filter(DriverRealtimeData.driver_id == driver_id).first()
        vehicle_id = realtime.vehicle_id if realtime else None
        if not vehicle_id:
            trip = db.query(TripLog).filter(TripLog.driver_id == driver_id).order_by(TripLog.time.desc()).first()
            if trip:
                vehicle_id = trip.vehicle_id
        if not vehicle_id:
            first_v = db.query(Vehicle).first()
            vehicle_id = first_v.vehicle_id if first_v else None
            
        if vehicle_id:
            query = query.filter(AlertLog.vehicle_id == vehicle_id)

    if resolved is not None:
        query = query.filter(AlertLog.resolved == resolved)
    return [map_alert(a) for a in query.order_by(AlertLog.time.desc()).all()]

@router.put("/{alert_id}/resolve")
def resolve_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_or_driver)
):
    alert = db.query(AlertLog).filter(AlertLog.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    alert.resolved = True
    db.commit()
    db.refresh(alert)
    return map_alert(alert)

