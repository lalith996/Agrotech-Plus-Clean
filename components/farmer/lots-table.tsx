'use client'

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/ui/search"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { mockQuery } from "@/lib/agrotrackMockData"
import { formatDate, formatWeight } from "@/lib/utils"
import { LotStatus } from "@/lib/types"
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid"

const statusColors: Record<LotStatus, "secondary" | "default" | "outline"> = {
  [LotStatus.PLANTED]: "secondary",
  [LotStatus.GROWING]: "default",
  [LotStatus.HARVESTED]: "default",
  [LotStatus.PACKAGED]: "default",
  [LotStatus.SHIPPED]: "outline"
}

export function LotsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  
  const lots = mockQuery.farmerLots.filter(lot =>
    lot.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-sm">
          <Search
            placeholder="Search lots..."
            value={searchTerm}
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2">
          <PlusIcon className="h-4 w-4" />
          New Lot
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farmer Lots</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Planted Date</TableHead>
                <TableHead>Harvest Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {lots.map((lot) => (
                  <motion.tr
                    key={lot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="group hover:bg-muted/50 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === lot.id ? null : lot.id)}
                  >
                    <TableCell className="font-medium">{lot.name}</TableCell>
                    <TableCell>{formatDate(lot.plantedDate)}</TableCell>
                    <TableCell>{formatDate(lot.harvestDate)}</TableCell>
                    <TableCell>{formatWeight(lot.quantity)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[lot.status]}>
                        {lot.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          
          <AnimatePresence>
            {expandedRow && (() => {
              const expandedLot = lots.find(lot => lot.id === expandedRow)
              return expandedLot && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="border-t bg-muted/25 p-4"
                >
                  <div className="space-y-2">
                    <h4 className="font-semibold">Certifications:</h4>
                    <div className="flex gap-2">
                      {expandedLot.certifications.map((cert) => (
                        <Badge key={cert} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })()}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}