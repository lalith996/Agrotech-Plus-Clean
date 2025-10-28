import os
from typing import TYPE_CHECKING, Any, Optional, cast

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "nlp_intent_sentiment.pkl")
_model: Optional[Any] = None


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def classify_intent(polarity: float, subjectivity: float, length: int, contains_complaint: int) -> dict[str, Any]:
    model = load_model()
    if model is None:
        if contains_complaint:
            return {"intent": 1, "confidence": 0.6}
        return {"intent": 0, "confidence": 0.6}
    X: list[list[float]] = [[polarity, subjectivity, float(length), float(contains_complaint)]]
    proba = model.predict_proba(X)[0]
    intent = int(proba.argmax())
    return {"intent": intent, "confidence": float(proba.max())}