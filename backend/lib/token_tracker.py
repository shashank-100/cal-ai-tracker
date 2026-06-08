"""
Persistent token usage tracker — writes every call to the `usage_logs` table.
Falls back to in-memory totals if the DB insert fails so food analysis never breaks.
"""
import logging
import threading

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
            res = admin_supabase.table("usage_logs").select(
                "model, purpose, input_tokens, output_tokens, total_tokens, created_at"
            ).order("created_at", desc=False).execute()

            rows = res.data or []
            total_input = sum(r["input_tokens"] for r in rows)
            total_output = sum(r["output_tokens"] for r in rows)
            total_tokens = sum(r["total_tokens"] for r in rows)

            by_model: dict = {}
            by_purpose: dict = {}
            for r in rows:
                m = by_model.setdefault(r["model"], {"input": 0, "output": 0, "calls": 0})
                m["input"] += r["input_tokens"]
                m["output"] += r["output_tokens"]
                m["calls"] += 1

                p = by_purpose.setdefault(r["purpose"], {"input": 0, "output": 0, "calls": 0})
                p["input"] += r["input_tokens"]
                p["output"] += r["output_tokens"]
                p["calls"] += 1

            # claude-opus-4-5 pricing: $15/$75 per 1M tokens
            input_cost = total_input / 1_000_000 * 15.0
            output_cost = total_output / 1_000_000 * 75.0

            return {
                "total_calls": len(rows),
                "total_input_tokens": total_input,
                "total_output_tokens": total_output,
                "total_tokens": total_tokens,
                "estimated_cost_usd": round(input_cost + output_cost, 6),
                "by_model": by_model,
                "by_purpose": by_purpose,
                "recent_calls": [
                    {
                        "model": r["model"],
                        "purpose": r["purpose"],
                        "input_tokens": r["input_tokens"],
                        "output_tokens": r["output_tokens"],
                        "total_tokens": r["total_tokens"],
                        "created_at": r["created_at"],
                    }
                    for r in rows[-20:]
                ],
            }
        except Exception as e:
            logger.error("Failed to read usage logs from DB: %s", e)
            with self._lock:
                total_input = self._fallback_input
                total_output = self._fallback_output
                calls = self._fallback_calls
            input_cost = total_input / 1_000_000 * 15.0
            output_cost = total_output / 1_000_000 * 75.0
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
            admin_supabase.table("usage_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        except Exception as e:
            logger.error("Failed to reset usage logs: %s", e)
        with self._lock:
            self._fallback_input = 0
            self._fallback_output = 0
            self._fallback_calls = 0


usage_store = _UsageStore()
