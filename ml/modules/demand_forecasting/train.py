# pyright: strict
import os
import json
from typing import TYPE_CHECKING, TypedDict, Any, cast

import pandas as pd
import numpy as np
from datetime import datetime, timezone
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split as _train_test_split  # type: ignore[reportUnknownVariableType,reportUnknownMemberType]
from sklearn.metrics import mean_absolute_error as _mean_absolute_error  # type: ignore[reportUnknownVariableType,reportUnknownMemberType]

# Alias third-party functions with partially unknown types to Any for strict mode
train_test_split: Any = cast(Any, _train_test_split)
mean_absolute_error: Any = cast(Any, _mean_absolute_error)

# Helper to call pandas.get_dummies without exposing its partially-unknown signature
def _get_dummies(*args: Any, **kwargs: Any) -> Any:
    return pd.get_dummies(*args, **kwargs)  # type: ignore[reportUnknownMemberType,reportUnknownVariableType]

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

from ml.common.config import MODEL_DIR
from .features import build_daily_series, add_time_features, add_lag_features

DATA_PATH = os.getenv("ORDERS_SYNTHETIC_PATH", "ml/data/synthetic/orders.json")
MODEL_PATH = os.path.join(MODEL_DIR, "demand_forecasting.pkl")
META_PATH = os.path.join(MODEL_DIR, "demand_forecasting.meta.json")


class TrainResult(TypedDict):
    mae: float
    model_path: str
    n_samples: int


def load_orders() -> pd.DataFrame:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Synthetic orders not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        data = json.load(f)
    return pd.DataFrame(cast(list[dict[str, Any]], data))


def train_model() -> TrainResult:
    orders_df = load_orders()
    daily = build_daily_series(orders_df)
    daily = add_time_features(daily)
    daily = add_lag_features(daily, lags=7)

    # one-hot for productId
    X: Any = _get_dummies(daily[['productId', 'dow', 'month', 'sin_week', 'cos_week',
                              'qty_lag_1', 'qty_lag_2', 'qty_lag_3', 'qty_lag_4', 'qty_lag_5', 'qty_lag_6', 'qty_lag_7']])
    y: Any = daily['qty']

    # split
    result: Any = train_test_split(X, y, test_size=0.2, shuffle=False)
    X_train: Any
    X_test: Any
    y_train: Any
    y_test: Any
    X_train, X_test, y_train, y_test = cast(tuple[Any, Any, Any, Any], result)

    model = RandomForestRegressor(n_estimators=200, random_state=42)
    cast(Any, model).fit(X_train, y_train)

    preds: Any = cast(Any, model).predict(X_test)
    mae = float(mean_absolute_error(y_test, preds))

    # Calibrate uncertainty as relative MAE on the test split, bounded
    y_test_arr = np.asarray(y_test, dtype=float)
    preds_arr = np.asarray(preds, dtype=float)
    mean_y = float(np.mean(y_test_arr)) if y_test_arr.size > 0 else 0.0
    rel_unc = (float(np.mean(np.abs(y_test_arr - preds_arr))) / (mean_y + 1e-6)) if mean_y > 0 else 0.15
    uncertainty = float(max(0.05, min(0.35, rel_unc)))

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]

    # Write meta for serving to consume calibrated uncertainty
    with open(META_PATH, 'w') as f:
        json.dump({
            "uncertainty": uncertainty,
            "mae": mae,
            "n_samples": int(len(daily)),
            "trained_at": datetime.now(timezone.utc).isoformat(),
        }, f)

    return {"mae": mae, "model_path": MODEL_PATH, "n_samples": int(len(daily))}

if __name__ == "__main__":
    metrics = train_model()
    print("Trained demand forecasting:", metrics)