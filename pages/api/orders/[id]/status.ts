import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, OrderStatus as PrismaOrderStatus } from '@prisma/client'
import { orderStatusSchema } from '@/lib/schemas/order'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (session.user.role !== UserRole.FARMER) {
      return res.status(403).json({ message: 'Only farmers can update order status' })
    }

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid order ID' })
    }

    // Validate request body
    const validationResult = orderStatusSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: validationResult.error.errors
      })
    }

    const { status } = validationResult.data

    // Map frontend status to Prisma enum
    const statusMap: Record<string, PrismaOrderStatus> = {
      pending: PrismaOrderStatus.PENDING,
      confirmed: PrismaOrderStatus.CONFIRMED,
      preparing: PrismaOrderStatus.PICKED,
      out_for_delivery: PrismaOrderStatus.ORDER_IN_TRANSIT,
      delivered: PrismaOrderStatus.DELIVERED,
      cancelled: PrismaOrderStatus.CANCELLED,
    }

    const prismaStatus = statusMap[status]
    if (!prismaStatus) {
      return res.status(400).json({ message: 'Unsupported order status' })
    }

    // Get farmer profile
    const farmer = await prisma.farmer.findFirst({
      where: { userId: session.user.id }
    })

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' })
    }

    // Get order and verify farmer has items in it
    const order = await prisma.order.findFirst({
      where: {
        id,
        items: {
          some: {
            product: {
              farmerId: farmer.id
            }
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not accessible' })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: prismaStatus
      }
    })

    return res.status(200).json({
      success: true,
      order: updatedOrder
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}