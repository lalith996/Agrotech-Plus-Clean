import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiAccess } from '@/lib/api-auth';
import { z } from 'zod';
import { mlClient } from '@/lib/ml-client';

const requestSchema = z.object({
  farmer_id: z.string().min(1),
  product_type: z.string().min(1),
  harvest_date: z.string().optional(),
  defects: z.number().optional(),
  arrival_conditions: z.record(z.any()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireApiAccess(req, res);

    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: parsed.error.errors.map(e => ({ path: e.path, message: e.message })),
      });
    }

    const mlResponse = await mlClient.getQualityPredictionV1(parsed.data);

    if (!mlResponse.success || !mlResponse.data) {
      return res.status(502).json({
        error: mlResponse.error || 'Quality prediction service unavailable',
      });
    }

    return res.status(200).json({
      ...mlResponse.data,
      cached: mlResponse.cached || false,
      fallback: mlResponse.fallback || false,
    });
  } catch (error) {
    console.error('Quality prediction API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}