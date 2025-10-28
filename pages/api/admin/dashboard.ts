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
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const isOperations = session.user.role === UserRole.OPERATIONS

      // Fetch platform metrics
      const [
        totalOrders,
        totalRevenue,
        activeUsers,
        activeFarmers,
        pendingFarmersData,
        qualityAlertsData
      ] = await Promise.all([
        // Total orders
        prisma.order.count(),
        
        // Total revenue
        prisma.order.aggregate({
          where: {
            status: { in: ["DELIVERED", "CONFIRMED", "PICKED", "ORDER_IN_TRANSIT"] }
          },
          _sum: { totalAmount: true }
        }),
        
        // Active users (customers with orders in last 30 days)
        prisma.customer.count({
          where: {
            orders: {
              some: {
                createdAt: {
                  gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            }
          }
        }),
        
        // Active farmers (approved farmers)
        prisma.farmer.count({
          where: { isApproved: true }
        }),
        
        // Pending farmers (only for admin)
        isOperations ? Promise.resolve([]) : prisma.farmer.findMany({
          where: { isApproved: false },
          include: {
            user: true,
            certifications: {
              select: {
                name: true,
                issuingBody: true,
                expiryDate: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }),
        
        // Quality alerts (recent QC failures)
        prisma.qCResult.findMany({
          where: {
            rejectedQuantity: { gt: 0 },
            timestamp: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          include: {
            product: {
              select: {
                name: true
              }
            },
            farmer: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { timestamp: "desc" },
          take: 10
        })
      ])

      // Generate simple revenue forecast (placeholder until ML is implemented) - Only for Admin
      let revenueForecast: Array<{ date: string; forecast: number; confidence: number }> = []
      if (!isOperations) {
        const historicalRevenue = await prisma.order.groupBy({
          by: ['createdAt'],
          where: {
            createdAt: {
              gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            },
            status: { in: ["DELIVERED", "CONFIRMED", "PICKED", "ORDER_IN_TRANSIT"] }
          },
          _sum: {
            totalAmount: true
          }
        })

        // Calculate average daily revenue
        const avgDailyRevenue = historicalRevenue.length > 0
          ? historicalRevenue.reduce((sum, day) => sum + (day._sum.totalAmount || 0), 0) / historicalRevenue.length
          : 0

        // Generate 7-day forecast with slight variation
        revenueForecast = Array.from({ length: 7 }, (_, i) => ({
          date: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          forecast: avgDailyRevenue * (1 + (Math.random() * 0.2 - 0.1)), // ±10% variation
          confidence: 0.75 // Placeholder confidence
        }))
      }

      // Fetch procurement list for both Admin and Operations
      let procurementList: Array<{
        id: string
        productName: string
        totalQuantity: number
        unit: string
        assignedFarmers: number
        status: string
      }> = []
      try {
        // Generate procurement list for next 3 days
        const procurementResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/procurement/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': req.headers.cookie || ''
          },
          body: JSON.stringify({ days: 3 })
        })

        if (procurementResponse.ok) {
          const procurementData = await procurementResponse.json()
          
          // Transform procurement data for dashboard display
          procurementList = procurementData.procurementList.items.map((item: any) => ({
            id: item.productId,
            productName: item.productName,
            totalQuantity: item.totalQuantity,
            unit: item.unit,
            assignedFarmers: item.farmers.length,
            status: 'pending' // Default status
          }))
        } else {
          // Fallback to empty list if generation fails
          procurementList = []
        }
      } catch (error) {
        console.error('Failed to fetch procurement list:', error)
        procurementList = []
      }

      // Operations-specific data
      let activeRoutes: Array<{
        id: string
        name: string
        driverName: string
        totalStops: number
        completedStops: number
        status: string
        estimatedCompletion: string
      }> = []
      let inventoryStatus: Array<{
        productName: string
        currentStock: number
        unit: string
        status: 'low' | 'adequate' | 'high'
        reorderPoint: number
      }> = []

      if (isOperations) {

        // Mock active routes (in real implementation, fetch from database)
        activeRoutes = [
          {
            id: 'route-1',
            name: 'Downtown Route A',
            driverName: 'John Driver',
            totalStops: 8,
            completedStops: 3,
            status: 'IN_PROGRESS',
            estimatedCompletion: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'route-2',
            name: 'Uptown Route B',
            driverName: 'Jane Delivery',
            totalStops: 6,
            completedStops: 1,
            status: 'IN_PROGRESS',
            estimatedCompletion: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'route-3',
            name: 'Suburbs Route C',
            driverName: 'Mike Transport',
            totalStops: 10,
            completedStops: 0,
            status: 'PLANNED',
            estimatedCompletion: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString()
          }
        ]

        // Mock inventory status (in real implementation, fetch from database)
        inventoryStatus = [
          {
            productName: 'Fresh Spinach',
            currentStock: 15,
            unit: 'bunches',
            status: 'low' as const,
            reorderPoint: 20
          },
          {
            productName: 'Organic Tomatoes',
            currentStock: 45,
            unit: 'kg',
            status: 'adequate' as const,
            reorderPoint: 30
          },
          {
            productName: 'Fresh Carrots',
            currentStock: 80,
            unit: 'kg',
            status: 'high' as const,
            reorderPoint: 25
          },
          {
            productName: 'Green Beans',
            currentStock: 12,
            unit: 'kg',
            status: 'low' as const,
            reorderPoint: 15
          },
          {
            productName: 'Bell Peppers',
            currentStock: 35,
            unit: 'kg',
            status: 'adequate' as const,
            reorderPoint: 20
          }
        ]
      }

      const dashboard = {
        metrics: {
          totalOrders,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          activeUsers,
          activeFarmers
        },
        pendingFarmers: pendingFarmersData.map(farmer => ({
          id: farmer.id,
          farmName: farmer.farmName,
          location: farmer.location,
          userName: farmer.user.name || "Unknown",
          email: farmer.user.email,
          city: (farmer.user as any).city || null,
          phone: farmer.phone,
          certifications: farmer.certifications.map(cert => ({
            name: cert.name,
            issuingBody: cert.issuingBody,
            expiryDate: cert.expiryDate?.toISOString()
          })),
          createdAt: farmer.createdAt.toISOString()
        })),
        qualityAlerts: qualityAlertsData.map(alert => ({
          id: alert.id,
          productName: alert.product.name,
          farmerName: alert.farmer.user.name || "Unknown",
          expectedQuantity: alert.expectedQuantity,
          acceptedQuantity: alert.acceptedQuantity,
          rejectedQuantity: alert.rejectedQuantity,
          rejectionReasons: alert.rejectionReasons,
          timestamp: alert.timestamp.toISOString()
        })),
        procurementList, // Available for both Admin and Operations
        ...(isOperations ? {
          activeRoutes,
          inventoryStatus
        } : {
          revenueForecast
        })
      }

      res.status(200).json(dashboard)
    } catch (error) {
      console.error("Admin dashboard error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}