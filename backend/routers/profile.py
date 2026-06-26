from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from lib.supabase import admin_supabase
from models.schemas import ProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])

PROFILE_COLUMNS = (
    "id, email, full_name, gender, birthday, height_cm, weight_kg, goal, "
    "desired_weight_kg, weight_speed_kg_week, workouts_per_week, diet_preference, "
    "blocker, accomplish, rollover_calories, add_calories_burned, metric, "
    "referral_source, onboarding_complete, notification_preferences, preferences, created_at"
)


@router.get("")
async def get_profile(user: dict = Depends(get_current_user)):
    res = admin_supabase.table("users").select(PROFILE_COLUMNS).eq("id", user["id"]).limit(1).execute()
    if res.data:
        return res.data[0]

    # Self-heal: a row should be auto-created by the handle_new_user trigger on
    # signup, but if it's missing (e.g. trigger not yet applied), create it now
    # so the client never sees a spurious "Profile not found".
    admin_supabase.table("users").upsert(
        {"id": user["id"], "email": user["email"]}, on_conflict="id"
    ).execute()
    res = admin_supabase.table("users").select(PROFILE_COLUMNS).eq("id", user["id"]).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Could not create profile")
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
