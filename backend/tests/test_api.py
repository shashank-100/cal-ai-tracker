"""
Cal AI API Integration Tests
Run: python -m pytest tests/test_api.py -v
"""

import pytest
import httpx
import os

BASE_URL = os.getenv("API_BASE_URL", "https://calai-production-72a1.up.railway.app")
TOKEN = os.getenv("API_TEST_TOKEN", "")  # Set a valid Supabase JWT to test auth endpoints

client = httpx.Client(base_url=BASE_URL, timeout=15)
auth_headers = {"Authorization": f"Bearer {TOKEN}"}


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def authed(method: str, path: str, **kwargs):
    return client.request(method, path, headers=auth_headers, **kwargs)


# ─────────────────────────────────────────────
# PUBLIC
# ─────────────────────────────────────────────

class TestPublic:
    def test_health(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}

    def test_docs_reachable(self):
        r = client.get("/docs")
        assert r.status_code == 200

    def test_openapi_spec(self):
        r = client.get("/openapi.json")
        assert r.status_code == 200
        data = r.json()
        assert "paths" in data
        assert len(data["paths"]) > 20  # at least 20 routes

    def test_referrals_validate_invalid_code(self):
        r = client.post("/referrals/validate", json={"referral_code": "DOESNOTEXIST"})
        assert r.status_code == 404
        assert "detail" in r.json()

    def test_referrals_validate_missing_body(self):
        r = client.post("/referrals/validate", json={})
        assert r.status_code == 422


# ─────────────────────────────────────────────
# AUTH GUARD — no token should return 403
# ─────────────────────────────────────────────

class TestAuthGuard:
    endpoints = [
        ("GET",   "/profile"),
        ("GET",   "/plans"),
        ("GET",   "/food-logs?log_date=2026-06-05"),
        ("GET",   "/food-logs/daily-summary?log_date=2026-06-05"),
        ("GET",   "/food-search?q=chicken"),
        ("GET",   "/food-search/barcode?upc=012345678905"),
        ("GET",   "/weight-entries"),
        ("GET",   "/water-logs?log_date=2026-06-05"),
        ("GET",   "/exercise-logs?log_date=2026-06-05"),
        ("GET",   "/progress/weekly"),
        ("GET",   "/progress/monthly"),
        ("GET",   "/streaks"),
        ("GET",   "/streaks/achievements"),
        ("GET",   "/referrals"),
        ("POST",  "/plans/generate"),
        ("POST",  "/food-logs"),
        ("POST",  "/weight-entries"),
        ("POST",  "/water-logs"),
        ("POST",  "/exercise-logs"),
        ("POST",  "/referrals/generate"),
        ("PATCH", "/plans/fake-id"),
        ("PATCH", "/food-logs/fake-id"),
        ("DELETE","/food-logs/fake-id"),
        ("DELETE","/weight-entries/fake-id"),
        ("DELETE","/water-logs/fake-id"),
        ("DELETE","/exercise-logs/fake-id"),
    ]

    @pytest.mark.parametrize("method,path", endpoints)
    def test_requires_auth(self, method, path):
        r = client.request(method, path, json={})
        assert r.status_code in (401, 403), (
            f"{method} {path} returned {r.status_code}, expected 401/403"
        )


# ─────────────────────────────────────────────
# AUTHENTICATED ENDPOINTS
# (only runs if API_TEST_TOKEN is set)
# ─────────────────────────────────────────────

@pytest.mark.skipif(not TOKEN, reason="API_TEST_TOKEN not set")
class TestProfile:
    def test_get_profile(self):
        r = authed("GET", "/profile")
        assert r.status_code in (200, 404)
        if r.status_code == 200:
            data = r.json()
            assert "id" in data
            assert "email" in data

    def test_patch_profile(self):
        r = authed("PATCH", "/profile", json={"full_name": "Test User"})
        assert r.status_code == 200
        assert r.json().get("full_name") == "Test User"

    def test_patch_profile_empty_body(self):
        r = authed("PATCH", "/profile", json={})
        assert r.status_code == 400


@pytest.mark.skipif(not TOKEN, reason="API_TEST_TOKEN not set")
class TestPlans:
    def test_generate_plan(self):
        r = authed("POST", "/plans/generate", json={
            "gender": "male",
            "birthday": "1995-06-01",
            "height_cm": 175.0,
            "weight_kg": 80.0,
            "goal": "lose",
            "desired_weight_kg": 72.0,
            "weight_speed_kg_week": 0.5,
            "workouts_per_week": 3,
            "diet_preference": "standard",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["calories_target"] >= 1200
        assert data["protein_g"] > 0
        assert data["carbs_g"] > 0
        assert data["fat_g"] > 0
        assert data["tdee"] > 0

    def test_generate_plan_missing_fields(self):
        r = authed("POST", "/plans/generate", json={"gender": "male"})
        assert r.status_code == 422

    def test_get_active_plan(self):
        r = authed("GET", "/plans")
        assert r.status_code in (200, 404)
        if r.status_code == 200:
            data = r.json()
            assert data["is_active"] is True
            assert "calories_target" in data


@pytest.mark.skipif(not TOKEN, reason="API_TEST_TOKEN not set")
class TestFoodLogs:
    created_id = None

    def test_create_food_log(self):
        r = authed("POST", "/food-logs", json={
            "log_date": "2026-06-05",
            "meal_type": "lunch",
            "food_name": "Test Chicken Salad",
            "calories": 420.0,
            "protein_g": 38.0,
            "carbs_g": 22.0,
            "fat_g": 18.0,
            "serving_qty": 1.0,
            "serving_unit": "g",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["food_name"] == "Test Chicken Salad"
        assert data["calories"] == 420.0
        TestFoodLogs.created_id = data["id"]

    def test_list_food_logs(self):
        r = authed("GET", "/food-logs?log_date=2026-06-05")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_food_logs_missing_date(self):
        r = authed("GET", "/food-logs")
        assert r.status_code == 422

    def test_daily_summary(self):
        r = authed("GET", "/food-logs/daily-summary?log_date=2026-06-05")
        assert r.status_code == 200
        data = r.json()
        assert "total_calories" in data
        assert "calories_remaining" in data
        assert "entries_by_meal" in data
        assert set(data["entries_by_meal"].keys()) == {"breakfast", "lunch", "dinner", "snack"}

    def test_update_food_log(self):
        if not TestFoodLogs.created_id:
            pytest.skip("No food log created")
        r = authed("PATCH", f"/food-logs/{TestFoodLogs.created_id}", json={"calories": 400.0})
        assert r.status_code == 200
        assert r.json()["calories"] == 400.0

    def test_delete_food_log(self):
        if not TestFoodLogs.created_id:
            pytest.skip("No food log created")
        r = authed("DELETE", f"/food-logs/{TestFoodLogs.created_id}")
        assert r.status_code == 200
        assert r.json() == {"deleted": True}

    def test_delete_nonexistent_log(self):
        r = authed("DELETE", "/food-logs/00000000-0000-0000-0000-000000000000")
        assert r.status_code == 404


@pytest.mark.skipif(not TOKEN, reason="API_TEST_TOKEN not set")
class TestFoodSearch:
    def test_search_food(self):
        r = authed("GET", "/food-search?q=chicken")
        assert r.status_code == 200
        data = r.json()
        assert "results" in data
        assert "source" in data
        assert isinstance(data["results"], list)

    def test_search_too_short(self):
        r = authed("GET", "/food-search?q=a")
        assert r.status_code == 422

    def test_barcode_not_found(self):
        r = authed("GET", "/food-search/barcode?upc=00000000")
        assert r.status_code in (404, 200)


@pytest.mark.skipif(not TOKEN, reason="API_TEST_TOKEN not set")
class TestWeightEntries:
    created_id = None

    def test_create_weight_entry(self):
        r = authed("POST", "/weight-entries", json={
            "weight_kg": 79.5,
            "log_date": "2026-06-05",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["weight_kg"] == 79.5
        TestWeightEntries.created_id = data.get("id")

    def test_list_weight_entries(self):
        r = authed("GET", "/weight-entries")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_delete_weight_entry(self):
        if not TestWeightEntries.created_id:
            pytest.skip("No entry created")
        r = authed("DELETE", f"/weight-entries/{TestWeightEntries.created_id}")
        assert r.status_code == 200


@pytest.mark.skipif(not TOKEN, reason="API_TEST_TOKEN not set")
class TestWaterLogs:
    created_id = None

    def test_log_water(self):
        r = authed("POST", "/water-logs", json={
            "log_date": "2026-06-05",
            "amount_ml": 500,
        })
        assert r.status_code == 200
        data = r.json()
        assert data["amount_ml"] == 500
        TestWaterLogs.created_id = data.get("id")

    def test_list_water_logs(self):
        r = authed("GET", "/water-logs?log_date=2026-06-05")
        assert r.status_code == 200
        data = r.json()
        assert "total_ml" in data
        assert "entries" in data

    def test_water_amount_out_of_range(self):
        r = authed("POST", "/water-logs", json={"log_date": "2026-06-05", "amount_ml": 99999})
        assert r.status_code == 422

    def test_delete_water_log(self):
        if not TestWaterLogs.created_id:
            pytest.skip("No entry created")
        r = authed("DELETE", f"/water-logs/{TestWaterLogs.created_id}")
        assert r.status_code == 200


@pytest.mark.skipif(not TOKEN, reason="API_TEST_TOKEN not set")
class TestExerciseLogs:
    created_id = None

    def test_log_exercise(self):
        r = authed("POST", "/exercise-logs", json={
            "log_date": "2026-06-05",
            "activity_name": "Running",
            "duration_min": 30,
            "calories_burned": 300,
            "source": "manual",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["calories_burned"] == 300
        TestExerciseLogs.created_id = data.get("id")

    def test_list_exercise_logs(self):
        r = authed("GET", "/exercise-logs?log_date=2026-06-05")
        assert r.status_code == 200
        data = r.json()
        assert "total_burned" in data
        assert "entries" in data

    def test_delete_exercise_log(self):
        if not TestExerciseLogs.created_id:
            pytest.skip("No entry created")
        r = authed("DELETE", f"/exercise-logs/{TestExerciseLogs.created_id}")
        assert r.status_code == 200


@pytest.mark.skipif(not TOKEN, reason="API_TEST_TOKEN not set")
class TestProgress:
    def test_weekly_progress(self):
        r = authed("GET", "/progress/weekly?week_start=2026-06-02")
        assert r.status_code == 200
        data = r.json()
        assert "daily" in data
        assert len(data["daily"]) == 7
        assert "avg_calories" in data
        assert "days_logged" in data

    def test_weekly_progress_default(self):
        r = authed("GET", "/progress/weekly")
        assert r.status_code == 200

    def test_monthly_progress(self):
        r = authed("GET", "/progress/monthly?year=2026&month=6")
        assert r.status_code == 200
        data = r.json()
        assert data["year"] == 2026
        assert data["month"] == 6
        assert "adherence_pct" in data
        assert "days_in_month" in data

    def test_monthly_progress_default(self):
        r = authed("GET", "/progress/monthly")
        assert r.status_code == 200


@pytest.mark.skipif(not TOKEN, reason="API_TEST_TOKEN not set")
class TestStreaks:
    def test_get_streak(self):
        r = authed("GET", "/streaks")
        assert r.status_code == 200
        data = r.json()
        assert "current_streak" in data
        assert "longest_streak" in data

    def test_get_achievements(self):
        r = authed("GET", "/streaks/achievements")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


@pytest.mark.skipif(not TOKEN, reason="API_TEST_TOKEN not set")
class TestReferrals:
    def test_generate_referral_code(self):
        r = authed("POST", "/referrals/generate")
        assert r.status_code == 200
        data = r.json()
        assert "referral_code" in data
        assert len(data["referral_code"]) == 8

    def test_validate_own_code(self):
        # Generate a code first
        r = authed("POST", "/referrals/generate")
        code = r.json()["referral_code"]
        # Validate it (public endpoint)
        r2 = client.post("/referrals/validate", json={"referral_code": code})
        assert r2.status_code == 200
        assert r2.json()["valid"] is True

    def test_list_referrals(self):
        r = authed("GET", "/referrals")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
