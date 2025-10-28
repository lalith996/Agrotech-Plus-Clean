# pyright: strict
import os
from typing import Any, Optional, List

XGB_MODEL_PATH = os.path.join("ml/models", "dynamic_pricing_xgb.pkl")
DQN_MODEL_PATH = os.path.join("ml/models", "dynamic_pricing_dqn.pt")

_xgb_model: Optional[Any] = None
_dqn_state: Optional[Any] = None


def load_xgb() -> Optional[Any]:
    global _xgb_model
    if _xgb_model is not None:
        return _xgb_model
    if not os.path.exists(XGB_MODEL_PATH):
        return None
    try:
        import joblib  # type: ignore[reportMissingTypeStubs]
        _xgb_model = joblib.load(XGB_MODEL_PATH)  # type: ignore[reportMissingTypeStubs]
        return _xgb_model
    except Exception:
        return None


def load_dqn() -> Optional[Any]:
    global _dqn_state
    if _dqn_state is not None:
        return _dqn_state
    if not os.path.exists(DQN_MODEL_PATH):
        return None
    try:
        import torch  # type: ignore[reportMissingTypeStubs]
        import torch.nn as nn  # type: ignore[reportMissingTypeStubs]
        # Build same architecture used in training
        qnet: Any = nn.Sequential(  # type: ignore[reportUnknownMemberType]
            nn.Linear(5, 64), nn.ReLU(),  # type: ignore[reportUnknownMemberType]
            nn.Linear(64, 64), nn.ReLU(),  # type: ignore[reportUnknownMemberType]
            nn.Linear(64, 5),  # type: ignore[reportUnknownMemberType]
        )
        qnet.load_state_dict(torch.load(DQN_MODEL_PATH, map_location="cpu"))  # type: ignore[reportUnknownMemberType]
        qnet.eval()  # type: ignore[reportUnknownMemberType]
        _dqn_state = qnet  # type: ignore[reportUnknownVariableType]
        return _dqn_state
    except Exception:
        return None


def predict_with_models(base_price: float, competitor_price: float, expected_demand: float, quality_grade: str, inventory: int, expiry_hours: int, unit_cost: float, candidates: List[float]) -> Optional[float]:
    # Try XGB first
    xgb = load_xgb()
    if xgb is not None:
        grade_map = {"A": 2, "B": 1, "C": 0}
        feat = [
            float(base_price),
            float(grade_map.get(quality_grade.upper(), 1)),
            float(inventory),
            float(expected_demand),
            float(competitor_price),
        ]
        try:
            pred = float(xgb.predict([feat])[0])  # type: ignore[reportUnknownMemberType]
            return pred
        except Exception:
            pass
    # Try DQN policy
    dqn = load_dqn()
    if dqn is not None:
        try:
            import torch  # type: ignore[reportMissingTypeStubs]
            state = torch.tensor([float(inventory), float(expected_demand), (1.0 if quality_grade.upper()=="A" else 0.85 if quality_grade.upper()=="B" else 0.7), float(competitor_price/base_price if base_price>0 else 1.0), float(expiry_hours)], dtype=torch.float32)  # type: ignore[reportUnknownMemberType]
            with torch.no_grad():  # type: ignore[reportUnknownMemberType]
                qvals = dqn(state)  # type: ignore[reportUnknownMemberType]
                import numpy as np  # type: ignore[reportMissingTypeStubs]
                idx = int(torch.argmax(qvals).item())  # type: ignore[reportUnknownMemberType]
                actions = [-0.10, -0.05, 0.0, 0.05, 0.10]
                action = actions[idx]
                pred = base_price * (1.0 + action)
                return float(pred)
        except Exception:
            pass
    return None