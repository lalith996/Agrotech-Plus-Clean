import os
from typing import TYPE_CHECKING, Any, Optional, cast
from collections import Counter

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

MODEL_PATH = os.path.join("ml/models", "recommendations.pkl")
_model: Optional[Any] = None


def load_model() -> Optional[Any]:
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = cast(Any, joblib.load(MODEL_PATH))  # type: ignore[reportMissingTypeStubs]
    return _model


def recommend_for_user(user_id: str, recent_items: Optional[list[str]] = None, k: int = 10) -> dict[str, Any]:
    model = load_model()
    if model is None:
        pops: Counter[str] = Counter()
        return {"userId": user_id, "items": []}
    pops: Counter[str] = Counter(cast(dict[str, int], model.get("item_popularity", {})))
    cooccur: dict[str, dict[str, int]] = cast(dict[str, dict[str, int]], model.get("cooccur", {}))
    scores: dict[str, float] = {}
    if recent_items:
        for it in recent_items:
            for neigh, w in cooccur.get(it, {}).items():
                scores[neigh] = scores.get(neigh, 0.0) + float(w)
    for item, cnt in pops.items():
        scores[item] = scores.get(item, 0.0) + float(cnt) * 0.5
    ranked = [item for item, _ in sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:k]]
    return {"userId": user_id, "items": ranked}