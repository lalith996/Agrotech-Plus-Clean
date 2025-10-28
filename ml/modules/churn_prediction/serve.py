import os
from typing import TYPE_CHECKING, Any, Optional, cast

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "churn_prediction.pkl")
_model: Optional[Any] = None


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def predict_churn_proba(tenure_days: int, events: int, last_active_days: int) -> float:
    model = load_model()
    if model is None:
        score = 0.5
        score += 0.2 if tenure_days > 180 else -0.1
        score += -0.2 if events > 10 else 0.1
        score += 0.2 if last_active_days > 30 else -0.1
        return max(0.0, min(1.0, score))
    X: list[list[float]] = [[float(tenure_days), float(events), float(last_active_days)]]
    proba = float(model.predict_proba(X)[0][1])
    return proba