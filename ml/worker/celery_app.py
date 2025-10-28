# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false, reportUnknownVariableType=false, reportMissingImports=false, reportUntypedFunctionDecorator=false
import os
from celery import Celery  # type: ignore[reportMissingTypeStubs]
from datetime import timedelta
from typing import Any, Dict

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
AUTO_SELF_TRAIN = os.getenv("ENABLE_SELF_TRAINING", "true") == "true"
RETRAIN_INTERVAL_DAYS = int(os.getenv("RETRAIN_INTERVAL_DAYS", "7"))
ENABLE_SYNTHETIC = os.getenv("ENABLE_SYNTHETIC_DATA", "true") == "true"
SCALING_FACTOR = float(os.getenv("SYNTHETIC_SCALING_FACTOR", "2.0"))
DATA_TYPES = os.getenv("SYNTHETIC_DATA_TYPES", "orders,qcResults,subscriptions,userBehaviors").split(",")

app: Any = Celery('ml-worker', broker=REDIS_URL, backend=REDIS_URL)

app.conf.timezone = 'UTC'
app.conf.beat_schedule = {
    'weekly-retrain': {
        'task': 'ml-worker.retrain_all_modules',
        'schedule': timedelta(days=RETRAIN_INTERVAL_DAYS),
        'options': {'expires': 60*60}
    },
    'daily-synthetic-data': {
        'task': 'ml-worker.generate_synthetic_data',
        'schedule': timedelta(days=1),
        'options': {'expires': 60*60}
    },
}

@app.task(name='ml-worker.retrain_all_modules')
def retrain_all_modules() -> Dict[str, Any]:
    if not AUTO_SELF_TRAIN:
        return {"status": "skipped", "reason": "self-training disabled"}
    # Invoke implemented training pipelines
    from ml.modules.demand_forecasting.train import train_model as train_df
    from ml.modules.quality_prediction.train import train_model as train_qc
    from ml.modules.dynamic_pricing.train import train_model as train_dp
    from ml.modules.recommendations.train import train_model as train_rec
    from ml.modules.churn_prediction.train import train_model as train_churn
    from ml.modules.anomaly_detection.train import train_model as train_anom
    from ml.modules.seasonal_analysis.train import train_model as train_season
    from ml.modules.clv_prediction.train import train_model as train_clv
    from ml.modules.subscription_optimization.train import train_model as train_subopt
    from ml.modules.certification_validation.train import train_model as train_cert
    from ml.modules.predictive_maintenance.train import train_model as train_pm
    from ml.modules.image_qc.train import train_model as train_imgqc
    from ml.modules.nlp_intent_sentiment.train import train_model as train_nlp

    results: Dict[str, Any] = {}
    results['demand_forecasting'] = train_df()
    results['quality_prediction'] = train_qc()
    results['dynamic_pricing'] = train_dp()
    results['recommendations'] = train_rec()
    results['churn_prediction'] = train_churn()
    results['anomaly_detection'] = train_anom()
    results['seasonal_analysis'] = train_season()
    results['clv_prediction'] = train_clv()
    results['subscription_optimization'] = train_subopt()
    results['certification_validation'] = train_cert()
    results['predictive_maintenance'] = train_pm()
    results['image_qc'] = train_imgqc()
    results['nlp_intent_sentiment'] = train_nlp()

    return {"status": "done", "modules": results}

@app.task(name='ml-worker.generate_synthetic_data')
def generate_synthetic_data() -> Dict[str, Any]:
    if not ENABLE_SYNTHETIC:
        return {"status": "skipped", "reason": "synthetic disabled"}
    # Placeholder: call generator writing to parquet/csv per DATA_TYPES
    generated = {dt: int(100 * SCALING_FACTOR) for dt in DATA_TYPES}
    return {"status": "done", "generated": generated, "scaling_factor": SCALING_FACTOR}

# Run: celery -A ml.worker.celery_app worker --loglevel=info
# Beat: celery -A ml.worker.celery_app beat --loglevel=info