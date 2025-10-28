# pyright: strict, reportUnknownArgumentType=false, reportUnknownParameterType=false
import os
import json
from typing import TYPE_CHECKING, TypedDict, List, Any, cast

import numpy as np
from numpy.typing import NDArray

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

from sklearn.ensemble import IsolationForest

from ml.common.config import MODEL_DIR

DATA_PATH = os.getenv("ANOMALY_DATA_PATH", "ml/data/synthetic/orders.anomaly_detection.json")
MODEL_PATH = os.path.join(MODEL_DIR, "anomaly_detection.pkl")


class TrainResult(TypedDict):
    model_path: str
    n_samples: int


def load_data() -> List[dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Anomaly detection synthetic not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        return json.load(f)


def train_model() -> TrainResult:
    rows = load_data()
    X_list: List[List[float]] = [[float(r["quantity"]), float(r["price"]), float(r["acceptedRate"]) ] for r in rows]
    X: NDArray[np.float64] = np.array(X_list, dtype=np.float64)
    model = IsolationForest(random_state=42, contamination=0.1)
    cast(Any, model).fit(X)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]
    return {"model_path": MODEL_PATH, "n_samples": int(len(rows))}

if __name__ == "__main__":
    print(train_model())