# pyright: reportUnknownMemberType=false, reportUnknownVariableType=false, reportMissingTypeStubs=false, reportUnknownArgumentType=false, reportUnknownParameterType=false
import os
import json
import pandas as pd
from typing import TYPE_CHECKING, Any, cast
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split as _train_test_split
from sklearn.metrics import f1_score as _f1_score, mean_squared_error as _mse

# Create Any-typed aliases to quiet partial-unknown types under strict checkers
train_test_split: Any = cast(Any, _train_test_split)
f1_score: Any = cast(Any, _f1_score)
mean_squared_error: Any = cast(Any, _mse)

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

from ml.common.config import MODEL_DIR

DATA_PATH = os.getenv("QC_SYNTHETIC_PATH", "ml/data/synthetic/qcResults.json")
MODEL_PATH = os.path.join(MODEL_DIR, "quality_prediction.pkl")
SHELF_MODEL_PATH = os.path.join(MODEL_DIR, "quality_shelf_life.pkl")


def _get_dummies(*args: Any, **kwargs: Any) -> Any:
    return pd.get_dummies(*args, **kwargs)  # type: ignore[reportUnknownMemberType,reportUnknownVariableType]


def load_qc() -> pd.DataFrame:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Synthetic QC results not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        data = json.load(f)
    return pd.DataFrame(cast(list[dict[str, Any]], data))


def train_model() -> dict[str, Any]:
    df = load_qc()
    df['accepted'] = (df['acceptedRate'] >= 0.8).astype(int)
    defects_series: Any = df['defects']
    df['defects'] = defects_series.fillna(0).astype(int)

    # Classification: predict acceptance
    X_cls: Any = _get_dummies(df[['farmerId', 'defects']])
    y_cls: Any = df['accepted']

    cls_split: Any = train_test_split(X_cls, y_cls, test_size=0.2, random_state=42)
    Xc_train: Any; Xc_test: Any; yc_train: Any; yc_test: Any
    Xc_train, Xc_test, yc_train, yc_test = cast(tuple[Any, Any, Any, Any], cls_split)

    cls_model = RandomForestClassifier(n_estimators=200, random_state=42)
    cast(Any, cls_model).fit(Xc_train, yc_train)

    cls_preds: Any = cast(Any, cls_model).predict(Xc_test)
    f1 = float(f1_score(yc_test, cls_preds))

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(cls_model, MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]

    # Regression: predict shelf-life hours (derived target)
    shelf_life = (72 + df['acceptedRate'] * 48 - df['defects'] * 6).clip(lower=24)
    X_reg: Any = _get_dummies(df[['farmerId']])
    X_reg['defects'] = df['defects']
    X_reg['acceptedRate'] = df['acceptedRate']
    y_reg: Any = shelf_life

    reg_split: Any = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)
    Xr_train: Any; Xr_test: Any; yr_train: Any; yr_test: Any
    Xr_train, Xr_test, yr_train, yr_test = cast(tuple[Any, Any, Any, Any], reg_split)

    reg_model = RandomForestRegressor(n_estimators=200, random_state=42)
    cast(Any, reg_model).fit(Xr_train, yr_train)

    reg_preds: Any = cast(Any, reg_model).predict(Xr_test)
    rmse = float(mean_squared_error(yr_test, reg_preds) ** 0.5)

    os.makedirs(os.path.dirname(SHELF_MODEL_PATH), exist_ok=True)
    joblib.dump(reg_model, SHELF_MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]

    return {
        "f1": f1,
        "model_path": MODEL_PATH,
        "shelf_life_rmse": rmse,
        "shelf_life_model_path": SHELF_MODEL_PATH,
        "n_samples": int(len(df))
    }

if __name__ == "__main__":
    metrics = train_model()
    print("Trained quality prediction:", metrics)