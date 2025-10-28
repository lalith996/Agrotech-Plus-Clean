import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (session.user.role !== UserRole.FARMER) {
    return res.status(403).json({ message: "Access denied" })
  }

  if (req.method === "GET") {
    try {
      const farmer = await prisma.farmer.findUnique({
        where: { userId: session.user.id },
      })

      if (!farmer) {
        return res.status(404).json({ message: "Farmer profile not found" })
      }

      // Check approval status
      if (!farmer.isApproved) {
        return res.status(200).json({
          isApproved: false,
          message: "Your farmer account is pending approval. You will receive an email once approved."
        })
      }

      // Get current date for calculations
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      // Fetch upcoming deliveries (next 7 days)
      const upcomingDeliveries = await prisma.farmerDelivery.findMany({
        where: {
          farmerId: farmer.id,
          deliveryDate: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { deliveryDate: "asc" }
      })

      // Fetch QC results for quality score calculation (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const qcResults = await prisma.qCResult.findMany({
        where: {
          farmerId: farmer.id,
          timestamp: { gte: thirtyDaysAgo }
        },
        orderBy: { timestamp: "desc" }
      })

      // Calculate quality score
      const calculateQualityScore = (results: typeof qcResults) => {
        if (results.length === 0) return 0
        const scores = results.map(result => {
          const total = result.acceptedQuantity + result.rejectedQuantity
          return total > 0 ? (result.acceptedQuantity / total) * 100 : 0
        })
        return scores.reduce((sum, score) => sum + score, 0) / scores.length
      }

      const currentQualityScore = calculateQualityScore(qcResults.slice(0, 10))
      const previousQualityScore = calculateQualityScore(qcResults.slice(10, 20))
      
      let qualityTrend: 'up' | 'down' | 'stable' = 'stable'
      if (currentQualityScore > previousQualityScore + 2) qualityTrend = 'up'
      else if (currentQualityScore < previousQualityScore - 2) qualityTrend = 'down'

      // Group QC results by date for history
      const qualityHistory = qcResults.reduce((acc, result) => {
        const date = result.timestamp.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { total: 0, accepted: 0, rejected: 0 }
        }
        acc[date].total += result.acceptedQuantity + result.rejectedQuantity
        acc[date].accepted += result.acceptedQuantity
        acc[date].rejected += result.rejectedQuantity
        return acc
      }, {} as Record<string, { total: number; accepted: number; rejected: number }>)

      const qualityHistoryArray = Object.entries(qualityHistory).map(([date, data]) => ({
        date,
        score: data.total > 0 ? (data.accepted / data.total) * 100 : 0
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Calculate revenue
      const [todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
        prisma.orderItem.aggregate({
          where: {
            product: { farmerId: farmer.id },
            order: {
              createdAt: { gte: startOfToday },
              status: { in: ["DELIVERED", "CONFIRMED", "PICKED", "ORDER_IN_TRANSIT"] }
            }
          },
          _sum: { price: true }
        }),
        prisma.orderItem.aggregate({
          where: {
            product: { farmerId: farmer.id },
            order: {
              createdAt: { gte: startOfWeek },
              status: { in: ["DELIVERED", "CONFIRMED", "PICKED", "ORDER_IN_TRANSIT"] }
            }
          },
          _sum: { price: true }
        }),
        prisma.orderItem.aggregate({
          where: {
            product: { farmerId: farmer.id },
            order: {
              createdAt: { gte: startOfMonth },
              status: { in: ["DELIVERED", "CONFIRMED", "PICKED", "ORDER_IN_TRANSIT"] }
            }
          },
          _sum: { price: true }
        })
      ])

      // Get farmer's products for demand forecast (placeholder until ML is implemented)
      const products = await prisma.product.findMany({
        where: { farmerId: farmer.id, isActive: true },
        take: 5
      })

      // Generate simple demand forecast based on historical averages (placeholder)
      const demandForecast = await Promise.all(
        products.map(async (product) => {
          const historicalOrders = await prisma.orderItem.aggregate({
            where: {
              productId: product.id,
              order: {
                createdAt: { gte: startOfMonth },
                status: { in: ["DELIVERED", "CONFIRMED", "PICKED", "ORDER_IN_TRANSIT"] }
              }
            },
            _sum: { quantity: true }
          })

          const avgDailyDemand = (historicalOrders._sum.quantity || 0) / 30
          
          return Array.from({ length: 7 }, (_, i) => ({
            productId: product.id,
            productName: product.name,
            quantity: Math.round(avgDailyDemand * (1 + (Math.random() * 0.2 - 0.1))), // ±10% variation
            date: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            confidence: 0.75 // Placeholder confidence
          }))
        })
      )

      // Generate alerts
      const alerts = []
      
      // Low quality score alert
      if (currentQualityScore < 80 && qcResults.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Quality Score Below Target',
          message: `Your quality score is ${currentQualityScore.toFixed(1)}%. Aim for 80% or higher.`,
          timestamp: now.toISOString()
        })
      }

      // Upcoming delivery alert
      const upcomingDeliveryToday = upcomingDeliveries.filter(d => 
        new Date(d.deliveryDate).toDateString() === now.toDateString()
      )
      if (upcomingDeliveryToday.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Delivery Scheduled Today',
          message: `You have ${upcomingDeliveryToday.length} delivery scheduled for today.`,
          timestamp: now.toISOString()
        })
      }

      const dashboard = {
        isApproved: true,
        upcomingDeliveries: upcomingDeliveries.map(delivery => ({
          id: delivery.id,
          deliveryDate: delivery.deliveryDate.toISOString(),
          status: delivery.status,
          notes: delivery.notes
        })),
        demandForecast: demandForecast.flat(),
        qualityScore: {
          current: Math.round(currentQualityScore * 10) / 10,
          trend: qualityTrend,
          history: qualityHistoryArray
        },
        revenue: {
          today: (todayRevenue._sum.price || 0) * 0.6, // Farmer gets 60%
          week: (weekRevenue._sum.price || 0) * 0.6,
          month: (monthRevenue._sum.price || 0) * 0.6
        },
        alerts
      }

      res.status(200).json(dashboard)
    } catch (error) {
      console.error("Farmer dashboard error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}