import secrets
import string
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from middleware.auth import get_current_user
from lib.supabase import admin_supabase

router = APIRouter(prefix="/referrals", tags=["referrals"])


class ValidateRequest(BaseModel):
    referral_code: str = Field(max_length=8)


@router.get("")
async def get_referrals(user: dict = Depends(get_current_user)):
    res = (
        admin_supabase.table("referrals")
        .select("referral_code, status, created_at")
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

    code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    res = admin_supabase.table("referrals").insert({
        "referrer_id": user["id"],
        "referral_code": code,
        "status": "pending",
    }).execute()
    return {"referral_code": code}


@router.post("/validate")
async def validate_referral_code(body: ValidateRequest, user: dict = Depends(get_current_user)):
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
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to validate referral code") from e
