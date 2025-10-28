import os
import pickle
import pandas as pd
from typing import Optional, Dict, Any, Tuple, cast
from datetime import datetime, timezone

_rf_cache: Optional[Dict[str, Any]] = None
_xgb_cache: Optional[Dict[str, Any]] = None

QUALITY_RF_MODEL_PATH = os.getenv("QUALITY_RF_MODEL_PATH", "ml/models/quality_rf.pkl")
SHELF_LIFE_XGB_MODEL_PATH = os.getenv("SHELF_LIFE_XGB_MODEL_PATH", "ml/models/shelf_life_xgb.pkl")


def load_quality_rf() -> Optional[Dict[str, Any]]:
    global _rf_cache
    if _rf_cache is not None:
        return _rf_cache
    if os.path.exists(QUALITY_RF_MODEL_PATH):
        with open(QUALITY_RF_MODEL_PATH, "rb") as f:
            _rf_cache = cast(Optional[Dict[str, Any]], pickle.load(f))
    else:
        _rf_cache = None
    return _rf_cache


def load_shelf_life_xgb() -> Optional[Dict[str, Any]]:
    global _xgb_cache
    if _xgb_cache is not None:
        return _xgb_cache
    if os.path.exists(SHELF_LIFE_XGB_MODEL_PATH):
        with open(SHELF_LIFE_XGB_MODEL_PATH, "rb") as f:
            _xgb_cache = cast(Optional[Dict[str, Any]], pickle.load(f))
    else:
        _xgb_cache = None
    return _xgb_cache


def _parse_arrival(arrival: Dict[str, Any]) -> Dict[str, float]:
    temp = float(arrival.get("temperature", arrival.get("temp", 8.0)))
    hum = float(arrival.get("humidity", arrival.get("hum", 65.0)))
    return {"temperature": temp, "humidity": hum}


def _grade_confidence(proba: Dict[str, float]) -> Tuple[str, float]:
    if not proba:
        return ("Grade_B", 0.50)
    best_label = max(proba.items(), key=lambda kv: kv[1])[0]
    best_conf = float(proba.get(best_label, 0.0))
    return (best_label, best_conf)


def predict_quality_v1(payload: Dict[str, Any]) -> Dict[str, Any]:
    rf: Optional[Dict[str, Any]] = load_quality_rf()
    xgb: Optional[Dict[str, Any]] = load_shelf_life_xgb()

    farmer_id = str(payload.get("farmer_id", "unknown"))
    product_type = str(payload.get("product_type", "unknown"))
    arrival: Dict[str, Any] = cast(Dict[str, Any], payload.get("arrival_conditions", {}) or {})
    parsed = _parse_arrival(arrival)

    harvest_date_str = str(payload.get("harvest_date", arrival.get("harvest_date", "")))
    age_hours = 24.0
    try:
        if harvest_date_str:
            dt = datetime.fromisoformat(harvest_date_str)
            now = datetime.now(timezone.utc)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            age_hours = max(0.0, (now - dt).total_seconds() / 3600.0)
    except Exception:
        age_hours = 24.0

    sample_rf: list[Dict[str, Any]] = [{
        "farmer_id": farmer_id,
        "product_type": product_type,
        "harvest_date": harvest_date_str or "unknown",
        "weather": str(arrival.get("weather", "sunny")),
        "transport_time": int(arrival.get("transport_time", 6)),
        "storage": str(arrival.get("storage", "cold")),
        "temperature": parsed["temperature"],
        "humidity": parsed["humidity"],
    }]

    predicted_label = "Grade_B"
    confidence = 0.5
    acceptance_probability = 0.8
    if rf is not None:
        pipe: Any = rf.get("pipeline")
        classes: list[str] = cast(list[str], rf.get("classes", ["Premium", "Grade_A", "Grade_B", "Rejected"]))
        try:
            X_df = pd.DataFrame(sample_rf)
            probs = pipe.predict_proba(X_df)[0]
            proba_map: Dict[str, float] = {str(classes[i]): float(probs[i]) for i in range(len(classes))}
            predicted_label, confidence = _grade_confidence(proba_map)
            acceptance_probability = float(1.0 - proba_map.get("Rejected", 0.0))
        except Exception:
            pass

    sample_xgb: list[Dict[str, Any]] = [{
        "quality_grade": predicted_label,
        "category": "vegetable" if product_type in ("tomato", "potato", "cucumber") else "leafy",
        "age": float(age_hours),
        "temperature": parsed["temperature"],
        "humidity": parsed["humidity"],
    }]

    predicted_shelf_life = 36.0
    if xgb is not None:
        pipe: Any = xgb.get("pipeline")
        try:
            X_df2 = pd.DataFrame(sample_xgb)
            pred = pipe.predict(X_df2)[0]
            predicted_shelf_life = float(max(1.0, min(120.0, float(pred))))
        except Exception:
            pass

    return {
        "predicted_quality_grade": predicted_label,
        "quality_confidence": round(confidence, 3),
        "predicted_shelf_life_hours": round(predicted_shelf_life, 1),
        "acceptance_probability": round(acceptance_probability, 3),
    }