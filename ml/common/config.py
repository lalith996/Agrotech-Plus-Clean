import os

MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
MODEL_DIR = os.getenv("MODEL_DIR", "ml/models")
PERFORMANCE_THRESHOLD = float(os.getenv("PERFORMANCE_THRESHOLD", "0.85"))

os.makedirs(MODEL_DIR, exist_ok=True)