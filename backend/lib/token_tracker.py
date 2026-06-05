"""
In-memory token usage tracker for Anthropic API calls.
Resets on server restart; use GET /usage to query totals.
"""
import threading
from dataclasses import dataclass, field
from typing import List


@dataclass
class CallRecord:
    model: str
    purpose: str       # e.g. 'food_analysis'
    input_tokens: int
    output_tokens: int
    total_tokens: int


@dataclass
class _UsageStore:
    calls: List[CallRecord] = field(default_factory=list)
    total_input: int = 0
    total_output: int = 0
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def record(self, model: str, purpose: str, input_tokens: int, output_tokens: int):
        rec = CallRecord(
            model=model,
            purpose=purpose,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=input_tokens + output_tokens,
        )
        with self._lock:
            self.calls.append(rec)
            self.total_input += input_tokens
            self.total_output += output_tokens

    def summary(self) -> dict:
        with self._lock:
            by_model: dict[str, dict] = {}
            by_purpose: dict[str, dict] = {}
            for c in self.calls:
                m = by_model.setdefault(c.model, {"input": 0, "output": 0, "calls": 0})
                m["input"] += c.input_tokens
                m["output"] += c.output_tokens
                m["calls"] += 1

                p = by_purpose.setdefault(c.purpose, {"input": 0, "output": 0, "calls": 0})
                p["input"] += c.input_tokens
                p["output"] += c.output_tokens
                p["calls"] += 1

            total_calls = len(self.calls)
            total_tokens = self.total_input + self.total_output

            # Rough cost estimate (claude-opus-4-5 pricing: $15/$75 per 1M tokens)
            input_cost  = self.total_input  / 1_000_000 * 15.0
            output_cost = self.total_output / 1_000_000 * 75.0

            return {
                "total_calls": total_calls,
                "total_input_tokens": self.total_input,
                "total_output_tokens": self.total_output,
                "total_tokens": total_tokens,
                "estimated_cost_usd": round(input_cost + output_cost, 6),
                "by_model": by_model,
                "by_purpose": by_purpose,
                "recent_calls": [
                    {
                        "model": c.model,
                        "purpose": c.purpose,
                        "input_tokens": c.input_tokens,
                        "output_tokens": c.output_tokens,
                        "total_tokens": c.total_tokens,
                    }
                    for c in self.calls[-20:]  # last 20 calls
                ],
            }

    def reset(self):
        with self._lock:
            self.calls.clear()
            self.total_input = 0
            self.total_output = 0


usage_store = _UsageStore()
