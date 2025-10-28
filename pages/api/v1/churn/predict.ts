import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { UserRole } from '@prisma/client'
import { requireRole, withErrorHandling } from '@/lib/api-auth'
import { mlClient, ChurnPredictRequest, ChurnPredictResponse, ChurnPrediction } from '@/lib/ml-client'
import { metricsCollector } from '@/lib/performance'

const bodySchema = z.object({
  user_ids: z.array(z.string()).min(1),
  include_recommendations: z.boolean().optional().default(false),
})

type BodyInput = z.infer<typeof bodySchema>

function riskLevel(prob: number): 'low' | 'medium' | 'high' {
  if (prob >= 0.7) return 'high'
  if (prob >= 0.4) return 'medium'
  return 'low'
}

async function simpleFallback(users: string[], includeRecommendations: boolean): Promise<ChurnPredictResponse> {
  const results: ChurnPrediction[] = users.map((userId) => {
    const prob = 0.25 // conservative baseline
    const top_churn_factors = [
      'low order frequency',
      'no recent app login',
      'delivery friction signals',
    ]
    const retention_actions = [
      'offer 10% loyalty discount',
      'send personalized reactivation email',
      'free delivery on next order',
    ]

    return {
      userId,
      churn_probability: prob,
      risk_level: riskLevel(prob),
      top_churn_factors,
      retention_actions,
      recommendations: includeRecommendations ? [] : undefined,
    }
  })

  return { results }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await requireRole(req, res, [UserRole.ADMIN, UserRole.OPERATIONS])

  const parse = bodySchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() })
  }

  const { user_ids, include_recommendations }: BodyInput = parse.data

  const start = performance.now()
  const resp = await mlClient.predictChurn(
    { userIds: user_ids, includeRecommendations: include_recommendations } as ChurnPredictRequest,
    () => simpleFallback(user_ids, include_recommendations)
  )
  const duration = performance.now() - start

  metricsCollector.record('churn_prediction_served', user_ids.length, {
    duration_ms: duration,
    user_count: user_ids.length,
    include_recommendations,
    success: resp.success,
    cached: resp.cached || false,
    fallback: resp.fallback || false,
    requester_id: session.user.id,
    role: session.user.role,
  })

  if (!resp.success || !resp.data) {
    return res.status(502).json({ error: resp.error || 'Churn prediction failed' })
  }

  return res.status(200).json({ results: resp.data.results })
}

export default withErrorHandling(handler)