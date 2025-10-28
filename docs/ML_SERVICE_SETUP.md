# ML Service & Worker Setup

This guide covers running the Python ML service (FastAPI) and Celery worker with scheduled self-training and synthetic data generation.

## Prerequisites
- Python 3.11 (optional if using Docker)
- Docker & Docker Compose
- Redis (container provided)

## Env Vars (.env)
```
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_API_KEY=dev-key
AUTO_TUNING=true
RETRAIN_INTERVAL_DAYS=7
PERFORMANCE_THRESHOLD=0.85
ENABLE_SELF_TRAINING=true
ENABLE_SYNTHETIC_DATA=true
SYNTHETIC_SCALING_FACTOR=2.0
SYNTHETIC_DATA_TYPES=orders,qcResults,subscriptions,userBehaviors
```

## Run with Docker Compose
```
docker compose -f docker-compose.ml.yml up --build
```
- FastAPI: http://localhost:8000/health
- MLflow: http://localhost:5000
- Redis: localhost:6379

## Local Dev (without Docker)
```
# Service
pip install -r ml/requirements.txt
uvicorn ml.service.main:app --host 0.0.0.0 --port 8000

# Worker
celery -A ml.worker.celery_app worker --loglevel=info
celery -A ml.worker.celery_app beat --loglevel=info

# Synthetic data (optional)
python ml/scripts/synthetic_data.py
```

## Next.js Integration
- The existing `lib/ml-client.ts` expects endpoints:
  - `POST /ml/recommendations`
  - `POST /ml/demand-forecast`
  - `POST /ml/farmer-score`
  - `POST /ml/search`
  - `POST /ml/route-optimize`
  - `GET /health`
- Configure `ML_SERVICE_URL` and `ML_SERVICE_API_KEY` in `.env`

## Testing
```
pytest ml/tests -q --maxfail=1 --disable-warnings
```

### Feature-Specific Synthetic Orders

- Set `SYNTHETIC_DATA_TYPES=orders_demand_forecasting` to generate a demand-forecasting-ready dataset with engineered features (daily series, lags, dow/month, sin/cos seasonality).
- Optional: set `ORDERS_OUTPUT_FORMAT=csv` to write CSV instead of JSON. Default is JSON.
- Output path: `ml/data/synthetic/orders.demand_forecasting.{json|csv}`.
- Raw orders are still generated via `SYNTHETIC_DATA_TYPES=orders` → `ml/data/synthetic/orders.json`.

Example:

`SYNTHETIC_DATA_TYPES=orders,orders_demand_forecasting ORDERS_OUTPUT_FORMAT=csv python ml/scripts/synthetic_data.py`