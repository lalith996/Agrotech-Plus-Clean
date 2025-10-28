from ml.modules.demand_forecasting.train import train_model as train_df
from ml.modules.quality_prediction.train import train_model as train_qc
from ml.modules.dynamic_pricing.train import train_model as train_dp
from ml.modules.recommendations.train import train_model as train_rec
from ml.modules.churn_prediction.train import train_model as train_churn
from ml.modules.anomaly_detection.train import train_model as train_anom
from ml.modules.seasonal_analysis.train import train_model as train_season
from ml.modules.clv_prediction.train import train_model as train_clv
from ml.modules.subscription_optimization.train import train_model as train_subopt
from ml.modules.certification_validation.train import train_model as train_cert
from ml.modules.predictive_maintenance.train import train_model as train_pm
from ml.modules.image_qc.train import train_model as train_imgqc
from ml.modules.nlp_intent_sentiment.train import train_model as train_nlp


if __name__ == "__main__":
    results = {}

    print("Training demand forecasting...")
    results['demand_forecasting'] = train_df()
    print(results['demand_forecasting'])

    print("Training quality prediction...")
    results['quality_prediction'] = train_qc()
    print(results['quality_prediction'])

    print("Training dynamic pricing...")
    results['dynamic_pricing'] = train_dp()
    print(results['dynamic_pricing'])

    print("Training recommendations...")
    results['recommendations'] = train_rec()
    print(results['recommendations'])

    print("Training churn prediction...")
    results['churn_prediction'] = train_churn()
    print(results['churn_prediction'])

    print("Training anomaly detection...")
    results['anomaly_detection'] = train_anom()
    print(results['anomaly_detection'])

    print("Training seasonal analysis...")
    results['seasonal_analysis'] = train_season()
    print(results['seasonal_analysis'])

    print("Training CLV prediction...")
    results['clv_prediction'] = train_clv()
    print(results['clv_prediction'])

    print("Training subscription optimization...")
    results['subscription_optimization'] = train_subopt()
    print(results['subscription_optimization'])

    print("Training certification validation...")
    results['certification_validation'] = train_cert()
    print(results['certification_validation'])

    print("Training predictive maintenance...")
    results['predictive_maintenance'] = train_pm()
    print(results['predictive_maintenance'])

    print("Training image QC...")
    results['image_qc'] = train_imgqc()
    print(results['image_qc'])

    print("Training NLP intent/sentiment...")
    results['nlp_intent_sentiment'] = train_nlp()
    print(results['nlp_intent_sentiment'])

    print("Done.")