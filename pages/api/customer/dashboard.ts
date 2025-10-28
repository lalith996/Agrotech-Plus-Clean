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

  console.log('[Dashboard API] ===== DEBUG START =====')
  console.log('[Dashboard API] Session exists:', !!session)
  console.log('[Dashboard API] User exists:', !!session?.user)
  console.log('[Dashboard API] User ID:', session?.user?.id)
  console.log('[Dashboard API] User email:', session?.user?.email)
  console.log('[Dashboard API] User role (raw):', session?.user?.role)
  console.log('[Dashboard API] User role (type):', typeof session?.user?.role)
  console.log('[Dashboard API] User role (JSON):', JSON.stringify(session?.user?.role))
  console.log('[Dashboard API] Full user object:', JSON.stringify(session?.user, null, 2))
  console.log('[Dashboard API] ===== DEBUG END =====')

  if (!session?.user?.id) {
    console.log('[Dashboard API] REJECTED: No session or user ID')
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Check if role is CUSTOMER (case-insensitive to handle any inconsistencies)
  const userRole = session.user.role?.toString().toUpperCase()
  console.log('[Dashboard API] Processed role:', userRole, '| Expected: CUSTOMER | Match:', userRole === 'CUSTOMER')
  
  if (userRole !== 'CUSTOMER') {
    console.log('[Dashboard API] REJECTED: Access denied - role:', session.user.role, '| processed:', userRole, '| expected: CUSTOMER')
    return res.status(403).json({ 
      message: "Access denied - Customer role required",
      userRole: session.user.role,
      processedRole: userRole,
      expected: 'CUSTOMER'
    })
  }

  console.log('[Dashboard API] PASSED: Role check succeeded')

  if (req.method === "GET") {
    try {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      })

      if (!customer) {
        return res.status(404).json({ message: "Customer profile not found" })
      }

      // Get active subscriptions count
      const activeSubscriptionsCount = await prisma.subscription.count({
        where: {
          customerId: customer.id,
          status: "ACTIVE"
        }
      })

      // Get recent orders (last 5)
      const recentOrders = await prisma.order.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Calculate next delivery date from upcoming orders
      const upcomingOrders = await prisma.order.findMany({
        where: {
          customerId: customer.id,
          deliveryDate: {
            gte: new Date()
          },
          status: {
            in: ["CONFIRMED", "PICKED", "ORDER_IN_TRANSIT"]
          }
        },
        orderBy: { deliveryDate: "asc" },
        take: 1
      })

      const nextDelivery = upcomingOrders[0] ? {
        date: upcomingOrders[0].deliveryDate.toISOString(),
        itemCount: await prisma.orderItem.count({
          where: { orderId: upcomingOrders[0].id }
        })
      } : null

      // Get recommended products - simple fallback to latest products
      let recommendedProducts: any[] = []
      try {
        const products = await prisma.product.findMany({
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 10,
          include: {
            farmer: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        })
        
        recommendedProducts = products.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          basePrice: Number(product.basePrice),
          unit: product.unit,
          images: product.images,
          farmer: {
            name: product.farmer.user.name || "Unknown",
            farmName: product.farmer.farmName
          }
        }))
      } catch (error) {
        console.error("Error fetching products:", error)
        recommendedProducts = []
      }

      const dashboard = {
        activeSubscriptions: activeSubscriptionsCount,
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          status: order.status,
          totalAmount: Number(order.totalAmount),
          deliveryDate: order.deliveryDate.toISOString(),
          itemCount: order.items.length,
          items: order.items.map(item => ({
            id: item.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: Number(item.price)
          }))
        })),
        nextDelivery,
        recommendedProducts
      }

      res.status(200).json(dashboard)
    } catch (error) {
      console.error("Customer dashboard error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}