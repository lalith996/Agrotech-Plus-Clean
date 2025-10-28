import os
import json
from typing import Any, TypedDict, List, Dict, cast

DATA_PATH = os.getenv("FARMER_SCORING_DATA_PATH", "ml/data/synthetic/farmers.scoring.metrics.json")


class FarmerMetrics(TypedDict, total=False):
    on_time_rate: float
    qc_score_avg: float
    rejection_rate: float
    weekly_volume: int


class FarmerScore(TypedDict):
    farmerId: str
    score: float
    metrics: FarmerMetrics


def score_farmer(farmer_id: str) -> FarmerScore:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Farmer scoring synthetic not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        rows = cast(List[Dict[str, Any]], json.load(f))
    for r in rows:
        if r["farmerId"] == farmer_id:
            return {
                "farmerId": farmer_id,
                "score": float(r["score"]),
                "metrics": {
                    "on_time_rate": float(r["on_time_rate"]),
                    "qc_score_avg": float(r["qc_score_avg"]),
                    "rejection_rate": float(r["rejection_rate"]),
                    "weekly_volume": int(r["weekly_volume"]),
                },
            }
    # fallback avg
    if rows:
        avg = sum(float(r["score"]) for r in rows) / len(rows)
        return {"farmerId": farmer_id, "score": round(avg, 2), "metrics": {}}
    return {"farmerId": farmer_id, "score": 0.0, "metrics": {}}