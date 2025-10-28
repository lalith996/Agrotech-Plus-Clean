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

from sklearn.linear_model import LinearRegression

from ml.common.config import MODEL_DIR

DATA_PATH = os.getenv("DYNAMIC_PRICING_DATA_PATH", "ml/data/synthetic/orders.dynamic_pricing.json")
MODEL_PATH = os.path.join(MODEL_DIR, "dynamic_pricing.pkl")


class TrainResult(TypedDict):
    model_path: str
    n_samples: int
    coef: List[float]
    intercept: float


def load_data() -> List[dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dynamic pricing synthetic not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        data = json.load(f)
    return cast(List[dict[str, Any]], data)


def train_model() -> TrainResult:
    data = load_data()
    X_list: List[List[float]] = [[float(d["base_price"]), float(d["competitor_price"]), float(d["demand_index"]), float(d["stock_level"]) ] for d in data]
    X: NDArray[np.float64] = np.array(X_list, dtype=np.float64)
    y: NDArray[np.float64] = np.array([float(d["recommended_price"]) for d in data], dtype=np.float64)
    model = LinearRegression()
    cast(Any, model).fit(X, y)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]
    coef_arr: NDArray[np.float64] = np.ravel(getattr(model, 'coef_', np.array([], dtype=np.float64)))
    coef_list: List[float] = [float(v) for v in coef_arr.tolist()]
    return {"coef": coef_list, "intercept": float(getattr(model, 'intercept_', 0.0)), "model_path": MODEL_PATH, "n_samples": int(len(data))}

if __name__ == "__main__":
    print(train_model())