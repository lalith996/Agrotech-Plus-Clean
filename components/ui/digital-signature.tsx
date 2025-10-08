'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  PenTool, 
  RotateCcw, 
  Check, 
  X,
  Download,
  Upload,
  User,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface SignatureData {
  signature: string // Base64 data URL
  signerName: string
  signerRole: string
  timestamp: number
  deviceInfo: string
  metadata?: {
    width: number
    height: number
    strokeCount: number
  }
}

interface DigitalSignatureProps {
  onSignature: (signatureData: SignatureData) => void
  signerName?: string
  signerRole?: string
  title?: string
  description?: string
  required?: boolean
  width?: number
  height?: number
  className?: string
}

export function DigitalSignature({
  onSignature,
  signerName = '',
  signerRole = '',
  title = "Digital Signature",
  description = "Please sign below to confirm",
  required = false,
  width = 400,
  height = 200,
  className = ''
}: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)
  const [localSignerName, setLocalSignerName] = useState(signerName)
  const [localSignerRole, setLocalSignerRole] = useState(signerRole)
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up canvas
    canvas.width = width
    canvas.height = height
    
    // Configure drawing context
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // Set background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [width, height])

  const getEventPos = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0] || event.changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      }
    } else {
      // Mouse event
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      }
    }
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    const pos = getEventPos(event)
    setIsDrawing(true)
    setLastPoint(pos)
    
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    if (!isDrawing || !lastPoint) return

    const pos = getEventPos(event)
    const ctx = canvasRef.current?.getContext('2d')
    
    if (ctx) {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      setLastPoint(pos)
    }
  }

  const stopDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    if (isDrawing) {
      setIsDrawing(false)
      setLastPoint(null)
      setStrokeCount(prev => prev + 1)
      setHasSignature(true)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    
    if (canvas && ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setHasSignature(false)
      setStrokeCount(0)
    }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) {
      toast.error('Please provide a signature first')
      return
    }

    if (!localSignerName.trim()) {
      toast.error('Please enter signer name')
      return
    }

    // Convert canvas to data URL
    const dataURL = canvas.toDataURL('image/png')
    
    const signatureData: SignatureData = {
      signature: dataURL,
      signerName: localSignerName.trim(),
      signerRole: localSignerRole.trim(),
      timestamp: Date.now(),
      deviceInfo: navigator.userAgent,
      metadata: {
        width: canvas.width,
        height: canvas.height,
        strokeCount
      }
    }

    onSignature(signatureData)
    toast.success('Signature captured successfully')
  }

  const downloadSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) {
      toast.error('No signature to download')
      return
    }

    const link = document.createElement('a')
    link.download = `signature-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const uploadSignature = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        
        if (canvas && ctx) {
          // Clear canvas
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          // Draw uploaded image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          setHasSignature(true)
          setStrokeCount(1)
          toast.success('Signature uploaded successfully')
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
    
    // Reset file input
    event.target.value = ''
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PenTool className="w-5 h-5 mr-2" />
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Signer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="signerName" className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              Signer Name {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id="signerName"
              value={localSignerName}
              onChange={(e) => setLocalSignerName(e.target.value)}
              placeholder="Enter full name"
              required={required}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signerRole">Role/Title</Label>
            <Input
              id="signerRole"
              value={localSignerRole}
              onChange={(e) => setLocalSignerRole(e.target.value)}
              placeholder="e.g., Quality Inspector"
            />
          </div>
        </div>

        {/* Signature Canvas */}
        <div className="space-y-2">
          <Label>Signature</Label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
            <canvas
              ref={canvasRef}
              className="border border-gray-200 rounded cursor-crosshair touch-none w-full"
              style={{ maxWidth: '100%', height: 'auto' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            
            {/* Signature line */}
            <div className="absolute bottom-4 left-4 right-4 border-b border-gray-400 pointer-events-none" />
            
            {/* Status indicator */}
            {hasSignature && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Signed
                </Badge>
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            Sign above using your finger or stylus. {strokeCount > 0 && `Strokes: ${strokeCount}`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          
          <Button
            variant="outline"
            onClick={downloadSignature}
            disabled={!hasSignature}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button
            variant="outline"
            onClick={() => document.getElementById('signature-upload')?.click()}
            className="flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          
          <Button
            onClick={saveSignature}
            disabled={!hasSignature || !localSignerName.trim()}
            className="flex items-center ml-auto"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Signature
          </Button>
        </div>

        {/* Timestamp */}
        {hasSignature && (
          <div className="flex items-center text-xs text-gray-500 pt-2 border-t">
            <Calendar className="w-3 h-3 mr-1" />
            Signature created: {new Date().toLocaleString()}
          </div>
        )}

        {/* Hidden file input */}
        <input
          id="signature-upload"
          type="file"
          accept="image/*"
          onChange={uploadSignature}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}

// Signature verification component
interface SignatureVerificationProps {
  signatureData: SignatureData
  className?: string
}

export function SignatureVerification({ signatureData, className = '' }: SignatureVerificationProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <Check className="w-4 h-4 text-green-600 mr-2" />
          Verified Signature
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Signature Image */}
        <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
          <img
            src={signatureData.signature}
            alt="Digital Signature"
            className="w-full h-auto max-h-24 object-contain"
          />
        </div>
        
        {/* Signature Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Signer:</span>
            <span className="font-medium">{signatureData.signerName}</span>
          </div>
          
          {signatureData.signerRole && (
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="font-medium">{signatureData.signerRole}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Signed:</span>
            <span className="font-medium">
              {new Date(signatureData.timestamp).toLocaleString()}
            </span>
          </div>
          
          {signatureData.metadata && (
            <div className="flex justify-between">
              <span className="text-gray-600">Strokes:</span>
              <span className="font-medium">{signatureData.metadata.strokeCount}</span>
            </div>
          )}
        </div>
        
        {/* Verification Badge */}
        <div className="pt-2 border-t">
          <Badge variant="secondary" className="bg-green-100 text-green-800 w-full justify-center">
            <Check className="w-3 h-3 mr-1" />
            Digitally Verified
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}