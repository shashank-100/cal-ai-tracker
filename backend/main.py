import logging
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from routers import (
    profile,
    plans,
    food_analysis,
    food_logs,
    food_search,
    weight_entries,
    water_logs,
    exercise_logs,
    progress,
    streaks,
    referrals,
    usage,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("calai")

limiter = Limiter(key_func=get_remote_address)

from lib.config import settings as _settings

if not _settings.admin_secret:
    logger.warning("ADMIN_SECRET is not set — /usage endpoint is disabled")

_docs_url = "/docs" if _settings.app_env != "production" else None
_redoc_url = "/redoc" if _settings.app_env != "production" else None
_openapi_url = "/openapi.json" if _settings.app_env != "production" else None

app = FastAPI(
    title="Cal AI API",
    version="1.0.0",
    description="Backend API for Cal AI calorie tracking app",
    docs_url=_docs_url,
    redoc_url=_redoc_url,
    openapi_url=_openapi_url,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = [
    "https://calai-production-72a1.up.railway.app",
    "http://localhost:8081",
    "http://localhost:19006",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Admin-Secret"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/privacy", response_class=HTMLResponse)
def privacy_policy():
    path = os.path.join(os.path.dirname(__file__), "privacy-policy.html")
    with open(path, "r") as f:
        return f.read()


app.include_router(profile.router)
app.include_router(plans.router)
app.include_router(food_analysis.router)
app.include_router(food_logs.router)
app.include_router(food_search.router)
app.include_router(weight_entries.router)
app.include_router(water_logs.router)
app.include_router(exercise_logs.router)
app.include_router(progress.router)
app.include_router(streaks.router)
app.include_router(referrals.router)
app.include_router(usage.router)
