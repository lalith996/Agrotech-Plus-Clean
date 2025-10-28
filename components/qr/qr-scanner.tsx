'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { mockQuery } from "@/lib/agrotrackMockData"
import { formatDate } from "@/lib/utils"
import { QrCodeIcon } from "@heroicons/react/24/solid"

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<typeof mockQuery.traceabilityData | null>(null)

  const handleScan = () => {
    setIsScanning(true)
    // Simulate scanning delay
    setTimeout(() => {
      setScannedData(mockQuery.traceabilityData)
      setIsScanning(false)
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCodeIcon className="h-6 w-6" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square max-w-sm mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-brand rounded-lg overflow-hidden">
              {/* Scan frame corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand" />
              
              {/* Animated scan line */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ y: "-100%" }}
                    animate={{ y: "100%" }}
                    transition={{ 
                      duration: 2.4, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="absolute left-0 w-full h-0.5 bg-brand shadow-lg"
                    style={{
                      boxShadow: "0 0 20px hsl(var(--brand))"
                    }}
                  />
                )}
              </AnimatePresence>
              
              {/* Camera view placeholder */}
              <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                <QrCodeIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={handleScan} 
              disabled={isScanning}
              className="w-full"
              aria-describedby="scan-instructions"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!isScanning) handleScan()
                }
              }}
            >
              {isScanning ? "Scanning..." : "Start Scan"}
            </Button>
            <p id="scan-instructions" className="sr-only">
              Press Enter or Space to start scanning QR code
            </p>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {scannedData && (
          <motion.div
            initial={{ opacity: 0, rotateY: 8 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -8 }}
            transition={{ duration: 0.32 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Product Traceability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-brand mb-2">
                    {scannedData.product}
                  </h3>
                  <p className="text-muted-foreground">
                    QR Code: {scannedData.qrCode}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Origin</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Farm:</span> {scannedData.origin.farm}</p>
                    <p><span className="font-medium">Location:</span> {scannedData.origin.location}</p>
                    <p><span className="font-medium">Farmer:</span> {scannedData.origin.farmer}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Journey Timeline</h4>
                  <div className="space-y-4">
                    {scannedData.journey.map((stage: { stage: string; date: Date; location: string }, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-3 h-3 rounded-full bg-brand flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{stage.stage}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(stage.date)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {stage.location}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}