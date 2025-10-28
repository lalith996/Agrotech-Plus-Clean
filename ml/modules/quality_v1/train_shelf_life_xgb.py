import os
from typing import List, Dict, Any
import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pickle

MODEL_PATH = os.getenv("SHELF_LIFE_XGB_MODEL_PATH", "ml/models/shelf_life_xgb.pkl")


def generate_synthetic(n: int = 1000) -> Dict[str, Any]:
    rng = np.random.default_rng(123)
    quality_grades = rng.choice(["Premium", "Grade_A", "Grade_B", "Rejected"], size=n, p=[0.3, 0.4, 0.25, 0.05])
    categories = rng.choice(["vegetable", "fruit", "leafy"], size=n)
    age = rng.integers(0, 120, size=n)  # hours since harvest
    temperature = rng.normal(8.0, 4.0, size=n)
    humidity = rng.normal(65.0, 12.0, size=n)

    # Target: remaining shelf life hours
    base: List[float] = []
    for i in range(n):
        base_life = 96 if categories[i] == "fruit" else (72 if categories[i] == "vegetable" else 48)
        grade_bonus = {"Premium": 24, "Grade_A": 12, "Grade_B": 0, "Rejected": -12}[str(quality_grades[i])]
        temp_penalty = max(0.0, (float(temperature[i]) - 6.0)) * 3.0
        hum_penalty = max(0.0, (float(humidity[i]) - 70.0)) * 0.8
        age_penalty = float(age[i]) * 0.6
        noise = float(rng.normal(0.0, 6.0))
        life = base_life + grade_bonus - temp_penalty - hum_penalty - age_penalty + noise
        life = float(np.clip(life, 1.0, 120.0))
        base.append(life)

    X: List[Dict[str, Any]] = []
    for i in range(n):
        rec: Dict[str, Any] = {
            "quality_grade": str(quality_grades[i]),
            "category": str(categories[i]),
            "age": int(age[i]),
            "temperature": float(temperature[i]),
            "humidity": float(humidity[i]),
        }
        X.append(rec)
    y: List[float] = base
    return {"X": X, "y": y}


def build_pipeline() -> Pipeline:
    cat_features = ["quality_grade", "category"]
    num_features = ["age", "temperature", "humidity"]
    pre = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features),
        ("num", "passthrough", num_features)
    ])
    xgb = XGBRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=123,
        objective="reg:squarederror"
    )
    pipe = Pipeline([("pre", pre), ("xgb", xgb)])
    return pipe


def main():
    data = generate_synthetic(1500)
    X: List[Dict[str, Any]] = data["X"]
    y: List[float] = data["y"]
    pipe = build_pipeline()
    from typing import Any as _Any
    pipe_t: _Any = pipe
    # Use DataFrame for ColumnTransformer
    X_df = pd.DataFrame(X)
    pipe_t.fit(X_df, y)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump({"pipeline": pipe}, f)
    print(f"Saved XGB shelf-life regressor to {MODEL_PATH}")


if __name__ == "__main__":
    main()