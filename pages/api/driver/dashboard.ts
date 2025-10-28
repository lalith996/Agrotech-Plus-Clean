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

  if (session.user.role !== UserRole.DRIVER) {
    return res.status(403).json({ message: "Access denied" })
  }

  if (req.method === "GET") {
    try {
      const driverId = session.user.id
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Fetch today's assigned routes
      const todaysRoutes = await prisma.deliveryRoute.findMany({
        where: {
          driverId,
          date: {
            gte: startOfToday,
            lt: endOfToday
          }
        },
        include: {
          slot: {
            include: {
              zone: true
            }
          },
          routeOrders: {
            include: {
              order: {
                include: {
                  address: true,
                  items: {
                    include: {
                      product: true
                    }
                  }
                }
              }
            },
            orderBy: {
              sequence: 'asc'
            }
          },
          optimization: true
        }
      })

      // Get active route (in_progress status)
      const activeRoute = todaysRoutes.find(route => route.status === 'in_progress')

      // Fetch today's deliveries from routes
      const todaysDeliveries = todaysRoutes.flatMap(route => 
        route.routeOrders.map(ro => ({
          id: ro.order.id,
          orderId: ro.order.id,
          routeId: route.id,
          sequence: ro.sequence,
          status: ro.order.status,
          address: {
            name: ro.order.address.name,
            street: ro.order.address.street,
            city: ro.order.address.city,
            state: ro.order.address.state,
            zipCode: ro.order.address.zipCode,
            latitude: ro.order.address.latitude,
            longitude: ro.order.address.longitude
          },
          deliverySlot: ro.order.deliverySlot,
          totalAmount: ro.order.totalAmount,
          itemCount: ro.order.items.length,
          specialNotes: ro.order.specialNotes
        }))
      )

      // Calculate delivery performance stats
      const completedDeliveriesCount = await prisma.order.count({
        where: {
          routeOrders: {
            some: {
              route: {
                driverId,
                status: 'completed'
              }
            }
          },
          status: 'DELIVERED'
        }
      })

      const totalAssignedDeliveries = await prisma.order.count({
        where: {
          routeOrders: {
            some: {
              route: {
                driverId
              }
            }
          }
        }
      })

      const successRate = totalAssignedDeliveries > 0 
        ? (completedDeliveriesCount / totalAssignedDeliveries) * 100 
        : 0

      // Calculate average delivery time from completed routes
      const completedRoutes = await prisma.deliveryRoute.findMany({
        where: {
          driverId,
          status: 'completed',
          actualDuration: { not: null }
        },
        select: {
          actualDuration: true,
          routeOrders: {
            select: {
              id: true
            }
          }
        }
      })

      const avgTimePerDelivery = completedRoutes.length > 0
        ? completedRoutes.reduce((sum, route) => {
            const deliveryCount = route.routeOrders.length || 1
            return sum + ((route.actualDuration || 0) / deliveryCount)
          }, 0) / completedRoutes.length
        : 0

      // Calculate today's earnings (assuming driver gets 10% of delivery value)
      const todaysEarnings = todaysDeliveries
        .filter(d => d.status === 'DELIVERED')
        .reduce((sum, delivery) => sum + (delivery.totalAmount * 0.1), 0)

      // Calculate week's earnings
      const weekRoutes = await prisma.deliveryRoute.findMany({
        where: {
          driverId,
          date: { gte: startOfWeek },
          status: 'completed'
        },
        include: {
          routeOrders: {
            include: {
              order: true
            }
          }
        }
      })

      const weekEarnings = weekRoutes.flatMap(route => 
        route.routeOrders
          .filter(ro => ro.order.status === 'DELIVERED')
          .map(ro => ro.order.totalAmount * 0.1)
      ).reduce((sum, amount) => sum + amount, 0)

      // Prepare active route information
      let activeRouteInfo = null
      if (activeRoute) {
        activeRouteInfo = {
          id: activeRoute.id,
          zoneName: activeRoute.slot.zone.name,
          timeSlot: `${activeRoute.slot.startTime} - ${activeRoute.slot.endTime}`,
          totalStops: activeRoute.routeOrders.length,
          completedStops: activeRoute.routeOrders.filter(ro => 
            ro.order.status === 'DELIVERED'
          ).length,
          estimatedDuration: activeRoute.estimatedDuration,
          stops: activeRoute.routeOrders.map(ro => ({
            sequence: ro.sequence,
            orderId: ro.order.id,
            address: `${ro.order.address.street}, ${ro.order.address.city}`,
            latitude: ro.order.address.latitude,
            longitude: ro.order.address.longitude,
            status: ro.order.status,
            deliverySlot: ro.order.deliverySlot
          })),
          optimization: activeRoute.optimization ? {
            algorithm: activeRoute.optimization.algorithm,
            originalDistance: activeRoute.optimization.originalDistance,
            optimizedDistance: activeRoute.optimization.optimizedDistance,
            savings: activeRoute.optimization.savings,
            estimatedTime: activeRoute.optimization.optimizedDuration
          } : null
        }
      }

      const dashboard = {
        todaysDeliveries: todaysDeliveries.sort((a, b) => a.sequence - b.sequence),
        activeRoute: activeRouteInfo,
        performance: {
          successRate: Math.round(successRate * 10) / 10,
          avgTimePerDelivery: Math.round(avgTimePerDelivery),
          totalDeliveries: totalAssignedDeliveries,
          completedDeliveries: completedDeliveriesCount
        },
        earnings: {
          today: Math.round(todaysEarnings * 100) / 100,
          week: Math.round(weekEarnings * 100) / 100
        }
      }

      res.status(200).json(dashboard)
    } catch (error) {
      console.error("Driver dashboard error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}
