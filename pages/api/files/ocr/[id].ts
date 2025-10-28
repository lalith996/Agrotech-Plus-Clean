import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OCRService } from '@/lib/ocr-service';
import { prisma } from '@/lib/db-optimization';
// S3StorageService removed - AWS S3 removed in clean version

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid file ID' });
  }

  try {
    // Get file record
    const file = await prisma.file.findFirst({
      where: {
        id,
        uploadedBy: session.user.id
      }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if file is an image or PDF
    if (!file.mimeType.startsWith('image/') && file.mimeType !== 'application/pdf') {
      return res.status(400).json({ error: 'OCR is only supported for images and PDF files' });
    }

    console.log('[OCR] File download disabled - S3 removed:', {
      fileId: file.id,
      mimeType: file.mimeType
    });

    res.status(501).json({
      error: 'OCR processing not available - file storage disabled in clean version'
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'OCR processing failed'
    });
  }
}