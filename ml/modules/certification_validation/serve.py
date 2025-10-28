# pyright: strict
import os
from typing import Optional, Protocol, Sequence, TypedDict, cast, TYPE_CHECKING

# Provide a minimal protocol for classifiers with predict_proba
class ProbabilisticClassifier(Protocol):
    def predict_proba(self, X: Sequence[Sequence[float]]) -> Sequence[Sequence[float]]: ...

class CertificationValidationResult(TypedDict):
    isValid: bool
    score: float

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "certification_validation.pkl")
_model: Optional[ProbabilisticClassifier] = None


def load_model() -> Optional[ProbabilisticClassifier]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(ProbabilisticClassifier, joblib.load(MODEL_PATH))  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]
    return _model


def validate_cert(ocr_confidence: float, doc_age_days: int, issuer_trust: float) -> CertificationValidationResult:
    model = load_model()
    if model is None:
        score = 0.5 * ocr_confidence + 0.3 * issuer_trust - 0.2 * (doc_age_days / 365.0)
        return {"isValid": score > 0.5, "score": float(score)}
    X: list[list[float]] = [[ocr_confidence, doc_age_days, issuer_trust]]
    proba_seq = model.predict_proba(X)[0]
    proba = float(proba_seq[1])
    return {"isValid": proba > 0.5, "score": proba}