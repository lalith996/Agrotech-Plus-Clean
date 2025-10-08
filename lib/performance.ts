// Performance optimization utilities and monitoring

import { NextApiRequest, NextApiResponse } from 'next'

// Performance metrics collection
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

class MetricsCollector {
  private metrics: PerformanceMetric[] = []
  private readonly maxMetrics = 1000

  record(name: string, value: number, metadata?: Record<string, any>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata
    })

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    return name 
      ? this.metrics.filter(m => m.name === name)
      : this.metrics
  }

  getAverageMetric(name: string, timeWindow?: number): number | null {
    const now = Date.now()
    const windowStart = timeWindow ? now - timeWindow : 0
    
    const relevantMetrics = this.metrics.filter(m => 
      m.name === name && m.timestamp >= windowStart
    )

    if (relevantMetrics.length === 0) return null

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0)
    return sum / relevantMetrics.length
  }

  clear(): void {
    this.metrics = []
  }
}

export const metricsCollector = new MetricsCollector()

// API response time middleware
export function withPerformanceTracking(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = performance.now()
    const route = req.url || 'unknown'

    try {
      await handler(req, res)
    } finally {
      const duration = performance.now() - startTime
      metricsCollector.record('api_response_time', duration, {
        route,
        method: req.method,
        statusCode: res.statusCode
      })
    }
  }
}

// Database query performance tracking
export function trackDatabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()
  
  return queryFn().then(result => {
    const duration = performance.now() - startTime
    metricsCollector.record('db_query_time', duration, { queryName })
    return result
  }).catch(error => {
    const duration = performance.now() - startTime
    metricsCollector.record('db_query_time', duration, { 
      queryName, 
      error: true 
    })
    throw error
  })
}

import React from 'react';

// Component render performance tracking
export function useRenderPerformance(componentName: string) {
  const startTime = React.useRef<number>()
  
  React.useEffect(() => {
    startTime.current = performance.now()
  })

  React.useEffect(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current
      metricsCollector.record('component_render_time', duration, { componentName })
    }
  })
}

// Memory usage monitoring
export class MemoryMonitor {
  static getMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }
    }
    return null
  }

  static trackMemoryUsage(label: string) {
    const usage = this.getMemoryUsage()
    if (usage) {
      metricsCollector.record('memory_usage', usage.used, { 
        label,
        total: usage.total,
        limit: usage.limit
      })
    }
  }
}

// Network performance monitoring
export class NetworkMonitor {
  static trackFetchPerformance<T>(
    url: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    
    return fetchFn().then(result => {
      const duration = performance.now() - startTime
      metricsCollector.record('network_request_time', duration, { url })
      return result
    }).catch(error => {
      const duration = performance.now() - startTime
      metricsCollector.record('network_request_time', duration, { 
        url, 
        error: true 
      })
      throw error
    })
  }

  static async measureConnectionSpeed(): Promise<number> {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      return connection.downlink || 0
    }
    return 0
  }
}

// Bundle size analysis utilities
export const BundleAnalysis = {
  // Track component bundle sizes
  trackComponentSize(componentName: string, size: number) {
    metricsCollector.record('component_bundle_size', size, { componentName })
  },

  // Lazy load heavy components
  createLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    componentName: string
  ) {
    return React.lazy(async () => {
      const startTime = performance.now()
      const module = await importFn()
      const loadTime = performance.now() - startTime
      
      metricsCollector.record('component_load_time', loadTime, { componentName })
      return module
    })
  }
}

// Image optimization performance
export const ImagePerformance = {
  // Track image load times
  trackImageLoad(src: string, loadTime: number) {
    metricsCollector.record('image_load_time', loadTime, { src })
  },

  // Optimize image loading
  createOptimizedImageProps(src: string, alt: string) {
    return {
      src,
      alt,
      loading: 'lazy' as const,
      onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget
        const loadTime = performance.now() - (img as any).startTime
        this.trackImageLoad(src, loadTime)
      },
      onLoadStart: (e: React.SyntheticEvent<HTMLImageElement>) => {
        (e.currentTarget as any).startTime = performance.now()
      }
    }
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  private static budgets = new Map<string, number>()

  static setBudget(metric: string, budget: number) {
    this.budgets.set(metric, budget)
  }

  static checkBudget(metric: string, value: number): boolean {
    const budget = this.budgets.get(metric)
    return budget ? value <= budget : true
  }

  static getBudgetStatus() {
    const status: Record<string, { budget: number; current: number; status: 'ok' | 'warning' | 'exceeded' }> = {}

    for (const [metric, budget] of Array.from(this.budgets.entries())) {
      const current = metricsCollector.getAverageMetric(metric, 5 * 60 * 1000) || 0 // Last 5 minutes
      
      let statusValue: 'ok' | 'warning' | 'exceeded' = 'ok'
      if (current > budget) {
        statusValue = 'exceeded'
      } else if (current > budget * 0.8) {
        statusValue = 'warning'
      }

      status[metric] = { budget, current, status: statusValue }
    }

    return status
  }
}

// Set default performance budgets
PerformanceBudget.setBudget('api_response_time', 1000) // 1 second
PerformanceBudget.setBudget('db_query_time', 500) // 500ms
PerformanceBudget.setBudget('component_render_time', 100) // 100ms
PerformanceBudget.setBudget('network_request_time', 2000) // 2 seconds

// Performance optimization recommendations
export class PerformanceOptimizer {
  static analyzeMetrics() {
    const recommendations: string[] = []
    
    // Check API response times
    const avgApiTime = metricsCollector.getAverageMetric('api_response_time', 10 * 60 * 1000)
    if (avgApiTime && avgApiTime > 1000) {
      recommendations.push('API response times are slow. Consider adding caching or optimizing database queries.')
    }

    // Check database query times
    const avgDbTime = metricsCollector.getAverageMetric('db_query_time', 10 * 60 * 1000)
    if (avgDbTime && avgDbTime > 500) {
      recommendations.push('Database queries are slow. Consider adding indexes or optimizing queries.')
    }

    // Check component render times
    const avgRenderTime = metricsCollector.getAverageMetric('component_render_time', 10 * 60 * 1000)
    if (avgRenderTime && avgRenderTime > 100) {
      recommendations.push('Component rendering is slow. Consider memoization or code splitting.')
    }

    // Check memory usage
    const memoryUsage = MemoryMonitor.getMemoryUsage()
    if (memoryUsage && memoryUsage.used / memoryUsage.limit > 0.8) {
      recommendations.push('Memory usage is high. Consider reducing bundle size or implementing lazy loading.')
    }

    return recommendations
  }

  static getOptimizationReport() {
    return {
      budgetStatus: PerformanceBudget.getBudgetStatus(),
      recommendations: this.analyzeMetrics(),
      metrics: {
        apiResponseTime: metricsCollector.getAverageMetric('api_response_time', 10 * 60 * 1000),
        dbQueryTime: metricsCollector.getAverageMetric('db_query_time', 10 * 60 * 1000),
        componentRenderTime: metricsCollector.getAverageMetric('component_render_time', 10 * 60 * 1000),
        networkRequestTime: metricsCollector.getAverageMetric('network_request_time', 10 * 60 * 1000)
      },
      memoryUsage: MemoryMonitor.getMemoryUsage()
    }
  }
}

// React performance hooks
export function usePerformanceOptimization() {
  const [performanceData, setPerformanceData] = React.useState<any>(null)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceData(PerformanceOptimizer.getOptimizationReport())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return performanceData
}

// Critical resource hints for better loading
export const ResourceHints = {
  // Generate preload links for critical resources
  generatePreloadLinks(resources: Array<{ href: string; as: string; type?: string }>) {
    return resources.map(resource => ({
      rel: 'preload',
      href: resource.href,
      as: resource.as,
      type: resource.type
    }))
  },

  // Generate prefetch links for likely next resources
  generatePrefetchLinks(hrefs: string[]) {
    return hrefs.map(href => ({
      rel: 'prefetch',
      href
    }))
  },

  // Generate DNS prefetch for external domains
  generateDnsPrefetch(domains: string[]) {
    return domains.map(domain => ({
      rel: 'dns-prefetch',
      href: `//${domain}`
    }))
  }
}

export default {
  metricsCollector,
  withPerformanceTracking,
  trackDatabaseQuery,
  useRenderPerformance,
  MemoryMonitor,
  NetworkMonitor,
  BundleAnalysis,
  ImagePerformance,
  PerformanceBudget,
  PerformanceOptimizer,
  usePerformanceOptimization,
  ResourceHints
}