import os
import numpy as np

MODEL_PATH = os.path.join("ml/models", "seasonal_analysis.npy")
_seasonality = None


def load_seasonality():
    global _seasonality
    if _seasonality is None and os.path.exists(MODEL_PATH):
        _seasonality = np.load(MODEL_PATH)
    return _seasonality


def get_month_factor(month: int):
    seasonality = load_seasonality()
    if seasonality is None:
        # neutral fallback
        return 1.0
    base = float(seasonality.mean()) if seasonality.size else 1.0
    mval = float(seasonality[month - 1])
    return mval / base if base else 1.0