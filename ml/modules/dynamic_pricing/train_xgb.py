# pyright: strict
import os
import json
from typing import TYPE_CHECKING, TypedDict, List, Dict, Any, cast

import numpy as np

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "dynamic_pricing_xgb.pkl")
DATA_PATH = os.getenv("DYNAMIC_PRICING_XGB_DATA_PATH", "ml/data/synthetic/dynamic_pricing.xgb.json")


class TrainResult(TypedDict):
    model_path: str
    n_samples: int
    params: Dict[str, Any]


def _generate_synthetic(n: int = 300) -> List[Dict[str, Any]]:
    rng = np.random.default_rng(42)
    grades = ["A", "B", "C"]
    rows: List[Dict[str, Any]] = []
    for _ in range(n):
        unit_cost = float(rng.uniform(0.8, 4.5))
        grade = cast(str, rng.choice(grades))
        grade_factor = {"A": 2.0, "B": 1.6, "C": 1.3}[grade]
        base_price = unit_cost * grade_factor
        demand = float(rng.uniform(2.0, 12.0))
        stock_level = int(rng.integers(10, 250))
        competitor_avg = float(base_price * rng.uniform(0.92, 1.08))
        expiry_hours = int(rng.integers(8, 96))
        # Heuristic target using reward model
        candidates = [base_price * (1 + s) for s in [-0.10, -0.05, 0.0, 0.05, 0.10]]
        # constraints
        min_margin = 0.15
        max_discount = 0.30
        min_price = max(base_price * (1 - max_discount), unit_cost * (1 + min_margin))
        candidates = [max(c, min_price) for c in candidates]
        best_p = candidates[0]
        best_reward = float("-inf")
        for p in candidates:
            elasticity = 0.1 * ((competitor_avg - p) / base_price)
            demand_adj = max(0.0, demand * (1.0 + elasticity))
            sold = min(float(stock_level), demand_adj)
            revenue = sold * p
            waste_penalty = 0.2 if expiry_hours > 48 else (0.5 if expiry_hours > 24 else 0.8)
            waste_cost = max(0.0, float(stock_level) - sold) * unit_cost * waste_penalty
            satisfaction_bonus = 0.05 * revenue if abs(p - competitor_avg) / base_price < 0.03 else 0.0
            reward = revenue - waste_cost + satisfaction_bonus
            if reward > best_reward:
                best_reward = reward
                best_p = p
        rows.append({
            "base_price": float(base_price),
            "quality_grade": grade,
            "stock_level": int(stock_level),
            "demand": float(demand),
            "competitor_avg": float(competitor_avg),
            "optimal_price": float(best_p),
        })
    return rows


def load_or_generate_data() -> List[Dict[str, Any]]:
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r") as f:
            return cast(List[Dict[str, Any]], json.load(f))
    rows = _generate_synthetic(300)
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w") as f:
        json.dump(rows, f)
    return rows


def train_model() -> TrainResult:
    # Lazy import to avoid hard dependency at import-time
    try:
        import xgboost as xgb  # type: ignore[reportMissingTypeStubs]
    except Exception as e:
        raise RuntimeError("xgboost not installed; please enable in ml/requirements.txt and install deps") from e

    rows = load_or_generate_data()
    grade_map = {"A": 2, "B": 1, "C": 0}
    X = np.array([[float(r["base_price"]), float(grade_map.get(cast(str, r["quality_grade"]), 1)), float(r["stock_level"]), float(r["demand"]), float(r["competitor_avg"]) ] for r in rows], dtype=float)
    y = np.array([float(r["optimal_price"]) for r in rows], dtype=float)

    model: Any = xgb.XGBRegressor(max_depth=6, learning_rate=0.1, n_estimators=200, subsample=0.9, colsample_bytree=0.9, random_state=42)  # type: ignore[reportUnknownMemberType]
    model.fit(X, y)  # type: ignore[reportUnknownMemberType]

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]
    return {"model_path": MODEL_PATH, "n_samples": int(len(rows)), "params": {"max_depth": 6, "learning_rate": 0.1, "n_estimators": 200}}


if __name__ == "__main__":
    print(train_model())