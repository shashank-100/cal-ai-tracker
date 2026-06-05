from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
)

app = FastAPI(
    title="Cal AI API",
    version="1.0.0",
    description="Backend API for Cal AI calorie tracking app",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten this in production to your app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
def health():
    return {"status": "ok"}

# Routers
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
