from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from lib.supabase import admin_supabase
from lib.token_tracker import usage_store

# Admin user IDs allowed to view/reset global usage
_ADMIN_IDS: set[str] = set()

router = APIRouter(prefix="/usage", tags=["usage"])


def _require_admin(user: dict):
    if _ADMIN_IDS and user["id"] not in _ADMIN_IDS:
        raise HTTPException(status_code=403, detail="Admin only")


@router.get("")
async def get_usage(user: dict = Depends(get_current_user)):
    _require_admin(user)
    return usage_store.summary()


@router.delete("")
async def reset_usage(user: dict = Depends(get_current_user)):
    _require_admin(user)
    usage_store.reset()
    return {"reset": True}
