from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from lib.supabase import admin_supabase
from models.schemas import ExerciseLogCreate

router = APIRouter(prefix="/exercise-logs", tags=["exercise-logs"])


@router.get("")
async def list_exercise_logs(log_date: date, user: dict = Depends(get_current_user)):
    res = (
        admin_supabase.table("exercise_logs")
        .select("*")
        .eq("user_id", user["id"])
        .eq("log_date", log_date.isoformat())
        .execute()
    )
    total_burned = sum(e.get("calories_burned", 0) for e in (res.data or []))
    return {"date": log_date.isoformat(), "entries": res.data or [], "total_burned": total_burned}


@router.post("")
async def log_exercise(body: ExerciseLogCreate, user: dict = Depends(get_current_user)):
    data = body.model_dump()
    data["user_id"] = user["id"]
    data["log_date"] = data["log_date"].isoformat()

    res = admin_supabase.table("exercise_logs").insert(data).execute()
    return res.data[0] if res.data else {}


@router.delete("/{log_id}")
async def delete_exercise_log(log_id: str, user: dict = Depends(get_current_user)):
    res = (
        admin_supabase.table("exercise_logs")
        .delete()
        .eq("id", log_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Log entry not found")
    return {"deleted": True}
