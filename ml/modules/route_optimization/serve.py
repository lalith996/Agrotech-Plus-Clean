import os
import json
from math import radians, cos, sin, asin, sqrt
from typing import TypedDict, List, Dict, cast

DATA_PATH = os.getenv("ROUTE_OPT_DATA_PATH", "ml/data/synthetic/orders.route_optimization.json")


class Address(TypedDict):
    lat: float
    lon: float


class Order(TypedDict):
    orderId: str
    address: Address


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # distance in km
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return R * c


def optimize_route(limit: int = 50) -> Dict[str, List[str]]:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Route synthetic not found at {DATA_PATH}")
    with open(DATA_PATH, 'r') as f:
        orders = cast(List[Order], json.load(f))[:limit]
    if not orders:
        return {"optimizedOrder": []}
    # Simple nearest-neighbor heuristic
    start = orders[0]
    route: List[Order] = [start]
    remaining: List[Order] = orders[1:]
    while remaining:
        last = route[-1]
        last_lat, last_lon = float(last["address"]["lat"]), float(last["address"]["lon"])
        next_idx = min(
            range(len(remaining)),
            key=lambda i: _haversine(
                last_lat,
                last_lon,
                float(remaining[i]["address"]["lat"]),
                float(remaining[i]["address"]["lon"]),
            ),
        )
        route.append(remaining.pop(next_idx))
    return {"optimizedOrder": [r["orderId"] for r in route]}