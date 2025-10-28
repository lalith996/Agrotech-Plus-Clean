import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SearchEngine } from '@/lib/search';
import { prisma } from '@/lib/db-optimization';
import { cacheHelpers } from '@/lib/cache';
import { mlClient } from '@/lib/ml-client';
import { ML_FEATURES } from '@/lib/config/ml-endpoints';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    const { q: query, limit = '10', type = 'all' } = req.query;

    if (!query || typeof query !== 'string' || query.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query must be at least 2 characters long' 
      });
    }

    const suggestionLimit = Math.min(parseInt(limit as string), 20);

    // Cache suggestions for better performance
    const cacheKey = `suggestions:${query}:${type}:${suggestionLimit}`;
    
    const suggestions = await cacheHelpers.cacheApiResponse(
      'suggestions',
      { query, type, limit: suggestionLimit },
      async () => {
        // Try ML-powered suggestions first if enabled
        if (ML_FEATURES.smartSearch.enabled && query.length >= 2) {
          try {
            const mlSuggestions = await getMLSuggestions(
              query,
              suggestionLimit,
              type as string,
              session?.user?.id
            );
            
            if (mlSuggestions && mlSuggestions.length > 0) {
              return mlSuggestions;
            }
          } catch (error) {
            console.error('ML suggestions failed, falling back:', error);
          }
        }
        
        // Try Elasticsearch next
        const isElasticsearchAvailable = await SearchEngine.isElasticsearchAvailable();
        
        if (isElasticsearchAvailable) {
          return await getElasticsearchSuggestions(query, suggestionLimit, type as string);
        } else {
          return await getDatabaseSuggestions(query, suggestionLimit, type as string);
        }
      },
      300 // 5 minutes cache
    );

    res.status(200).json({
      success: true,
      query,
      suggestions
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
}

/**
 * Get ML-powered suggestions with NLP and fuzzy matching
 */
async function getMLSuggestions(
  query: string,
  limit: number,
  type: string,
  userId?: string
) {
  try {
    // Call ML service for smart suggestions
    const mlResponse = await mlClient.search(
      {
        query,
        filters: {},
        userId,
        limit: limit * 2, // Request more for better filtering
      },
      // Fallback to database suggestions
      async () => {
        return {
          results: [],
          suggestions: await getDatabaseSuggestions(query, limit, type),
          totalCount: 0,
        };
      }
    );

    if (!mlResponse.success || !mlResponse.data) {
      return null;
    }

    const { suggestions: mlSuggestions, results } = mlResponse.data;

    // Combine ML suggestions with product results
    const combinedSuggestions: any[] = [];

    // Add ML-generated suggestions (typo corrections, synonyms, etc.)
    if (mlSuggestions && mlSuggestions.length > 0) {
      combinedSuggestions.push(
        ...mlSuggestions.slice(0, Math.ceil(limit / 2)).map((s: string) => ({
          text: s,
          type: 'suggestion',
          score: 100,
        }))
      );
    }

    // Add product name suggestions from ML results
    if (results && results.length > 0) {
      const productSuggestions = results
        .slice(0, Math.ceil(limit / 2))
        .map((r: any) => ({
          text: r.name,
          type: 'product',
          id: r.id,
          score: r.relevance || 50,
        }));
      
      combinedSuggestions.push(...productSuggestions);
    }

    // Sort by score and limit
    return combinedSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('ML suggestions error:', error);
    return null;
  }
}

async function getElasticsearchSuggestions(query: string, limit: number, type: string) {
  try {
    const suggestions = await SearchEngine.getSearchSuggestions('products', query, limit);
    
    // Add type information
    return suggestions.map(suggestion => ({
      ...suggestion,
      type: 'product'
    }));
  } catch (error) {
    console.error('Elasticsearch suggestions error:', error);
    return await getDatabaseSuggestions(query, limit, type);
  }
}

async function getDatabaseSuggestions(query: string, limit: number, type: string) {
  const suggestions: any[] = [];

  try {
    if (type === 'all' || type === 'products') {
      // Product suggestions
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          name: true,
          category: true
        },
        take: Math.ceil(limit / 3),
        orderBy: { name: 'asc' }
      });

      suggestions.push(...products.map(p => ({
        text: p.name,
        type: 'product',
        category: p.category,
        score: calculateRelevanceScore(p.name, query)
      })));
    }

    if (type === 'all' || type === 'farmers') {
      // Farmer suggestions
      const farmers = await prisma.farmer.findMany({
        where: {
          isApproved: true,
          farmName: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          farmName: true,
          location: true
        },
        take: Math.ceil(limit / 3),
        orderBy: { farmName: 'asc' }
      });

      suggestions.push(...farmers.map(f => ({
        text: f.farmName,
        type: 'farmer',
        location: f.location,
        score: calculateRelevanceScore(f.farmName, query)
      })));
    }

    if (type === 'all' || type === 'categories') {
      // Category suggestions
      const categories = await prisma.product.groupBy({
        by: ['category'],
        where: {
          isActive: true,
          category: {
            contains: query,
            mode: 'insensitive'
          }
        },
        _count: {
          category: true
        },
        orderBy: {
          _count: {
            category: 'desc'
          }
        },
        take: Math.ceil(limit / 3)
      });

      suggestions.push(...categories.map(c => ({
        text: c.category,
        type: 'category',
        count: c._count.category,
        score: calculateRelevanceScore(c.category, query)
      })));
    }

    // Sort by relevance score and limit results
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

  } catch (error) {
    console.error('Database suggestions error:', error);
    return [];
  }
}

function calculateRelevanceScore(text: string, query: string): number {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match gets highest score
  if (textLower === queryLower) return 100;
  
  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return 80;
  
  // Contains query gets medium score
  if (textLower.includes(queryLower)) return 60;
  
  // Calculate similarity based on common characters
  let commonChars = 0;
  for (const char of queryLower) {
    if (textLower.includes(char)) {
      commonChars++;
    }
  }
  
  return (commonChars / queryLower.length) * 40;
}