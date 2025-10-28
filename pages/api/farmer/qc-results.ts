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

      const { limit = "30", days = "30" } = req.query

      // Calculate date range
      const now = new Date()
      const daysAgo = new Date(now.getTime() - parseInt(days as string) * 24 * 60 * 60 * 1000)

      // Fetch QC results for this farmer
      const qcResults = await prisma.qCResult.findMany({
        where: {
          farmerId: farmer.id,
          timestamp: { gte: daysAgo }
        },
        include: {
          product: {
            select: {
              name: true,
              unit: true
            }
          }
        },
        orderBy: { timestamp: "desc" },
        take: parseInt(limit as string)
      })

      // Calculate quality score trend
      const calculateQualityScore = (results: typeof qcResults) => {
        if (results.length === 0) return 0
        const scores = results.map(result => {
          const total = result.acceptedQuantity + result.rejectedQuantity
          return total > 0 ? (result.acceptedQuantity / total) * 100 : 0
        })
        return scores.reduce((sum, score) => sum + score, 0) / scores.length
      }

      // Split results into current and previous periods for trend calculation
      const midpoint = Math.floor(qcResults.length / 2)
      const currentResults = qcResults.slice(0, midpoint)
      const previousResults = qcResults.slice(midpoint)

      const currentScore = calculateQualityScore(currentResults)
      const previousScore = calculateQualityScore(previousResults)

      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (currentScore > previousScore + 2) trend = 'up'
      else if (currentScore < previousScore - 2) trend = 'down'

      // Group QC results by date for trend chart
      const qualityTrend = qcResults.reduce((acc, result) => {
        const date = result.timestamp.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { total: 0, accepted: 0, rejected: 0 }
        }
        acc[date].total += result.acceptedQuantity + result.rejectedQuantity
        acc[date].accepted += result.acceptedQuantity
        acc[date].rejected += result.rejectedQuantity
        return acc
      }, {} as Record<string, { total: number; accepted: number; rejected: number }>)

      const trendData = Object.entries(qualityTrend)
        .map(([date, data]) => ({
          date,
          score: data.total > 0 ? (data.accepted / data.total) * 100 : 0,
          acceptedQuantity: data.accepted,
          rejectedQuantity: data.rejected,
          totalQuantity: data.total
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Format recent QC results
      const recentResults = qcResults.map(result => {
        const total = result.acceptedQuantity + result.rejectedQuantity
        const passRate = total > 0 ? (result.acceptedQuantity / total) * 100 : 0
        
        return {
          id: result.id,
          productName: result.product.name,
          unit: result.product.unit,
          expectedQuantity: result.expectedQuantity,
          acceptedQuantity: result.acceptedQuantity,
          rejectedQuantity: result.rejectedQuantity,
          passRate: Math.round(passRate * 10) / 10,
          status: passRate >= 90 ? 'pass' : passRate >= 70 ? 'warning' : 'fail',
          rejectionReasons: result.rejectionReasons,
          timestamp: result.timestamp.toISOString(),
          notes: result.notes
        }
      })

      res.status(200).json({
        qualityScore: {
          current: Math.round(currentScore * 10) / 10,
          previous: Math.round(previousScore * 10) / 10,
          trend
        },
        trendData,
        recentResults,
        summary: {
          totalInspections: qcResults.length,
          averagePassRate: Math.round(currentScore * 10) / 10,
          totalAccepted: qcResults.reduce((sum, r) => sum + r.acceptedQuantity, 0),
          totalRejected: qcResults.reduce((sum, r) => sum + r.rejectedQuantity, 0)
        }
      })
    } catch (error) {
      console.error("QC results error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}
