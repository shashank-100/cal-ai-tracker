import base64
import json
import logging
import anthropic

logger = logging.getLogger(__name__)
from .config import settings
from .token_tracker import usage_store

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key, timeout=30.0)

FOOD_ANALYSIS_PROMPT = """Analyze this food image and return ONLY valid JSON with this exact shape — no markdown, no explanation:
{
  "name": "string (food name, e.g. 'Grilled Chicken Salad')",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "sugar_g": number,
  "serving_size": number,
  "serving_unit": "g or oz or cup or piece or ml",
  "confidence": number (0.0 to 1.0, how confident you are in the estimate),
  "items": [
    { "name": "string", "calories": number }
  ]
}
Base all estimates on a realistic single serving visible in the image.
If multiple dishes are shown, treat the full plate as one serving.
If confidence is below 0.5 because the image is unclear, still return your best estimate."""


async def analyze_food_image(image_bytes: bytes, media_type: str = "image/jpeg") -> dict:
    b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    response = await client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=FOOD_ANALYSIS_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": b64,
                        },
                    },
                    {"type": "text", "text": "Analyze this food image."},
                ],
            }
        ],
    )

    usage_store.record(
        model=response.model,
        purpose="food_analysis",
        input_tokens=response.usage.input_tokens,
        output_tokens=response.usage.output_tokens,
    )

    # Find the first text block; the content list can be empty (e.g. refusal /
    # max_tokens with no text) which would otherwise IndexError.
    raw = next((b.text for b in response.content if getattr(b, "type", None) == "text"), "")
    if not raw.strip():
        raise ValueError("Claude returned no text content")

    # Strip code fences case-insensitively.
    cleaned = raw.strip()
    low = cleaned.lower()
    if low.startswith("```json"):
        cleaned = cleaned[len("```json"):]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    cleaned = cleaned.removesuffix("```").strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.debug("Claude non-JSON response: %s", cleaned[:200])
        raise ValueError("Claude returned non-JSON response")

    # Validate required numeric fields so malformed AI output can't poison the
    # food log. Coerce to numbers; raise ValueError (→ 422) on missing/bad data.
    required_numeric = ("calories", "protein_g", "carbs_g", "fat_g")
    for key in required_numeric:
        if key not in data:
            raise ValueError(f"Claude response missing required field: {key}")
        try:
            data[key] = float(data[key])
        except (TypeError, ValueError):
            raise ValueError(f"Claude response field {key} is not a number")
        if data[key] < 0:
            raise ValueError(f"Claude response field {key} is negative")
    # Optional fields default to sane values.
    data.setdefault("fiber_g", 0)
    data.setdefault("name", "Unknown food")
    return data
