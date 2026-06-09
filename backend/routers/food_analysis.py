import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from slowapi import Limiter
from slowapi.util import get_remote_address
from middleware.auth import get_current_user
from lib.claude import analyze_food_image
from lib.supabase import admin_supabase

router = APIRouter(prefix="/food-analysis", tags=["food-analysis"])

def _user_or_ip(request: Request) -> str:
    return getattr(request.state, "user_id", None) or get_remote_address(request)

limiter = Limiter(key_func=_user_or_ip)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("")
@limiter.limit("10/minute")
async def analyze_food(
    request: Request,
    image: UploadFile = File(...),
    meal_type: str = Form(default="lunch"),
    user: dict = Depends(get_current_user),
):
    # Set user_id on request.state before rate limit key is evaluated on retry
    request.state.user_id = user["id"]
    if not image.content_type or image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {image.content_type}")

    image_bytes = await image.read()
    if len(image_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")

    # Upload to Supabase Storage
    file_name = f"{user['id']}/{uuid.uuid4()}.jpg"
    try:
        admin_supabase.storage.from_("food-photos").upload(
            file_name,
            image_bytes,
            {"content-type": image.content_type or "image/jpeg", "upsert": "true"},
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to upload image")

    photo_url = admin_supabase.storage.from_("food-photos").get_public_url(file_name)

    try:
        analysis = await analyze_food_image(image_bytes, media_type=image.content_type or "image/jpeg")
    except ValueError:
        raise HTTPException(status_code=422, detail="Could not identify food in the image. Please try a clearer photo.")
    except Exception:
        raise HTTPException(status_code=502, detail="Food analysis unavailable. Please try again.")

    return {
        **analysis,
        "photo_url": photo_url,
        "meal_type": meal_type,
    }
