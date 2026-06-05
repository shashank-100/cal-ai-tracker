import base64
import json
import anthropic
from .config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

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

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
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
                    {"type": "text", "text": FOOD_ANALYSIS_PROMPT},
                ],
            }
        ],
    )

    raw = response.content[0].text if response.content[0].type == "text" else "{}"
    # Strip markdown code fences if model wraps output
    raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(raw)
