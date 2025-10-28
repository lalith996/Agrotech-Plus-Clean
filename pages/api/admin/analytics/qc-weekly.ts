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

    const results = await prisma.qCResult.findMany({
      where: {
        timestamp: { gte: start, lt: addDays(end, 7) }
      },
      select: {
        timestamp: true,
        expectedQuantity: true,
        acceptedQuantity: true,
      }
    })

    const buckets: Record<string, { weekStart: string; weekEnd: string; accepted: number; expected: number; rate: number }> = {}
    for (const r of results) {
      const ds = startOfWeek(new Date(r.timestamp))
      const key = ds.toISOString().slice(0,10)
      const we = addDays(ds, 6)
      if (!buckets[key]) buckets[key] = { weekStart: ds.toISOString(), weekEnd: we.toISOString(), accepted: 0, expected: 0, rate: 0 }
      buckets[key].accepted += Number(r.acceptedQuantity || 0)
      buckets[key].expected += Number(r.expectedQuantity || 0)
    }
    const data = Object.values(buckets)
      .map(b => ({ ...b, rate: b.expected > 0 ? (b.accepted / b.expected) * 100 : 0 }))
      .sort((a,b) => a.weekStart.localeCompare(b.weekStart))

    return res.status(200).json({ success: true, data, meta: { weeks: weeksNum, start: start.toISOString(), end: end.toISOString() } })
  } catch (error) {
    console.error('qc-weekly error', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}