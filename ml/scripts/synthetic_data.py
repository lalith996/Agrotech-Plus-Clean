# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false, reportUnknownVariableType=false, reportMissingImports=false
import os
from faker import Faker  # type: ignore[reportMissingTypeStubs]
import json
from datetime import datetime, timedelta, timezone
import math
import pandas as pd
import numpy as np
from typing import Any, List, Dict

fake: Any = Faker()
OUTPUT_DIR = os.getenv("SYNTHETIC_OUTPUT_DIR", "ml/data/synthetic")
SCALING_FACTOR = float(os.getenv("SYNTHETIC_SCALING_FACTOR", "2.0"))
DATA_TYPES = os.getenv(
    "SYNTHETIC_DATA_TYPES",
    ",".join([
        "orders",
        "orders_demand_forecasting",
        # Below are opt-in; set in env when needed
        # "orders_dynamic_pricing",
        # "behaviors_recommendations",
        # "subscriptions_churn_prediction",
        # "orders_route_optimization",
        # "farmer_scoring_metrics",
        # "orders_anomaly_detection",
        # "nlp_sentiment_intent",
        # "orders_seasonal_analysis",
        # "orders_clv_prediction",
        # "subscriptions_optimization",
        # "certification_ocr_samples",
        # "maintenance_predictive_metrics",
        # "images_qc_metadata",
        "qcResults",
        "subscriptions",
        "userBehaviors",
    ])
).split(",")
ORDERS_OUTPUT_FORMAT = os.getenv("ORDERS_OUTPUT_FORMAT", "json")  # json or csv

os.makedirs(OUTPUT_DIR, exist_ok=True)


def gen_orders(n: int = 200) -> List[Dict[str, Any]]:
    orders: List[Dict[str, Any]] = []
    start = datetime.now(timezone.utc) - timedelta(days=30)
    for i in range(n):
        d = start + timedelta(days=fake.random_int(min=0, max=29))
        orders.append({
            "orderId": f"ord_{i}",
            "customerId": f"cust_{fake.random_int(1,50)}",
            "productId": f"prod_{fake.random_int(1,40)}",
            "quantity": fake.random_int(1, 10),
            "price": round(fake.random_int(100, 2000)/100, 2),
            "deliveryDate": d.strftime("%Y-%m-%d")
        })
    return orders


def gen_orders_demand_forecasting(products: int = 40, days: int = 60) -> pd.DataFrame:
    rows: List[Dict[str, Any]] = []
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    for p in range(1, products + 1):
        base = fake.random_int(min=5, max=15)
        for d in range(days):
            date = start_date + timedelta(days=d)
            dow = date.weekday()
            month = date.month
            seasonal = 3 * math.sin(2 * math.pi * (d % 7) / 7)
            qty = max(0, int(base + seasonal + fake.random_int(min=-2, max=2)))
            price = round(fake.random_int(100, 2000) / 100, 2)
            rows.append({
                "date": date.strftime("%Y-%m-%d"),
                "productId": f"prod_{p}",
                "qty": qty,
                "price": price,
                "dow": dow,
                "month": month,
            })
    df = pd.DataFrame(rows)
    df = df.sort_values(["productId", "date"]).reset_index(drop=True)
    grouped_qty = df.groupby("productId")["qty"]
    for lag in range(1, 8):
        df[f"qty_lag_{lag}"] = grouped_qty.shift(lag)
    df[[f"qty_lag_{lag}" for lag in range(1, 8)]] = df[[f"qty_lag_{lag}" for lag in range(1, 8)]].fillna(0)
    df["sin_week"] = np.sin(2 * np.pi * df["dow"] / 7)
    df["cos_week"] = np.cos(2 * np.pi * df["dow"] / 7)
    return df

# ---- Feature-specific datasets (opt-in) ----

def gen_orders_dynamic_pricing(n: int = 500) -> List[Dict[str, Any]]:
    data: List[Dict[str, Any]] = []
    for _ in range(n):
        demand_idx = round(fake.random_number(digits=2) / 100, 2)
        base_price = round(fake.random_int(100, 2500)/100, 2)
        competitor_price = round(base_price * (0.9 + fake.random_number(digits=1)/100), 2)
        stock_level = fake.random_int(0, 200)
        discount = round((0.05 + demand_idx * 0.1) * (1 if stock_level > 50 else 0.5), 2)
        rec_price = round(max(0.1, base_price * (1 + demand_idx) * (1 - discount)), 2)
        data.append({
            "productId": f"prod_{fake.random_int(1,40)}",
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "base_price": base_price,
            "competitor_price": competitor_price,
            "demand_index": demand_idx,
            "stock_level": stock_level,
            "recommended_price": rec_price,
            "ab_bucket": fake.random_element(elements=("A","B"))
        })
    return data


def gen_behaviors_recommendations(n: int = 800) -> List[Dict[str, Any]]:
    actions = ("view","click","add_to_cart","purchase")
    items: List[Dict[str, Any]] = []
    for _ in range(n):
        items.append({
            "userId": f"cust_{fake.random_int(1,50)}",
            "itemId": f"prod_{fake.random_int(1,40)}",
            "action": fake.random_element(elements=actions),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "popularity": fake.random_int(0, 100)
        })
    return items


def gen_subscriptions_churn_prediction(n: int = 300) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for i in range(n):
        tenure_days = fake.random_int(1, 720)
        events = fake.random_int(0, 50)
        last_active_days = fake.random_int(0, 60)
        is_churned = 1 if (tenure_days > 180 and last_active_days > 30 and events < 5) else 0
        rows.append({
            "subscriptionId": f"sub_{i}",
            "customerId": f"cust_{fake.random_int(1,50)}",
            "tenure_days": tenure_days,
            "events": events,
            "last_active_days": last_active_days,
            "is_churned": is_churned
        })
    return rows


def gen_orders_route_optimization(n: int = 200) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for i in range(n):
        lat = 17.3 + fake.random_number(digits=3)/1000
        lon = 78.4 + fake.random_number(digits=3)/1000
        window_start = fake.random_element(elements=("09:00","10:00","11:00"))
        window_end = "17:00"
        rows.append({
            "orderId": f"ord_{i}",
            "address": {"lat": round(lat,6), "lon": round(lon,6)},
            "items": fake.random_int(1, 10),
            "priority": fake.random_element(elements=("high","medium","low")),
            "deliveryWindow": {"start": window_start, "end": window_end}
        })
    return rows


def gen_farmer_scoring_metrics(n: int = 100) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for i in range(n):
        on_time = round(fake.random_int(70, 99)/100, 2)
        qc_avg = round(fake.random_int(70, 95)/100, 2)
        rejection = round(fake.random_int(0, 20)/100, 2)
        volume = fake.random_int(50, 200)
        rows.append({
            "farmerId": f"farmer_{i}",
            "on_time_rate": on_time,
            "qc_score_avg": qc_avg,
            "rejection_rate": rejection,
            "weekly_volume": volume,
            "score": round(on_time*0.4 + qc_avg*0.4 + (1-rejection)*0.2, 2)
        })
    return rows


def gen_orders_anomaly_detection(n: int = 400) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for i in range(n):
        qty = fake.random_int(1, 50)
        price = round(fake.random_int(100, 3000)/100, 2)
        accepted = round(fake.random_int(70, 99)/100, 2)
        anomaly = 1 if (qty > 45 or price > 25 or accepted < 0.75) else 0
        rows.append({
            "orderId": f"ord_{i}",
            "productId": f"prod_{fake.random_int(1,40)}",
            "quantity": qty,
            "price": price,
            "acceptedRate": accepted,
            "anomaly": anomaly
        })
    return rows


def gen_nlp_sentiment_intent(n: int = 200) -> List[Dict[str, Any]]:
    sentiments = ("positive","neutral","negative")
    intents = ("question","complaint","purchase","feedback")
    rows: List[Dict[str, Any]] = []
    for _ in range(n):
        rows.append({
            "text": fake.sentence(nb_words=12),
            "sentiment": fake.random_element(elements=sentiments),
            "intent": fake.random_element(elements=intents)
        })
    return rows


def gen_orders_seasonal_analysis(products: int = 20, days: int = 120):
    df = gen_orders_demand_forecasting(products=products, days=days)
    # Attach a simple seasonal tag for peaks
    df["seasonal_peak"] = (df["sin_week"].abs() > 0.8).astype(int)
    return df.to_dict(orient="records")


def gen_orders_clv_prediction(n: int = 200) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for i in range(n):
        order_count = fake.random_int(1, 40)
        avg_order_value = round(fake.random_int(500, 5000)/100, 2)
        tenure_days = fake.random_int(30, 720)
        survival_flag = 1 if (order_count > 5 and tenure_days > 120) else 0
        clv = round(order_count * avg_order_value * (0.6 + survival_flag*0.4), 2)
        rows.append({
            "customerId": f"cust_{i}",
            "order_count": order_count,
            "avg_order_value": avg_order_value,
            "tenure_days": tenure_days,
            "survival_flag": survival_flag,
            "clv_value": clv
        })
    return rows


def gen_subscriptions_optimization(n: int = 200) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for i in range(n):
        subs_id = f"sub_{i}"
        items = [f"prod_{fake.random_int(1,40)}" for _ in range(fake.random_int(1,5))]
        recs = items[:max(1, len(items)-1)]
        rows.append({
            "subscriptionId": subs_id,
            "current_items": items,
            "recommended_mix": recs
        })
    return rows


def gen_certification_ocr_samples(n: int = 50) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for i in range(n):
        rows.append({
            "id": f"cert_{i}",
            "image_path": f"ml/data/qc_images/cert_{i}.png",
            "extracted_text": fake.sentence(nb_words=10),
            "confidence": round(fake.random_int(80, 99)/100, 2)
        })
    return rows


def gen_maintenance_predictive_metrics(n: int = 150) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for i in range(n):
        distance_km = round(fake.random_int(5, 120), 2)
        stops = fake.random_int(5, 20)
        vehicle_age_years = round(fake.random_int(1, 10), 1)
        breakdown_flag = 1 if (distance_km > 100 and vehicle_age_years > 7) else 0
        rows.append({
            "routeId": f"route_{i}",
            "distance_km": distance_km,
            "stops": stops,
            "vehicle_age_years": vehicle_age_years,
            "breakdown_flag": breakdown_flag
        })
    return rows


def gen_images_qc_metadata(n: int = 30) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for i in range(n):
        rows.append({
            "image_id": f"img_{i}",
            "image_path": f"ml/data/qc_images/img_{i}.jpg",
            "productId": f"prod_{fake.random_int(1,40)}",
            "label": fake.random_element(elements=("pass","fail","uncertain"))
        })
    return rows


# ---- Existing other generators ----

def gen_qc(n: int = 150) -> List[Dict[str, Any]]:
    qc: List[Dict[str, Any]] = []
    for i in range(n):
        qc.append({
            "batchId": f"batch_{i}",
            "farmerId": f"farmer_{fake.random_int(1,30)}",
            "acceptedRate": round(fake.random_int(70, 99)/100, 2),
            "defects": fake.random_int(0, 5),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    return qc


def gen_subs(n: int = 120) -> List[Dict[str, Any]]:
    subs: List[Dict[str, Any]] = []
    for i in range(n):
        subs.append({
            "subscriptionId": f"sub_{i}",
            "customerId": f"cust_{fake.random_int(1,50)}",
            "status": fake.random_element(elements=("active","paused","canceled")),
            "items": fake.random_int(1, 8),
            "createdAt": datetime.now(timezone.utc).isoformat()
        })
    return subs


def gen_behaviors(n: int = 300) -> List[Dict[str, Any]]:
    logs: List[Dict[str, Any]] = []
    for _ in range(n):
        logs.append({
            "userId": f"cust_{fake.random_int(1,50)}",
            "event": fake.random_element(elements=("view","click","add_to_cart","purchase","search")),
            "context": fake.random_element(elements=("dashboard","product","cart")),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    return logs


if __name__ == "__main__":
    base_counts = {
        "orders": 200,
        "orders_demand_forecasting": 2400,
        "qcResults": 150,
        "subscriptions": 120,
        "userBehaviors": 300,
        # opt-in features default sizes
        "orders_dynamic_pricing": 500,
        "behaviors_recommendations": 800,
        "subscriptions_churn_prediction": 300,
        "orders_route_optimization": 200,
        "farmer_scoring_metrics": 100,
        "orders_anomaly_detection": 400,
        "nlp_sentiment_intent": 200,
        "orders_seasonal_analysis": 2400,
        "orders_clv_prediction": 200,
        "subscriptions_optimization": 200,
        "certification_ocr_samples": 50,
        "maintenance_predictive_metrics": 150,
        "images_qc_metadata": 30,
    }
    counts = {k: int(v * SCALING_FACTOR) for k, v in base_counts.items()}

    for dt in DATA_TYPES:
        if dt == "orders":
            data = gen_orders(counts[dt])
            path = os.path.join(OUTPUT_DIR, f"orders.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "orders_demand_forecasting":
            df = gen_orders_demand_forecasting(products=40, days=60)
            ext = "csv" if ORDERS_OUTPUT_FORMAT.lower() == "csv" else "json"
            path = os.path.join(OUTPUT_DIR, f"orders.demand_forecasting.{ext}")
            if ext == "csv":
                df.to_csv(path, index=False)
            else:
                with open(path, "w") as f:
                    json.dump(df.to_dict(orient="records"), f)
            print(f"Wrote {len(df)} rows to {path}")
            continue
        if dt == "orders_dynamic_pricing":
            data = gen_orders_dynamic_pricing(counts[dt])
            path = os.path.join(OUTPUT_DIR, "orders.dynamic_pricing.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "behaviors_recommendations":
            data = gen_behaviors_recommendations(counts[dt])
            path = os.path.join(OUTPUT_DIR, "behaviors.recommendations.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "subscriptions_churn_prediction":
            data = gen_subscriptions_churn_prediction(counts[dt])
            path = os.path.join(OUTPUT_DIR, "subscriptions.churn_prediction.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "orders_route_optimization":
            data = gen_orders_route_optimization(counts[dt])
            path = os.path.join(OUTPUT_DIR, "orders.route_optimization.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "farmer_scoring_metrics":
            data = gen_farmer_scoring_metrics(counts[dt])
            path = os.path.join(OUTPUT_DIR, "farmers.scoring.metrics.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "orders_anomaly_detection":
            data = gen_orders_anomaly_detection(counts[dt])
            path = os.path.join(OUTPUT_DIR, "orders.anomaly_detection.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "nlp_sentiment_intent":
            data = gen_nlp_sentiment_intent(counts[dt])
            path = os.path.join(OUTPUT_DIR, "nlp.sentiment_intent.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "orders_seasonal_analysis":
            data = gen_orders_seasonal_analysis(products=20, days=120)
            path = os.path.join(OUTPUT_DIR, "orders.seasonal_analysis.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "orders_clv_prediction":
            data = gen_orders_clv_prediction(counts[dt])
            path = os.path.join(OUTPUT_DIR, "orders.clv_prediction.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "subscriptions_optimization":
            data = gen_subscriptions_optimization(counts[dt])
            path = os.path.join(OUTPUT_DIR, "subscriptions.optimization.item_mix.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "certification_ocr_samples":
            data = gen_certification_ocr_samples(counts[dt])
            path = os.path.join(OUTPUT_DIR, "certification.ocr_samples.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "maintenance_predictive_metrics":
            data = gen_maintenance_predictive_metrics(counts[dt])
            path = os.path.join(OUTPUT_DIR, "maintenance.predictive.metrics.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        if dt == "images_qc_metadata":
            data = gen_images_qc_metadata(counts[dt])
            path = os.path.join(OUTPUT_DIR, "images.qc_metadata.json")
            with open(path, "w") as f:
                json.dump(data, f)
            print(f"Wrote {len(data)} records to {path}")
            continue
        elif dt == "qcResults":
            data = gen_qc(counts[dt])
        elif dt == "subscriptions":
            data = gen_subs(counts[dt])
        elif dt == "userBehaviors":
            data = gen_behaviors(counts[dt])
        else:
            continue
        path = os.path.join(OUTPUT_DIR, f"{dt}.json")
        with open(path, "w") as f:
            json.dump(data, f)
        print(f"Wrote {len(data)} records to {path}")