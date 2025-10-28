import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { requireApiAccess, requireOwnership, handleApiError } from '@/lib/api-auth';
import { mlClient } from '@/lib/ml-client';
import { prisma } from '@/lib/prisma';
import { metricsCollector } from '@/lib/performance';
import { UserRole } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const querySchema = z.object({
  top_n: z.string().optional(),
  category_filter: z.string().optional(),
  exclude_purchased: z.string().optional(),
  model: z.enum(['als','content','ncf']).optional(),
  blend: z.string().optional(),
  budget: z.string().optional(),
  cart_product_ids: z.string().optional(), // comma-separated IDs
  experiment_id: z.string().optional(),
  variant: z.string().optional(),
});

function parseBlend(input?: string): Record<string, number> | undefined {
  if (!input) return undefined;
  try {
    const obj = JSON.parse(input);
    if (typeof obj === 'object' && obj) return obj as Record<string, number>;
  } catch {}
  const weights: Record<string, number> = {};
  input.split(',').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k && v && !Number.isNaN(Number(v))) weights[k.trim()] = Number(v);
  });
  return Object.keys(weights).length ? weights : undefined;
}

function validateBlend(blend?: Record<string, number>): { normalized?: Record<string, number>, status: 'valid'|'normalized'|'invalid' } {
  if (!blend) return { status: 'invalid' };
  const keys = Object.keys(blend);
  const allowed = new Set(['als','content','ncf']);
  if (keys.length === 0 || !keys.every(k => allowed.has(k))) return { status: 'invalid' };
  const sum = keys.reduce((acc, k) => acc + (blend[k] || 0), 0);
  if (sum <= 0) return { status: 'invalid' };
  const epsilon = 1e-6;
  if (Math.abs(sum - 1) < epsilon) return { normalized: blend, status: 'valid' };
  // Normalize to sum=1
  const normalized: Record<string, number> = {};
  for (const k of keys) normalized[k] = (blend[k] || 0) / sum;
  return { normalized, status: 'normalized' };
}

function loadJsonSet(filePath: string): Set<string> {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const arr = JSON.parse(data);
    if (Array.isArray(arr)) return new Set(arr);
  } catch {}
  return new Set<string>();
}

function getSeasonalCategoriesFromDataset(month: number): Set<string> {
  const fp = path.join(process.cwd(), 'ml', 'data', 'synthetic', 'seasonality.json');
  try {
    const raw = fs.readFileSync(fp, 'utf8');
    const m = JSON.parse(raw);
    const cats = m[String(month)] || [];
    return new Set<string>(Array.isArray(cats) ? cats : []);
  } catch {
    return getSeasonalCategoriesFallback(month);
  }
}

function getSeasonalCategoriesFallback(month: number): Set<string> {
  const seasonMap: Record<number, string[]> = {
    1: ['leafy greens', 'citrus'],
    2: ['leafy greens', 'citrus'],
    3: ['berries', 'leafy greens'],
    4: ['berries', 'stone fruits'],
    5: ['berries', 'stone fruits'],
    6: ['stone fruits', 'melons'],
    7: ['melons', 'tomatoes'],
    8: ['tomatoes', 'peppers'],
    9: ['apples', 'pears'],
    10: ['apples', 'squash'],
    11: ['squash', 'citrus'],
    12: ['citrus', 'leafy greens'],
  };
  return new Set(seasonMap[month] || []);
}

function getPairingsForCategory(cat: string): Set<string> {
  const fp = path.join(process.cwd(), 'ml', 'data', 'synthetic', 'pairings.json');
  try {
    const raw = fs.readFileSync(fp, 'utf8');
    const m = JSON.parse(raw);
    const arr = m[cat] || [];
    return new Set<string>(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set<string>();
  }
}

function buildRationale(flags: { diversified: boolean; respectsBudget: boolean; inSeasonPreference: boolean }): string {
  const parts: string[] = [];
  if (flags.diversified) parts.push('Balanced nutritional diversity via category variety');
  if (flags.respectsBudget) parts.push('Fits your budget preferences');
  if (flags.inSeasonPreference) parts.push('Prioritized in-season produce');
  return parts.length ? parts.join(' • ') : 'Top personalized picks matched to your preferences';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await requireApiAccess(req, res);
    const { user_id } = req.query;

    if (typeof user_id !== 'string') {
      return res.status(400).json({ error: 'Invalid user_id' });
    }

    // Bypass ownership for ADMIN/OPERATIONS; enforce for CUSTOMER
    if (session.user.role === UserRole.CUSTOMER) {
      await requireOwnership(session, 'customer', user_id);
    }

    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const topN = parsed.data.top_n ? parseInt(parsed.data.top_n, 10) : 10;
    const categoryFilter = parsed.data.category_filter;
    const excludePurchased = (parsed.data.exclude_purchased || 'false').toLowerCase() === 'true';
    const model = parsed.data.model;
    const blendInput = parseBlend(parsed.data.blend);
    const blendValidation = validateBlend(blendInput);
    const blend = blendValidation.normalized;
    const blendStatus = blendValidation.status;
    const budget = parsed.data.budget ? parseFloat(parsed.data.budget) : undefined;
    const cartIds = (parsed.data.cart_product_ids || '').split(',').map(s => s.trim()).filter(Boolean);
    const experimentId = parsed.data.experiment_id || null;
    const variant = parsed.data.variant || null;

    const mlResponse = await mlClient.getRecommendations({
      userId: session.user.id,
      context: 'dashboard',
      limit: topN,
      model,
      blend,
    });

    if (!mlResponse.success || !mlResponse.data) {
      return res.status(502).json({ error: mlResponse.error || 'Recommendation service unavailable' });
    }

    // Start with ML recommended product IDs and scores
    let recs = mlResponse.data.products.map(p => ({ product_id: p.id, score: p.score, reason: 'personalized' }));

    // Fetch details for recommended and cart products
    const recIds = recs.map(r => r.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: [...recIds, ...cartIds] }, isActive: true },
      select: { id: true, name: true, category: true, basePrice: true },
    });
    const productById = new Map(products.map(p => [p.id, p]));
    const cartCategories = new Set(products.filter(p => cartIds.includes(p.id)).map(p => p.category));

    // Fetch user purchase history
    const orders = await prisma.order.findMany({
      where: { customer: { userId: session.user.id } },
      include: { items: { include: { product: { select: { id: true, category: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const purchasedIds = new Set(orders.flatMap(o => o.items.map(i => i.product.id)));
    const purchasedCategories = new Set(orders.flatMap(o => o.items.map(i => i.product.category)));

    // Exclude previously purchased products if requested
    if (excludePurchased) {
      recs = recs.filter(r => !purchasedIds.has(r.product_id));
    }

    // Apply category filter
    if (categoryFilter) {
      recs = recs.filter(r => productById.get(r.product_id)?.category === categoryFilter);
    }

    // Compute popularity by product (sum of quantities)
    const popularity = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { productId: { in: recs.map(r => r.product_id) } },
      _sum: { quantity: true },
    });
    const popularityMap = new Map(popularity.map(p => [p.productId, p._sum.quantity || 0]));
    const popularityValues = Array.from(popularityMap.values());
    const medianPopularity = popularityValues.length
      ? popularityValues.sort((a,b)=>a-b)[Math.floor(popularityValues.length/2)]
      : 0;

    // Generate reasons
    recs = recs.map(r => {
      const pd = productById.get(r.product_id);
      const reasons: string[] = [];
      if (pd && purchasedCategories.has(pd.category)) {
        reasons.push('similar to items you bought');
      }
      const pop = popularityMap.get(r.product_id) || 0;
      if (pd && pop >= medianPopularity && medianPopularity > 0) {
        reasons.push('popular in your category');
      }
      // Cart pairing
      if (pd && cartCategories.size > 0) {
        for (const cc of cartCategories) {
          const pairings = getPairingsForCategory(cc);
          if (pairings.has(pd.category)) {
            reasons.push('pairs well with items in your cart');
            break;
          }
        }
      }
      return { ...r, reason: reasons.length ? reasons.join(' • ') : r.reason };
    });

    // Build subscription box suggestion using diversity, budget, seasonality
    const month = new Date().getMonth() + 1;
    const inSeasonCategories = getSeasonalCategoriesFromDataset(month);
    const maxItems = Math.min(5, recs.length);

    // Budget constraints (use user preferences max or query budget)
    let priceMax: number | undefined = budget;
    if (!priceMax) {
      const prefs = await prisma.userPreference.findUnique({
        where: { userId: session.user.id },
        select: { priceRange: true },
      });
      if (prefs?.priceRange && typeof prefs.priceRange === 'object') {
        const maybeMax = (prefs.priceRange as any).max;
        if (typeof maybeMax === 'number') priceMax = maybeMax;
      }
    }

    const selection: { product_id: string; score: number; reason: string }[] = [];
    const usedCategories = new Set<string>();
    let totalCost = 0;

    // Prefer in-season and diversify categories while respecting budget
    const sortedRecs = recs
      .slice()
      .sort((a, b) => {
        const pa = productById.get(a.product_id);
        const pb = productById.get(b.product_id);
        const aSeason = pa && inSeasonCategories.has(pa.category) ? 1 : 0;
        const bSeason = pb && inSeasonCategories.has(pb.category) ? 1 : 0;
        if (aSeason !== bSeason) return bSeason - aSeason; // prefer in-season
        return b.score - a.score; // then by score
      });

    for (const r of sortedRecs) {
      if (selection.length >= maxItems) break;
      const p = productById.get(r.product_id);
      if (!p) continue;
      const cat = p.category;
      const price = p.basePrice || 0;
      const wouldExceedBudget = priceMax !== undefined && totalCost + price > priceMax;

      // Try to maximize diversity: prefer new categories unless budget blocks
      const prefer = !usedCategories.has(cat) || selection.length === 0;
      if (prefer && !wouldExceedBudget) {
        selection.push(r);
        usedCategories.add(cat);
        totalCost += price;
      } else if (!wouldExceedBudget && selection.length < maxItems) {
        selection.push(r);
        totalCost += price;
      }
    }

    const subscription_box_suggestion = {
      items: selection,
      rationale: buildRationale({
        diversified: usedCategories.size > 1,
        respectsBudget: priceMax !== undefined ? totalCost <= priceMax : true,
        inSeasonPreference: selection.some(i => inSeasonCategories.has(productById.get(i.product_id)?.category || '')),
      }),
      budget_used: totalCost,
      budget_limit: priceMax ?? null,
      seasonality_month: month,
    };

    // A/B experiment logging
    metricsCollector.record('recommendations_served', recs.length, {
      experiment_id: experimentId,
      variant,
      user_id,
      model: model || 'auto',
      blend_status: blendStatus,
    });

    return res.status(200).json({
      recommendations: recs.slice(0, topN),
      subscription_box_suggestion,
      experiment: experimentId ? { experiment_id: experimentId, variant } : null,
      blend_status: blendStatus,
    });
  } catch (error) {
    handleApiError(error, res);
  }
}