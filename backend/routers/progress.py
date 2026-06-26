from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from middleware.auth import get_current_user
from lib.supabase import admin_supabase

router = APIRouter(prefix="/progress", tags=["progress"])


def _week_start(d: date) -> date:
    return d - timedelta(days=d.weekday())  # Monday


@router.get("/weekly")
async def weekly_progress(
    week_start: date = Query(default=None),
    user: dict = Depends(get_current_user),
):
    if week_start is None:
        week_start = _week_start(date.today())
    week_end = week_start + timedelta(days=6)

    res = (
        admin_supabase.table("food_logs")
        .select("log_date,calories,protein_g,carbs_g,fat_g")
        .eq("user_id", user["id"])
        .gte("log_date", week_start.isoformat())
        .lte("log_date", week_end.isoformat())
        .execute()
    )
    logs = res.data or []

    # Get plan target
    plan_res = (
        admin_supabase.table("plans")
        .select("calories_target")
        .eq("user_id", user["id"])
        .eq("is_active", True)
        .limit(1)
        .execute()
    )
    goal = plan_res.data[0]["calories_target"] if plan_res.data else 2000

    # Aggregate per day
    days: dict[str, dict] = {}
    for log in logs:
        d = log["log_date"]
        if d not in days:
            days[d] = {"date": d, "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0}
        days[d]["calories"] += log.get("calories") or 0
        days[d]["protein_g"] += log.get("protein_g") or 0
        days[d]["carbs_g"]   += log.get("carbs_g")   or 0
        days[d]["fat_g"]     += log.get("fat_g")     or 0

    # Fill in all 7 days even if no logs
    daily = []
    for i in range(7):
        d = (week_start + timedelta(days=i)).isoformat()
        entry = days.get(d, {"date": d, "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0})
        entry["goal_calories"] = goal
        # On target = within a band around goal, not merely "logged something
        # under goal" (a single 20-kcal day shouldn't count).
        entry["on_target"] = goal * 0.8 <= entry["calories"] <= goal * 1.05
        daily.append(entry)

    logged_days = sum(1 for d in daily if d["calories"] > 0)
    avg_calories = round(sum(d["calories"] for d in daily) / max(logged_days, 1), 1)

    return {
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "goal_calories": goal,
        "daily": daily,
        "days_logged": logged_days,
        "days_on_target": sum(1 for d in daily if d["on_target"] and d["calories"] > 0),
        "avg_calories": avg_calories,
    }


@router.get("/monthly")
async def monthly_progress(
    year: int = Query(default=None, ge=2020, le=2100),
    month: int = Query(default=None, ge=1, le=12),
    user: dict = Depends(get_current_user),
):
    today = date.today()
    if year is None:
        year = today.year
    if month is None:
        month = today.month

    month_start = date(year, month, 1)
    if month == 12:
        month_end = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        month_end = date(year, month + 1, 1) - timedelta(days=1)

    res = (
        admin_supabase.table("food_logs")
        .select("log_date,calories,protein_g,carbs_g,fat_g")
        .eq("user_id", user["id"])
        .gte("log_date", month_start.isoformat())
        .lte("log_date", month_end.isoformat())
        .execute()
    )
    logs = res.data or []

    plan_res = (
        admin_supabase.table("plans")
        .select("calories_target")
        .eq("user_id", user["id"])
        .eq("is_active", True)
        .limit(1)
        .execute()
    )
    goal = plan_res.data[0]["calories_target"] if plan_res.data else 2000

    days: dict[str, dict] = {}
    for log in logs:
        d = log["log_date"]
        if d not in days:
            days[d] = {"date": d, "calories": 0}
        days[d]["calories"] += log.get("calories") or 0

    logged_days = len(days)
    on_target = sum(1 for v in days.values() if goal * 0.8 <= v["calories"] <= goal * 1.05)
    avg_cal = round(sum(v["calories"] for v in days.values()) / max(logged_days, 1), 1)

    return {
        "year": year,
        "month": month,
        "goal_calories": goal,
        "days_in_month": (month_end - month_start).days + 1,
        "days_logged": logged_days,
        "days_on_target": on_target,
        "adherence_pct": round(on_target / max(logged_days, 1) * 100, 1),
        "avg_calories": avg_cal,
        "daily": list(days.values()),
    }
