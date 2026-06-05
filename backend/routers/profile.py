from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from lib.supabase import admin_supabase
from models.schemas import ProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("")
async def get_profile(user: dict = Depends(get_current_user)):
    res = admin_supabase.table("users").select("*").eq("id", user["id"]).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return res.data


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
