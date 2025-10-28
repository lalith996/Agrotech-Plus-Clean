import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mlClient, RecommendationResponse } from "@/lib/ml-client"
import { UserRole } from "@prisma/client"

/**
 * Product Recommendations API
 * 
 * GET /api/personalization/recommendations
 * 
 * Returns personalized product recommendations for the authenticated user.
 * Uses ML service for collaborative filtering with fallback to trending products.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Only customers can get recommendations
  if (session.user.role !== UserRole.CUSTOMER) {
    return res.status(403).json({ message: "Access denied" })
  }

  try {
    const { context = 'dashboard', limit = 10 } = req.query

    // Get customer profile
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    })

    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" })
    }

    // Define fallback function for trending products
    const getTrendingProducts = async (): Promise<RecommendationResponse> => {
      const trendingProducts = await prisma.product.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          orderItems: {
            _count: "desc"
          }
        },
        take: parseInt(limit as string) || 10,
        select: {
          id: true,
          name: true
        }
      })

      return {
        products: trendingProducts.map(p => ({
          id: p.id,
          name: p.name,
          score: 0.5 // Default score for trending
        })),
        confidence: 0.5,
        algorithm: 'trending-fallback'
      }
    }

    // Call ML service for recommendations
    const mlResponse = await mlClient.getRecommendations(
      {
        userId: session.user.id,
        context: context as 'dashboard' | 'product-page' | 'cart',
        limit: parseInt(limit as string) || 10
      },
      getTrendingProducts
    )

    if (!mlResponse.success || !mlResponse.data) {
      // If ML service fails completely, use fallback
      const fallbackData = await getTrendingProducts()
      const products = await enrichProductData(fallbackData.products.map(p => p.id))
      
      return res.status(200).json({
        products,
        confidence: fallbackData.confidence,
        algorithm: fallbackData.algorithm,
        cached: false,
        fallback: true
      })
    }

    // Enrich product data from database
    const productIds = mlResponse.data.products.map(p => p.id)
    const products = await enrichProductData(productIds)

    res.status(200).json({
      products,
      confidence: mlResponse.data.confidence,
      algorithm: mlResponse.data.algorithm,
      cached: mlResponse.cached || false,
      fallback: mlResponse.fallback || false
    })
  } catch (error) {
    console.error("Recommendations API error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

/**
 * Enrich product IDs with full product data from database
 */
async function enrichProductData(productIds: string[]) {
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true
    },
    include: {
      farmer: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      }
    }
  })

  // Maintain order from ML service
  const productMap = new Map(products.map(p => [p.id, p]))
  const orderedProducts = productIds
    .map(id => productMap.get(id))
    .filter(p => p !== undefined)

  return orderedProducts.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    basePrice: product.basePrice,
    unit: product.unit,
    images: product.images,
    farmer: {
      name: product.farmer.user.name || "Unknown",
      farmName: product.farmer.farmName
    }
  }))
}
