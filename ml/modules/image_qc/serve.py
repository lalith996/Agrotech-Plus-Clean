import os
from typing import TYPE_CHECKING, Any, Optional, cast

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "image_qc.pkl")
_model: Optional[Any] = None


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def predict_qc_score(brightness: float, contrast: float, sharpness: float, defect_likelihood: float) -> float:
    model = load_model()
    if model is None:
        score = 0.3 * brightness + 0.3 * contrast + 0.3 * sharpness - 0.3 * defect_likelihood
        return max(0.0, min(1.0, float(score)))
    X: list[list[float]] = [[brightness, contrast, sharpness, defect_likelihood]]
    return float(model.predict(X)[0])