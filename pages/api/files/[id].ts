import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// FileUploadService removed - AWS S3 removed in clean version
import { prisma } from '@/lib/db-optimization';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid file ID' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id, session.user.id);
    case 'DELETE':
      return handleDelete(req, res, id, session.user.id);
    case 'PUT':
      return handleUpdate(req, res, id, session.user.id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, fileId: string, userId: string) {
  try {
    console.log('[File Get] File retrieval disabled - S3 removed:', { fileId, userId });
    
    res.status(501).json({ 
      error: 'File retrieval not available - storage disabled in clean version' 
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, fileId: string, userId: string) {
  try {
    console.log('[File Delete] File deletion disabled - S3 removed:', { fileId, userId });
    
    res.status(501).json({ 
      error: 'File deletion not available - storage disabled in clean version' 
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
}

async function handleUpdate(req: NextApiRequest, res: NextApiResponse, fileId: string, userId: string) {
  try {
    // Verify file ownership
    const existingFile = await prisma.file.findFirst({
      where: {
        id: fileId,
        uploadedBy: userId
      }
    });

    if (!existingFile) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    // No schema-backed fields to update here; return existing file
    return res.status(200).json({ 
      success: true, 
      message: 'No updatable fields in current schema; returning existing file.',
      file: existingFile
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
}