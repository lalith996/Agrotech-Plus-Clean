import os
import json
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, Any, Optional, List, Dict, cast

from ml.common.config import MODEL_DIR

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join(MODEL_DIR, "demand_forecasting.pkl")
META_PATH = os.path.join(MODEL_DIR, "demand_forecasting.meta.json")
_model: Optional[Any] = None


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def _load_uncertainty() -> float:
    env_val = os.getenv("DEMAND_UNCERTAINTY")
    if env_val is not None:
        try:
            return float(env_val)
        except Exception:
            pass
    if os.path.exists(META_PATH):
        try:
            with open(META_PATH, "r") as f:
                meta = json.load(f)
            u = float(meta.get("uncertainty", 0.15))
            return max(0.0, min(1.0, u))
        except Exception:
            pass
    return 0.15

def get_uncertainty() -> float:
    return _load_uncertainty()
# Wrapper to avoid exposing pandas.get_dummies partially-unknown signature
def _get_dummies(df: Any) -> Any:
    return pd.get_dummies(df)  # type: ignore[reportUnknownMemberType,reportUnknownVariableType]


def _build_feature_rows(product_id: str, start_date: datetime, days: int) -> Any:
    rows: List[Dict[str, Any]] = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        rows.append({
            'productId': product_id,
            'dow': d.weekday(),
            'month': d.month,
            'sin_week': 0.0,
            'cos_week': 0.0,
            'qty_lag_1': 0,
            'qty_lag_2': 0,
            'qty_lag_3': 0,
            'qty_lag_4': 0,
            'qty_lag_5': 0,
            'qty_lag_6': 0,
            'qty_lag_7': 0,
        })
    return _get_dummies(pd.DataFrame(rows))


def forecast_product(product_id: str, days: int = 7) -> List[Dict[str, Any]]:
    model = load_model()
    start_date = datetime.now(timezone.utc)
    uncertainty = _load_uncertainty()
    if model is None:
        base = 10.0
        return [{
            'date': (start_date + timedelta(days=d)).strftime('%Y-%m-%d'),
            'quantity': base,
            'quantityLow': max(0.0, base * (1.0 - uncertainty)),
            'quantityHigh': base * (1.0 + uncertainty),
        } for d in range(days)]
    features_df: Any = _build_feature_rows(product_id, start_date, days)
    trained_cols = getattr(model, 'feature_names_in_', None)
    if trained_cols is not None:
        for col in trained_cols:
            if col not in features_df.columns:
                features_df[col] = 0
        features_df = features_df[trained_cols]
    preds: Any = model.predict(features_df)
    results: List[Dict[str, Any]] = []
    for i, p in enumerate(preds):
        q = float(max(0.0, p))
        results.append({
            'date': (start_date + timedelta(days=i)).strftime('%Y-%m-%d'),
            'quantity': q,
            'quantityLow': max(0.0, q * (1.0 - uncertainty)),
            'quantityHigh': q * (1.0 + uncertainty),
        })
    return results