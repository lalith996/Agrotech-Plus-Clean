import os
from typing import TYPE_CHECKING, Any, Optional, cast

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "predictive_maintenance.pkl")
_model: Optional[Any] = None


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def predict_days_to_failure(runtime_hours: float, temp_avg: float, vibration: float, last_service_days: int) -> float:
    model = load_model()
    if model is None:
        base = 200
        base -= temp_avg * 0.5
        base -= vibration * 2.0
        base -= runtime_hours * 0.1
        base += max(0, 60 - last_service_days) * 0.2
        return max(1.0, float(base))
    X: list[list[float]] = [[runtime_hours, temp_avg, vibration, last_service_days]]
    return float(model.predict(X)[0])