from datetime import date
from typing import Literal, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from middleware.auth import get_current_user
from lib.supabase import admin_supabase
from lib.streak import update_streak
from models.schemas import FoodLogCreate, FoodLogUpdate

router = APIRouter(prefix="/food-logs", tags=["food-logs"])


@router.get("")
async def list_food_logs(log_date: date, meal_type: Optional[Literal["breakfast", "lunch", "dinner", "snack"]] = Query(default=None), user: dict = Depends(get_current_user)):
    query = (
        admin_supabase.table("food_logs")
        .select("*")
        .eq("user_id", user["id"])
        .eq("log_date", log_date.isoformat())
        .order("logged_at")
    )
    if meal_type:
        query = query.eq("meal_type", meal_type)
    res = query.execute()
    return res.data or []


@router.get("/daily-summary")
async def daily_summary(log_date: date, user: dict = Depends(get_current_user)):
    logs_res = (
        admin_supabase.table("food_logs")
        .select("*")
        .eq("user_id", user["id"])
        .eq("log_date", log_date.isoformat())
        .execute()
    )
    logs = logs_res.data or []

    # Aggregate
    totals = {"calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0, "fiber_g": 0.0}
    entries_by_meal: dict[str, list] = {"breakfast": [], "lunch": [], "dinner": [], "snack": []}

    for entry in logs:
        for key in totals:
            totals[key] += entry.get(key) or 0
        meal = entry.get("meal_type", "snack")
        entries_by_meal.setdefault(meal, []).append(entry)

    # Get exercise calories burned for the day
    ex_res = (
        admin_supabase.table("exercise_logs")
        .select("calories_burned")
        .eq("user_id", user["id"])
        .eq("log_date", log_date.isoformat())
        .execute()
    )
    calories_burned = sum(e.get("calories_burned", 0) for e in (ex_res.data or []))

    # Get active plan target
    plan_res = (
        admin_supabase.table("plans")
        .select("calories_target")
        .eq("user_id", user["id"])
        .eq("is_active", True)
        .limit(1)
        .execute()
    )
    goal_calories = plan_res.data[0]["calories_target"] if plan_res.data else 2000

    # Check user preference for counting burned calories
    profile_res = (
        admin_supabase.table("users")
        .select("add_calories_burned")
        .eq("id", user["id"])
        .limit(1)
        .execute()
    )
    add_calories_burned = (profile_res.data[0].get("add_calories_burned", True) if profile_res.data else True)

    # Water
    water_res = (
        admin_supabase.table("water_logs")
        .select("amount_ml")
        .eq("user_id", user["id"])
        .eq("log_date", log_date.isoformat())
        .execute()
    )
    water_ml = sum(w.get("amount_ml", 0) for w in (water_res.data or []))

    return {
        "date": log_date.isoformat(),
        "total_calories": round(totals["calories"], 1),
        "total_protein_g": round(totals["protein_g"], 1),
        "total_carbs_g": round(totals["carbs_g"], 1),
        "total_fat_g": round(totals["fat_g"], 1),
        "total_fiber_g": round(totals["fiber_g"], 1),
        "calories_burned": calories_burned,
        "water_ml": water_ml,
        "goal_calories": goal_calories,
        "net_calories": round(totals["calories"] - (calories_burned if add_calories_burned else 0), 1),
        "calories_remaining": round(goal_calories - totals["calories"] + (calories_burned if add_calories_burned else 0), 1),
        "entries_by_meal": entries_by_meal,
    }


@router.post("")
async def create_food_log(body: FoodLogCreate, user: dict = Depends(get_current_user)):
    data = body.model_dump()
    data.pop("ai_raw_response", None)  # never store client-supplied raw response
    data["user_id"] = user["id"]
    data["log_date"] = data["log_date"].isoformat()

    res = admin_supabase.table("food_logs").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create log entry")

    # Update streak
    update_streak(user["id"], body.log_date)

    return res.data[0]


@router.patch("/{log_id}")
async def update_food_log(log_id: str, body: FoodLogUpdate, user: dict = Depends(get_current_user)):
    patch = body.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status_code=400, detail="No fields to update")

    res = (
        admin_supabase.table("food_logs")
        .update(patch)
        .eq("id", log_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Log entry not found")
    return res.data[0]


@router.delete("/{log_id}")
async def delete_food_log(log_id: str, user: dict = Depends(get_current_user)):
    res = admin_supabase.table("food_logs").delete().eq("id", log_id).eq("user_id", user["id"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Log entry not found")
    return {"deleted": True}
