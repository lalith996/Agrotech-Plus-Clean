import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() || 7 // Sunday=0 -> 7
  if (day !== 1) d.setDate(d.getDate() - (day - 1)) // Monday start
  d.setHours(0,0,0,0)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) return res.status(401).json({ message: 'Unauthorized' })
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OPERATIONS) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    const { weeks = '12' } = req.query
    const weeksNum = Math.max(1, parseInt(weeks as string, 10) || 12)

    const end = startOfWeek(new Date())
    const start = addDays(end, -7 * weeksNum)

    const orders = await prisma.order.findMany({
      where: {
        deliveryDate: {
          gte: start,
          lt: addDays(end, 7)
        }
      },
      select: {
        id: true,
        deliveryDate: true,
        totalAmount: true,
      }
    })

    const buckets: Record<string, { weekStart: string; weekEnd: string; orders: number; totalAmount: number }> = {}
    for (const o of orders) {
      const ds = startOfWeek(new Date(o.deliveryDate))
      const key = ds.toISOString().slice(0,10) // YYYY-MM-DD week start
      const we = addDays(ds, 6)
      if (!buckets[key]) buckets[key] = { weekStart: ds.toISOString(), weekEnd: we.toISOString(), orders: 0, totalAmount: 0 }
      buckets[key].orders += 1
      buckets[key].totalAmount += Number(o.totalAmount || 0)
    }

    const data = Object.values(buckets).sort((a,b) => a.weekStart.localeCompare(b.weekStart))
    return res.status(200).json({ success: true, data, meta: { weeks: weeksNum, start: start.toISOString(), end: end.toISOString() } })
  } catch (error) {
    console.error('orders-weekly error', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}