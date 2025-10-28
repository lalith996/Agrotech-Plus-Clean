import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { requireApiAccess, handleApiError } from '@/lib/api-auth';
import { metricsCollector } from '@/lib/performance';
import { UserRole } from '@prisma/client';

const querySchema = z.object({
  experiment_id: z.string(),
  variant: z.string().optional(),
  k: z.string().optional(),
  window_minutes: z.string().optional(),
});

type MetricEvent = { name: string; value: number; timestamp: number; metadata?: Record<string, any> };

function filterEvents(events: MetricEvent[], experimentId: string, variant?: string, windowMs?: number) {
  const now = Date.now();
  return events.filter(e => {
    if (windowMs && e.timestamp < now - windowMs) return false;
    const meta = e.metadata || {};
    if (meta.experiment_id !== experimentId) return false;
    if (variant && meta.variant !== variant) return false;
    return true;
  });
}

function computeCTR(impressions: MetricEvent[], clicks: MetricEvent[]) {
  const totalImpressions = impressions.length;
  const totalClicks = clicks.length;
  return totalImpressions > 0 ? totalClicks / totalImpressions : 0;
}

function computeSessionMaps(
  impressions: MetricEvent[],
  clicks: MetricEvent[],
  purchases: MetricEvent[],
  windowMs: number
) {
  // Map session_id -> last impression (within window)
  const lastImpressionBySession = new Map<string, MetricEvent>();
  impressions.forEach(e => {
    const sid = e.metadata?.session_id;
    if (!sid) return;
    const prev = lastImpressionBySession.get(sid);
    if (!prev || (prev.timestamp < e.timestamp)) {
      lastImpressionBySession.set(sid, e);
    }
  });

  // Associate clicks/purchases to session impression
  const clicksBySession = new Map<string, MetricEvent[]>();
  const purchasesBySession = new Map<string, MetricEvent[]>();

  function withinWindow(impressionTs: number, eventTs: number) {
    return eventTs >= impressionTs && eventTs <= impressionTs + windowMs;
  }

  clicks.forEach(e => {
    const sid = e.metadata?.session_id;
    if (!sid) return;
    const imp = lastImpressionBySession.get(sid);
    if (!imp) return;
    if (!withinWindow(imp.timestamp, e.timestamp)) return;
    const arr = clicksBySession.get(sid) || [];
    arr.push(e);
    clicksBySession.set(sid, arr);
  });

  purchases.forEach(e => {
    const sid = e.metadata?.session_id;
    if (!sid) return;
    const imp = lastImpressionBySession.get(sid);
    if (!imp) return;
    if (!withinWindow(imp.timestamp, e.timestamp)) return;
    const arr = purchasesBySession.get(sid) || [];
    arr.push(e);
    purchasesBySession.set(sid, arr);
  });

  return { lastImpressionBySession, clicksBySession, purchasesBySession };
}

function precisionRecallMAPNDCG(
  lastImpressionBySession: Map<string, MetricEvent>,
  purchasesBySession: Map<string, MetricEvent[]>,
  k: number
) {
  let precisionSum = 0;
  let recallSum = 0;
  let mapSum = 0;
  let ndcgSum = 0;
  let sessionCount = 0;

  lastImpressionBySession.forEach((imp, sid) => {
    const list: Array<{ product_id: string; rank: number; score?: number }> = (imp.metadata?.list || []).map((x: any) => ({
      product_id: x.product_id,
      rank: x.rank,
      score: x.score,
    }));
    if (!Array.isArray(list) || list.length === 0) return;

    const topK = list
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .slice(0, k);

    const purchases = (purchasesBySession.get(sid) || [])
      .map(p => ({ product_id: p.metadata?.product_id as string, rank: (p.metadata?.rank as number) ?? null }))
      .filter(p => !!p.product_id);

    // Purchased set and ranks
    const topKIds = new Set(topK.map(i => i.product_id));
    const purchasedInSession = new Set(purchases.map(p => p.product_id));
    const purchasedInTopK = purchases.filter(p => topKIds.has(p.product_id));

    const intersectionSize = purchasedInTopK.length;
    const totalPurchased = purchasedInSession.size;

    // Precision@K
    const precisionK = k > 0 ? intersectionSize / k : 0;

    // Recall@K
    const recallK = totalPurchased > 0 ? intersectionSize / totalPurchased : 0;

    // MAP (limit to top K)
    // Sort purchases by rank ascending (unknown ranks treated as large number)
    const effectivePurchases = purchasedInTopK
      .map(p => ({ ...p, r: p.rank ?? (k + 1000) }))
      .filter(p => p.r <= k)
      .sort((a, b) => (a.r as number) - (b.r as number));

    let apSum = 0;
    let hits = 0;
    effectivePurchases.forEach(p => {
      hits += 1;
      const precisionAtR = hits / (p.r as number);
      apSum += precisionAtR;
    });
    const ap = effectivePurchases.length > 0 ? apSum / effectivePurchases.length : 0;

    // NDCG@K
    // DCG: sum(1 / log2(rank+1)) for hits within top K
    const dcg = effectivePurchases.reduce((acc, p) => acc + 1 / Math.log2((p.r as number) + 1), 0);
    // IDCG: ideal scenario with m hits in top K at ranks 1..m
    const m = Math.min(effectivePurchases.length, k);
    const idcg = m > 0 ? Array.from({ length: m }, (_, i) => 1 / Math.log2((i + 1) + 1)).reduce((a, b) => a + b, 0) : 1;
    const ndcg = idcg > 0 ? dcg / idcg : 0;

    precisionSum += precisionK;
    recallSum += recallK;
    mapSum += ap;
    ndcgSum += ndcg;
    sessionCount += 1;
  });

  const avgPrecisionK = sessionCount > 0 ? precisionSum / sessionCount : 0;
  const avgRecallK = sessionCount > 0 ? recallSum / sessionCount : 0;
  const meanAP = sessionCount > 0 ? mapSum / sessionCount : 0;
  const meanNDCG = sessionCount > 0 ? ndcgSum / sessionCount : 0;

  return { avgPrecisionK, avgRecallK, meanAP, meanNDCG, sessions: sessionCount };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await requireApiAccess(req, res);
    // Enforce admin/operations roles explicitly to satisfy TypeScript
    if (!(session.user.role === UserRole.ADMIN || session.user.role === UserRole.OPERATIONS)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const experimentId = parsed.data.experiment_id;
    const variant = parsed.data.variant;
    const k = parsed.data.k ? parseInt(parsed.data.k, 10) : 10;
    const windowMinutes = parsed.data.window_minutes ? parseInt(parsed.data.window_minutes, 10) : 60;
    const windowMs = windowMinutes * 60 * 1000;

    const impressions = filterEvents(metricsCollector.getMetrics('recommendation_impression') as any, experimentId, variant, windowMs);
    const clicks = filterEvents(metricsCollector.getMetrics('recommendation_click') as any, experimentId, variant, windowMs);
    const purchases = filterEvents(metricsCollector.getMetrics('recommendation_purchase') as any, experimentId, variant, windowMs);

    const ctr = computeCTR(impressions, clicks);

    const { lastImpressionBySession, purchasesBySession } = computeSessionMaps(impressions, clicks, purchases, windowMs);

    const { avgPrecisionK, avgRecallK, meanAP, meanNDCG, sessions } = precisionRecallMAPNDCG(lastImpressionBySession, purchasesBySession, k);

    return res.status(200).json({
      experiment_id: experimentId,
      variant: variant ?? null,
      k,
      window_minutes: windowMinutes,
      counts: {
        impressions: impressions.length,
        clicks: clicks.length,
        purchases: purchases.length,
        sessions,
      },
      metrics: {
        ctr,
        precision_at_k: avgPrecisionK,
        recall_at_k: avgRecallK,
        map: meanAP,
        ndcg: meanNDCG,
      },
    });
  } catch (error) {
    handleApiError(error, res);
  }
}