import os
from typing import TYPE_CHECKING, Any, Optional, cast

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "clv_prediction.pkl")
_model: Optional[Any] = None


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def predict_clv(orders_count: int, avg_order_value: float, tenure_days: int, churn_risk: float) -> float:
    model = load_model()
    if model is None:
        tenure_factor = 1 + (tenure_days / 365.0)
        return float(avg_order_value * orders_count * tenure_factor * (1 - churn_risk))
    X: list[list[float]] = [[orders_count, avg_order_value, tenure_days, churn_risk]]
    return float(model.predict(X)[0])