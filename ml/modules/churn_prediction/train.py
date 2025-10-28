# pyright: strict
import os
import json
from typing import TYPE_CHECKING, TypedDict, List, Any, cast

import numpy as np
from numpy.typing import NDArray

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

from sklearn.linear_model import LogisticRegression

from ml.common.config import MODEL_DIR

DATA_PATH = os.getenv("CHURN_DATA_PATH", "ml/data/synthetic/subscriptions.churn_prediction.json")
MODEL_PATH = os.path.join(MODEL_DIR, "churn_prediction.pkl")


class TrainResult(TypedDict):
    model_path: str
    n_samples: int
    coef: List[float]


def load_data() -> List[dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Churn synthetic not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        return json.load(f)


def train_model() -> TrainResult:
    rows = load_data()
    X_list: List[List[float]] = [[float(r["tenure_days"]), float(r["events"]), float(r["last_active_days"]) ] for r in rows]
    X: NDArray[np.float64] = np.array(X_list, dtype=np.float64)
    y_arr: NDArray[np.int64] = np.array([int(r["is_churned"]) for r in rows], dtype=np.int64)
    model = LogisticRegression(max_iter=500)
    cast(Any, model).fit(X, y_arr)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]
    coef_arr: NDArray[np.float64] = np.ravel(getattr(model, 'coef_', np.array([], dtype=np.float64)))
    coef_list: List[float] = [float(v) for v in coef_arr.tolist()]
    return {"coef": coef_list, "model_path": MODEL_PATH, "n_samples": int(len(rows))}

if __name__ == "__main__":
    print(train_model())