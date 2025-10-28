/**
 * ML Service Endpoints Configuration
 * 
 * Centralized configuration for all ML service endpoints and their settings.
 */

export interface MLEndpointConfig {
  path: string;
  timeout: number;
  cacheTTL: number;
  description: string;
}

/**
 * ML Service Endpoints
 */
export const ML_ENDPOINTS = {
  // Product Recommendations
  RECOMMENDATIONS: {
    path: '/ml/recommendations',
    timeout: 5000,
    cacheTTL: 3600, // 1 hour
    description: 'Get personalized product recommendations for a user',
  },

  // Demand Forecasting
  DEMAND_FORECAST: {
    path: '/ml/demand-forecast',
    timeout: 5000,
    cacheTTL: 86400, // 24 hours
    description: 'Get demand forecast for farmer products',
  },

  // Farmer Application Scoring
  FARMER_SCORE: {
    path: '/ml/farmer-score',
    timeout: 5000,
    cacheTTL: 604800, // 7 days
    description: 'Score farmer application for approval',
  },

  // Smart Search
  SEARCH: {
    path: '/ml/search',
    timeout: 3000,
    cacheTTL: 1800, // 30 minutes
    description: 'Perform NLP-powered product search',
  },

  // Route Optimization
  ROUTE_OPTIMIZE: {
    path: '/ml/route-optimize',
    timeout: 10000,
    cacheTTL: 0, // No caching (always fresh)
    description: 'Optimize delivery routes',
  },

  // Health Check
  HEALTH: {
    path: '/health',
    timeout: 2000,
    cacheTTL: 0,
    description: 'Check ML service health status',
  },

  // Quality Prediction (v1)
  QUALITY_PREDICT_V1: {
    path: '/api/v1/quality/predict',
    timeout: 5000,
    cacheTTL: 300, // 5 minutes
    description: 'Predict quality grade and shelf life (v1)',
  },

  // Churn Prediction
  CHURN_PREDICT: {
    path: '/ml/churn-predict',
    timeout: 5000,
    cacheTTL: 3600, // 1 hour
    description: 'Predict user churn probability and retention actions',
  },
} as const;

/**
 * ML Service Configuration
 */
export const ML_CONFIG = {
  // Service URL
  baseURL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  
  // API Key for authentication
  apiKey: process.env.ML_SERVICE_API_KEY || '',
  
  // Default timeout for requests (milliseconds)
  defaultTimeout: parseInt(process.env.ML_SERVICE_TIMEOUT || '5000'),
  
  // Health check interval (milliseconds)
  healthCheckInterval: 60000, // 1 minute
  
  // Retry configuration
  retry: {
    maxRetries: 2,
    retryDelay: 1000, // 1 second
  },
  
  // Cache configuration
  cache: {
    enabled: true,
    keyPrefix: 'ml:',
  },
} as const;

/**
 * ML Feature Flags
 * 
 * Enable/disable specific ML features
 */
export const ML_FEATURES = {
  recommendations: {
    enabled: process.env.ML_FEATURE_RECOMMENDATIONS !== 'false',
    fallbackEnabled: true,
  },
  demandForecast: {
    enabled: process.env.ML_FEATURE_DEMAND_FORECAST !== 'false',
    fallbackEnabled: true,
  },
  farmerScoring: {
    enabled: process.env.ML_FEATURE_FARMER_SCORING !== 'false',
    fallbackEnabled: true,
  },
  smartSearch: {
    enabled: process.env.ML_FEATURE_SMART_SEARCH !== 'false',
    fallbackEnabled: true,
  },
  routeOptimization: {
    enabled: process.env.ML_FEATURE_ROUTE_OPTIMIZATION !== 'false',
    fallbackEnabled: true,
  },
} as const;

/**
 * Cache key generators for ML predictions
 */
export const mlCacheKeys = {
  recommendations: (userId: string, context: string = 'default') => 
    `${ML_CONFIG.cache.keyPrefix}recommendations:${userId}:${context}`,
  
  demandForecast: (farmerId: string, date: string) => 
    `${ML_CONFIG.cache.keyPrefix}forecast:${farmerId}:${date}`,
  
  farmerScore: (farmerId: string) => 
    `${ML_CONFIG.cache.keyPrefix}farmer-score:${farmerId}`,
  
  search: (query: string, filters: Record<string, any>) => 
    `${ML_CONFIG.cache.keyPrefix}search:${Buffer.from(JSON.stringify({ query, filters })).toString('base64')}`,
  
  routeOptimization: (routeId: string) => 
    `${ML_CONFIG.cache.keyPrefix}route:${routeId}`,

  churnPredict: (userIds: string[], includeRecommendations: boolean = false) =>
    `${ML_CONFIG.cache.keyPrefix}churn:${Buffer.from(userIds.join(',')).toString('base64')}:${includeRecommendations ? 'with_rec' : 'no_rec'}`,
};

/**
 * ML Service Error Messages
 */
export const ML_ERROR_MESSAGES = {
  SERVICE_UNAVAILABLE: 'ML service is currently unavailable. Using fallback data.',
  TIMEOUT: 'ML service request timed out. Using fallback data.',
  INVALID_REQUEST: 'Invalid request data provided to ML service.',
  AUTHENTICATION_FAILED: 'ML service authentication failed.',
  UNKNOWN_ERROR: 'An unknown error occurred with the ML service.',
} as const;

/**
 * Validate ML service configuration
 */
export function validateMLConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!ML_CONFIG.baseURL) {
    errors.push('ML_SERVICE_URL is not configured');
  }

  if (!ML_CONFIG.apiKey && process.env.NODE_ENV === 'production') {
    errors.push('ML_SERVICE_API_KEY is required in production');
  }

  if (ML_CONFIG.defaultTimeout < 1000) {
    errors.push('ML_SERVICE_TIMEOUT should be at least 1000ms');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get ML service status information
 */
export function getMLServiceInfo() {
  return {
    baseURL: ML_CONFIG.baseURL,
    timeout: ML_CONFIG.defaultTimeout,
    features: Object.entries(ML_FEATURES).map(([name, config]) => ({
      name,
      enabled: config.enabled,
      fallbackEnabled: config.fallbackEnabled,
    })),
    endpoints: Object.entries(ML_ENDPOINTS).map(([name, config]) => ({
      name,
      path: config.path,
      timeout: config.timeout,
      cacheTTL: config.cacheTTL,
      description: config.description,
    })),
  };
}
