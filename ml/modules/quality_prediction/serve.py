import os
import pandas as pd
from typing import TYPE_CHECKING, Any, Optional, cast

from ml.common.config import MODEL_DIR

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join(MODEL_DIR, "quality_prediction.pkl")
SHELF_MODEL_PATH = os.path.join(MODEL_DIR, "quality_shelf_life.pkl")
_model: Optional[Any] = None
_shelf_model: Optional[Any] = None


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def load_shelf_model() -> Optional[Any]:
    global _shelf_model
    if _shelf_model is None and os.path.exists(SHELF_MODEL_PATH):
        _shelf_model = cast(Any, joblib.load(SHELF_MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _shelf_model


def _get_dummies(df: Any) -> Any:
    return pd.get_dummies(df)  # type: ignore[reportUnknownMemberType,reportUnknownArgumentType,reportUnknownVariableType]


def predict_quality(farmer_id: str, defects: int = 0, threshold: float = 0.5) -> dict[str, Any]:
    model_opt = load_model()
    X_df: Any = _get_dummies(pd.DataFrame([{ 'farmerId': farmer_id, 'defects': defects }]))
    if model_opt is None:
        prob = max(0.0, 0.85 - defects * 0.1)
        shelf_life_hours = max(24.0, 72.0 + prob * 48.0 - defects * 6.0)
        grade = 'A' if prob >= 0.8 else ('B' if prob >= 0.6 else 'C')
        return {
            'pass_prob': float(prob),
            'predicted_shelf_life_hours': float(shelf_life_hours),
            'predicted_grade': grade,
            'key_factors': [{ 'feature': 'defects', 'impact': -0.1 * defects }]
        }
    model: Any = model_opt
    trained_cols = getattr(model, 'feature_names_in_', None)
    if trained_cols is not None:
        for col in trained_cols:
            if col not in X_df.columns:  # type: ignore[reportUnknownMemberType]
                X_df[col] = 0  # type: ignore[reportUnknownMemberType]
        X_df = X_df[trained_cols]  # type: ignore[reportUnknownMemberType]
    proba = float(model.predict_proba(X_df)[0][1])

    # Shelf-life prediction using second model (uses farmerId, defects, acceptedRate ~ proba)
    shelf_model_opt = load_shelf_model()
    shelf_life_hours: float
    if shelf_model_opt is None:
        shelf_life_hours = float(max(24.0, 72.0 + proba * 48.0 - defects * 6.0))
    else:
        X_shelf: Any = _get_dummies(pd.DataFrame([{ 'farmerId': farmer_id }]))
        X_shelf['defects'] = defects
        X_shelf['acceptedRate'] = proba
        trained_cols_shelf = getattr(shelf_model_opt, 'feature_names_in_', None)
        if trained_cols_shelf is not None:
            for col in trained_cols_shelf:
                if col not in X_shelf.columns:  # type: ignore[reportUnknownMemberType]
                    X_shelf[col] = 0  # type: ignore[reportUnknownMemberType]
            X_shelf = X_shelf[trained_cols_shelf]  # type: ignore[reportUnknownMemberType]
        shelf_life_hours = float(shelf_model_opt.predict(X_shelf)[0])

    grade = 'A' if proba >= 0.8 else ('B' if proba >= 0.6 else 'C')
    return {
        'pass_prob': float(proba),
        'predicted_shelf_life_hours': float(shelf_life_hours),
        'predicted_grade': grade,
        'key_factors': [{ 'feature': 'defects', 'impact': -0.1 * defects }]
    }