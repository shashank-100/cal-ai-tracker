from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.auth import get_current_user
from lib.supabase import admin_supabase
from lib.plan_calc import generate_plan
from models.schemas import PlanGenerateRequest


class PlanPatch(BaseModel):
    is_active: bool | None = None

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("")
async def get_active_plan(user: dict = Depends(get_current_user)):
    res = (
        admin_supabase.table("plans")
        .select("*")
        .eq("user_id", user["id"])
        .eq("is_active", True)
        .order("generated_at", desc=True)
        .limit(1)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="No active plan found")
    return res.data[0]


@router.post("/generate")
async def generate_user_plan(body: PlanGenerateRequest, user: dict = Depends(get_current_user)):
    plan_data = generate_plan(
        gender=body.gender,
        birthday=body.birthday,
        height_cm=body.height_cm,
        weight_kg=body.weight_kg,
        goal=body.goal,
        desired_weight_kg=body.desired_weight_kg,
        weight_speed_kg_week=body.weight_speed_kg_week,
        workouts_per_week=body.workouts_per_week,
        diet_preference=body.diet_preference,
    )

    # Insert new plan first — if this fails, existing plan stays active
    res = admin_supabase.table("plans").insert({
        "user_id": user["id"],
        "is_active": True,
        **plan_data,
    }).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create plan")

    # Only deactivate old plans after new one is confirmed saved
    admin_supabase.table("plans").update({"is_active": False}).eq("user_id", user["id"]).neq("id", res.data[0]["id"]).execute()

    return res.data[0]


@router.patch("/{plan_id}")
async def update_plan(plan_id: str, body: PlanPatch, user: dict = Depends(get_current_user)):
    patch = body.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = admin_supabase.table("plans").update(patch).eq("id", plan_id).eq("user_id", user["id"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Plan not found")
    return res.data[0]
