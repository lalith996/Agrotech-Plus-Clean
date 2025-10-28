import Redis from 'ioredis';
import NodeCache from 'node-cache';

// Redis client configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryStrategy: (times: number) => Math.min(times * 50, 2000)
});

// Memory cache for fastest access
const memoryCache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every minute
  useClones: false, // Better performance
});

// Cache configuration interface
export interface CacheOptions {
  memoryTTL?: number; // Memory cache TTL in seconds
  redisTTL?: number;  // Redis cache TTL in seconds
  skipMemory?: boolean; // Skip memory cache
  skipRedis?: boolean;  // Skip Redis cache
}

// Default cache options
const defaultOptions: Required<CacheOptions> = {
  memoryTTL: 300,  // 5 minutes
  redisTTL: 3600,  // 1 hour
  skipMemory: false,
  skipRedis: false,
};

export class CacheService {
  private redis: Redis;
  private memoryCache: NodeCache;

  constructor() {
    this.redis = redis;
    this.memoryCache = memoryCache;
    
    // Handle Redis connection events
    this.redis.on('connect', () => {
      console.log('Redis connected');
    });
    
    this.redis.on('error', (error) => {
      console.error('Redis error:', error);
    });
    
    this.redis.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  /**
   * Get value from cache with fallback to fetch function
   */
  async get<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const opts: Required<CacheOptions> = { ...defaultOptions, ...options };

    try {
      // Level 1: Memory cache (fastest)
      if (!opts.skipMemory) {
        const memoryResult = this.memoryCache.get<T>(key);
        if (memoryResult !== undefined) {
          return memoryResult;
        }
      }

      // Level 2: Redis cache
      if (!opts.skipRedis) {
        const redisResult = await this.redis.get(key);
        if (redisResult !== null) {
          try {
            const parsed = JSON.parse(redisResult);
            // Warm memory cache
            this.memoryCache.set(key, parsed, opts.memoryTTL);
            return parsed as T;
          } catch (error) {
            // If JSON parsing fails, treat as raw value
            return redisResult as unknown as T;
          }
        }
      }

      // If not found in cache, fetch from source
      const freshValue = await fetchFunction();

      // Set in caches
      if (!opts.skipMemory) {
        this.memoryCache.set(key, freshValue, opts.memoryTTL);
      }

      if (!opts.skipRedis) {
        try {
          const serialized = JSON.stringify(freshValue);
          await this.redis.setex(key, opts.redisTTL, serialized);
        } catch (error) {
          // Fallback: store raw value if JSON serialization fails
          await this.redis.setex(key, opts.redisTTL, String(freshValue));
        }
      }

      return freshValue;
    } catch (error) {
      console.error('Cache get error:', error);
      // Fallback to fetch function on error
      return await fetchFunction();
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const opts: Required<CacheOptions> = { ...defaultOptions, ...options };

    try {
      // Set memory cache
      if (!opts.skipMemory) {
        this.memoryCache.set(key, value, opts.memoryTTL);
      }

      // Set Redis cache
      if (!opts.skipRedis) {
        const serialized = JSON.stringify(value);
        await this.redis.setex(key, opts.redisTTL, serialized);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      // Delete from memory cache
      this.memoryCache.del(key);
      
      // Delete from Redis
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Invalidate cache entries by pattern (Redis only)
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memory: {
        keys: this.memoryCache.keys().length,
        stats: this.memoryCache.getStats(),
      },
      redis: {
        status: this.redis.status,
      },
    };
  }

  /**
   * Warm up cache with precomputed values
   */
  async warmCache<T>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.options);
    }
  }

  /**
   * Close cache services
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
}

// Export a singleton instance
export const cacheService = new CacheService();

// Common cache key helpers
export const cacheUtils = {
  userKey: (userId: string, resource: string) => `user:${userId}:${resource}`,
  productKey: (productId: string) => `product:${productId}`,
  searchKey: (query: string, filters: Record<string, any>) => {
    const filterStr = Object.entries(filters)
      .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
      .join('|');
    return `search:${query}:${filterStr}`;
  },
  analyticsKey: (type: string, period: string, userId?: string) => {
    return userId ? `analytics:${type}:${period}:${userId}` : `analytics:${type}:${period}`;
  },
  apiKey: (endpoint: string, params: Record<string, any> = {}) => {
    const paramStr = Object.entries(params)
      .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
      .join('|');
    return `api:${endpoint}:${paramStr}`;
  },
};

// Higher-order function for caching API responses
export function withCache<T>(
  key: string | ((req: any) => string),
  options: CacheOptions = {}
) {
  return async (req: any, res: any, next: any) => {
    try {
      const cacheKey = typeof key === 'function' ? key(req) : key;
      const cachedData = await cacheService.get(cacheKey, async () => {
        return await new Promise<T>((resolve) => {
          // Collect response
          const originalJson = res.json;
          res.json = (data: T) => {
            resolve(data);
            return originalJson.call(res, data);
          };
          
          next();
        });
      }, options);

      if (cachedData) {
        return res.json(cachedData);
      }
    } catch (error) {
      console.error('Error in withCache:', error);
      next();
    }
  };
}