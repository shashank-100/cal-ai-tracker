from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from lib.supabase import admin_supabase
from models.schemas import WaterLogCreate

router = APIRouter(prefix="/water-logs", tags=["water-logs"])


@router.get("")
async def list_water_logs(log_date: date, user: dict = Depends(get_current_user)):
    res = (
        admin_supabase.table("water_logs")
        .select("*")
        .eq("user_id", user["id"])
        .eq("log_date", log_date.isoformat())
        .execute()
    )
    total_ml = sum(w.get("amount_ml", 0) for w in (res.data or []))
    return {"date": log_date.isoformat(), "entries": res.data or [], "total_ml": total_ml}


@router.post("")
async def log_water(body: WaterLogCreate, user: dict = Depends(get_current_user)):
    data = body.model_dump()
    data["user_id"] = user["id"]
    data["log_date"] = data["log_date"].isoformat()

    res = admin_supabase.table("water_logs").insert(data).execute()
    return res.data[0] if res.data else {}


@router.delete("/{log_id}")
async def delete_water_log(log_id: str, user: dict = Depends(get_current_user)):
    res = (
        admin_supabase.table("water_logs")
        .delete()
        .eq("id", log_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Log entry not found")
    return {"deleted": True}
