import os
import json
from typing import Dict, Any, Optional, cast
from urllib.request import urlopen
from urllib.parse import urlencode

_comp_cache: Optional[Dict[str, float]] = None
COMP_FILE_PATH = os.getenv("COMPETITOR_PRICE_PATH", "ml/data/synthetic/competitors.json")
COMP_API_URL = os.getenv("COMPETITOR_API_URL", "")


def _load_from_file() -> Dict[str, float]:
    global _comp_cache
    if _comp_cache is not None:
        return _comp_cache
    data: Dict[str, float] = {}
    try:
        if os.path.exists(COMP_FILE_PATH):
            with open(COMP_FILE_PATH, "r", encoding="utf-8") as f:
                raw_any: Any = json.load(f)
                obj: Dict[str, Any] = cast(Dict[str, Any], raw_any) if isinstance(raw_any, dict) else {}
                for key, val in obj.items():
                    try:
                        data[str(key)] = float(val)
                    except Exception:
                        continue
    except Exception:
        pass
    _comp_cache = data
    return data


def _fetch_http(product_id: str) -> Optional[float]:
    # Optional HTTP fetch if API URL is configured
    if not COMP_API_URL:
        return None
    try:
        query = urlencode({"product_id": product_id})
        url = f"{COMP_API_URL}?{query}"
        with urlopen(url, timeout=3.0) as resp:
            raw = resp.read()
            val = json.loads(raw)
            if isinstance(val, dict) and "price" in val:
                p = float(val["price"])  # type: ignore
                return p
            if isinstance(val, (int, float)):
                return float(val)
    except Exception:
        return None
    return None


def get_competitor_price(product_id: str, base_price: float) -> float:
    """Return competitor price for product.
    Tries HTTP API (if set), then local file cache, otherwise falls back to base_price * factor.
    """
    # 1) Try HTTP feed
    p = _fetch_http(product_id)
    if isinstance(p, float):
        return max(0.1, p)
    # 2) Try local file
    mp = _load_from_file().get(product_id)
    if isinstance(mp, float):
        return max(0.1, mp)
    # 3) Fallback to factor relative to base price
    factor = float(os.getenv("COMPETITOR_PRICE_FACTOR", "0.98"))
    return max(0.1, base_price * factor)