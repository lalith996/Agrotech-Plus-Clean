import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// File upload service removed - AWS S3 removed in clean version

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { 
      category, 
      entityType, 
      entityId, 
      page = '1', 
      limit = '20' 
    } = req.query;

    console.log('[Files List] File listing disabled - S3 removed:', {
      userId: session.user.id,
      category,
      entityType,
      entityId
    });

    // Return empty result since file storage is disabled
    res.status(200).json({
      success: true,
      files: [],
      total: 0,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
}