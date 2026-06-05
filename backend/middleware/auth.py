from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from lib.config import settings

bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict:
    token = credentials.credentials
    try:
        # Verify JWT with Supabase — creates a client scoped to this user's token
        client = create_client(settings.supabase_url, settings.supabase_anon_key)
        client.auth.set_session(token, "")
        user_resp = client.auth.get_user(token)
        if not user_resp.user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"id": user_resp.user.id, "email": user_resp.user.email, "token": token}
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
