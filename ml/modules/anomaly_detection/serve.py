import os
from typing import TYPE_CHECKING, Any, Optional, cast

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "anomaly_detection.pkl")
_model: Optional[Any] = None


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def score_anomaly(quantity: float, price: float, accepted_rate: float) -> float:
    model_opt = load_model()
    if model_opt is None:
        score = 0
        score += 1 if price > 100 and accepted_rate < 0.5 else 0
        score += 1 if quantity > 1000 or quantity < 1 else 0
        return float(score)
    model: Any = model_opt
    X: list[list[float]] = [[quantity, price, accepted_rate]]
    raw = float(model.decision_function(X)[0])
    score = max(0.0, min(1.0, -raw))
    return score