# 农业科技AI/ML系统技术设计（版本 v0.1）

本设计覆盖10个AI/ML模块的技术方案、训练与评估流程、API规范（批量+实时）、监控与日志方案；统一采用MLflow进行模型版本管理，支持FastAPI服务、Celery批处理任务、Redis缓存；部署采用Docker并可扩展至AWS SageMaker或Vertex AI。

---
## 一、平台总架构
- 服务边界：`ml-service`（FastAPI实时推理）+ `ml-worker`（Celery批处理/训练）+ `mlflow`（模型管理）+ `redis`（缓存/队列）+ `storage`（S3/Neon/Parquet）
- 数据流：ETL → 特征工程 → 训练（离线） → 注册模型（MLflow）→ 部署（FastAPI加载最新prod模型）→ 监控/反馈 → 周期重训
- 统一规范：
  - MLflow注册命名：`<domain>/<module>/<model_name>`，阶段：`staging|production`；自动记录参数/指标/工件
  - 批量接口：由Celery任务触发，输出写回DB/S3；实时接口：FastAPI返回JSON预测
  - 日志与监控：Prometheus + Grafana（系统指标）、MLflow（训练指标）、自研业务指标端点 `/metrics`
  - 测试：pytest + coverage≥80%，包含单元测试、集成测试（API/任务/特征计算）

---
## 二、通用数据与特征层
- 数据源：订单（Order/OrderItem）、产品（Product）、农户（Farmer）、客户（Customer/Subscription）、配送（Route/Driver）、QC质检（QCResult）、价格/促销、反馈（Review/NLP）
- 特征存储：`feature_store`（parquet或Neon表），按`entity_id + date_week`分区
- 版本化：`feature_version`字段，特征生成脚本记录至MLflow artifact
- 缺失值与异常：统一处理策略（填充/删减），并在`data_quality_report`中记录

---
## 三、模块设计

### 1) 需求预测与库存优化
- 目标：预测每周产品需求，驱动采购与库存决策
- 模型：LSTM（短期序列）、Prophet（季节/节假日）、ARIMA基准
- 特征：历史销量/订阅量、价格、促销、节假日、天气、区域、农户供给能力
- 训练流程：数据切分（rolling window）→ 模型训练与交叉验证 → MLflow记录 → 选型与集成（加权或stacking）
- 优化：线性规划/混合整数规划（采购周期、仓储成本、缺货惩罚）
- 指标：MAPE/RMSE、库存周转率、缺货率、总成本
- API（实时）：`POST /forecast/demand` 输入`product_id、weeks`；返回`[{week, demand_mean, demand_ci}]`
- 批量：`celery task forecast_weekly_all_products`写回`demand_forecast`表
- 监控：漂移检测（分位数/KS检验）、误差跟踪；异常报警

### 2) 动态定价引擎
- 目标：根据需求与质量自适应定价
- 模型：强化学习（策略梯度或DQN）、多元回归、价格弹性估计（log-log模型）
- 特征：历史价格、销量、质量评分、竞品价格、季节、库存状态
- 训练与策略：离线训练 + 在线A/B测试，安全约束（价格区间/利润底线）
- 规则引擎：优先级匹配（活动/监管/品类策略），与RL输出融合（加权）
- 指标：收益提升、转化率、价格稳定性、A/B显著性（p-value）
- API（实时）：`POST /pricing/quote` 输入`product_id, context` 返回`price, rationale`
- 批量：`celery task price_update_daily`按SKU批量更新挂牌价
- 监控：策略回放、探索率、异常涨价预警

### 3) 质量预测系统
- 目标：预测合格率与质量指标
- 模型：随机森林、XGBoost（结构化），可扩展LightGBM
- 特征：农户历史表现、天气、采收时间、运输时长、QC历史
- 指标：AUC、F1、PR-AUC、校准误差
- 评分卡：区间映射与可解释性（SHAP）
- 预警：阈值与规则（连续低质量）、工单派发
- API：`POST /quality/predict` 输入批次特征；返回`pass_prob, key_factors`
- 批量：`celery task qc_risk_scan`
- 监控：模型漂移、重要特征变化

### 4) 个性化推荐系统
- 目标：产品推荐与订阅箱定制
- 模型：协同过滤（ALS/BPR）、内容推荐（Embedding/TF-IDF）、混合引擎（rank融合）
- 特征：用户行为（浏览/购买/评分）、产品画像（品类/口感/营养）
- 指标：Precision@K、Recall@K、MAP、CTR
- API（实时）：`GET /recommendations?customer_id=&k=` 返回产品列表
- 批量：`celery task build_user_item_factors`
- 监控：多样性、冷启动命中率、推荐公平性

### 5) 客户流失预测与留存优化
- 目标：识别高风险客户并制定干预
- 模型：逻辑回归（可解释基线）、MLP（复杂交互）
- 特征：订阅周期、下单频次、投诉、价格敏感度、推荐互动
- 分群：KMeans/GMM；留存方案策略库（优惠、客服外呼）
- 指标：AUC、提升度（uplift）、干预ROI
- API：`POST /churn/predict` 返回`churn_prob, segment`
- 批量：`celery task churn_scan_and_actions`
- 监控：阈值稳定性、群体漂移

### 6) 智能路径优化系统
- 目标：优化配送路线，提高效率与准时率
- 算法：遗传算法（VRP变体）、RL（动态交通）
- 数据：订单地址、时窗、车辆容量、实时交通
- 平台：调度可视化（前端已有），后端提供最优路线与ETA
- 指标：总里程、准时率、载重利用率
- API：`POST /routing/optimize` 输入订单集合与约束；返回路径集合
- 批量：`celery task nightly_route_plan`
- 监控：计划与实际偏差、异常路段

### 7) 农户绩效评分系统
- 目标：评估与排名农户表现
- 模型：加权评分（交付准时、合格率、稳定供给、投诉），聚类分析农户群体
- 指标：综合分、分布、阶跃变化预警
- API：`GET /farmer/score?farmer_id=` 返回`score, breakdown`
- 批量：`celery task farmer_scoring_weekly`
- 监控：评分稳定性、异常波动

### 8) 异常检测系统
- 目标：识别欺诈与异常行为
- 模型：Isolation Forest、Autoencoder（高维特征）
- 场景：异常订单、价格异常、物流异常、数据漂移
- 指标：召回率、误报率、人工复核通过率
- API：`POST /anomaly/detect` 输入事件特征；返回`is_anomaly, score`
- 批量：`celery task anomaly_scan`
- 监控：报警压降、案例闭环记录

### 9) 基于图像的质检系统
- 目标：自动质检（外观缺陷、异物、损伤）
- 模型：CNN（ResNet/EfficientNet），检测（YOLOv5/v8）
- 数据：采集标注流程、缺陷分类体系
- 指标：mAP、Recall、误报率；推理时延
- 工作流：上传 → 队列推理 → 结果写回QC表 → 回看与复核
- API：`POST /qc/image/predict` 上传图像或URL；返回缺陷类别与置信度
- 批量：`celery task qc_image_batch_infer`
- 监控：模型精度回归、设备异常

### 10) 自然语言处理系统
- 目标：理解与分类客户反馈，生成智能回复
- 模型：BERT（分类/情感）、GPT（生成/摘要/QA）
- 数据：反馈文本、订单上下文、客服标签
- 指标：F1（分类）、情感准确率、响应满意度
- API：
  - `POST /nlp/sentiment` 返回`sentiment, score`
  - `POST /nlp/classify` 返回`label, prob`
  - `POST /nlp/reply` 返回`generated_reply`
- 批量：`celery task nlp_retrain_weekly`
- 监控：敏感词与合规、回复质量抽检

---
## 四、训练与评估规范
- 数据切分：时间序列保留最近N周为验证/测试；分类/回归采用分层/时间切分
- 交叉验证：时间序列CV；分类5折；记录随机种子与环境哈希
- 评估：统一`/reports`目录生成HTML/PDF报告，存入MLflow artifact
- 模型选择：基准线与复杂模型比较；上线标准（阈值+稳定性）

---
## 五、API规范（示例统一约定）
- 鉴权：JWT或会话，角色：`ADMIN|OPERATIONS|ANALYST`；速率限制（Redis）
- 通用错误：结构化JSON `{code, message, trace_id}`，避免HTML重定向
- 批量接口：传入`date_range或ids`，返回任务`task_id`；状态查询`GET /tasks/{task_id}`
- 版本：`/v1`前缀；返回含`model_version, served_at`

---
## 六、监控与日志
- 系统：请求耗时、QPS、错误率（Prometheus自动采集）
- 业务：预测误差、收益指标、报警事件；暴露`/metrics`端点
- 日志：结构化JSON（trace_id），区分`train|serve|task`；保留至S3/ELK

---
## 七、部署与运维
- 容器：`ml-service`、`ml-worker`、`mlflow`、`redis`、`prometheus`、`grafana`
- 云托管：模型训练可迁移至 SageMaker/Vertex；模型注册保持MLflow一致
- 滚动升级：蓝绿或灰度；A/B实验管理（定价模块）
- 安全：数据脱敏、最小权限；合规审计

---
## 八、测试策略
- 单元：特征、模型封装、API校验
- 集成：训练→注册→服务推理闭环；Celery任务与Redis队列
- 覆盖率：≥80%；在CI中强制
- 合成数据：`scripts/synthetic_data.py`生成覆盖极端场景与冷启动

---
## 九、落地路线图（建议）
1. 阶段1（2周）：搭建`ml-service`与`ml-worker`骨架、MLflow、Redis、Docker；实现模块1需求预测MVP（批量+实时）
2. 阶段2（3-4周）：动态定价、质量预测、流失预测；接入监控与A/B测试
3. 阶段3（4-6周）：路径优化、推荐系统、农户评分与异常检测
4. 阶段4（6-8周）：图像质检与NLP系统；完善文档、测试与合规

---
## 十、接口示例（JSON Schema简版）
- `POST /v1/forecast/demand`
```json
{
  "product_id": "string",
  "weeks": 12,
  "context": {"region": "string", "season": "string"}
}
```
返回：`[{"week":"2025-W43","demand_mean":120,"demand_ci":[100,150],"model_version":"v1"}]`

- `POST /v1/pricing/quote`
```json
{"product_id": "string", "quality_score": 0.87, "inventory": 320, "demand_signal": 1.2}
```
返回：`{"price": 9.99, "rationale": "rl+rules", "ab_bucket": "B"}`

- `POST /v1/quality/predict`
```json
{"batch_id": "string", "farmer_id": "string", "features": {"temp": 6.2, "transit_hours": 12}}
```
返回：`{"pass_prob": 0.78, "key_factors": [{"feature": "transit_hours", "impact": -0.12}]}`

---
## 十一、文档与操作手册
- 开发者指南：服务启动、环境变量、数据准备、训练与推理示例
- 业务手册：各模块指标含义、仪表盘解读、A/B流程
- 合规与隐私：数据使用范围、保留策略、访问控制

---
备注：本设计为v0.1草案，后续按实际数据与平台约束迭代细化与实现。