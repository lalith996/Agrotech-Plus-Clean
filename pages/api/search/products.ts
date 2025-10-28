import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db-optimization'
import { SearchEngine, PRODUCT_FILTERS } from '@/lib/search'
import { cacheHelpers } from '@/lib/cache'
import { z } from 'zod'
import { mlClient, mlFallbacks } from '@/lib/ml-client'
import { ML_FEATURES } from '@/lib/config/ml-endpoints'

const searchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  fuzzy: z.boolean().optional()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Parse and validate query parameters
    const queryParams = {
      query: req.query.query as string,
      filters: req.query.filters ? JSON.parse(req.query.filters as string) : {},
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      fuzzy: req.query.fuzzy === 'true'
    }

    const validationResult = searchSchema.safeParse(queryParams)
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        errors: validationResult.error.errors
      })
    }

    const searchOptions = validationResult.data

    // Cache key for search results
    const cacheKey = `search:products:${JSON.stringify(searchOptions)}`;

    const results = await cacheHelpers.cacheSearchResults(
      searchOptions.query || '',
      searchOptions.filters || {},
      async () => {
        // Try ML-powered smart search first if enabled and query exists
        if (ML_FEATURES.smartSearch.enabled && searchOptions.query && searchOptions.query.length >= 2) {
          try {
            const mlSearchResult = await performMLSearch(
              searchOptions,
              session?.user?.id
            );
            
            if (mlSearchResult) {
              return mlSearchResult;
            }
          } catch (error) {
            console.error('ML search failed, falling back to traditional search:', error);
          }
        }
        
        // Try Elasticsearch next, fallback to database
        const isElasticsearchAvailable = await SearchEngine.isElasticsearchAvailable();
        
        if (isElasticsearchAvailable && searchOptions.query) {
          return await SearchEngine.searchWithElasticsearch('products', searchOptions);
        } else {
          // Fallback to database search
          return await performDatabaseProductSearch(searchOptions);
        }
      },
      180 // 3 minutes cache
    );

    // Track search query for analytics and ML learning
    if (searchOptions.query && session?.user?.id) {
      await trackSearchQuery(searchOptions.query, session.user.id, results.total);
    }

    return res.status(200).json({
      success: true,
      ...results,
      searchOptions: {
        query: searchOptions.query,
        filters: searchOptions.filters,
        sortBy: searchOptions.sortBy,
        sortOrder: searchOptions.sortOrder,
        fuzzy: searchOptions.fuzzy
      }
    })

  } catch (error) {
    console.error('Error searching products:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

/**
 * Perform ML-powered smart search with NLP processing
 */
async function performMLSearch(options: any, userId?: string) {
  const { query, filters, page, limit, sortBy, sortOrder } = options;

  // Call ML service for NLP-powered search
  const mlResponse = await mlClient.search(
    {
      query,
      filters,
      userId,
      limit: limit * 2, // Request more results for better ranking
    },
    // Fallback to basic search if ML service unavailable
    async () => {
      return await mlFallbacks.basicSearch(query, filters, limit * 2);
    }
  );

  if (!mlResponse.success || !mlResponse.data) {
    return null;
  }

  const { results, totalCount } = mlResponse.data;

  // If ML service returned no results, return null to trigger fallback
  if (!results || results.length === 0) {
    return null;
  }

  // Fetch full product details for ML-ranked results
  const productIds = results.map((r: any) => r.id);
  
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
      farmer: {
        isApproved: true
      }
    },
    include: {
      farmer: {
        select: {
          id: true,
          farmName: true,
          location: true,
          isApproved: true
        }
      }
    }
  });

  // Sort products by ML relevance scores
  const relevanceMap = new Map(results.map((r: any) => [r.id, r.relevance]));
  const sortedProducts = products.sort((a, b) => {
    const scoreA = relevanceMap.get(a.id) || 0;
    const scoreB = relevanceMap.get(b.id) || 0;
    return scoreB - scoreA;
  });

  // Apply pagination
  const skip = (page - 1) * limit;
  const paginatedProducts = sortedProducts.slice(skip, skip + limit);
  const total = totalCount || sortedProducts.length;
  const totalPages = Math.ceil(total / limit);

  return {
    items: paginatedProducts,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    mlPowered: !mlResponse.fallback, // Indicate if ML was used
  };
}

async function performDatabaseProductSearch(options: any) {
  const { page, limit, query, filters, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    isActive: true,
    farmer: {
      isApproved: true
    }
  };

  // Text search
  if (query) {
    where.OR = [
      {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      {
        description: {
          contains: query,
          mode: 'insensitive'
        }
      },
      {
        farmer: {
          farmName: {
            contains: query,
            mode: 'insensitive'
          }
        }
      }
    ];
  }

  // Apply filters
  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.organic !== undefined) {
    // Assuming organic is stored in metadata or as a separate field
    where.metadata = {
      path: ['organic'],
      equals: filters.organic
    };
  }

  if (filters.inStock !== undefined) {
    where.isActive = filters.inStock;
  }

  if (filters.price && (filters.price.min !== undefined || filters.price.max !== undefined)) {
    where.basePrice = {};
    if (filters.price.min !== undefined) where.basePrice.gte = filters.price.min;
    if (filters.price.max !== undefined) where.basePrice.lte = filters.price.max;
  }

  // Build order by
  const orderBy: any = [];
  
  switch (sortBy) {
    case 'name':
      orderBy.push({ name: sortOrder || 'asc' });
      break;
    case 'price':
      orderBy.push({ basePrice: sortOrder || 'asc' });
      break;
    case 'newest':
      orderBy.push({ createdAt: 'desc' });
      break;
    default:
      orderBy.push({ name: 'asc' });
  }

  // Execute queries
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        farmer: {
          select: {
            id: true,
            farmName: true,
            location: true,
            isApproved: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items: products,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

/**
 * Track search query for analytics and ML learning
 */
async function trackSearchQuery(query: string, userId: string, results: number) {
  try {
    await prisma.searchQuery.create({
      data: {
        query,
        userId,
        results
      }
    });
  } catch (error) {
    console.error('Search tracking error:', error);
  }
}