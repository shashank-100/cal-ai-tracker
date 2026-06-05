import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.auth import get_current_user
from lib.supabase import admin_supabase

router = APIRouter(prefix="/referrals", tags=["referrals"])


class ValidateRequest(BaseModel):
    referral_code: str


@router.get("")
async def get_referrals(user: dict = Depends(get_current_user)):
    res = (
        admin_supabase.table("referrals")
        .select("*")
        .eq("referrer_id", user["id"])
        .execute()
    )
    return res.data or []


@router.post("/generate")
async def generate_referral_code(user: dict = Depends(get_current_user)):
    # Check if user already has a code
    existing = (
        admin_supabase.table("referrals")
        .select("referral_code")
        .eq("referrer_id", user["id"])
        .is_("referred_id", "null")
        .limit(1)
        .execute()
    )
    if existing.data:
        return {"referral_code": existing.data[0]["referral_code"]}

    code = str(uuid.uuid4())[:8].upper()
    res = admin_supabase.table("referrals").insert({
        "referrer_id": user["id"],
        "referral_code": code,
        "status": "pending",
    }).execute()
    return {"referral_code": code}


@router.post("/validate")
async def validate_referral_code(body: ValidateRequest):
    # Public endpoint — no auth required
    try:
        res = (
            admin_supabase.table("referrals")
            .select("id, referral_code, status")
            .eq("referral_code", body.referral_code.upper())
            .limit(1)
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Invalid referral code")
        return {"valid": True, "status": res.data[0]["status"]}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid referral code")
