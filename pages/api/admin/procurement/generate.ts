import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

interface ProcurementItem {
  productId: string
  productName: string
  category: string
  unit: string
  totalQuantity: number
  farmers: {
    farmerId: string
    farmerName: string
    farmName: string
    assignedQuantity: number
    capacity: number
    qualityScore: number
    pricePerUnit: number
    phone: string | null
  }[]
}

interface ProcurementList {
  date: string
  totalItems: number
  totalFarmers: number
  items: ProcurementItem[]
}

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

  if (req.method === "POST") {
    try {
      const { days = 3 } = req.body

      // Calculate date range for next N days
      const startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + days)
      endDate.setHours(23, 59, 59, 999)

      // Step 1: Get all confirmed orders and active subscriptions for the date range
      const upcomingOrders = await prisma.order.findMany({
        where: {
          deliveryDate: {
            gte: startDate,
            lte: endDate
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Get active subscriptions that will generate orders in this period
      const activeSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          startDate: {
            lte: endDate
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Step 2: Aggregate required quantities by product
      const productRequirements = new Map<string, {
        product: any
        totalQuantity: number
      }>()

      // Add quantities from confirmed orders
      upcomingOrders.forEach(order => {
        order.items.forEach(item => {
          const existing = productRequirements.get(item.productId)
          if (existing) {
            existing.totalQuantity += item.quantity
          } else {
            productRequirements.set(item.productId, {
              product: item.product,
              totalQuantity: item.quantity
            })
          }
        })
      })

      // Add estimated quantities from active subscriptions
      // Assuming weekly frequency, calculate how many deliveries in the period
      const daysInPeriod = days
      activeSubscriptions.forEach(subscription => {
        subscription.items.forEach(item => {
          // Estimate deliveries based on frequency (simplified: assume weekly = 1 delivery per 7 days)
          const estimatedDeliveries = item.frequency === 'weekly' 
            ? Math.ceil(daysInPeriod / 7)
            : item.frequency === 'biweekly'
            ? Math.ceil(daysInPeriod / 14)
            : 1

          const estimatedQuantity = item.quantity * estimatedDeliveries

          const existing = productRequirements.get(item.productId)
          if (existing) {
            existing.totalQuantity += estimatedQuantity
          } else {
            productRequirements.set(item.productId, {
              product: item.product,
              totalQuantity: estimatedQuantity
            })
          }
        })
      })

      // Step 3: For each product, find available farmers and their capacity
      const procurementItems: ProcurementItem[] = []
      const farmerIds = new Set<string>()

      for (const [productId, requirement] of productRequirements.entries()) {
        // Get all farmers who have this product
        const availableFarmers = await prisma.product.findMany({
          where: {
            id: productId,
            isActive: true,
            farmer: {
              isApproved: true
            }
          },
          include: {
            farmer: {
              include: {
                user: true,
                qcResults: {
                  orderBy: {
                    timestamp: 'desc'
                  },
                  take: 10 // Last 10 QC results for quality score
                }
              }
            }
          }
        })

        if (availableFarmers.length === 0) {
          // No farmers available for this product
          continue
        }

        // Calculate quality score and capacity for each farmer
        const farmersWithScores = availableFarmers.map(product => {
          const farmer = product.farmer
          
          // Calculate quality score from recent QC results
          let qualityScore = 85 // Default score
          if (farmer.qcResults.length > 0) {
            const totalAccepted = farmer.qcResults.reduce((sum, qc) => sum + qc.acceptedQuantity, 0)
            const totalExpected = farmer.qcResults.reduce((sum, qc) => sum + qc.expectedQuantity, 0)
            if (totalExpected > 0) {
              qualityScore = Math.round((totalAccepted / totalExpected) * 100)
            }
          }

          // Estimate capacity (simplified: assume 100 units per product per farmer)
          // In a real system, this would come from farmer inventory or capacity data
          const capacity = 100

          return {
            farmerId: farmer.id,
            farmerName: farmer.user.name || 'Unknown',
            farmName: farmer.farmName,
            qualityScore,
            capacity,
            pricePerUnit: product.basePrice,
            phone: farmer.phone
          }
        })

        // Step 4: Optimize farmer assignments based on quality and cost
        // Sort farmers by quality score (descending) and price (ascending)
        const sortedFarmers = farmersWithScores.sort((a, b) => {
          // Weighted score: 70% quality, 30% price (inverse)
          const scoreA = (a.qualityScore * 0.7) - (a.pricePerUnit * 0.3)
          const scoreB = (b.qualityScore * 0.7) - (b.pricePerUnit * 0.3)
          return scoreB - scoreA
        })

        // Assign quantities to farmers based on capacity
        let remainingQuantity = requirement.totalQuantity
        const assignedFarmers: ProcurementItem['farmers'] = []

        for (const farmer of sortedFarmers) {
          if (remainingQuantity <= 0) break

          const assignedQuantity = Math.min(remainingQuantity, farmer.capacity)
          assignedFarmers.push({
            ...farmer,
            assignedQuantity
          })

          farmerIds.add(farmer.farmerId)
          remainingQuantity -= assignedQuantity
        }

        procurementItems.push({
          productId: requirement.product.id,
          productName: requirement.product.name,
          category: requirement.product.category,
          unit: requirement.product.unit,
          totalQuantity: requirement.totalQuantity,
          farmers: assignedFarmers
        })
      }

      // Step 5: Generate procurement list
      const procurementList: ProcurementList = {
        date: startDate.toISOString(),
        totalItems: procurementItems.length,
        totalFarmers: farmerIds.size,
        items: procurementItems
      }

      res.status(200).json({ 
        success: true,
        procurementList,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        }
      })
    } catch (error) {
      console.error("Procurement generation error:", error)
      res.status(500).json({ 
        message: "Internal server error",
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}
