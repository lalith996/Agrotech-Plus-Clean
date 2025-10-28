import os
from fastapi import FastAPI, Header
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, cast
from datetime import datetime, timezone
from math import ceil, floor

API_KEY = os.getenv("ML_SERVICE_API_KEY", "")
AUTO_TUNING = os.getenv("AUTO_TUNING", "true") == "true"
RETRAIN_INTERVAL_DAYS = int(os.getenv("RETRAIN_INTERVAL_DAYS", "7"))
PERFORMANCE_THRESHOLD = float(os.getenv("PERFORMANCE_THRESHOLD", "0.85"))
PRODUCT_CATALOG_PATH = os.getenv("PRODUCT_CATALOG_PATH", "ml/data/synthetic/products.json")
PROCUREMENT_MIN = int(os.getenv("PROCUREMENT_MIN", "0"))
PROCUREMENT_MAX = int(os.getenv("PROCUREMENT_MAX", "0"))
_catalog_cache: Optional[Dict[str, Dict[str, Any]]] = None


app = FastAPI(title="AgriTech AI/ML Service", version="v1")


def load_product_catalog() -> Dict[str, Dict[str, Any]]:
    """Load product catalog from JSON file with names and unit costs."""
    global _catalog_cache
    if _catalog_cache is not None:
        return _catalog_cache

    try:
        with open(PRODUCT_CATALOG_PATH, "r") as f:
            content = f.read().strip()
        if not content:
            _catalog_cache = {}
            return _catalog_cache

        import json
        data_any: Any = json.loads(content)
        mapping: Dict[str, Dict[str, Any]] = {}

        if isinstance(data_any, list):
            data_list = cast(List[Any], data_any)
            for item in data_list:
                if not isinstance(item, dict):
                    continue
                item_dict = cast(Dict[str, Any], item)
                pid = str(item_dict.get("productId") or item_dict.get("id") or "")
                if not pid:
                    continue
                name = str(item_dict.get("name") or item_dict.get("title") or "")
                uc_val = item_dict.get("unitCost")
                uc_num = float(uc_val) if isinstance(uc_val, (int, float, str)) and str(uc_val) != "" else 0.0
                mapping[pid] = {"name": name, "unitCost": uc_num}
        elif isinstance(data_any, dict):
            data_dict = cast(Dict[Any, Any], data_any)
            for k, v in data_dict.items():
                key = str(k)
                if isinstance(v, dict):
                    v_dict = cast(Dict[str, Any], v)
                    name = str(v_dict.get("name") or v_dict.get("title") or "")
                    uc_val = v_dict.get("unitCost")
                    uc_num = float(uc_val) if isinstance(uc_val, (int, float, str)) and str(uc_val) != "" else 0.0
                    mapping[key] = {"name": name, "unitCost": uc_num}
                else:
                    mapping[key] = {"name": str(v), "unitCost": 0.0}
        else:
            mapping = {}

        _catalog_cache = mapping
        return mapping
    except Exception:
        _catalog_cache = {}
        return _catalog_cache

# --- Schemas ---
class RecommendationRequest(BaseModel):
    userId: str
    context: Optional[str] = "dashboard"
    limit: Optional[int] = 10

class ProductScore(BaseModel):
    id: str
    name: str
    score: float

class RecommendationResponse(BaseModel):
    products: List[ProductScore]
    confidence: float
    algorithm: str

class DemandForecastRequest(BaseModel):
    farmerId: str
    productIds: List[str]
    days: Optional[int] = 7
    stockOnHand: Optional[Dict[str, int]] = None
    leadTimeDays: Optional[int] = None
    unitCosts: Optional[Dict[str, float]] = None
    budget: Optional[float] = None

class DemandPrediction(BaseModel):
    date: str
    quantity: float
    quantityLow: Optional[float] = None
    quantityHigh: Optional[float] = None

class ForecastItem(BaseModel):
    productId: str
    productName: Optional[str] = None
    predictions: List[DemandPrediction]
    recommendedProcurement: Optional[int] = None
    uncertainty: Optional[float] = None
    unitCost: Optional[float] = None
    totalCost: Optional[float] = None

class DemandForecastResponse(BaseModel):
    forecasts: List[ForecastItem]
    totalCost: Optional[float] = None
    budget: Optional[float] = None
    budgetRemaining: Optional[float] = None

class FarmerScoreRequest(BaseModel):
    farmerId: str
    metrics: Optional[Dict[str, float]] = None

class FarmerScoreResponse(BaseModel):
    score: float
    breakdown: Dict[str, float]

class SearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    limit: Optional[int] = 20

class SearchItem(BaseModel):
    id: str
    name: str
    score: float

class SearchResponse(BaseModel):
    items: List[SearchItem]
    total: int

class RouteWaypoint(BaseModel):
    id: str
    address: Dict[str, Any]
    coordinates: Dict[str, float]

class RouteOptimizationRequest(BaseModel):
    origin: Dict[str, float]
    destination: Optional[Dict[str, float]] = None
    waypoints: List[RouteWaypoint]

class RouteLeg(BaseModel):
    startAddress: str
    endAddress: str
    distance: int
    duration: int

class OptimizedRoute(BaseModel):
    id: str
    waypoints: List[RouteWaypoint]
    totalDistance: int
    totalDuration: int
    estimatedFuelCost: float
    legs: List[RouteLeg]

# --- Auth helper ---
def require_api_key(x_api_key: str = Header(default="")):
    if API_KEY and x_api_key != API_KEY:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid API key")

# --- Health ---
@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "served_at": datetime.now(timezone.utc).isoformat(),
        "auto_tuning": AUTO_TUNING,
        "retrain_interval_days": RETRAIN_INTERVAL_DAYS,
        "performance_threshold": PERFORMANCE_THRESHOLD,
    }

# --- Recommendations ---
@app.post("/ml/recommendations", response_model=RecommendationResponse)
def recommendations(req: RecommendationRequest, x_api_key: str = Header(default="")) -> Dict[str, Any]:
    require_api_key(x_api_key)
    products: List[Dict[str, Any]] = []
    return {
        "products": products,
        "confidence": 0.0,
        "algorithm": "hybrid-baseline",
    }

# --- Demand Forecast ---
from ml.modules.demand_forecasting.serve import forecast_product, get_uncertainty

@app.post("/ml/demand-forecast", response_model=DemandForecastResponse)
def demand_forecast(req: DemandForecastRequest, x_api_key: str = Header(default="")) -> Dict[str, Any]:
    require_api_key(x_api_key)
    forecasts: List[Dict[str, Any]] = []
    days = req.days or 7
    stock_on_hand = req.stockOnHand or {}
    lead_time = req.leadTimeDays or min(3, days)
    catalog = load_product_catalog()
    uncertainty = get_uncertainty()
    unit_costs: Dict[str, float] = (req.unitCosts or {})
    budget: Optional[float] = req.budget
    for pid in req.productIds:
        preds = forecast_product(product_id=pid, days=days)
        total_demand = sum(float(p.get('quantity', 0.0)) for p in preds[:lead_time])
        stock = int(stock_on_hand.get(pid, 0))
        recommended = int(max(0, ceil(total_demand - stock)))
        if PROCUREMENT_MIN > 0:
            recommended = max(recommended, PROCUREMENT_MIN)
        if PROCUREMENT_MAX > 0:
            recommended = min(recommended, PROCUREMENT_MAX)
        
        # Get unit cost from request or catalog
        unit_cost = unit_costs.get(pid)
        if unit_cost is None:
            catalog_entry = catalog.get(pid, {})
            unit_cost = catalog_entry.get("unitCost", 0.0) if catalog_entry else 0.0
        unit_cost = float(unit_cost)
        
        # Get product name from catalog
        product_name = None
        catalog_entry = catalog.get(pid, {})
        if catalog_entry:
            product_name = catalog_entry.get("name")
        
        item_total_cost = (recommended * unit_cost) if unit_cost > 0 else 0.0
        forecasts.append({
            "productId": pid,
            "productName": product_name,
            "predictions": preds,
            "recommendedProcurement": recommended,
            "uncertainty": uncertainty,
            "unitCost": unit_cost if unit_cost > 0 else None,
            "totalCost": item_total_cost if unit_cost > 0 else None,
        })
    # Budget-aware scaling
    total_cost = sum(float(item.get("totalCost") or 0.0) for item in forecasts)
    if budget is not None and total_cost > 0 and total_cost > budget:
        scale = budget / total_cost
        for item in forecasts:
            rec = int(item.get("recommendedProcurement", 0) or 0)
            new_rec = int(max(0, floor(rec * scale)))
            # Apply max clamp (min clamp ignored when enforcing budget)
            if PROCUREMENT_MAX > 0:
                new_rec = min(new_rec, PROCUREMENT_MAX)
            item["recommendedProcurement"] = new_rec
            unit_cost = float(item.get("unitCost") or 0.0)
            item["totalCost"] = (new_rec * unit_cost) if unit_cost > 0 else None
        total_cost = sum(float(item.get("totalCost") or 0.0) for item in forecasts)
    budget_remaining = (budget - total_cost) if (budget is not None) else None
    return {"forecasts": forecasts, "totalCost": total_cost if total_cost > 0 else None, "budget": budget, "budgetRemaining": budget_remaining}

# --- Farmer Score ---
@app.post("/ml/farmer-score", response_model=FarmerScoreResponse)
def farmer_score(req: FarmerScoreRequest, x_api_key: str = Header(default="")) -> Dict[str, Any]:
    require_api_key(x_api_key)
    metrics = req.metrics or {"on_time": 0.8, "quality": 0.85, "consistency": 0.75}
    weights = {"on_time": 0.3, "quality": 0.5, "consistency": 0.2}
    score = sum(metrics.get(k, 0.0) * w for k, w in weights.items())
    return {"score": round(score, 3), "breakdown": metrics}

# --- Quality Prediction ---
from ml.modules.quality_prediction.serve import predict_quality
from ml.modules.quality_v1.serve_models import predict_quality_v1

class QualityV1Request(BaseModel):
    batch_id: Optional[str] = None
    farmer_id: str
    product_type: str
    harvest_date: Optional[str] = None
    defects: int = 0
    arrival_conditions: Optional[Dict[str, Any]] = None

class QualityV1Response(BaseModel):
    predicted_quality_grade: str
    quality_confidence: float
    predicted_shelf_life_hours: float
    acceptance_probability: float

@app.post("/api/v1/quality/predict", response_model=QualityV1Response)
def quality_predict_v1(req: QualityV1Request, x_api_key: str = Header(default="")) -> Dict[str, Any]:
    require_api_key(x_api_key)
    payload: Dict[str, Any] = {
        "batch_id": req.batch_id or "",
        "farmer_id": req.farmer_id,
        "product_type": req.product_type,
        "harvest_date": req.harvest_date or "",
        "defects": int(req.defects),
        "arrival_conditions": req.arrival_conditions or {},
    }
    out = predict_quality_v1(payload)
    return out

class QualityRequest(BaseModel):
    farmerId: str
    defects: int = 0

class QualityResponse(BaseModel):
    pass_prob: float
    predicted_shelf_life_hours: float
    predicted_grade: str
    key_factors: Dict[str, float] | List[Any]

@app.post("/ml/quality/predict", response_model=QualityResponse)
def quality_predict(req: QualityRequest, x_api_key: str = Header(default="")) -> Dict[str, Any]:
    require_api_key(x_api_key)
    result: Dict[str, Any] = predict_quality(farmer_id=req.farmerId, defects=req.defects)
    return result

# --- Dynamic Pricing ---
from ml.modules.dynamic_pricing.serve import recommend_price
from ml.modules.dynamic_pricing.serve_models import predict_with_models
from ml.modules.competitors.serve import get_competitor_price

class PricingRequest(BaseModel):
    basePrice: float
    competitorPrice: float
    demandIndex: float
    stockLevel: int
    abBucket: Optional[str] = None

class PricingResponse(BaseModel):
    recommended_price: float
    bucket: str

@app.post("/ml/pricing/optimize", response_model=PricingResponse)
def pricing_optimize(req: PricingRequest, x_api_key: str = Header(default="")) -> Dict[str, Any]:
    require_api_key(x_api_key)
    result: Dict[str, Any] = recommend_price(
        base_price=req.basePrice,
        competitor_price=req.competitorPrice,
        demand_index=req.demandIndex,
        stock_level=req.stockLevel,
        ab_bucket=(req.abBucket or "A")
    )
    return result

# --- Dynamic Pricing v1 ---
class PricingV1Request(BaseModel):
    product_id: str
    current_inventory: int
    quality_grade: str
    time_to_expiry_hours: int

class PricingV1Response(BaseModel):
    recommended_price: float
    price_adjustment_reason: str
    expected_demand: float
    revenue_impact: float

@app.post("/api/v1/pricing/optimize", response_model=PricingV1Response)
def pricing_optimize_v1(req: PricingV1Request, x_api_key: str = Header(default="")) -> Dict[str, Any]:
    require_api_key(x_api_key)
    catalog = load_product_catalog()
    entry: Dict[str, Any] = catalog.get(req.product_id, {})
    unit_cost = float(entry.get("unitCost", 0.0))

    grade = (req.quality_grade or "B").upper()
    grade_markup_map: Dict[str, float] = {"A": 2.0, "B": 1.6, "C": 1.3}
    markup = float(grade_markup_map.get(grade, 1.5))
    base_price = unit_cost * markup if unit_cost > 0 else 1.0

    min_margin = float(os.getenv("PRICING_MIN_MARGIN", "0.15"))
    base_price = max(base_price, unit_cost * (1.0 + min_margin)) if unit_cost > 0 else base_price

    preds = forecast_product(product_id=req.product_id, days=3)
    demand_baseline = float(preds[0].get("quantity", 0.0)) if preds else 0.0
    quality_factor_map: Dict[str, float] = {"A": 1.0, "B": 0.85, "C": 0.7}
    quality_factor = float(quality_factor_map.get(grade, 0.85))
    expiry_hours = int(req.time_to_expiry_hours)
    expiry_factor = 1.0 if expiry_hours > 48 else (0.7 if expiry_hours > 24 else 0.5)
    expected_demand = max(0.0, demand_baseline * quality_factor * expiry_factor)

    competitor_price = get_competitor_price(req.product_id, base_price)

    candidates: List[float] = [base_price * (1 + s) for s in [-0.10, -0.05, 0.0, 0.05, 0.10]]

    max_discount = float(os.getenv("PRICING_MAX_DISCOUNT", "0.30"))
    min_price_discount = base_price * (1.0 - max_discount)
    min_price_margin = unit_cost * (1.0 + min_margin) if unit_cost > 0 else 0.0
    min_allowed_price = max(min_price_discount, min_price_margin, 0.1)
    candidates = [max(p, min_allowed_price) for p in candidates]

    used_model = False
    model_price = predict_with_models(
        base_price=base_price,
        competitor_price=competitor_price,
        expected_demand=expected_demand,
        quality_grade=grade,
        inventory=req.current_inventory,
        expiry_hours=expiry_hours,
        unit_cost=unit_cost,
        candidates=candidates,
    )

    inventory = float(req.current_inventory)
    best_reward = float("-inf")
    competitor_adjusted = False
    if model_price is not None:
        mp = float(model_price)
        mp = max(mp, min_allowed_price)
        max_cand = max(candidates) if candidates else mp
        best_price = min(max_cand, mp)
        if competitor_price > 0:
            ratio = best_price / competitor_price
            if ratio > 1.05 and (inventory > 30 or expiry_hours <= 24):
                adjust = 0.3 * (competitor_price - best_price)
                best_price = max(min_allowed_price, min(max(candidates), best_price + adjust))
                competitor_adjusted = True
            elif ratio < 0.95 and inventory < 10:
                adjust = 0.2 * (competitor_price - best_price)
                best_price = max(min_allowed_price, min(max(candidates), best_price + adjust))
                competitor_adjusted = True
        elasticity = 0.1 * ((competitor_price - best_price) / base_price)
        demand_adj = max(0.0, expected_demand * (1.0 + elasticity))
        sold = min(inventory, demand_adj)
        revenue = sold * best_price
        waste_penalty_factor = 0.2 if expiry_hours > 48 else (0.5 if expiry_hours > 24 else 0.8)
        leftover = max(0.0, inventory - sold)
        waste_cost = leftover * unit_cost * waste_penalty_factor
        satisfaction_bonus = 0.05 * revenue if abs(best_price - competitor_price) / base_price < 0.03 else 0.0
        best_reward = revenue - waste_cost + satisfaction_bonus
        used_model = True
    else:
        best_price = candidates[0]
        for p in candidates:
            elasticity = 0.1 * ((competitor_price - p) / base_price)
            demand_adj = max(0.0, expected_demand * (1.0 + elasticity))
            sold = min(inventory, demand_adj)
            revenue = sold * p
            waste_penalty_factor = 0.2 if expiry_hours > 48 else (0.5 if expiry_hours > 24 else 0.8)
            leftover = max(0.0, inventory - sold)
            waste_cost = leftover * unit_cost * waste_penalty_factor
            satisfaction_bonus = 0.05 * revenue if abs(p - competitor_price) / base_price < 0.03 else 0.0
            reward = revenue - waste_cost + satisfaction_bonus
            if reward > best_reward:
                best_reward = reward
                best_price = p
        if competitor_price > 0:
            ratio = best_price / competitor_price
            if ratio > 1.05 and (inventory > 30 or expiry_hours <= 24):
                adjust = 0.3 * (competitor_price - best_price)
                best_price = max(min_allowed_price, min(max(candidates), best_price + adjust))
                competitor_adjusted = True
            elif ratio < 0.95 and inventory < 10:
                adjust = 0.2 * (competitor_price - best_price)
                best_price = max(min_allowed_price, min(max(candidates), best_price + adjust))
                competitor_adjusted = True

    ab_enabled = os.getenv("PRICING_AB_ENABLED", "true").lower() == "true"
    bucket = "A"
    if ab_enabled:
        bucket = "B" if (hash(req.product_id) % 2 == 0) else "A"
        if bucket == "B":
            best_price *= 0.98

    recommended = round(best_price, 2)
    base_sold = min(inventory, expected_demand)
    base_rev = base_sold * base_price
    impact = round(best_reward - base_rev, 2)

    final_elasticity = 0.1 * ((competitor_price - recommended) / base_price)
    expected_demand_out = max(0.0, expected_demand * (1.0 + final_elasticity))

    reason = (
        "Model-driven price" if used_model else (
            "Expiry-driven discount" if recommended < base_price else "Demand/margin-driven markup"
        )
    )
    if competitor_adjusted:
        reason = "Competitor-adjusted model price" if used_model else "Competitor-adjusted heuristic price"

    return {
        "recommended_price": recommended,
        "price_adjustment_reason": reason,
        "expected_demand": round(expected_demand_out, 2),
        "revenue_impact": impact,
    }

# --- NLP Search ---
@app.post("/ml/search", response_model=SearchResponse)
def search(req: SearchRequest, x_api_key: str = Header(default="")) -> Dict[str, Any]:
    require_api_key(x_api_key)
    items: List[Dict[str, Any]] = []
    return {"items": items, "total": 0}

# --- Route Optimization ---
@app.post("/ml/route-optimize", response_model=OptimizedRoute)
def route_optimize(req: RouteOptimizationRequest, x_api_key: str = Header(default="")) -> Dict[str, Any]:
    require_api_key(x_api_key)
    legs: List[Dict[str, Any]] = []
    total_distance = 0
    total_duration = 0
    for i, wp in enumerate(req.waypoints):
        if i == 0:
            continue
        legs.append({
            "startAddress": req.waypoints[i-1].address.get("street", ""),
            "endAddress": wp.address.get("street", ""),
            "distance": 1000,
            "duration": 300
        })
        total_distance += 1000
        total_duration += 300
    return {
        "id": f"route-{datetime.now(timezone.utc).timestamp()}",
        "waypoints": req.waypoints,
        "totalDistance": total_distance,
        "totalDuration": total_duration,
        "estimatedFuelCost": round(total_distance / 1000 * 0.2, 2),
        "legs": legs
    }

# Uvicorn entry: uvicorn ml.service.main:app --host 0.0.0.0 --port 8000
class ChurnPredictRequest(BaseModel):
    userIds: List[str]
    includeRecommendations: Optional[bool] = False

class ChurnPrediction(BaseModel):
    userId: str
    churn_probability: float
    risk_level: str
    top_churn_factors: List[str]
    retention_actions: List[str]
    recommendations: Optional[List[Dict[str, Any]]] = None

class ChurnPredictResponse(BaseModel):
    results: List[ChurnPrediction]

@app.post("/ml/churn-predict", response_model=ChurnPredictResponse)
def churn_predict(req: ChurnPredictRequest, x_api_key: str = Header(default="")) -> Dict[str, Any]:
    require_api_key(x_api_key)
    results: List[Dict[str, Any]] = []
    for uid in req.userIds:
        # Simple heuristic baseline; replace with real models
        prob = 0.35
        risk = 'high' if prob >= 0.7 else ('medium' if prob >= 0.4 else 'low')
        factors = [
            'low order frequency',
            'no recent app login',
            'delivery friction signals',
        ]
        actions = [
            'offer 10% loyalty discount',
            'send personalized reactivation email',
            'free delivery on next order',
        ]
        recs: Optional[List[Dict[str, Any]]] = [] if req.includeRecommendations else None
        results.append({
            'userId': uid,
            'churn_probability': prob,
            'risk_level': risk,
            'top_churn_factors': factors,
            'retention_actions': actions,
            'recommendations': recs,
        })
    return { 'results': results }