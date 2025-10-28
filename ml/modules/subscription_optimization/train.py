import os
import json
import numpy as np
from typing import TYPE_CHECKING, Any, List, cast

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

from sklearn.linear_model import LinearRegression

from ml.common.config import MODEL_DIR

DATA_PATH = os.getenv("SUB_OPT_DATA_PATH", "ml/data/synthetic/subscriptions.subscription_optimization.json")
MODEL_PATH = os.path.join(MODEL_DIR, "subscription_optimization.pkl")


def load_data() -> List[dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Subscription optimization synthetic not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        return cast(List[dict[str, Any]], json.load(f))


def train_model() -> dict[str, Any]:
    rows = load_data()
    X = np.array([[float(r["boxSize"]), float(r["frequencyWeeks"]), float(r["discount"]), float(r["varietyScore"]) ] for r in rows], dtype=float)
    y = np.array([float(r["retentionDays"]) for r in rows], dtype=float)
    model = LinearRegression()
    cast(Any, model).fit(X, y)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]
    return {"model_path": MODEL_PATH, "n_samples": int(len(rows))}

if __name__ == "__main__":
    print(train_model())