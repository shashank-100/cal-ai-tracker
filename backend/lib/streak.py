from datetime import date, timedelta
from .supabase import admin_supabase


def update_streak(user_id: str, log_date: date) -> dict:
    res = admin_supabase.table("streaks").select("*").eq("user_id", user_id).single().execute()
    streak = res.data or {"user_id": user_id, "current_streak": 0, "longest_streak": 0, "last_log_date": None}

    last = streak.get("last_log_date")
    current = streak.get("current_streak", 0)
    longest = streak.get("longest_streak", 0)

    if last is None:
        current = 1
    else:
        last_date = date.fromisoformat(last) if isinstance(last, str) else last
        diff = (log_date - last_date).days
        if diff == 1:
            current += 1
        elif diff == 0:
            pass  # same day, no change
        else:
            current = 1

    longest = max(longest, current)

    admin_supabase.table("streaks").upsert({
        "user_id": user_id,
        "current_streak": current,
        "longest_streak": longest,
        "last_log_date": log_date.isoformat(),
        "updated_at": "now()",
    }).execute()

    return {"current_streak": current, "longest_streak": longest}
