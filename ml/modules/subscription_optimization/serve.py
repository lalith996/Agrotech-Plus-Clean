import os
from typing import TYPE_CHECKING, Any, Optional, cast

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "subscription_optimization.pkl")
_model: Optional[Any] = None


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def recommend_upgrade(current_plan: str, usage_score: float, support_tickets: int) -> dict[str, Any]:
    model_opt = load_model()
    if model_opt is None:
        recommendation = "Upgrade" if usage_score > 0.7 or support_tickets > 5 else "Keep"
        return {"recommendation": recommendation, "confidence": 0.65}
    model: Any = model_opt
    X: Any = [[current_plan, usage_score, float(support_tickets)]]
    try:
        proba = float(model.predict_proba(X)[0][1])
    except Exception:
        proba = float(model.predict(X)[0])
    return {"recommendation": ("Upgrade" if proba > 0.5 else "Keep"), "confidence": proba}


def recommend_subscription(box_size: int, frequency_weeks: int, discount: float, variety_score: float) -> dict[str, Any]:
    model_opt = load_model()
    if model_opt is None:
        score = box_size * 10 + (4 - frequency_weeks) * 20 + discount * 100 + variety_score * 10
        return {"score": float(score), "recommendedFrequency": max(1, min(4, frequency_weeks))}
    model: Any = model_opt
    X: Any = [[box_size, frequency_weeks, discount, variety_score]]
    pred = float(model.predict(X)[0])
    freq = 1 if pred > 180 else 2 if pred > 120 else 3 if pred > 60 else 4
    return {"retentionDays": pred, "recommendedFrequency": freq}