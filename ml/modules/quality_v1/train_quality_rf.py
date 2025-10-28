import os
from typing import List, Dict, Any
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pickle

MODEL_PATH = os.getenv("QUALITY_RF_MODEL_PATH", "ml/models/quality_rf.pkl")

# Synthetic training data generator
CLASSES: List[str] = ["Premium", "Grade_A", "Grade_B", "Rejected"]


def generate_synthetic(n: int = 800) -> Dict[str, Any]:
    rng = np.random.default_rng(42)
    farmer_ids = [f"farmer_{i%20}" for i in range(n)]
    product_types = rng.choice(["tomato", "potato", "cucumber", "spinach"], size=n)
    harvest_dates = rng.choice(["2025-10-20", "2025-10-21", "2025-10-22"], size=n)
    weather = rng.choice(["sunny", "cloudy", "rainy"], size=n, p=[0.5, 0.3, 0.2])
    transport_time = rng.integers(1, 12, size=n)
    storage = rng.choice(["cold", "ambient"], size=n, p=[0.6, 0.4])
    temperature = rng.normal(6.0, 3.0, size=n)
    humidity = rng.normal(60.0, 15.0, size=n)

    # Target: quality class with heuristic probabilities
    y: List[str] = []
    for i in range(n):
        premium_prob = 0.4 if (storage[i] == "cold" and temperature[i] <= 6 and humidity[i] <= 65) else 0.2
        grade_a_prob = 0.3 if (transport_time[i] <= 6 and weather[i] != "rainy") else 0.25
        grade_b_prob = 0.2
        rejected_prob = 1.0 - (premium_prob + grade_a_prob + grade_b_prob)
        probs = np.array([premium_prob, grade_a_prob, grade_b_prob, rejected_prob])
        probs = np.clip(probs, 0.01, 0.9)
        probs = probs / probs.sum()
        cls = CLASSES[int(np.random.choice(len(CLASSES), p=probs))]
        y.append(cls)

    X: List[Dict[str, Any]] = []
    for i in range(n):
        rec: Dict[str, Any] = {
            "farmer_id": str(farmer_ids[i]),
            "product_type": str(product_types[i]),
            "harvest_date": str(harvest_dates[i]),
            "weather": str(weather[i]),
            "transport_time": int(transport_time[i]),
            "storage": str(storage[i]),
            "temperature": float(temperature[i]),
            "humidity": float(humidity[i]),
        }
        X.append(rec)
    return {"X": X, "y": y}


def build_pipeline() -> Pipeline:
    cat_features = ["farmer_id", "product_type", "harvest_date", "weather", "storage"]
    num_features = ["transport_time", "temperature", "humidity"]

    pre = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features),
        ("num", "passthrough", num_features)
    ])
    rf = RandomForestClassifier(n_estimators=300, max_depth=15, class_weight="balanced", random_state=42)
    pipe = Pipeline([("pre", pre), ("rf", rf)])
    return pipe


def main():
    data = generate_synthetic(1200)
    X: List[Dict[str, Any]] = data["X"]
    y: List[str] = data["y"]
    pipe = build_pipeline()
    # Use DataFrame so ColumnTransformer can select by column names
    X_df = pd.DataFrame(X)
    from typing import Any as _Any
    pipe_t: _Any = pipe
    pipe_t.fit(X_df, y)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump({"pipeline": pipe, "classes": CLASSES}, f)
    print(f"Saved RF quality classifier to {MODEL_PATH}")


if __name__ == "__main__":
    main()