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
  retryStrategy: (times) => Math.min(times * 50, 2000)
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
const defaultOptions: CacheOptions = {
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
    const opts = { ...defaultOptions, ...options };

    try {
      // Level 1: Memory cache (fastest)
      if (!opts.skipMemory) {
        const memoryResult = this.memoryCache.get<T>(key);
        if (memoryResult !== undefined) {
          return memoryResult;
        }
      }

      // Level 2: Redis cache (distributed)
      if (!opts.skipRedis) {
        try {
          const redisResult = await this.redis.get(key);
          if (redisResult) {
            const parsed = JSON.parse(redisResult) as T;
            
            // Store in memory cache for next time
            if (!opts.skipMemory) {
              this.memoryCache.set(key, parsed, opts.memoryTTL || 300);
            }
            
            return parsed;
          }
        } catch (redisError) {
          console.warn('Redis get failed, falling back to fetch:', redisError);
        }
      }

      // Level 3: Fetch from source
      const fresh = await fetchFunction();

      // Cache at all levels
      const cachePromises: Promise<any>[] = [];

      if (!opts.skipRedis) {
        try {
          const redisPromise = this.redis.setex(key, opts.redisTTL || 3600, JSON.stringify(fresh));
          if (redisPromise && typeof redisPromise.catch === 'function') {
            cachePromises.push(redisPromise.catch(error => console.warn('Redis set failed:', error)));
          }
        } catch (error) {
          console.warn('Redis set failed:', error);
        }
      }

      if (!opts.skipMemory) {
        this.memoryCache.set(key, fresh, opts.memoryTTL || 300);
      }

      // Don't wait for caching to complete
      Promise.all(cachePromises);

      return fresh;
    } catch (error) {
      console.error('Cache get error:', error);
      throw error;
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
    const opts = { ...defaultOptions, ...options };

    const cachePromises: Promise<any>[] = [];

    // Set in memory cache
    if (!opts.skipMemory) {
      this.memoryCache.set(key, value, opts.memoryTTL || 300);
    }

    // Set in Redis cache
    if (!opts.skipRedis) {
      try {
        const redisPromise = this.redis.setex(key, opts.redisTTL || 3600, JSON.stringify(value));
        if (redisPromise && typeof redisPromise.catch === 'function') {
          cachePromises.push(redisPromise.catch(error => console.warn('Redis set failed:', error)));
        }
      } catch (error) {
        console.warn('Redis set failed:', error);
      }
    }

    await Promise.all(cachePromises);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    const deletePromises: Promise<any>[] = [];

    // Delete from memory cache
    this.memoryCache.del(key);

    // Delete from Redis cache
    try {
      const redisPromise = this.redis.del(key);
      if (redisPromise && typeof redisPromise.catch === 'function') {
        deletePromises.push(redisPromise.catch(error => console.warn('Redis delete failed:', error)));
      }
    } catch (error) {
      console.warn('Redis delete failed:', error);
    }

    await Promise.all(deletePromises);
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<void> {
    // Clear memory cache (simple approach - clear all)
    this.memoryCache.flushAll();

    // Clear Redis cache by pattern
    try {
      const keys = await this.redis.keys(pattern);
      if (keys && keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.warn('Redis invalidate failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryKeys = this.memoryCache.keys();
    return {
      memory: {
        keys: memoryKeys ? memoryKeys.length : 0,
        stats: this.memoryCache.getStats(),
      },
      redis: {
        status: this.redis.status,
      }
    };
  }

  /**
   * Warm cache with data
   */
  async warmCache<T>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    const promises = entries.map(entry => 
      this.set(entry.key, entry.value, entry.options)
    );
    
    await Promise.all(promises);
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    this.memoryCache.close();
    await this.redis.quit();
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Utility functions for common cache patterns
export const cacheUtils = {
  /**
   * Generate cache key for user-specific data
   */
  userKey: (userId: string, resource: string) => `user:${userId}:${resource}`,

  /**
   * Generate cache key for product data
   */
  productKey: (productId: string) => `product:${productId}`,

  /**
   * Generate cache key for search results
   */
  searchKey: (query: string, filters: Record<string, any>) => {
    const filterStr = JSON.stringify(filters);
    return `search:${Buffer.from(query + filterStr).toString('base64')}`;
  },

  /**
   * Generate cache key for analytics data
   */
  analyticsKey: (type: string, period: string, userId?: string) => {
    const base = `analytics:${type}:${period}`;
    return userId ? `${base}:${userId}` : base;
  },

  /**
   * Generate cache key for API responses
   */
  apiKey: (endpoint: string, params: Record<string, any> = {}) => {
    const paramStr = Object.keys(params).length > 0 
      ? `:${Buffer.from(JSON.stringify(params)).toString('base64')}`
      : '';
    return `api:${endpoint}${paramStr}`;
  }
};

// Cache middleware for API routes
export function withCache<T>(
  key: string | ((req: any) => string),
  options: CacheOptions = {}
) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0];
      const cacheKey = typeof key === 'function' ? key(req) : key;

      try {
        return await cacheService.get<T>(
          cacheKey,
          () => method.apply(this, args),
          options
        );
      } catch (error) {
        console.error('Cache middleware error:', error);
        return method.apply(this, args);
      }
    };

    return descriptor;
  };
}