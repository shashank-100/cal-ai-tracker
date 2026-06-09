from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator


# ── Profile ──────────────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=200)
    gender: Optional[str] = Field(default=None, max_length=50)
    birthday: Optional[date] = None
    height_cm: Optional[float] = Field(default=None, gt=0, le=300)
    weight_kg: Optional[float] = Field(default=None, gt=0, le=700)
    goal: Optional[Literal["lose", "maintain", "gain"]] = None
    desired_weight_kg: Optional[float] = None
    weight_speed_kg_week: Optional[float] = None
    workouts_per_week: Optional[int] = None
    diet_preference: Optional[str] = Field(default=None, max_length=100)
    blocker: Optional[str] = Field(default=None, max_length=500)
    accomplish: Optional[str] = Field(default=None, max_length=500)
    rollover_calories: Optional[bool] = None
    add_calories_burned: Optional[bool] = None
    metric: Optional[bool] = None
    referral_source: Optional[str] = Field(default=None, max_length=200)
    onboarding_complete: Optional[bool] = None
    referral_code_used: Optional[str] = Field(default=None, max_length=50)
    notification_preferences: Optional[dict] = None
    preferences: Optional[dict] = None


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

    @field_validator("birthday")
    @classmethod
    def validate_age(cls, v: date) -> date:
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 10 or age > 120:
            raise ValueError("Birthday must correspond to an age between 10 and 120")
        return v


# ── Food Logs ─────────────────────────────────────────────────────────────────

class FoodLogCreate(BaseModel):
    food_item_id: Optional[str] = None
    log_date: date
    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    food_name: str = Field(max_length=200)
    calories: float = Field(ge=0, le=10000)
    protein_g: Optional[float] = Field(default=None, ge=0, le=1000)
    carbs_g: Optional[float] = Field(default=None, ge=0, le=1000)
    fat_g: Optional[float] = Field(default=None, ge=0, le=1000)
    fiber_g: Optional[float] = Field(default=None, ge=0, le=200)
    sugar_g: Optional[float] = Field(default=None, ge=0, le=1000)
    serving_qty: float = Field(default=1.0, gt=0, le=100)
    serving_unit: str = Field(default="g", min_length=1, max_length=20)
    photo_url: Optional[str] = Field(default=None, max_length=500)
    ai_confidence: Optional[float] = None
    ai_raw_response: Optional[dict] = None
    notes: Optional[str] = Field(default=None, max_length=1000)


class FoodLogUpdate(BaseModel):
    food_name: Optional[str] = Field(default=None, max_length=200)
    calories: Optional[float] = Field(default=None, ge=0, le=10000)
    protein_g: Optional[float] = Field(default=None, ge=0, le=1000)
    carbs_g: Optional[float] = Field(default=None, ge=0, le=1000)
    fat_g: Optional[float] = Field(default=None, ge=0, le=1000)
    serving_qty: Optional[float] = Field(default=None, gt=0, le=100)
    serving_unit: Optional[str] = Field(default=None, min_length=1, max_length=20)
    meal_type: Optional[Literal["breakfast", "lunch", "dinner", "snack"]] = None
    notes: Optional[str] = Field(default=None, max_length=1000)


# ── Weight Entries ────────────────────────────────────────────────────────────

class WeightEntryCreate(BaseModel):
    weight_kg: float = Field(gt=0, le=700)
    log_date: date
    notes: Optional[str] = Field(default=None, max_length=1000)


# ── Water Logs ────────────────────────────────────────────────────────────────

class WaterLogCreate(BaseModel):
    log_date: date
    amount_ml: int = Field(ge=1, le=5000)


# ── Exercise Logs ─────────────────────────────────────────────────────────────

class ExerciseLogCreate(BaseModel):
    log_date: date
    activity_name: str = Field(max_length=200)
    duration_min: Optional[int] = Field(default=None, ge=0, le=1440)
    calories_burned: int = Field(ge=0, le=10000)
    source: Literal["manual", "apple_health", "google_fit"] = "manual"
