import os
from typing import TYPE_CHECKING, Any, Optional, cast

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "dynamic_pricing.pkl")
_model: Optional[Any] = None

# Env-based constraints and A/B toggle
MAX_DISCOUNT = float(os.getenv("PRICING_MAX_DISCOUNT", "0.30"))
AB_ENABLED = os.getenv("PRICING_AB_ENABLED", "true").lower() == "true"


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def recommend_price(base_price: float, competitor_price: float, demand_index: float, stock_level: int, ab_bucket: str = "A") -> dict[str, Any]:
    model = load_model()
    if model is None:
        discount = (0.05 + demand_index * 0.1) * (1 if stock_level > 50 else 0.5)
        rec = max(0.1, base_price * (1 + demand_index) * (1 - discount))
    else:
        X: list[list[float]] = [[base_price, competitor_price, demand_index, float(stock_level)]]
        rec = float(model.predict(X)[0])
    # Clamp to respect max discount
    min_price = max(0.1, base_price * (1 - MAX_DISCOUNT))
    rec = max(rec, min_price)
    # A/B adjustment if enabled
    if AB_ENABLED and ab_bucket.upper() == "B":
        rec *= 0.98
    return {"recommended_price": round(rec, 2), "bucket": ab_bucket}