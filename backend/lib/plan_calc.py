from datetime import date, datetime
from typing import Literal


ACTIVITY_FACTORS = {0: 1.2, 1: 1.375, 2: 1.375, 3: 1.55, 4: 1.55, 5: 1.725, 6: 1.725, 7: 1.9}

MACRO_SPLITS: dict[str, tuple[float, float, float]] = {
    # (protein_ratio, carbs_ratio, fat_ratio) — fractions of total calories
    "standard":    (0.30, 0.40, 0.30),
    "classic":     (0.30, 0.40, 0.30),
    "keto":        (0.25, 0.05, 0.70),
    "vegetarian":  (0.25, 0.50, 0.25),
    "vegan":       (0.20, 0.55, 0.25),
    "paleo":       (0.30, 0.35, 0.35),
    "pescatarian": (0.30, 0.40, 0.30),
}


def calculate_age(birthday: date) -> int:
    today = date.today()
    return today.year - birthday.year - ((today.month, today.day) < (birthday.month, birthday.day))


def generate_plan(
    gender: str,
    birthday: date,
    height_cm: float,
    weight_kg: float,
    goal: Literal["lose", "maintain", "gain"],
    desired_weight_kg: float,
    weight_speed_kg_week: float,
    workouts_per_week: int,
    diet_preference: str = "standard",
) -> dict:
    age = calculate_age(birthday)

    # Mifflin-St Jeor BMR
    if gender.lower() in ("male", "m"):
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    factor = ACTIVITY_FACTORS.get(min(workouts_per_week, 7), 1.375)
    tdee = round(bmr * factor)

    # 7700 kcal ≈ 1 kg of body fat
    daily_delta = round((weight_speed_kg_week * 7700) / 7)

    if goal == "lose":
        calories_target = tdee - daily_delta
    elif goal == "gain":
        calories_target = tdee + daily_delta
    else:
        calories_target = tdee

    calories_target = max(1200, calories_target)

    split = MACRO_SPLITS.get(diet_preference.lower(), MACRO_SPLITS["standard"])
    protein_ratio, carbs_ratio, fat_ratio = split

    protein_g = round((calories_target * protein_ratio) / 4)
    carbs_g   = round((calories_target * carbs_ratio)   / 4)
    fat_g     = round((calories_target * fat_ratio)     / 9)

    # Estimated weeks to goal — derive from the EFFECTIVE deficit/surplus after
    # the 1200 floor, not the requested speed, so the timeline isn't a lie when
    # the target was clamped.
    weight_diff_kg = abs(desired_weight_kg - weight_kg)
    effective_daily = abs(tdee - calories_target)
    if goal == "maintain" or effective_daily == 0 or weight_diff_kg == 0:
        weeks_to_goal = 0
    else:
        effective_kg_week = (effective_daily * 7) / 7700
        weeks_to_goal = round(weight_diff_kg / effective_kg_week) if effective_kg_week > 0 else 0

    return {
        "calories_target": calories_target,
        "protein_g": protein_g,
        "carbs_g": carbs_g,
        "fat_g": fat_g,
        "tdee": tdee,
        "bmr": round(bmr),
        "activity_factor": factor,
        "deficit_surplus": calories_target - tdee,
        "weeks_to_goal": weeks_to_goal,
    }
