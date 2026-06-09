from fastapi import APIRouter, Depends, HTTPException, Header
from lib.token_tracker import usage_store
from lib.config import settings

router = APIRouter(prefix="/usage", tags=["usage"])


def _require_admin(x_admin_secret: str = Header(default="")):
    if not settings.admin_secret or x_admin_secret != settings.admin_secret:
        raise HTTPException(status_code=403, detail="Admin only")


@router.get("")
async def get_usage(admin: None = Depends(_require_admin)):
    return usage_store.summary()


@router.delete("")
async def reset_usage(admin: None = Depends(_require_admin)):
    usage_store.reset()
    return {"reset": True}
