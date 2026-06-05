import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from middleware.auth import get_current_user
from lib.supabase import admin_supabase
from lib.config import settings

router = APIRouter(prefix="/food-search", tags=["food-search"])

USDA_BASE = "https://api.nal.usda.gov/fdc/v1"
OFF_BASE  = "https://world.openfoodfacts.org/api/v2"


def _normalize_usda(food: dict) -> dict:
    nutrients = {n["nutrientName"]: n.get("value", 0) for n in food.get("foodNutrients", [])}
    return {
        "external_id": str(food.get("fdcId", "")),
        "source": "usda",
        "name": food.get("description", "Unknown"),
        "brand": food.get("brandOwner") or food.get("brandName"),
        "calories_per_100g": nutrients.get("Energy", 0),
        "protein_per_100g": nutrients.get("Protein", 0),
        "carbs_per_100g": nutrients.get("Carbohydrate, by difference", 0),
        "fat_per_100g": nutrients.get("Total lipid (fat)", 0),
        "fiber_per_100g": nutrients.get("Fiber, total dietary", 0),
        "sugar_per_100g": nutrients.get("Sugars, total including NLEA", 0),
        "sodium_per_100g": nutrients.get("Sodium, Na", 0),
    }


def _normalize_off(product: dict) -> dict:
    n = product.get("nutriments", {})
    return {
        "external_id": product.get("code", ""),
        "source": "off",
        "name": product.get("product_name", "Unknown"),
        "brand": product.get("brands"),
        "barcode": product.get("code"),
        "calories_per_100g": n.get("energy-kcal_100g", 0),
        "protein_per_100g": n.get("proteins_100g", 0),
        "carbs_per_100g": n.get("carbohydrates_100g", 0),
        "fat_per_100g": n.get("fat_100g", 0),
        "fiber_per_100g": n.get("fiber_100g", 0),
        "sugar_per_100g": n.get("sugars_100g", 0),
        "sodium_per_100g": n.get("sodium_100g", 0),
    }


@router.get("")
async def search_food(
    q: str = Query(..., min_length=2),
    limit: int = Query(default=20, le=50),
    user: dict = Depends(get_current_user),
):
    # Check local cache first (pg_trgm search)
    cache_res = (
        admin_supabase.table("food_items")
        .select("*")
        .ilike("name", f"%{q}%")
        .eq("is_verified", True)
        .limit(limit)
        .execute()
    )
    if cache_res.data and len(cache_res.data) >= 5:
        return {"source": "cache", "results": cache_res.data}

    # Fall back to USDA
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{USDA_BASE}/foods/search",
            params={"query": q, "pageSize": limit, "api_key": settings.usda_api_key},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="USDA API unavailable")

    foods = resp.json().get("foods", [])
    results = [_normalize_usda(f) for f in foods]
    return {"source": "usda", "results": results}


@router.get("/barcode")
async def search_by_barcode(
    upc: str = Query(..., min_length=8),
    user: dict = Depends(get_current_user),
):
    # Check local cache
    cache_res = (
        admin_supabase.table("food_items")
        .select("*")
        .eq("barcode", upc)
        .limit(1)
        .execute()
    )
    if cache_res.data:
        return {"source": "cache", "result": cache_res.data[0]}

    # Open Food Facts lookup
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{OFF_BASE}/product/{upc}.json",
            headers={"User-Agent": "CalAITracker/1.0"},
        )
    if resp.status_code != 200 or resp.json().get("status") != 1:
        raise HTTPException(status_code=404, detail="Product not found")

    result = _normalize_off(resp.json().get("product", {}))

    # Cache it — plain insert, ignore duplicate barcodes
    try:
        admin_supabase.table("food_items").insert({
            **result,
            "is_verified": True,
        }).execute()
    except Exception:
        pass

    return {"source": "off", "result": result}
