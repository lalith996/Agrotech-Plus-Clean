import os
import json
import numpy as np
from typing import Any, List, cast

from ml.common.config import MODEL_DIR

DATA_PATH = os.getenv("SEASONAL_DATA_PATH", "ml/data/synthetic/orders.seasonal_analysis.json")
MODEL_PATH = os.path.join(MODEL_DIR, "seasonal_analysis.npy")


def load_data() -> List[dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Seasonal synthetic not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        return cast(List[dict[str, Any]], json.load(f))


def train_model() -> dict[str, Any]:
    rows = load_data()
    month_avgs: dict[int, list[float]] = {m: [] for m in range(1, 13)}
    for r in rows:
        month = int(r["month"])
        month_avgs[month].append(float(r["quantity"]))
    seasonality = np.array([np.mean(month_avgs[m]) if month_avgs[m] else 0.0 for m in range(1, 13)], dtype=float)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    np.save(MODEL_PATH, seasonality)
    return {"model_path": MODEL_PATH, "seasonality": seasonality.tolist()}

if __name__ == "__main__":
    print(train_model())