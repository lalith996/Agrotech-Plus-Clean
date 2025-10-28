import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { requireApiAccess, handleApiError } from '@/lib/api-auth';
import { metricsCollector } from '@/lib/performance';

const impressionSchema = z.object({
  type: z.literal('recommendation_impression'),
  experiment_id: z.string(),
  variant: z.string().optional(),
  user_id: z.string(),
  session_id: z.string(),
  list: z.array(z.object({
    product_id: z.string(),
    score: z.number().optional(),
    rank: z.number().int(),
  })),
});

const clickSchema = z.object({
  type: z.literal('recommendation_click'),
  experiment_id: z.string(),
  variant: z.string().optional(),
  user_id: z.string(),
  session_id: z.string(),
  product_id: z.string(),
  rank: z.number().int().optional(),
});

const purchaseSchema = z.object({
  type: z.literal('recommendation_purchase'),
  experiment_id: z.string(),
  variant: z.string().optional(),
  user_id: z.string(),
  session_id: z.string(),
  product_id: z.string(),
  rank: z.number().int().optional(),
  quantity: z.number().int().optional(),
});

const addToCartSchema = z.object({
  type: z.literal('add_to_cart'),
  experiment_id: z.string().optional(),
  variant: z.string().optional(),
  user_id: z.string(),
  session_id: z.string(),
  product_id: z.string(),
  rank: z.number().int().optional(),
});

const bodySchema = z.union([
  impressionSchema,
  clickSchema,
  purchaseSchema,
  addToCartSchema,
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await requireApiAccess(req, res);
    const parsed = bodySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.errors });
    }

    const payload = parsed.data;
    const commonMeta = {
      experiment_id: 'experiment_id' in payload ? payload.experiment_id : undefined,
      variant: 'variant' in payload ? (payload as any).variant : undefined,
      user_id: (payload as any).user_id,
      session_id: (payload as any).session_id,
    } as Record<string, any>;

    switch (payload.type) {
      case 'recommendation_impression': {
        metricsCollector.record('recommendation_impression', payload.list.length, {
          ...commonMeta,
          list: payload.list,
        });
        break;
      }
      case 'recommendation_click': {
        metricsCollector.record('recommendation_click', 1, {
          ...commonMeta,
          product_id: payload.product_id,
          rank: payload.rank,
        });
        break;
      }
      case 'recommendation_purchase': {
        metricsCollector.record('recommendation_purchase', payload.quantity ?? 1, {
          ...commonMeta,
          product_id: payload.product_id,
          rank: payload.rank,
          quantity: payload.quantity ?? 1,
        });
        break;
      }
      case 'add_to_cart': {
        metricsCollector.record('add_to_cart', 1, {
          ...commonMeta,
          product_id: payload.product_id,
          rank: payload.rank,
        });
        break;
      }
      default: {
        return res.status(400).json({ error: 'Unsupported event type' });
      }
    }

    return res.status(202).json({ status: 'accepted' });
  } catch (error) {
    handleApiError(error, res);
  }
}