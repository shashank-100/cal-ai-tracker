# Cal AI API

FastAPI backend for Cal AI Tracker.

## Local setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in .env with your keys
uvicorn main:app --reload
```

API docs available at: http://localhost:8000/docs

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET/PATCH | /profile | User profile |
| GET | /plans | Active plan |
| POST | /plans/generate | Generate new plan |
| POST | /food-analysis | Analyze food photo (Claude Vision) |
| GET/POST | /food-logs | List / create food log entries |
| GET | /food-logs/daily-summary | Full day summary |
| PATCH/DELETE | /food-logs/{id} | Edit / delete entry |
| GET | /food-search | Search USDA food database |
| GET | /food-search/barcode | Barcode lookup (Open Food Facts) |
| GET/POST | /weight-entries | Weight log |
| GET/POST | /water-logs | Water intake log |
| GET/POST | /exercise-logs | Exercise / calories burned |
| GET | /progress/weekly | Weekly calorie chart data |
| GET | /progress/monthly | Monthly progress data |
| GET | /streaks | Current streak |
| GET | /streaks/achievements | Achievements list |
| POST | /referrals/generate | Generate referral code |
| POST | /referrals/validate | Validate referral code (public) |

## Deploy to Railway

1. Push this repo to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add environment variables (from .env.example)
4. Railway auto-detects Python and deploys

## Environment variables

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
USDA_API_KEY=DEMO_KEY
```
