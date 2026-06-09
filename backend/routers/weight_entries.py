from fastapi import APIRouter, Depends, HTTPException, Query
from middleware.auth import get_current_user
from lib.supabase import admin_supabase
from models.schemas import WeightEntryCreate

router = APIRouter(prefix="/weight-entries", tags=["weight-entries"])


@router.get("")
async def list_weight_entries(limit: int = Query(default=90, ge=1, le=365), user: dict = Depends(get_current_user)):
    res = (
        admin_supabase.table("weight_entries")
        .select("*")
        .eq("user_id", user["id"])
        .order("log_date", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data or []


@router.post("")
async def create_weight_entry(body: WeightEntryCreate, user: dict = Depends(get_current_user)):
    data = body.model_dump()
    data["user_id"] = user["id"]
    data["log_date"] = data["log_date"].isoformat()

    res = admin_supabase.table("weight_entries").upsert(data, on_conflict="user_id,log_date").execute()
    return res.data[0] if res.data else {}


@router.delete("/{entry_id}")
async def delete_weight_entry(entry_id: str, user: dict = Depends(get_current_user)):
    res = (
        admin_supabase.table("weight_entries")
        .delete()
        .eq("id", entry_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"deleted": True}
