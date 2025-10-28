import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mlClient, mlFallbacks } from '@/lib/ml-client';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Farmer Scoring API Endpoint
 * 
 * Scores farmer applications using ML service or rule-based fallback.
 * Provides approval recommendation based on multiple factors.
 */

// Request validation schema
const scoreRequestSchema = z.object({
  farmerId: z.string().cuid(),
});

// Response type
interface FarmerScoreResponse {
  score: number;
  factors: Array<{
    name: string;
    score: number;
    weight: number;
    details: string;
  }>;
  recommendation: 'approve' | 'review' | 'reject';
  usedFallback: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FarmerScoreResponse | { error: string; message: string }>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'Only POST requests are allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'You must be logged in' });
    }

    // Check authorization - only ADMIN and OPERATIONS can score farmers
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATIONS') {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You do not have permission to score farmer applications' 
      });
    }

    // Validate request body
    const validation = scoreRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: validation.error.errors[0].message 
      });
    }

    const { farmerId } = validation.data;

    // Fetch farmer data with related information
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        certifications: {
          include: {
            file: true,
          },
        },
        products: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!farmer) {
      return res.status(404).json({ error: 'Not found', message: 'Farmer not found' });
    }

    type FarmerWithRelations = Prisma.FarmerGetPayload<{
      include: {
        user: { select: { id: true; name: true; email: true } },
        certifications: { include: { file: true } },
        products: { select: { id: true } },
      }
    }>;

    const farmerData = farmer as FarmerWithRelations;

    // Prepare data for ML service
    const mlRequest = {
      farmerId: farmerData.id,
      certifications: farmerData.certifications.map((cert) => ({
        id: cert.id,
        name: cert.name,
        issuingBody: cert.issuingBody,
        issueDate: cert.issueDate.toISOString(),
        expiryDate: cert.expiryDate?.toISOString(),
        isValidated: cert.isValidated,
        hasFile: !!cert.fileId,
      })),
      location: farmerData.location,
      phone: farmerData.phone ?? undefined,
      farmName: farmerData.farmName,
      description: farmerData.description,
      productsCount: farmerData.products.length,
    };

    // Define fallback function for rule-based scoring
    const fallbackScoring = async () => {
      return calculateRuleBasedScore(farmerData, mlRequest);
    };

    // Call ML service with fallback
    const mlResponse = await mlClient.scoreFarmerApplication(mlRequest, fallbackScoring);

    if (!mlResponse.success || !mlResponse.data) {
      // If ML service failed and no fallback, use our own fallback
      const fallbackData = await fallbackScoring();
      return res.status(200).json({
        ...fallbackData,
        usedFallback: true,
      });
    }

    // Return ML service response
    return res.status(200).json({
      score: mlResponse.data.score,
      factors: mlResponse.data.factors,
      recommendation: mlResponse.data.recommendation,
      usedFallback: mlResponse.fallback || false,
    });

  } catch (error) {
    console.error('Error scoring farmer application:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to score farmer application' 
    });
  }
}

/**
 * Calculate rule-based score when ML service is unavailable
 */
function calculateRuleBasedScore(
  farmer: any,
  mlRequest: any
): FarmerScoreResponse {
  const factors: FarmerScoreResponse['factors'] = [];
  let totalScore = 0;

  // Factor 1: Certifications (40% weight)
  const certCount = mlRequest.certifications.length;
  const validCertCount = mlRequest.certifications.filter((c: any) => c.isValidated).length;
  const certScore = Math.min((certCount * 10) + (validCertCount * 5), 40);
  factors.push({
    name: 'Certifications',
    score: certScore,
    weight: 0.4,
    details: `${certCount} certification(s) provided, ${validCertCount} validated`,
  });
  totalScore += certScore;

  // Factor 2: Location Information (15% weight)
  const hasLocation = mlRequest.location && mlRequest.location.length > 0;
  const hasCity = mlRequest.city && mlRequest.city.length > 0;
  const locationScore = (hasLocation ? 10 : 0) + (hasCity ? 5 : 0);
  factors.push({
    name: 'Location',
    score: locationScore,
    weight: 0.15,
    details: hasLocation 
      ? `Location verified: ${mlRequest.location}` 
      : 'Location not provided',
  });
  totalScore += locationScore;

  // Factor 3: Contact Information (15% weight)
  const hasPhone = mlRequest.phone && mlRequest.phone.length > 0;
  const contactScore = hasPhone ? 15 : 5;
  factors.push({
    name: 'Contact Information',
    score: contactScore,
    weight: 0.15,
    details: hasPhone ? 'Phone number provided' : 'Phone number missing',
  });
  totalScore += contactScore;

  // Factor 4: Farm Details (20% weight)
  const hasFarmName = mlRequest.farmName && mlRequest.farmName.length > 0;
  const hasDescription = mlRequest.description && mlRequest.description.length > 0;
  const detailsScore = (hasFarmName ? 10 : 0) + (hasDescription ? 10 : 0);
  factors.push({
    name: 'Farm Details',
    score: detailsScore,
    weight: 0.2,
    details: `Farm name: ${hasFarmName ? 'provided' : 'missing'}, Description: ${hasDescription ? 'provided' : 'missing'}`,
  });
  totalScore += detailsScore;

  // Factor 5: Product Listings (10% weight)
  const productsScore = Math.min(mlRequest.productsCount * 2, 10);
  factors.push({
    name: 'Product Listings',
    score: productsScore,
    weight: 0.1,
    details: `${mlRequest.productsCount} product(s) listed`,
  });
  totalScore += productsScore;

  // Determine recommendation based on total score
  let recommendation: 'approve' | 'review' | 'reject';
  if (totalScore >= 70) {
    recommendation = 'approve';
  } else if (totalScore >= 50) {
    recommendation = 'review';
  } else {
    recommendation = 'reject';
  }

  return {
    score: Math.min(totalScore, 100),
    factors,
    recommendation,
    usedFallback: true,
  };
}
