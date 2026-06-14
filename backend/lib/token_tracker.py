"""
Persistent token usage tracker — writes every call to the `usage_logs` table.
Falls back to in-memory totals if the DB insert fails so food analysis never breaks.
"""
import logging
import threading
from datetime import datetime, timezone

logger = logging.getLogger("calai.token_tracker")


class _UsageStore:
    def __init__(self):
        self._lock = threading.Lock()
        # In-memory fallback totals (used only if DB is unavailable)
        self._fallback_input = 0
        self._fallback_output = 0
        self._fallback_calls = 0

    def record(self, model: str, purpose: str, input_tokens: int, output_tokens: int):
        # Lazy import to avoid circular imports at module load time
        from lib.supabase import admin_supabase
        try:
            admin_supabase.table("usage_logs").insert({
                "model": model,
                "purpose": purpose,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens,
            }).execute()
        except Exception as e:
            logger.error("Failed to persist usage log: %s", e)
            with self._lock:
                self._fallback_input += input_tokens
                self._fallback_output += output_tokens
                self._fallback_calls += 1

    def summary(self) -> dict:
        from lib.supabase import admin_supabase
        try:
            # Aggregate totals via SQL
            totals_res = admin_supabase.rpc("usage_summary").execute()
            totals = (totals_res.data or [{}])[0]
            total_input = totals.get("total_input", 0) or 0
            total_output = totals.get("total_output", 0) or 0
            total_tokens = totals.get("total_tokens", 0) or 0
            total_calls = totals.get("total_calls", 0) or 0

            # Group by model
            by_model_res = admin_supabase.rpc("usage_by_model").execute()
            by_model: dict = {}
            for r in (by_model_res.data or []):
                by_model[r["model"]] = {"input": r["total_input"], "output": r["total_output"], "calls": r["calls"]}

            # Group by purpose
            by_purpose_res = admin_supabase.rpc("usage_by_purpose").execute()
            by_purpose: dict = {}
            for r in (by_purpose_res.data or []):
                by_purpose[r["purpose"]] = {"input": r["total_input"], "output": r["total_output"], "calls": r["calls"]}

            # Recent 20 rows only
            recent_res = admin_supabase.table("usage_logs").select(
                "model, purpose, input_tokens, output_tokens, total_tokens, created_at"
            ).order("created_at", desc=True).limit(20).execute()

            # claude-opus-4-5 pricing: $15/$60 per 1M tokens
            input_cost = total_input / 1_000_000 * 15.0
            output_cost = total_output / 1_000_000 * 60.0

            return {
                "total_calls": total_calls,
                "total_input_tokens": total_input,
                "total_output_tokens": total_output,
                "total_tokens": total_tokens,
                "estimated_cost_usd": round(input_cost + output_cost, 6),
                "by_model": by_model,
                "by_purpose": by_purpose,
                "recent_calls": list(reversed(recent_res.data or [])),
            }
        except Exception as e:
            logger.error("Failed to read usage logs from DB: %s", e)
            with self._lock:
                total_input = self._fallback_input
                total_output = self._fallback_output
                calls = self._fallback_calls
            input_cost = total_input / 1_000_000 * 15.0
            output_cost = total_output / 1_000_000 * 60.0
            return {
                "total_calls": calls,
                "total_input_tokens": total_input,
                "total_output_tokens": total_output,
                "total_tokens": total_input + total_output,
                "estimated_cost_usd": round(input_cost + output_cost, 6),
                "by_model": {},
                "by_purpose": {},
                "recent_calls": [],
                "note": "DB unavailable — showing in-memory fallback totals only",
            }

    def reset(self):
        from lib.supabase import admin_supabase
        try:
            cutoff = datetime.now(timezone.utc).isoformat()
            admin_supabase.table("usage_logs").delete().lte("created_at", cutoff).execute()
        except Exception as e:
            logger.error("Failed to reset usage logs: %s", e)
        with self._lock:
            self._fallback_input = 0
            self._fallback_output = 0
            self._fallback_calls = 0


usage_store = _UsageStore()
