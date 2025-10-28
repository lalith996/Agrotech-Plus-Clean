# pyright: strict
import os
import json
from typing import TYPE_CHECKING, TypedDict, List, Any, cast

import numpy as np
from numpy.typing import NDArray

if TYPE_CHECKING:
    from typing import Any as joblib
else:
    import joblib  # type: ignore[reportMissingTypeStubs]

from sklearn.linear_model import LinearRegression

from ml.common.config import MODEL_DIR

DATA_PATH = os.getenv("IMAGE_QC_DATA_PATH", "ml/data/synthetic/images.image_qc.metadata.json")
MODEL_PATH = os.path.join(MODEL_DIR, "image_qc.pkl")


class TrainResult(TypedDict):
    model_path: str
    n_samples: int


def load_data() -> List[dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Image QC synthetic not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        return json.load(f)


def train_model() -> TrainResult:
    rows = load_data()
    # Use metadata features to predict a qc score
    X_list: List[List[float]] = [[float(r["brightness"]), float(r["contrast"]), float(r["sharpness"]), float(r["defectLikelihood"]) ] for r in rows]
    X: NDArray[np.float64] = np.array(X_list, dtype=np.float64)
    y: NDArray[np.float64] = np.array([float(r["qcScore"]) for r in rows], dtype=np.float64)
    model = LinearRegression()
    cast(Any, model).fit(X, y)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)  # type: ignore[reportUnknownMemberType,reportMissingTypeStubs]
    return {"model_path": MODEL_PATH, "n_samples": int(len(rows))}

if __name__ == "__main__":
    print(train_model())