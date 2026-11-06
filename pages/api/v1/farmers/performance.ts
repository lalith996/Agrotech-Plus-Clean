import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withErrorHandling, requireRole } from '@/lib/api-auth'
import { UserRole } from '@prisma/client'
import { metricsCollector } from '@/lib/performance'

// Query params: farmer_id (optional), tier_filter (optional), top_n (optional)
const querySchema = z.object({
  farmer_id: z.string().optional(),
  tier_filter: z.string().optional(),
  top_n: z.string().optional(),
  segmentation: z.enum(['heuristic','kmeans']).optional(),
})

// Weights from the feature spec
const WEIGHTS = {
  quality_consistency: 0.30,
  delivery_reliability: 0.20,
  volume_fulfillment: 0.15,
  sustainability: 0.15,
  customer_feedback: 0.20,
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function toPercent(v: number): number {
  return clamp(Math.round(v * 100), 0, 100)
}

type MetricBreakdown = {
  quality_consistency: number
  delivery_reliability: number
  volume_fulfillment: number
  sustainability: number
  customer_feedback: number
}

type FarmerPerformance = {
  farmer_id: string
  performance_score: number
  tier: string
  metric_breakdown: MetricBreakdown
  rank?: number
  trend: 'improving' | 'stable' | 'declining'
}

async function getAcceptanceRatesPerDelivery(farmerId: string): Promise<number[]> {
  const deliveries = await prisma.farmerDelivery.findMany({
    where: { farmerId },
    select: { id: true },
    orderBy: { deliveryDate: 'asc' },
  })
  if (!deliveries.length) return []

  const rates: number[] = []
  for (const d of deliveries) {
    const qs = await prisma.qCResult.findMany({
      where: { farmerDeliveryId: d.id },
      select: { expectedQuantity: true, acceptedQuantity: true },
    })
    if (!qs.length) {
      continue
    }
    const expected = qs.reduce((acc, r) => acc + (r.expectedQuantity || 0), 0)
    const accepted = qs.reduce((acc, r) => acc + (r.acceptedQuantity || 0), 0)
    const rate = expected > 0 ? accepted / expected : 0
    rates.push(rate)
  }
  return rates
}

function computeTrend(rates: number[]): 'improving' | 'stable' | 'declining' {
  if (!rates.length) return 'stable'
  const n = rates.length
  const lastWindow = rates.slice(Math.max(0, n - 3))
  const prevWindow = rates.slice(Math.max(0, n - 6), Math.max(0, n - 3))
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
  const lastAvg = avg(lastWindow)
  const prevAvg = avg(prevWindow)
  const delta = lastAvg - prevAvg
  if (delta > 0.05) return 'improving'
  if (delta < -0.05) return 'declining'
  return 'stable'
}

function computeTier(score: number): string {
  if (score >= 85) return 'Tier 1'
  if (score >= 70) return 'Tier 2'
  if (score >= 55) return 'Tier 3'
  return 'Tier 4'
}

// K-Means clustering for tier segmentation
type SegmentationMode = 'heuristic' | 'kmeans'

function squaredDistance(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] - b[i])
    s += d * d
  }
  return s
}

function kMeans(data: number[][], k: number, maxIter: number = 50): { assignments: number[]; centroids: number[][] } {
  // Initialize centroids with first k points (simple, deterministic)
  const centroids = data.slice(0, k).map(v => v.slice())
  let assignments = new Array(data.length).fill(0)

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign step
    for (let i = 0; i < data.length; i++) {
      let best = 0
      let bestDist = Infinity
      for (let c = 0; c < centroids.length; c++) {
        const dist = squaredDistance(data[i], centroids[c])
        if (dist < bestDist) {
          bestDist = dist
          best = c
        }
      }
      assignments[i] = best
    }

    // Update step
    const newCentroids: number[][] = Array.from({ length: k }, () => new Array(data[0].length).fill(0))
    const counts: number[] = new Array(k).fill(0)

    for (let i = 0; i < data.length; i++) {
      const a = assignments[i]
      counts[a] += 1
      const v = data[i]
      for (let j = 0; j < v.length; j++) {
        newCentroids[a][j] += v[j]
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) {
        // Reinitialize empty cluster centroid to a random data point
        newCentroids[c] = data[Math.floor(Math.random() * data.length)].slice()
        continue
      }
      for (let j = 0; j < newCentroids[c].length; j++) {
        newCentroids[c][j] /= counts[c]
      }
    }

    // Check convergence (optional): here we simply replace
    centroids.splice(0, centroids.length, ...newCentroids)
  }

  return { assignments, centroids }
}

function buildFeatureVector(b: MetricBreakdown): number[] {
  // Use 0-100 metric values directly for distances
  return [
    b.quality_consistency,
    b.delivery_reliability,
    b.volume_fulfillment,
    b.sustainability,
    b.customer_feedback,
  ]
}

async function computeMetricsForFarmer(farmerId: string): Promise<{ breakdown: MetricBreakdown; capacity: number; qualityVariance: number; trend: 'improving'|'stable'|'declining' }> {
  // QC-based metrics
  const qc = await prisma.qCResult.findMany({
    where: { farmerId },
    select: { expectedQuantity: true, acceptedQuantity: true, rejectedQuantity: true, timestamp: true, farmerDeliveryId: true },
    orderBy: { timestamp: 'asc' },
  })

  let totalExpected = 0
  let totalAccepted = 0
  let totalRejected = 0

  const perDeliveryMap = new Map<string, { expected: number; accepted: number }>()

  for (const r of qc) {
    totalExpected += r.expectedQuantity || 0
    totalAccepted += r.acceptedQuantity || 0
    totalRejected += r.rejectedQuantity || 0
    const key = r.farmerDeliveryId
    const curr = perDeliveryMap.get(key) || { expected: 0, accepted: 0 }
    curr.expected += r.expectedQuantity || 0
    curr.accepted += r.acceptedQuantity || 0
    perDeliveryMap.set(key, curr)
  }

  const acceptanceRates = Array.from(perDeliveryMap.values()).map(v => (v.expected > 0 ? v.accepted / v.expected : 0))
  const avgAcceptance = acceptanceRates.length ? acceptanceRates.reduce((a,b)=>a+b,0)/acceptanceRates.length : 0
  const variance = acceptanceRates.length ? acceptanceRates.reduce((acc, r) => acc + Math.pow(r - avgAcceptance, 2), 0) / acceptanceRates.length : 0

  // Delivery reliability from FarmerDelivery statuses
  const deliveries = await prisma.farmerDelivery.findMany({ where: { farmerId }, select: { status: true } })
  const totalDeliveries = deliveries.length
  const deliveredCount = deliveries.filter(d => d.status?.toLowerCase() === 'delivered').length
  const deliveryReliability = totalDeliveries > 0 ? deliveredCount / totalDeliveries : 0.5 // neutral fallback

  // Volume fulfillment (accepted / expected overall)
  const volumeFulfillment = totalExpected > 0 ? totalAccepted / totalExpected : (totalDeliveries > 0 ? 0.5 : 0)

  // Sustainability (based on certifications; valid/non-expired -> higher score)
  const certs = await prisma.certification.findMany({ where: { farmerId }, select: { expiryDate: true } })
  const now = new Date()
  const validCerts = certs.filter(c => !c.expiryDate || c.expiryDate > now).length
  const sustainabilityRaw = validCerts > 0 ? 0.8 + Math.min(0.2, validCerts * 0.05) : 0.4 // 0-1 scale

  // Customer feedback proxy: repeat purchase rate for products from this farmer
  const orders = await prisma.order.findMany({
    where: {
      items: { some: { product: { farmerId } } },
    },
    include: { items: { include: { product: { select: { farmerId: true } } } }, customer: { select: { id: true } } },
  })
  const purchasesByCustomer = new Map<string, number>()
  for (const o of orders) {
    const containsFarmerProduct = o.items.some(i => i.product.farmerId === farmerId)
    if (!containsFarmerProduct || !o.customer) continue
    const key = o.customer.id
    purchasesByCustomer.set(key, (purchasesByCustomer.get(key) || 0) + 1)
  }
  const customers = Array.from(purchasesByCustomer.values())
  const uniqueCustomers = customers.length
  const repeatCustomers = customers.filter(cnt => cnt >= 2).length
  const repeatRate = uniqueCustomers > 0 ? repeatCustomers / uniqueCustomers : 0
  const customerFeedbackRaw = 0.4 + 0.6 * repeatRate // 0-1 scale

  const breakdown: MetricBreakdown = {
    quality_consistency: toPercent(avgAcceptance),
    delivery_reliability: toPercent(deliveryReliability),
    volume_fulfillment: toPercent(volumeFulfillment),
    sustainability: toPercent(sustainabilityRaw),
    customer_feedback: toPercent(customerFeedbackRaw),
  }

  // Capacity proxy: average accepted quantity per delivery
  const capacity = acceptanceRates.length ? (totalAccepted / acceptanceRates.length) : totalAccepted

  const trend = computeTrend(acceptanceRates)

  return { breakdown, capacity, qualityVariance: variance, trend }
}

function weightedScore(b: MetricBreakdown): number {
  const score = (
    b.quality_consistency * WEIGHTS.quality_consistency +
    b.delivery_reliability * WEIGHTS.delivery_reliability +
    b.volume_fulfillment * WEIGHTS.volume_fulfillment +
    b.sustainability * WEIGHTS.sustainability +
    b.customer_feedback * WEIGHTS.customer_feedback
  )
  return Math.round(score)
}

async function computePerformanceForFarmer(farmerId: string): Promise<FarmerPerformance> {
  const { breakdown, capacity, qualityVariance, trend } = await computeMetricsForFarmer(farmerId)
  const performance_score = weightedScore(breakdown)
  const tier = computeTier(performance_score)
  // rank will be assigned when computing across all farmers
  return { farmer_id: farmerId, performance_score, tier, metric_breakdown: breakdown, trend }
}

async function computeAllFarmers(topN?: number, tierFilter?: string, segmentation?: SegmentationMode): Promise<{ results: FarmerPerformance[] }> {
  const farmers = await prisma.farmer.findMany({ select: { id: true } })
  const results: FarmerPerformance[] = []
  for (const f of farmers) {
    const perf = await computePerformanceForFarmer(f.id)
    results.push(perf)
  }
  // Rank by score
  results.sort((a, b) => b.performance_score - a.performance_score)
  results.forEach((r, idx) => { r.rank = idx + 1 })

  // Apply k-means tiering if requested and enough data
  if (segmentation === 'kmeans' && results.length >= 4) {
    const k = 4
    const data = results.map(r => buildFeatureVector(r.metric_breakdown))
    const { assignments } = kMeans(data, k)

    // Compute avg score per cluster
    const clusterScores: Array<{ cluster: number; avg: number }> = []
    for (let c = 0; c < k; c++) {
      const members = results.filter((_, idx) => assignments[idx] === c)
      const avg = members.length ? members.reduce((acc, m) => acc + m.performance_score, 0) / members.length : -Infinity
      clusterScores.push({ cluster: c, avg })
    }
    // Sort clusters by avg score descending and map to tiers
    const sorted = clusterScores.slice().sort((a, b) => b.avg - a.avg)
    const tierNames = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4']
    const clusterToTier = new Map<number, string>()
    for (let i = 0; i < sorted.length; i++) {
      clusterToTier.set(sorted[i].cluster, tierNames[i] || 'Tier 4')
    }
    // Assign tiers per cluster
    results.forEach((r, idx) => {
      const c = assignments[idx]
      const t = clusterToTier.get(c)
      if (t) r.tier = t
    })
  }

  let filtered = results
  if (tierFilter) {
    filtered = filtered.filter(r => r.tier.toLowerCase() === tierFilter.toLowerCase())
  }
  if (topN && topN > 0) {
    filtered = filtered.slice(0, topN)
  }
  return { results: filtered }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireRole(req, res, [UserRole.ADMIN, UserRole.OPERATIONS])

  const parsed = querySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.flatten() })
  }

  const farmerId = typeof parsed.data.farmer_id === 'string' ? parsed.data.farmer_id : undefined
  const tierFilter = typeof parsed.data.tier_filter === 'string' ? parsed.data.tier_filter : undefined
  const topN = parsed.data.top_n ? parseInt(parsed.data.top_n, 10) : undefined
  const segmentation = parsed.data.segmentation as SegmentationMode | undefined

  const start = performance.now()

  if (farmerId) {
    const perf = await computePerformanceForFarmer(farmerId)

    // Compute rank among all farmers
    const { results } = await computeAllFarmers(undefined, undefined, segmentation)
    const rank = results.find(r => r.farmer_id === farmerId)?.rank

    const duration = performance.now() - start
    metricsCollector.record('farmer_performance_served', 1, {
      duration_ms: duration,
      requester_id: session.user.id,
      role: session.user.role,
    })

    return res.status(200).json({
      farmer_id: perf.farmer_id,
      performance_score: perf.performance_score,
      tier: perf.tier,
      metric_breakdown: perf.metric_breakdown,
      rank: rank || null,
      trend: perf.trend,
    })
  }

  // List mode
  const all = await computeAllFarmers(topN, tierFilter, segmentation)
  const duration = performance.now() - start
  metricsCollector.record('farmer_performance_served', all.results.length, {
    duration_ms: duration,
    requester_id: session.user.id,
    role: session.user.role,
    top_n: topN || null,
    tier_filter: tierFilter || null,
  })

  return res.status(200).json({ results: all.results })
}

export default withErrorHandling(handler)