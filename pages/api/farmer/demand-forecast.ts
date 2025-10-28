import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mlClient, DemandForecastResponse } from "@/lib/ml-client"
import { UserRole } from "@prisma/client"

/**
 * Demand Forecast API
 * 
 * GET /api/farmer/demand-forecast
 * 
 * Returns 7-day demand predictions for farmer's products.
 * Uses ML service for time series predictions with fallback to moving average.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Only farmers can get demand forecasts
  if (session.user.role !== UserRole.FARMER) {
    return res.status(403).json({ message: "Access denied" })
  }

  try {
    const { days = 7 } = req.query

    // Get farmer profile
    const farmer = await prisma.farmer.findUnique({
      where: { userId: session.user.id },
    })

    if (!farmer) {
      return res.status(404).json({ message: "Farmer profile not found" })
    }

    // Check if farmer is approved
    if (!farmer.isApproved) {
      return res.status(403).json({ 
        message: "Your account is pending approval. Demand forecasts will be available once approved." 
      })
    }

    // Get farmer's active products
    const products = await prisma.product.findMany({
      where: { 
        farmerId: farmer.id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        unit: true
      }
    })

    if (products.length === 0) {
      return res.status(200).json({
        forecasts: [],
        accuracy: 0,
        message: "No active products found. Add products to see demand forecasts."
      })
    }

    const productIds = products.map(p => p.id)

    // Define fallback function for moving average calculation
    const getMovingAverageForecast = async (): Promise<DemandForecastResponse> => {
      const forecastDays = parseInt(days as string) || 7
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Calculate historical averages for each product
      const forecasts = await Promise.all(
        products.map(async (product) => {
          // Get historical order data for last 30 days
          const historicalOrders = await prisma.orderItem.findMany({
            where: {
              productId: product.id,
              order: {
                createdAt: { gte: thirtyDaysAgo },
                status: { 
                  in: ["DELIVERED", "CONFIRMED", "PICKED", "ORDER_IN_TRANSIT"] 
                }
              }
            },
            select: {
              quantity: true,
              order: {
                select: {
                  createdAt: true
                }
              }
            }
          })

          // Calculate daily average
          const totalQuantity = historicalOrders.reduce(
            (sum, item) => sum + item.quantity, 
            0
          )
          const avgDailyDemand = historicalOrders.length > 0 
            ? totalQuantity / 30 
            : 0

          // Generate predictions with slight variation (±10%)
          const predictions = Array.from({ length: forecastDays }, (_, i) => {
            const variation = 1 + (Math.random() * 0.2 - 0.1) // ±10%
            const quantity = Math.max(0, Math.round(avgDailyDemand * variation))
            const forecastDate = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
            
            return {
              date: forecastDate.toISOString().split('T')[0],
              quantity,
              confidence: historicalOrders.length > 5 ? 0.75 : 0.5 // Lower confidence with less data
            }
          })

          return {
            productId: product.id,
            productName: product.name,
            predictions
          }
        })
      )

      // Calculate overall accuracy based on data availability
      const totalHistoricalData = forecasts.reduce((sum, f) => 
        sum + f.predictions[0].confidence, 0
      )
      const accuracy = forecasts.length > 0 
        ? totalHistoricalData / forecasts.length 
        : 0

      return {
        forecasts,
        accuracy
      }
    }

    // Call ML service for demand forecast
    const mlResponse = await mlClient.getDemandForecast(
      {
        farmerId: farmer.id,
        productIds,
        days: parseInt(days as string) || 7
      },
      getMovingAverageForecast
    )

    if (!mlResponse.success || !mlResponse.data) {
      // If ML service fails completely, use fallback
      const fallbackData = await getMovingAverageForecast()
      
      return res.status(200).json({
        forecasts: fallbackData.forecasts,
        accuracy: fallbackData.accuracy,
        cached: false,
        fallback: true,
        message: "Using historical average (ML service unavailable)"
      })
    }

    // Return ML predictions
    res.status(200).json({
      forecasts: mlResponse.data.forecasts,
      accuracy: mlResponse.data.accuracy,
      cached: mlResponse.cached || false,
      fallback: mlResponse.fallback || false,
      message: mlResponse.fallback 
        ? "Using historical average (ML service unavailable)" 
        : undefined
    })
  } catch (error) {
    console.error("Demand forecast API error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}
