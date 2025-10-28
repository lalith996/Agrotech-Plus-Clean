import os
import json
from collections import defaultdict, Counter
from typing import TYPE_CHECKING, Any, List, Dict, Set, cast

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

from ml.common.config import MODEL_DIR

DATA_PATH = os.getenv("RECOMMENDATIONS_DATA_PATH", "ml/data/synthetic/behaviors.recommendations.json")
MODEL_PATH = os.path.join(MODEL_DIR, "recommendations.pkl")


def load_data() -> List[dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Recommendations synthetic not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        return cast(List[dict[str, Any]], json.load(f))


def train_model() -> dict[str, Any]:
    logs = load_data()
    user_items: Dict[str, Set[str]] = defaultdict(set)
    item_popularity: Counter[str] = Counter()
    for e in logs:
        uid = cast(str, e.get("userId"))
        iid = cast(str, e.get("itemId"))
        user_items[uid].add(iid)
        item_popularity[iid] += 1
    cooccur: Dict[str, Counter[str]] = defaultdict(Counter)
    for uid, items in user_items.items():
        items_list = list(items)
        for i in range(len(items_list)):
            for j in range(i + 1, len(items_list)):
                a, b = items_list[i], items_list[j]
                cooccur[a][b] += 1
                cooccur[b][a] += 1
    model: dict[str, Any] = {"item_popularity": dict(item_popularity), "cooccur": {k: dict(v) for k, v in cooccur.items()}}
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]
    return {"items": int(len(item_popularity)), "users": int(len(user_items)), "model_path": MODEL_PATH}

if __name__ == "__main__":
    print(train_model())