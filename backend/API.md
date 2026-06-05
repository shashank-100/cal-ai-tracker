# Cal AI API — Reference

Base URL: `https://your-railway-url.up.railway.app`  
Local: `http://localhost:8000`  
Interactive docs: `{base_url}/docs`

## Authentication

All endpoints (except `GET /health` and `POST /referrals/validate`) require a Bearer token:

```
Authorization: Bearer <supabase_jwt_token>
```

Get the token from Supabase after sign-in:
```js
const { data } = await supabase.auth.signInWithPassword({ email, password })
const token = data.session.access_token
```

---

## Health

### `GET /health`
No auth required.

**Response 200**
```json
{ "status": "ok" }
```

---

## Profile

### `GET /profile`
Returns the current user's full profile.

**Response 200**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "gender": "male",
  "birthday": "1995-01-01",
  "height_cm": 175.0,
  "weight_kg": 75.0,
  "goal": "lose",
  "desired_weight_kg": 70.0,
  "weight_speed_kg_week": 0.5,
  "workouts_per_week": 3,
  "diet_preference": "standard",
  "blocker": "Lack of consistency",
  "accomplish": "Feel better about my body",
  "rollover_calories": false,
  "add_calories_burned": true,
  "metric": true,
  "referral_source": "Instagram",
  "referral_code_used": null,
  "notification_preferences": {
    "daily_reminder": true,
    "daily_reminder_time": "20:00",
    "weekly_summary": true,
    "goal_reached": true,
    "streak_reminder": true
  },
  "preferences": {
    "energy_unit": "kcal",
    "first_day_of_week": "monday"
  },
  "onboarding_complete": true,
  "subscription_tier": "free",
  "created_at": "2026-06-05T10:00:00Z"
}
```

**Response 404** — profile not found

---

### `PATCH /profile`
Update any profile fields. All fields optional.

**Body**
```json
{
  "full_name": "string",
  "gender": "male | female | other | prefer_not_to_say",
  "birthday": "YYYY-MM-DD",
  "height_cm": 175.0,
  "weight_kg": 75.0,
  "goal": "lose | maintain | gain",
  "desired_weight_kg": 70.0,
  "weight_speed_kg_week": 0.5,
  "workouts_per_week": 3,
  "diet_preference": "standard | keto | vegetarian | vegan | paleo | pescatarian",
  "blocker": "string",
  "accomplish": "string",
  "rollover_calories": false,
  "add_calories_burned": true,
  "metric": true,
  "referral_source": "string",
  "referral_code_used": "string",
  "notification_preferences": { "daily_reminder": true },
  "preferences": { "energy_unit": "kcal" },
  "onboarding_complete": true
}
```

**Response 200** — updated profile object  
**Response 400** — no fields provided  
**Response 422** — validation error

---

## Plans

### `GET /plans`
Get the current user's active calorie/macro plan.

**Response 200**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "calories_target": 1800,
  "protein_g": 135,
  "carbs_g": 180,
  "fat_g": 50,
  "tdee": 2300,
  "bmr": 1750,
  "activity_factor": 1.55,
  "deficit_surplus": -500,
  "weeks_to_goal": 10,
  "is_active": true,
  "generated_at": "2026-06-05T10:00:00Z"
}
```

**Response 404** — no active plan

---

### `POST /plans/generate`
Generate a new plan using Mifflin-St Jeor BMR formula. Deactivates existing plan.

**Body** (`*` = required)
```json
{
  "gender": "male",           // * male | female | other
  "birthday": "1995-01-15",   // * YYYY-MM-DD
  "height_cm": 175.0,         // *
  "weight_kg": 80.0,          // *
  "goal": "lose",             // * lose | maintain | gain
  "desired_weight_kg": 72.0,  // *
  "weight_speed_kg_week": 0.5, // default: 0.5 (range: 0.1–1.5)
  "workouts_per_week": 3,      // default: 3  (range: 0–7)
  "diet_preference": "standard" // default: standard
}
```

**Response 200** — new plan object (same shape as GET /plans)  
**Response 422** — validation error

---

### `PATCH /plans/{plan_id}`
Update specific plan fields (e.g. manually override targets).

**Body** — free-form object with fields to update
```json
{
  "calories_target": 1900,
  "protein_g": 150
}
```

**Response 200** — updated plan  
**Response 404** — plan not found

---

## Food Analysis

### `POST /food-analysis`
Upload a food photo → Claude Vision analyzes it → returns nutritional breakdown.

**Body** — `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | JPEG, PNG, or WebP. Max 5 MB |
| `meal_type` | string | No | `breakfast \| lunch \| dinner \| snack` (default: `lunch`) |

**Response 200**
```json
{
  "name": "Grilled Chicken Salad",
  "calories": 420,
  "protein_g": 38,
  "carbs_g": 22,
  "fat_g": 18,
  "fiber_g": 5,
  "sugar_g": 8,
  "serving_size": 350,
  "serving_unit": "g",
  "confidence": 0.87,
  "items": [
    { "name": "Grilled chicken breast", "calories": 220 },
    { "name": "Mixed greens", "calories": 40 },
    { "name": "Cherry tomatoes", "calories": 30 },
    { "name": "Caesar dressing", "calories": 130 }
  ],
  "photo_url": "https://xxxx.supabase.co/storage/v1/object/public/food-photos/user-id/timestamp.jpg",
  "meal_type": "lunch"
}
```

**Response 400** — unsupported image type or file too large  
**Response 502** — AI analysis failed

---

## Food Logs

### `GET /food-logs`
List all food log entries for a specific date.

**Query params**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `log_date` | date | Yes | Format: `YYYY-MM-DD` |
| `meal_type` | string | No | Filter by `breakfast \| lunch \| dinner \| snack` |

**Response 200**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "food_item_id": "uuid or null",
    "log_date": "2026-06-05",
    "meal_type": "lunch",
    "food_name": "Grilled Chicken Salad",
    "calories": 420.0,
    "protein_g": 38.0,
    "carbs_g": 22.0,
    "fat_g": 18.0,
    "fiber_g": 5.0,
    "sugar_g": 8.0,
    "serving_qty": 1.0,
    "serving_unit": "g",
    "photo_url": "https://...",
    "ai_confidence": 0.87,
    "notes": null,
    "logged_at": "2026-06-05T13:22:00Z"
  }
]
```

---

### `GET /food-logs/daily-summary`
Full day breakdown — totals, remaining calories, entries grouped by meal.

**Query params**

| Param | Type | Required |
|-------|------|----------|
| `log_date` | date | Yes |

**Response 200**
```json
{
  "date": "2026-06-05",
  "total_calories": 980.0,
  "total_protein_g": 72.0,
  "total_carbs_g": 95.0,
  "total_fat_g": 32.0,
  "total_fiber_g": 12.0,
  "calories_burned": 300,
  "water_ml": 1500,
  "goal_calories": 1800,
  "net_calories": 680.0,
  "calories_remaining": 1120.0,
  "entries_by_meal": {
    "breakfast": [ ...entries ],
    "lunch":     [ ...entries ],
    "dinner":    [],
    "snack":     []
  }
}
```

---

### `POST /food-logs`
Save a food log entry (after confirming AI analysis or manual entry).

**Body** (`*` = required)
```json
{
  "log_date": "2026-06-05",      // *
  "meal_type": "lunch",          // * breakfast | lunch | dinner | snack
  "food_name": "Chicken Salad",  // *
  "calories": 420,               // *
  "protein_g": 38,
  "carbs_g": 22,
  "fat_g": 18,
  "fiber_g": 5,
  "sugar_g": 8,
  "serving_qty": 1.0,            // default: 1.0
  "serving_unit": "g",           // default: g
  "food_item_id": "uuid",        // optional — link to food_items cache
  "photo_url": "https://...",    // optional
  "ai_confidence": 0.87,         // optional
  "ai_raw_response": {},         // optional — raw AI output
  "notes": "string"              // optional
}
```

**Response 200** — created log entry  
**Response 422** — validation error

---

### `PATCH /food-logs/{log_id}`
Edit a saved food log entry.

**Body** — all fields optional
```json
{
  "food_name": "string",
  "calories": 400,
  "protein_g": 35,
  "carbs_g": 20,
  "fat_g": 15,
  "serving_qty": 1.5,
  "serving_unit": "cup",
  "meal_type": "dinner",
  "notes": "string"
}
```

**Response 200** — updated entry  
**Response 404** — entry not found

---

### `DELETE /food-logs/{log_id}`

**Response 200**
```json
{ "deleted": true }
```

**Response 404** — entry not found

---

## Food Search

### `GET /food-search`
Search for food by name. Checks local cache first, falls back to USDA FoodData Central.

**Query params**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | Yes | Min 2 chars |
| `limit` | int | No | Max 50, default 20 |

**Response 200**
```json
{
  "source": "usda | cache",
  "results": [
    {
      "external_id": "534358",
      "source": "usda",
      "name": "Chicken, broiler, rotisserie, BBQ, back meat and skin",
      "brand": null,
      "calories_per_100g": 234.0,
      "protein_per_100g": 24.5,
      "carbs_per_100g": 0.3,
      "fat_per_100g": 14.8,
      "fiber_per_100g": 0.0,
      "sugar_per_100g": 0.0,
      "sodium_per_100g": 320.0
    }
  ]
}
```

---

### `GET /food-search/barcode`
Look up packaged food by UPC/EAN barcode. Checks cache first, falls back to Open Food Facts.

**Query params**

| Param | Type | Required |
|-------|------|----------|
| `upc` | string | Yes — min 8 chars |

**Response 200**
```json
{
  "source": "off | cache",
  "result": {
    "external_id": "0021000043521",
    "source": "off",
    "name": "Mac & Cheese",
    "brand": "Kraft",
    "barcode": "0021000043521",
    "calories_per_100g": 370.0,
    "protein_per_100g": 11.0,
    "carbs_per_100g": 58.0,
    "fat_per_100g": 10.0,
    "fiber_per_100g": 2.0,
    "sugar_per_100g": 6.0,
    "sodium_per_100g": 560.0
  }
}
```

**Response 404** — product not found

---

## Weight Entries

### `GET /weight-entries`
List weight log entries, newest first.

**Query params**

| Param | Type | Default |
|-------|------|---------|
| `limit` | int | 90 |

**Response 200**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "weight_kg": 79.2,
    "log_date": "2026-06-05",
    "notes": null,
    "created_at": "2026-06-05T08:00:00Z"
  }
]
```

---

### `POST /weight-entries`
Log a body weight measurement. One entry per day (upserts on same date).

**Body**
```json
{
  "weight_kg": 79.2,       // *
  "log_date": "2026-06-05", // *
  "notes": "Morning weigh-in"
}
```

**Response 200** — created/updated entry

---

### `DELETE /weight-entries/{entry_id}`

**Response 200** `{ "deleted": true }`

---

## Water Logs

### `GET /water-logs`
Get all water entries for a date plus daily total.

**Query params** — `log_date: date` (required)

**Response 200**
```json
{
  "date": "2026-06-05",
  "total_ml": 1500,
  "entries": [
    { "id": "uuid", "amount_ml": 500, "logged_at": "..." },
    { "id": "uuid", "amount_ml": 1000, "logged_at": "..." }
  ]
}
```

---

### `POST /water-logs`

**Body**
```json
{
  "log_date": "2026-06-05", // *
  "amount_ml": 500          // * range: 1–5000
}
```

**Response 200** — created entry

---

### `DELETE /water-logs/{log_id}`

**Response 200** `{ "deleted": true }`

---

## Exercise Logs

### `GET /exercise-logs`
Get exercise entries for a date plus total calories burned.

**Query params** — `log_date: date` (required)

**Response 200**
```json
{
  "date": "2026-06-05",
  "total_burned": 350,
  "entries": [
    {
      "id": "uuid",
      "activity_name": "Running",
      "duration_min": 30,
      "calories_burned": 350,
      "source": "manual",
      "log_date": "2026-06-05"
    }
  ]
}
```

---

### `POST /exercise-logs`

**Body**
```json
{
  "log_date": "2026-06-05",  // *
  "activity_name": "Running", // *
  "duration_min": 30,         // optional
  "calories_burned": 350,     // *
  "source": "manual"          // manual | apple_health | google_fit
}
```

**Response 200** — created entry

---

### `DELETE /exercise-logs/{log_id}`

**Response 200** `{ "deleted": true }`

---

## Progress

### `GET /progress/weekly`
Calorie data for each day of a week. Used for bar chart.

**Query params**

| Param | Type | Default |
|-------|------|---------|
| `week_start` | date | Current Monday |

**Response 200**
```json
{
  "week_start": "2026-06-02",
  "week_end": "2026-06-08",
  "goal_calories": 1800,
  "days_logged": 4,
  "days_on_target": 3,
  "avg_calories": 1740.0,
  "daily": [
    {
      "date": "2026-06-02",
      "calories": 1650,
      "protein_g": 128,
      "carbs_g": 165,
      "fat_g": 46,
      "goal_calories": 1800,
      "on_target": true
    }
    // ... 7 entries total
  ]
}
```

---

### `GET /progress/monthly`
Monthly calorie adherence. Used for line chart.

**Query params**

| Param | Type | Default |
|-------|------|---------|
| `year` | int | Current year |
| `month` | int | Current month |

**Response 200**
```json
{
  "year": 2026,
  "month": 6,
  "goal_calories": 1800,
  "days_in_month": 30,
  "days_logged": 18,
  "days_on_target": 14,
  "adherence_pct": 77.8,
  "avg_calories": 1762.0,
  "daily": [
    { "date": "2026-06-01", "calories": 1820 }
  ]
}
```

---

## Streaks

### `GET /streaks`

**Response 200**
```json
{
  "current_streak": 5,
  "longest_streak": 12,
  "last_log_date": "2026-06-05"
}
```

---

### `GET /streaks/achievements`

**Response 200**
```json
[
  {
    "id": "uuid",
    "key": "streak_7",
    "name": "Week Warrior",
    "description": "Log food 7 days in a row",
    "icon_url": "https://...",
    "unlocked": true,
    "unlocked_at": "2026-06-01T10:00:00Z"
  },
  {
    "id": "uuid",
    "key": "streak_30",
    "name": "Monthly Master",
    "description": "Log food 30 days in a row",
    "icon_url": "https://...",
    "unlocked": false,
    "unlocked_at": null
  }
]
```

---

## Referrals

### `GET /referrals`
List all referrals created by the current user.

**Response 200**
```json
[
  {
    "id": "uuid",
    "referral_code": "AB12CD34",
    "status": "completed",
    "referred_id": "uuid",
    "reward_granted": false,
    "created_at": "2026-05-01T00:00:00Z",
    "completed_at": "2026-05-15T00:00:00Z"
  }
]
```

---

### `POST /referrals/generate`
Generate a unique referral code for the current user.

**Response 200**
```json
{ "referral_code": "AB12CD34" }
```

---

### `POST /referrals/validate`
Validate a referral code during onboarding. **No auth required.**

**Body**
```json
{ "referral_code": "AB12CD34" }
```

**Response 200**
```json
{ "valid": true, "status": "pending" }
```

**Response 404** — invalid code

---

## Error Format

All errors follow this shape:

```json
{
  "detail": "Human-readable error message"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request — missing or invalid input |
| 401 | Unauthorized — missing or expired token |
| 404 | Resource not found |
| 422 | Validation error — wrong field types |
| 500 | Server error |
| 502 | Upstream API failed (Claude, USDA, etc.) |
