# pyright: strict
import os
import json
from typing import TYPE_CHECKING, TypedDict, List, Any

if TYPE_CHECKING:
    from typing import Any as joblib  # avoid missing stubs in type checking
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

from sklearn.linear_model import LogisticRegression
from numpy.typing import NDArray
import numpy as np

from ml.common.config import MODEL_DIR

DATA_PATH = os.getenv("CERT_VALID_DATA_PATH", "ml/data/synthetic/certifications.certification_validation.json")
MODEL_PATH = os.path.join(MODEL_DIR, "certification_validation.pkl")


class TrainResult(TypedDict):
    model_path: str
    n_samples: int


def load_data() -> List[dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Certification synthetic not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        return json.load(f)


def train_model() -> TrainResult:
    rows = load_data()
    X_list: List[List[float]] = [[float(r["ocrConfidence"]), float(r["docAgeDays"]), float(r["issuerTrust"]) ] for r in rows]
    X: NDArray[np.float64] = np.array(X_list, dtype=np.float64)
    y_raw: List[Any] = [r["isValid"] for r in rows]
    y_arr: NDArray[np.int64] = np.array([1 if bool(v) else 0 for v in y_raw], dtype=np.int64)
    model = LogisticRegression(max_iter=500)
    # Silence strict type checks on third-party .fit signature
    from typing import cast as _cast_any
    _cast_any(Any, model).fit(X, y_arr)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]
    return {"model_path": MODEL_PATH, "n_samples": int(len(rows))}

if __name__ == "__main__":
    print(train_model())