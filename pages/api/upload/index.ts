import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db-optimization'
import multer from 'multer'
import { z } from 'zod'

// File upload disabled - AWS S3 removed in clean version
// This endpoint is kept for compatibility but uploads are not processed

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
    files: 10 // Max 10 files per request
  }
})

const uploadSchema = z.object({
  type: z.enum(['profileImages', 'productImages', 'documents', 'qcPhotos']),
  entityId: z.string().optional(),
  entityType: z.string().optional()
})

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

// Promisify multer
const multerMiddleware = (req: any, res: any) => {
  return new Promise((resolve, reject) => {
    upload.array('files')(req, res, (err: any) => {
      if (err) reject(err)
      else resolve(req.files)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Parse multipart form data
    await multerMiddleware(req, res)
    const files = (req as any).files as Express.Multer.File[]
    const body = (req as any).body

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    // Validate request body
    const validationResult = uploadSchema.safeParse(body)
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid request parameters',
        errors: validationResult.error.errors
      })
    }

    const { type, entityId, entityType } = validationResult.data

    // File upload disabled - AWS S3 removed in clean version
    console.log('[Upload] File upload attempted (disabled in clean version):', {
      userId: session.user.id,
      type,
      fileCount: files.length,
      files: files.map(f => ({
        name: f.originalname,
        size: f.size,
        type: f.mimetype
      }))
    });

    // Return mock response for compatibility
    const mockResults = files.map((file, index) => ({
      id: `mock-${Date.now()}-${index}`,
      key: `mock/${type}/${file.originalname}`,
      url: `/api/placeholder-image`,
      thumbnailUrl: `/api/placeholder-image`,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype,
      metadata: {}
    }));

    return res.status(200).json({
      success: true,
      message: `File upload disabled in clean version. ${files.length} file(s) logged to console.`,
      files: mockResults,
      note: 'AWS S3 integration removed - files not actually uploaded'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}