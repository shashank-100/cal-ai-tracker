from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from lib.supabase import admin_supabase
from models.schemas import ProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("")
async def get_profile(user: dict = Depends(get_current_user)):
    res = admin_supabase.table("users").select(
        "id, email, full_name, gender, birthday, height_cm, weight_kg, goal, "
        "desired_weight_kg, weight_speed_kg_week, workouts_per_week, diet_preference, "
        "blocker, accomplish, rollover_calories, add_calories_burned, metric, "
        "referral_source, onboarding_complete, notification_preferences, preferences, created_at"
    ).eq("id", user["id"]).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return res.data[0]


@router.patch("")
async def update_profile(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    patch = body.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Serialize date fields to ISO strings for Supabase
    for key in ("birthday",):
        if key in patch and hasattr(patch[key], "isoformat"):
            patch[key] = patch[key].isoformat()

    res = admin_supabase.table("users").update(patch).eq("id", user["id"]).execute()
    return res.data[0] if res.data else {}
