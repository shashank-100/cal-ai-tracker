from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from lib.supabase import admin_supabase

router = APIRouter(prefix="/streaks", tags=["streaks"])


@router.get("")
async def get_streak(user: dict = Depends(get_current_user)):
    res = admin_supabase.table("streaks").select("*").eq("user_id", user["id"]).single().execute()
    return res.data or {"current_streak": 0, "longest_streak": 0, "last_log_date": None}


@router.get("/achievements")
async def get_achievements(user: dict = Depends(get_current_user)):
    # All achievement definitions
    all_res = admin_supabase.table("achievements").select("*").execute()
    # User's unlocked ones
    unlocked_res = (
        admin_supabase.table("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", user["id"])
        .execute()
    )
    unlocked_ids = {r["achievement_id"] for r in (unlocked_res.data or [])}
    unlocked_map = {r["achievement_id"]: r["unlocked_at"] for r in (unlocked_res.data or [])}

    result = []
    for a in (all_res.data or []):
        result.append({
            **a,
            "unlocked": a["id"] in unlocked_ids,
            "unlocked_at": unlocked_map.get(a["id"]),
        })
    return result
