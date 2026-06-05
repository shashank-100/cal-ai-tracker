import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from middleware.auth import get_current_user
from lib.claude import analyze_food_image
from lib.supabase import admin_supabase
from lib.config import settings

router = APIRouter(prefix="/food-analysis", tags=["food-analysis"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("")
async def analyze_food(
    image: UploadFile = File(...),
    meal_type: str = Form(default="lunch"),
    user: dict = Depends(get_current_user),
):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {image.content_type}")

    image_bytes = await image.read()
    if len(image_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")

    # Upload to Supabase Storage
    file_name = f"{user['id']}/{uuid.uuid4()}.jpg"
    upload_res = admin_supabase.storage.from_("food-photos").upload(
        file_name,
        image_bytes,
        {"content-type": "image/jpeg", "upsert": "false"},
    )
    if upload_res.get("error"):
        raise HTTPException(status_code=500, detail="Failed to upload image")

    public_url = admin_supabase.storage.from_("food-photos").get_public_url(file_name)

    # Analyze with Claude Vision
    try:
        analysis = await analyze_food_image(image_bytes, media_type=image.content_type or "image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    return {
        **analysis,
        "photo_url": public_url,
        "meal_type": meal_type,
    }
