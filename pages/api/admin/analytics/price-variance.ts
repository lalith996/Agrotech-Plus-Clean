import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() || 7
  if (day !== 1) d.setDate(d.getDate() - (day - 1))
  d.setHours(0,0,0,0)
  return d
}
function addDays(date: Date, days: number) { const d = new Date(date); d.setDate(d.getDate() + days); return d }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
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

    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          deliveryDate: {
            gte: start,
            lt: addDays(end, 7)
          }
        }
      },
      select: {
        price: true,
        product: { select: { category: true } }
      }
    })

    const byCategory: Record<string, { count: number; sum: number; sumSq: number; avg: number; variance: number; min: number; max: number }> = {}
    for (const it of items) {
      const cat = it.product?.category || 'Unknown'
      const price = Number(it.price || 0)
      if (!byCategory[cat]) byCategory[cat] = { count: 0, sum: 0, sumSq: 0, avg: 0, variance: 0, min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
      const bucket = byCategory[cat]
      bucket.count += 1
      bucket.sum += price
      bucket.sumSq += price * price
      bucket.min = Math.min(bucket.min, price)
      bucket.max = Math.max(bucket.max, price)
    }

    const data = Object.entries(byCategory).map(([category, b]) => {
      const avg = b.count > 0 ? b.sum / b.count : 0
      const variance = b.count > 1 ? (b.sumSq / b.count) - (avg * avg) : 0
      return { category, count: b.count, avg: Number(avg.toFixed(2)), variance: Number(variance.toFixed(2)), min: Number(b.min.toFixed(2)), max: Number(b.max.toFixed(2)) }
    }).sort((a,b) => b.variance - a.variance)

    return res.status(200).json({ success: true, data, meta: { weeks: weeksNum, start: start.toISOString(), end: end.toISOString() } })
  } catch (error) {
    console.error('price-variance error', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}