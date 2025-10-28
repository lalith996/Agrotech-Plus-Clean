import axios, { AxiosInstance, AxiosError } from 'axios';

// Minimal cache service interface to avoid breaking imports
// If your project provides a richer cacheService, you can wire it back later.
const cacheService = {
  async get<T>(_key: string): Promise<T | null> { return null; },
  async set<T>(_key: string, _value: T, _opts?: { redisTTL?: number; memoryTTL?: number }): Promise<void> { /* noop */ },
  async invalidate(_pattern: string): Promise<void> { /* noop */ },
};

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_API_KEY = process.env.ML_SERVICE_API_KEY || '';
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT || '5000');

export interface MLServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  fallback?: boolean;
}

export interface RecommendationRequest {
  userId: string;
  context?: 'dashboard' | 'product-page' | 'cart';
  limit?: number;
  model?: 'als' | 'content' | 'ncf';
  blend?: Record<string, number>;
}
export interface RecommendationResponse {
  products: Array<{ id: string; name: string; score: number }>; 
  confidence: number;
  algorithm: string;
}

export interface DemandForecastRequest { farmerId: string; productIds: string[]; days?: number; }
export interface DemandForecastResponse {
  forecasts: Array<{ productId: string; productName: string; predictions: Array<{ date: string; quantity: number; confidence: number }>; }>;
  accuracy: number;
}

export interface FarmerScoringRequest { farmerId: string; certifications: any[]; location: string; phone?: string }
export interface FarmerScoringResponse {
  score: number;
  factors: Array<{ name: string; score: number; weight: number; details: string }>;
  recommendation: 'approve' | 'review' | 'reject';
}

export interface SearchRequest { query: string; filters?: Record<string, any>; userId?: string; limit?: number }
export interface SearchResponse {
  results: Array<{ id: string; name: string; relevance: number }>;
  suggestions: string[];
  totalCount: number;
}

export interface RouteOptimizationRequest {
  orders: Array<{ id: string; address: { lat: number; lng: number }; timeWindow?: { start: string; end: string } }>;
  constraints?: { maxStops?: number; maxDuration?: number };
}
export interface RouteOptimizationResponse {
  routeId: string;
  optimizedSequence: string[];
  originalDistance: number;
  optimizedDistance: number;
  savings: number;
  estimatedDuration: number;
}

export interface QualityV1Request {
  farmer_id: string;
  product_type: string;
  harvest_date?: string;
  defects?: number;
  arrival_conditions?: Record<string, any>;
}
export interface QualityV1Response {
  predicted_quality_grade: string;
  quality_confidence: number;
  predicted_shelf_life_hours: number;
  acceptance_probability: number;
}

export interface ChurnPredictRequest {
  userIds: string[];
  includeRecommendations?: boolean;
}
export interface ChurnPrediction {
  userId: string;
  churn_probability: number;
  risk_level: 'low' | 'medium' | 'high';
  top_churn_factors: string[];
  retention_actions: string[];
  recommendations?: Array<{ id: string; name: string; score: number }>;
}
export interface ChurnPredictResponse {
  results: ChurnPrediction[];
}

export class MLClient {
  private client: AxiosInstance;
  private isAvailable = true;
  private lastHealthCheck = 0;
  private healthCheckInterval = 60000;

  constructor() {
    this.client = axios.create({
      baseURL: ML_SERVICE_URL,
      timeout: ML_SERVICE_TIMEOUT,
      headers: { 'Content-Type': 'application/json', 'X-API-Key': ML_SERVICE_API_KEY },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('ML Service error:', { endpoint: error.config?.url, status: error.response?.status, message: error.message });
        throw error;
      }
    );
  }

  private async checkHealth(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) return this.isAvailable;
    try {
      await this.client.get('/health', { timeout: 2000 });
      this.isAvailable = true; this.lastHealthCheck = now; return true;
    } catch (e) { this.isAvailable = false; this.lastHealthCheck = now; return false; }
  }

  private async request<T>(endpoint: string, data: any, opts: { timeout?: number; cacheKey?: string; cacheTTL?: number; fallback?: () => Promise<T> } = {}): Promise<MLServiceResponse<T>> {
    const { timeout, cacheKey, cacheTTL, fallback } = opts;
    if (cacheKey) {
      const cached = await cacheService.get<T>(cacheKey);
      if (cached) return { success: true, data: cached, cached: true };
    }

    const healthy = await this.checkHealth();
    if (!healthy && fallback) {
      const fb = await fallback();
      return { success: true, data: fb, fallback: true };
    }

    try {
      const resp = await this.client.post<T>(endpoint, data, { timeout: timeout || ML_SERVICE_TIMEOUT });
      const result = resp.data as T;
      if (cacheKey && cacheTTL) await cacheService.set(cacheKey, result, { redisTTL: cacheTTL, memoryTTL: Math.min(cacheTTL, 300) });
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err?.message || 'ML service error' };
    }
  }

  async getRecommendations(request: RecommendationRequest, fallback?: () => Promise<RecommendationResponse>): Promise<MLServiceResponse<RecommendationResponse>> {
    const modelKey = request.model || 'auto'
    const blendKey = request.blend ? Buffer.from(JSON.stringify(request.blend)).toString('base64') : 'none'
    const cacheKey = `ml:recommendations:${request.userId}:${request.context || 'default'}:${modelKey}:${blendKey}`;
    return this.request('/ml/recommendations', request, { cacheKey, cacheTTL: 3600, fallback });
  }

  async getDemandForecast(request: DemandForecastRequest, fallback?: () => Promise<DemandForecastResponse>): Promise<MLServiceResponse<DemandForecastResponse>> {
    const cacheKey = `ml:forecast:${request.farmerId}:${new Date().toISOString().split('T')[0]}`;
    return this.request('/ml/demand-forecast', request, { cacheKey, cacheTTL: 86400, fallback });
  }

  async scoreFarmerApplication(request: FarmerScoringRequest, fallback?: () => Promise<FarmerScoringResponse>): Promise<MLServiceResponse<FarmerScoringResponse>> {
    const cacheKey = `ml:farmer-score:${request.farmerId}`;
    return this.request('/ml/farmer-score', request, { cacheKey, cacheTTL: 604800, fallback });
  }

  async search(request: SearchRequest, fallback?: () => Promise<SearchResponse>): Promise<MLServiceResponse<SearchResponse>> {
    const cacheKey = `ml:search:${Buffer.from(JSON.stringify(request)).toString('base64')}`;
    return this.request('/ml/search', request, { cacheKey, cacheTTL: 1800, timeout: 3000, fallback });
  }

  async optimizeRoute(request: RouteOptimizationRequest, fallback?: () => Promise<RouteOptimizationResponse>): Promise<MLServiceResponse<RouteOptimizationResponse>> {
    return this.request('/ml/route-optimize', request, { timeout: 10000, fallback });
  }

  async getQualityPredictionV1(request: QualityV1Request, fallback?: () => Promise<QualityV1Response>): Promise<MLServiceResponse<QualityV1Response>> {
    const cacheKey = `ml:quality-v1:${request.farmer_id}:${request.product_type}:${request.harvest_date || 'unknown'}`;
    return this.request('/api/v1/quality/predict', request, { cacheKey, cacheTTL: 300, fallback });
  }

  async predictChurn(request: ChurnPredictRequest, fallback?: () => Promise<ChurnPredictResponse>): Promise<MLServiceResponse<ChurnPredictResponse>> {
    const usersKey = Buffer.from(request.userIds.join(',')).toString('base64')
    const cacheKey = `ml:churn:${usersKey}:${request.includeRecommendations ? 'with_rec' : 'no_rec'}`
    return this.request('/ml/churn-predict', request, { cacheKey, cacheTTL: 3600, fallback })
  }

  async invalidateCache(pattern: string): Promise<void> { await cacheService.invalidate(`ml:${pattern}*`); }

  async getStatus(): Promise<{ available: boolean; lastCheck: number }> {
    const available = await this.checkHealth();
    return { available, lastCheck: this.lastHealthCheck };
  }
}

export const mlClient = new MLClient();

// Fallback helpers used by some API routes
export const mlFallbacks = {
  async basicSearch(query: string, filters: Record<string, any>, limit: number): Promise<SearchResponse> {
    // Minimal fallback: return no results so callers can fall back to ES/DB
    return {
      results: [],
      suggestions: [],
      totalCount: 0,
    };
  },

  async nearestNeighbor(
    orders: Array<{ id: string; address: { lat: number; lng: number } }>
  ): Promise<RouteOptimizationResponse> {
    // Minimal fallback: preserve current order and estimate duration
    const optimizedSequence = orders.map(o => o.id);
    return {
      routeId: `fallback_${Date.now()}`,
      optimizedSequence,
      originalDistance: 0,
      optimizedDistance: 0,
      savings: 0,
      estimatedDuration: optimizedSequence.length * 30,
    };
  },
};