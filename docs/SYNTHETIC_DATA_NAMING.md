# Synthetic Data Naming Conventions

This document defines feature-aligned names for Python modules and synthetic datasets so you can add models quickly later.

## File Naming Pattern

- Data files: `<domain>.<feature>.<format>` (JSON by default; CSV optional)
- Python modules: `ml/modules/<feature>/{train.py,serve.py,features.py}`
- Environment keys: `SYNTHETIC_DATA_TYPES` selects generators by key; outputs go to `ml/data/synthetic/`

## Keys → Output Files → Intended Module Paths

- orders_demand_forecasting → `orders.demand_forecasting.{json|csv}` → `ml/modules/demand_forecasting/`
- orders_dynamic_pricing → `orders.dynamic_pricing.json` → `ml/modules/dynamic_pricing/`
- behaviors_recommendations → `behaviors.recommendations.json` → `ml/modules/recommendations/`
- subscriptions_churn_prediction → `subscriptions.churn_prediction.json` → `ml/modules/churn_prediction/`
- orders_route_optimization → `orders.route_optimization.json` → `ml/modules/route_optimization/`
- farmer_scoring_metrics → `farmers.scoring.metrics.json` → `ml/modules/farmer_scoring/`
- orders_anomaly_detection → `orders.anomaly_detection.json` → `ml/modules/anomaly_detection/`
- images_qc_metadata → `images.qc_metadata.json` → `ml/modules/image_qc/`
- nlp_sentiment_intent → `nlp.sentiment_intent.json` → `ml/modules/nlp/`
- orders_seasonal_analysis → `orders.seasonal_analysis.json` → `ml/modules/seasonal_analysis/`
- orders_clv_prediction → `orders.clv_prediction.json` → `ml/modules/clv_prediction/`
- subscriptions_optimization → `subscriptions.optimization.item_mix.json` → `ml/modules/subscription_optimization/`
- certification_ocr_samples → `certification.ocr_samples.json` → `ml/modules/certification_validation/`
- maintenance_predictive_metrics → `maintenance.predictive.metrics.json` → `ml/modules/predictive_maintenance/`

## Example Commands

- Generate raw orders + demand forecasting features (CSV):
  `SYNTHETIC_DATA_TYPES=orders,orders_demand_forecasting ORDERS_OUTPUT_FORMAT=csv python ml/scripts/synthetic_data.py`

- Generate datasets for dynamic pricing and recommendations:
  `SYNTHETIC_DATA_TYPES=orders_dynamic_pricing,behaviors_recommendations python ml/scripts/synthetic_data.py`

- Generate churn and CLV datasets:
  `SYNTHETIC_DATA_TYPES=subscriptions_churn_prediction,orders_clv_prediction python ml/scripts/synthetic_data.py`

## Schemas (Short)

- `orders.dynamic_pricing.json`: productId, date, base_price, competitor_price, demand_index, stock_level, recommended_price, ab_bucket
- `behaviors.recommendations.json`: userId, itemId, action, timestamp, popularity
- `subscriptions.churn_prediction.json`: subscriptionId, customerId, tenure_days, events, last_active_days, is_churned
- `orders.route_optimization.json`: orderId, address.lat/lon, items, priority, deliveryWindow.start/end
- `farmers.scoring.metrics.json`: farmerId, on_time_rate, qc_score_avg, rejection_rate, weekly_volume, score
- `orders.anomaly_detection.json`: orderId, productId, quantity, price, acceptedRate, anomaly
- `images.qc_metadata.json`: image_id, image_path, productId, label
- `nlp.sentiment_intent.json`: text, sentiment, intent
- `orders.seasonal_analysis.json`: date, productId, qty, price, dow, month, qty_lag_1..7, sin_week, cos_week, seasonal_peak
- `orders.clv_prediction.json`: customerId, order_count, avg_order_value, tenure_days, survival_flag, clv_value
- `subscriptions.optimization.item_mix.json`: subscriptionId, current_items[], recommended_mix[]
- `certification.ocr_samples.json`: id, image_path, extracted_text, confidence
- `maintenance.predictive.metrics.json`: routeId, distance_km, stops, vehicle_age_years, breakdown_flag

## Notes

- Default `SYNTHETIC_DATA_TYPES` keeps original datasets; feature datasets are opt-in.
- Use `.csv` by setting `ORDERS_OUTPUT_FORMAT=csv` for `orders.demand_forecasting` only (others are JSON).
- Align module code with the data file names above to keep integration straightforward.