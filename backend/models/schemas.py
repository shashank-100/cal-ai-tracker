from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, Field


# ── Profile ──────────────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[str] = None
    birthday: Optional[date] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[Literal["lose", "maintain", "gain"]] = None
    desired_weight_kg: Optional[float] = None
    weight_speed_kg_week: Optional[float] = None
    workouts_per_week: Optional[int] = None
    diet_preference: Optional[str] = None
    blocker: Optional[str] = None
    accomplish: Optional[str] = None
    rollover_calories: Optional[bool] = None
    add_calories_burned: Optional[bool] = None
    metric: Optional[bool] = None
    referral_source: Optional[str] = None
    referral_code_used: Optional[str] = None
    notification_preferences: Optional[dict] = None
    preferences: Optional[dict] = None
    onboarding_complete: Optional[bool] = None


# ── Plan ─────────────────────────────────────────────────────────────────────

class PlanGenerateRequest(BaseModel):
    gender: str
    birthday: date
    height_cm: float
    weight_kg: float
    goal: Literal["lose", "maintain", "gain"]
    desired_weight_kg: float
    weight_speed_kg_week: float = Field(default=0.5, ge=0.1, le=1.5)
    workouts_per_week: int = Field(default=3, ge=0, le=7)
    diet_preference: str = "standard"


# ── Food Logs ─────────────────────────────────────────────────────────────────

class FoodLogCreate(BaseModel):
    food_item_id: Optional[str] = None
    log_date: date
    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    food_name: str
    calories: float
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    fiber_g: Optional[float] = None
    sugar_g: Optional[float] = None
    serving_qty: float = 1.0
    serving_unit: str = "g"
    photo_url: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_raw_response: Optional[dict] = None
    notes: Optional[str] = None


class FoodLogUpdate(BaseModel):
    food_name: Optional[str] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    serving_qty: Optional[float] = None
    serving_unit: Optional[str] = None
    meal_type: Optional[Literal["breakfast", "lunch", "dinner", "snack"]] = None
    notes: Optional[str] = None


# ── Weight Entries ────────────────────────────────────────────────────────────

class WeightEntryCreate(BaseModel):
    weight_kg: float
    log_date: date
    notes: Optional[str] = None


# ── Water Logs ────────────────────────────────────────────────────────────────

class WaterLogCreate(BaseModel):
    log_date: date
    amount_ml: int = Field(ge=1, le=5000)


# ── Exercise Logs ─────────────────────────────────────────────────────────────

class ExerciseLogCreate(BaseModel):
    log_date: date
    activity_name: str
    duration_min: Optional[int] = None
    calories_burned: int
    source: Literal["manual", "apple_health", "google_fit"] = "manual"
