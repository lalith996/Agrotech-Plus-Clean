import { describe, it, expect, beforeEach } from 'vitest'
import { vi } from 'vitest'

// Analytics calculation utilities
class AnalyticsCalculator {
  static calculateChurnRate(totalCustomers: number, churnedCustomers: number): number {
    if (totalCustomers === 0) return 0
    return (churnedCustomers / totalCustomers) * 100
  }

  static calculateCustomerLifetimeValue(
    averageOrderValue: number,
    purchaseFrequency: number,
    customerLifespan: number
  ): number {
    return averageOrderValue * purchaseFrequency * customerLifespan
  }

  static calculateAverageOrderValue(totalRevenue: number, totalOrders: number): number {
    if (totalOrders === 0) return 0
    return totalRevenue / totalOrders
  }

  static calculateGrowthRate(currentValue: number, previousValue: number): number {
    if (previousValue === 0) return currentValue > 0 ? 100 : 0
    return ((currentValue - previousValue) / previousValue) * 100
  }

  static calculateRetentionRate(
    customersAtStart: number,
    customersAtEnd: number,
    newCustomers: number
  ): number {
    if (customersAtStart === 0) return 0
    return ((customersAtEnd - newCustomers) / customersAtStart) * 100
  }

  static calculateConversionRate(conversions: number, totalVisitors: number): number {
    if (totalVisitors === 0) return 0
    return (conversions / totalVisitors) * 100
  }

  static calculateInventoryTurnover(costOfGoodsSold: number, averageInventory: number): number {
    if (averageInventory === 0) return 0
    return costOfGoodsSold / averageInventory
  }

  static calculateGrossMargin(revenue: number, costOfGoodsSold: number): number {
    if (revenue === 0) return 0
    return ((revenue - costOfGoodsSold) / revenue) * 100
  }

  static calculateCustomerAcquisitionCost(
    marketingSpend: number,
    newCustomersAcquired: number
  ): number {
    if (newCustomersAcquired === 0) return 0
    return marketingSpend / newCustomersAcquired
  }

  static calculateDeliveryPerformance(
    onTimeDeliveries: number,
    totalDeliveries: number
  ): number {
    if (totalDeliveries === 0) return 0
    return (onTimeDeliveries / totalDeliveries) * 100
  }

  static calculateQualityScore(
    acceptedItems: number,
    totalItems: number
  ): number {
    if (totalItems === 0) return 0
    return (acceptedItems / totalItems) * 10 // Scale to 0-10
  }

  static calculateSeasonalTrend(monthlyData: number[]): {
    trend: 'increasing' | 'decreasing' | 'stable'
    seasonality: number
    volatility: number
  } {
    if (monthlyData.length < 2) {
      return { trend: 'stable', seasonality: 0, volatility: 0 }
    }

    // Calculate trend
    const firstHalf = monthlyData.slice(0, Math.floor(monthlyData.length / 2))
    const secondHalf = monthlyData.slice(Math.floor(monthlyData.length / 2))
    
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    const trendThreshold = 0.05 // 5% threshold
    
    if (secondHalfAvg > firstHalfAvg * (1 + trendThreshold)) {
      trend = 'increasing'
    } else if (secondHalfAvg < firstHalfAvg * (1 - trendThreshold)) {
      trend = 'decreasing'
    }

    // Calculate seasonality (coefficient of variation)
    const mean = monthlyData.reduce((sum, val) => sum + val, 0) / monthlyData.length
    const variance = monthlyData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / monthlyData.length
    const standardDeviation = Math.sqrt(variance)
    const seasonality = mean > 0 ? (standardDeviation / mean) * 100 : 0

    // Calculate volatility (standard deviation as percentage of mean)
    const volatility = seasonality

    return { trend, seasonality, volatility }
  }

  static aggregateMetricsByPeriod(
    data: Array<{ date: Date; value: number }>,
    period: 'daily' | 'weekly' | 'monthly'
  ): Array<{ period: string; value: number; count: number }> {
    const grouped = new Map<string, { sum: number; count: number }>()

    data.forEach(item => {
      let key: string
      
      switch (period) {
        case 'daily':
          key = item.date.toISOString().split('T')[0]
          break
        case 'weekly':
          const weekStart = new Date(item.date)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'monthly':
          key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`
          break
        default:
          key = item.date.toISOString().split('T')[0]
      }

      if (!grouped.has(key)) {
        grouped.set(key, { sum: 0, count: 0 })
      }
      
      const existing = grouped.get(key)!
      existing.sum += item.value
      existing.count += 1
    })

    return Array.from(grouped.entries()).map(([period, data]) => ({
      period,
      value: data.sum,
      count: data.count
    })).sort((a, b) => a.period.localeCompare(b.period))
  }

  static calculatePercentileRank(value: number, dataset: number[]): number {
    if (dataset.length === 0) return 0
    
    const sortedData = [...dataset].sort((a, b) => a - b)
    const rank = sortedData.filter(x => x <= value).length
    return (rank / sortedData.length) * 100
  }

  static calculateMovingAverage(data: number[], windowSize: number): number[] {
    if (windowSize <= 0 || windowSize > data.length) return []
    
    const result: number[] = []
    
    for (let i = windowSize - 1; i < data.length; i++) {
      const window = data.slice(i - windowSize + 1, i + 1)
      const average = window.reduce((sum, val) => sum + val, 0) / windowSize
      result.push(average)
    }
    
    return result
  }

  static detectAnomalies(
    data: number[],
    threshold: number = 2
  ): Array<{ index: number; value: number; zscore: number }> {
    if (data.length < 3) return []
    
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    const standardDeviation = Math.sqrt(variance)
    
    if (standardDeviation === 0) return []
    
    const anomalies: Array<{ index: number; value: number; zscore: number }> = []
    
    data.forEach((value, index) => {
      const zscore = Math.abs((value - mean) / standardDeviation)
      if (zscore > threshold) {
        anomalies.push({ index, value, zscore })
      }
    })
    
    return anomalies
  }
}

describe('Analytics Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Customer Metrics', () => {
    it('should calculate churn rate correctly', () => {
      expect(AnalyticsCalculator.calculateChurnRate(1000, 50)).toBe(5)
      expect(AnalyticsCalculator.calculateChurnRate(100, 3)).toBe(3)
      expect(AnalyticsCalculator.calculateChurnRate(0, 0)).toBe(0)
    })

    it('should calculate customer lifetime value', () => {
      // AOV: $50, Frequency: 12 times/year, Lifespan: 3 years
      expect(AnalyticsCalculator.calculateCustomerLifetimeValue(50, 12, 3)).toBe(1800)
      expect(AnalyticsCalculator.calculateCustomerLifetimeValue(100, 6, 2)).toBe(1200)
      expect(AnalyticsCalculator.calculateCustomerLifetimeValue(0, 12, 3)).toBe(0)
    })

    it('should calculate average order value', () => {
      expect(AnalyticsCalculator.calculateAverageOrderValue(10000, 100)).toBe(100)
      expect(AnalyticsCalculator.calculateAverageOrderValue(5000, 50)).toBe(100)
      expect(AnalyticsCalculator.calculateAverageOrderValue(1000, 0)).toBe(0)
    })

    it('should calculate retention rate', () => {
      // Started with 100, ended with 110, gained 20 new customers
      expect(AnalyticsCalculator.calculateRetentionRate(100, 110, 20)).toBe(90)
      expect(AnalyticsCalculator.calculateRetentionRate(50, 45, 5)).toBe(80)
      expect(AnalyticsCalculator.calculateRetentionRate(0, 10, 10)).toBe(0)
    })

    it('should calculate conversion rate', () => {
      expect(AnalyticsCalculator.calculateConversionRate(50, 1000)).toBe(5)
      expect(AnalyticsCalculator.calculateConversionRate(25, 500)).toBe(5)
      expect(AnalyticsCalculator.calculateConversionRate(10, 0)).toBe(0)
    })

    it('should calculate customer acquisition cost', () => {
      expect(AnalyticsCalculator.calculateCustomerAcquisitionCost(5000, 100)).toBe(50)
      expect(AnalyticsCalculator.calculateCustomerAcquisitionCost(2500, 50)).toBe(50)
      expect(AnalyticsCalculator.calculateCustomerAcquisitionCost(1000, 0)).toBe(0)
    })
  })

  describe('Growth and Trend Calculations', () => {
    it('should calculate growth rate correctly', () => {
      expect(AnalyticsCalculator.calculateGrowthRate(110, 100)).toBe(10)
      expect(AnalyticsCalculator.calculateGrowthRate(90, 100)).toBe(-10)
      expect(AnalyticsCalculator.calculateGrowthRate(100, 0)).toBe(100)
      expect(AnalyticsCalculator.calculateGrowthRate(0, 0)).toBe(0)
    })

    it('should detect seasonal trends', () => {
      const increasingData = [100, 110, 120, 130, 140, 150]
      const decreasingData = [150, 140, 130, 120, 110, 100]
      const stableData = [100, 102, 98, 101, 99, 100]

      expect(AnalyticsCalculator.calculateSeasonalTrend(increasingData).trend).toBe('increasing')
      expect(AnalyticsCalculator.calculateSeasonalTrend(decreasingData).trend).toBe('decreasing')
      expect(AnalyticsCalculator.calculateSeasonalTrend(stableData).trend).toBe('stable')
    })

    it('should calculate seasonality and volatility', () => {
      const volatileData = [100, 200, 50, 300, 25, 250]
      const stableData = [100, 101, 99, 102, 98, 100]

      const volatileResult = AnalyticsCalculator.calculateSeasonalTrend(volatileData)
      const stableResult = AnalyticsCalculator.calculateSeasonalTrend(stableData)

      expect(volatileResult.volatility).toBeGreaterThan(stableResult.volatility)
      expect(volatileResult.seasonality).toBeGreaterThan(stableResult.seasonality)
    })

    it('should handle edge cases for trend calculation', () => {
      expect(AnalyticsCalculator.calculateSeasonalTrend([]).trend).toBe('stable')
      expect(AnalyticsCalculator.calculateSeasonalTrend([100]).trend).toBe('stable')
    })
  })

  describe('Financial Metrics', () => {
    it('should calculate gross margin', () => {
      expect(AnalyticsCalculator.calculateGrossMargin(1000, 600)).toBe(40)
      expect(AnalyticsCalculator.calculateGrossMargin(500, 300)).toBe(40)
      expect(AnalyticsCalculator.calculateGrossMargin(0, 100)).toBe(0)
    })

    it('should calculate inventory turnover', () => {
      expect(AnalyticsCalculator.calculateInventoryTurnover(120000, 10000)).toBe(12)
      expect(AnalyticsCalculator.calculateInventoryTurnover(60000, 5000)).toBe(12)
      expect(AnalyticsCalculator.calculateInventoryTurnover(50000, 0)).toBe(0)
    })
  })

  describe('Operations Metrics', () => {
    it('should calculate delivery performance', () => {
      expect(AnalyticsCalculator.calculateDeliveryPerformance(95, 100)).toBe(95)
      expect(AnalyticsCalculator.calculateDeliveryPerformance(190, 200)).toBe(95)
      expect(AnalyticsCalculator.calculateDeliveryPerformance(50, 0)).toBe(0)
    })

    it('should calculate quality score', () => {
      expect(AnalyticsCalculator.calculateQualityScore(95, 100)).toBe(9.5)
      expect(AnalyticsCalculator.calculateQualityScore(85, 100)).toBe(8.5)
      expect(AnalyticsCalculator.calculateQualityScore(100, 0)).toBe(0)
    })
  })

  describe('Data Aggregation', () => {
    it('should aggregate metrics by period', () => {
      const testData = [
        { date: new Date('2024-01-01'), value: 100 },
        { date: new Date('2024-01-01'), value: 150 },
        { date: new Date('2024-01-02'), value: 200 },
        { date: new Date('2024-01-03'), value: 120 }
      ]

      const dailyAgg = AnalyticsCalculator.aggregateMetricsByPeriod(testData, 'daily')
      expect(dailyAgg).toHaveLength(3)
      expect(dailyAgg[0]).toEqual({
        period: '2024-01-01',
        value: 250,
        count: 2
      })
      expect(dailyAgg[1]).toEqual({
        period: '2024-01-02',
        value: 200,
        count: 1
      })
    })

    it('should aggregate by weekly periods', () => {
      const testData = [
        { date: new Date('2024-01-01'), value: 100 }, // Monday
        { date: new Date('2024-01-02'), value: 150 }, // Tuesday
        { date: new Date('2024-01-08'), value: 200 }  // Next Monday
      ]

      const weeklyAgg = AnalyticsCalculator.aggregateMetricsByPeriod(testData, 'weekly')
      expect(weeklyAgg).toHaveLength(2)
      expect(weeklyAgg[0].value).toBe(250) // First week total
      expect(weeklyAgg[1].value).toBe(200) // Second week total
    })

    it('should aggregate by monthly periods', () => {
      const testData = [
        { date: new Date('2024-01-15'), value: 100 },
        { date: new Date('2024-01-20'), value: 150 },
        { date: new Date('2024-02-10'), value: 200 }
      ]

      const monthlyAgg = AnalyticsCalculator.aggregateMetricsByPeriod(testData, 'monthly')
      expect(monthlyAgg).toHaveLength(2)
      expect(monthlyAgg[0]).toEqual({
        period: '2024-01',
        value: 250,
        count: 2
      })
      expect(monthlyAgg[1]).toEqual({
        period: '2024-02',
        value: 200,
        count: 1
      })
    })
  })

  describe('Statistical Analysis', () => {
    it('should calculate percentile rank', () => {
      const dataset = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      
      expect(AnalyticsCalculator.calculatePercentileRank(50, dataset)).toBe(50)
      expect(AnalyticsCalculator.calculatePercentileRank(25, dataset)).toBe(20)
      expect(AnalyticsCalculator.calculatePercentileRank(100, dataset)).toBe(100)
      expect(AnalyticsCalculator.calculatePercentileRank(5, dataset)).toBe(0)
    })

    it('should calculate moving average', () => {
      const data = [10, 20, 30, 40, 50]
      const movingAvg3 = AnalyticsCalculator.calculateMovingAverage(data, 3)
      
      expect(movingAvg3).toHaveLength(3)
      expect(movingAvg3[0]).toBe(20) // (10+20+30)/3
      expect(movingAvg3[1]).toBe(30) // (20+30+40)/3
      expect(movingAvg3[2]).toBe(40) // (30+40+50)/3
    })

    it('should handle edge cases for moving average', () => {
      expect(AnalyticsCalculator.calculateMovingAverage([1, 2, 3], 0)).toEqual([])
      expect(AnalyticsCalculator.calculateMovingAverage([1, 2, 3], 5)).toEqual([])
      expect(AnalyticsCalculator.calculateMovingAverage([], 3)).toEqual([])
    })

    it('should detect anomalies in data', () => {
      const normalData = [10, 12, 11, 13, 9, 10, 11, 12]
      const dataWithAnomaly = [10, 12, 11, 100, 9, 10, 11, 12] // 100 is an anomaly
      
      const normalAnomalies = AnalyticsCalculator.detectAnomalies(normalData, 2)
      const anomaliesDetected = AnalyticsCalculator.detectAnomalies(dataWithAnomaly, 2)
      
      expect(normalAnomalies).toHaveLength(0)
      expect(anomaliesDetected).toHaveLength(1)
      expect(anomaliesDetected[0].index).toBe(3)
      expect(anomaliesDetected[0].value).toBe(100)
    })

    it('should handle edge cases for anomaly detection', () => {
      expect(AnalyticsCalculator.detectAnomalies([], 2)).toEqual([])
      expect(AnalyticsCalculator.detectAnomalies([1, 2], 2)).toEqual([])
      expect(AnalyticsCalculator.detectAnomalies([5, 5, 5, 5], 2)).toEqual([]) // No variance
    })
  })

  describe('Integration Tests', () => {
    it('should calculate comprehensive customer analytics', () => {
      const customerData = {
        totalCustomers: 1000,
        churnedCustomers: 30,
        totalRevenue: 50000,
        totalOrders: 500,
        newCustomers: 80,
        marketingSpend: 4000
      }

      const churnRate = AnalyticsCalculator.calculateChurnRate(
        customerData.totalCustomers, 
        customerData.churnedCustomers
      )
      const aov = AnalyticsCalculator.calculateAverageOrderValue(
        customerData.totalRevenue, 
        customerData.totalOrders
      )
      const cac = AnalyticsCalculator.calculateCustomerAcquisitionCost(
        customerData.marketingSpend, 
        customerData.newCustomers
      )
      const clv = AnalyticsCalculator.calculateCustomerLifetimeValue(aov, 12, 2)

      expect(churnRate).toBe(3)
      expect(aov).toBe(100)
      expect(cac).toBe(50)
      expect(clv).toBe(2400)
    })

    it('should calculate farmer performance metrics', () => {
      const farmerData = {
        totalDeliveries: 100,
        onTimeDeliveries: 95,
        totalItems: 1000,
        acceptedItems: 950,
        previousMonthDeliveries: 90
      }

      const deliveryPerformance = AnalyticsCalculator.calculateDeliveryPerformance(
        farmerData.onTimeDeliveries,
        farmerData.totalDeliveries
      )
      const qualityScore = AnalyticsCalculator.calculateQualityScore(
        farmerData.acceptedItems,
        farmerData.totalItems
      )
      const growthRate = AnalyticsCalculator.calculateGrowthRate(
        farmerData.totalDeliveries,
        farmerData.previousMonthDeliveries
      )

      expect(deliveryPerformance).toBe(95)
      expect(qualityScore).toBe(9.5)
      expect(growthRate).toBeCloseTo(11.11, 2)
    })

    it('should process time series data for trends', () => {
      const monthlyRevenue = [
        { date: new Date('2024-01-01'), value: 10000 },
        { date: new Date('2024-02-01'), value: 12000 },
        { date: new Date('2024-03-01'), value: 11000 },
        { date: new Date('2024-04-01'), value: 15000 },
        { date: new Date('2024-05-01'), value: 14000 },
        { date: new Date('2024-06-01'), value: 18000 }
      ]

      const monthlyAgg = AnalyticsCalculator.aggregateMetricsByPeriod(monthlyRevenue, 'monthly')
      const revenueValues = monthlyAgg.map(item => item.value)
      const trend = AnalyticsCalculator.calculateSeasonalTrend(revenueValues)
      const movingAvg = AnalyticsCalculator.calculateMovingAverage(revenueValues, 3)

      expect(monthlyAgg).toHaveLength(6)
      expect(trend.trend).toBe('increasing')
      expect(movingAvg).toHaveLength(4)
      expect(movingAvg[0]).toBe(11000) // Average of first 3 months
    })
  })

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => i + 1)
      
      const startTime = Date.now()
      const percentile = AnalyticsCalculator.calculatePercentileRank(5000, largeDataset)
      const movingAvg = AnalyticsCalculator.calculateMovingAverage(largeDataset, 100)
      const anomalies = AnalyticsCalculator.detectAnomalies(largeDataset.slice(0, 1000), 3)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
      expect(percentile).toBeCloseTo(50, 1)
      expect(movingAvg.length).toBe(9901)
      expect(anomalies.length).toBe(0) // Sequential data should have no anomalies
    })

    it('should handle edge cases gracefully', () => {
      // Test with empty arrays
      expect(AnalyticsCalculator.calculateMovingAverage([], 5)).toEqual([])
      expect(AnalyticsCalculator.detectAnomalies([], 2)).toEqual([])
      expect(AnalyticsCalculator.aggregateMetricsByPeriod([], 'daily')).toEqual([])

      // Test with zero values
      expect(AnalyticsCalculator.calculateChurnRate(0, 0)).toBe(0)
      expect(AnalyticsCalculator.calculateAverageOrderValue(0, 0)).toBe(0)
      expect(AnalyticsCalculator.calculateGrossMargin(0, 0)).toBe(0)

      // Test with negative values
      expect(AnalyticsCalculator.calculateGrowthRate(80, 100)).toBe(-20)
      expect(AnalyticsCalculator.calculateGrossMargin(100, 120)).toBe(-20)
    })
  })
})

// Export for use in other tests
export { AnalyticsCalculator }