from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from lib.token_tracker import usage_store

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("")
async def get_usage(user: dict = Depends(get_current_user)):
    return usage_store.summary()


@router.delete("")
async def reset_usage(user: dict = Depends(get_current_user)):
    usage_store.reset()
    return {"reset": True}
