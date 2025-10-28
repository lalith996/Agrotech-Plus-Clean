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

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OPERATIONS) {
    return res.status(403).json({ message: "Access denied" })
  }

  if (req.method === "GET") {
    try {
      const { days = "7", severity = "all" } = req.query

      // Calculate date range
      const now = new Date()
      const daysAgo = new Date(now.getTime() - parseInt(days as string) * 24 * 60 * 60 * 1000)

      // Fetch QC results with quality issues
      const qcResults = await prisma.qCResult.findMany({
        where: {
          timestamp: { gte: daysAgo },
          rejectedQuantity: { gt: 0 }
        },
        include: {
          product: {
            select: {
              name: true,
              unit: true,
              category: true
            }
          },
          farmer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  city: true
                }
              }
            }
          }
        },
        orderBy: { timestamp: "desc" }
      })

      // Calculate severity and format alerts
      const alerts = qcResults.map(result => {
        const total = result.acceptedQuantity + result.rejectedQuantity
        const rejectionRate = total > 0 ? (result.rejectedQuantity / total) * 100 : 0
        
        let alertSeverity: 'critical' | 'high' | 'medium' | 'low' = 'low'
        if (rejectionRate >= 50) alertSeverity = 'critical'
        else if (rejectionRate >= 30) alertSeverity = 'high'
        else if (rejectionRate >= 15) alertSeverity = 'medium'

        return {
          id: result.id,
          severity: alertSeverity,
          productName: result.product.name,
          productCategory: result.product.category,
          unit: result.product.unit,
          farmerName: result.farmer.user.name || "Unknown",
          farmerEmail: result.farmer.user.email,
          farmerCity: result.farmer.user.city,
          farmerId: result.farmerId,
          expectedQuantity: result.expectedQuantity,
          acceptedQuantity: result.acceptedQuantity,
          rejectedQuantity: result.rejectedQuantity,
          rejectionRate: Math.round(rejectionRate * 10) / 10,
          rejectionReasons: result.rejectionReasons,
          timestamp: result.timestamp.toISOString(),
          notes: result.notes,
          photos: result.photos
        }
      })

      // Filter by severity if specified
      const filteredAlerts = severity === 'all' 
        ? alerts 
        : alerts.filter(alert => alert.severity === severity)

      // Calculate summary statistics
      const summary = {
        total: filteredAlerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length,
        totalRejected: alerts.reduce((sum, a) => sum + a.rejectedQuantity, 0),
        averageRejectionRate: alerts.length > 0 
          ? alerts.reduce((sum, a) => sum + a.rejectionRate, 0) / alerts.length 
          : 0
      }

      // Group alerts by farmer for farmer-level insights
      const farmerAlerts = alerts.reduce((acc, alert) => {
        if (!acc[alert.farmerId]) {
          acc[alert.farmerId] = {
            farmerId: alert.farmerId,
            farmerName: alert.farmerName,
            farmerEmail: alert.farmerEmail,
            farmerCity: alert.farmerCity,
            alertCount: 0,
            totalRejected: 0,
            averageRejectionRate: 0,
            recentAlerts: []
          }
        }
        acc[alert.farmerId].alertCount++
        acc[alert.farmerId].totalRejected += alert.rejectedQuantity
        acc[alert.farmerId].recentAlerts.push({
          productName: alert.productName,
          rejectionRate: alert.rejectionRate,
          timestamp: alert.timestamp
        })
        return acc
      }, {} as Record<string, any>)

      // Calculate average rejection rate per farmer
      Object.values(farmerAlerts).forEach((farmer: any) => {
        const rates = farmer.recentAlerts.map((a: any) => a.rejectionRate)
        farmer.averageRejectionRate = rates.length > 0 
          ? Math.round((rates.reduce((sum: number, r: number) => sum + r, 0) / rates.length) * 10) / 10
          : 0
        // Keep only 3 most recent alerts
        farmer.recentAlerts = farmer.recentAlerts.slice(0, 3)
      })

      // Sort farmers by alert count (highest first)
      const topFarmersWithIssues = Object.values(farmerAlerts)
        .sort((a: any, b: any) => b.alertCount - a.alertCount)
        .slice(0, 10)

      res.status(200).json({
        alerts: filteredAlerts,
        summary,
        topFarmersWithIssues
      })
    } catch (error) {
      console.error("QC alerts error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}
