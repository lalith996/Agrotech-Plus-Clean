import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RoleBasedLayout } from "@/components/auth/role-based-layout"
import { 
  Package, 
  AlertCircle, 
  RefreshCw,
  Phone,
  User,
  MapPin,
  TrendingUp,
  Edit2,
  Check,
  X
} from "lucide-react"

interface ProcurementFarmer {
  farmerId: string
  farmerName: string
  farmName: string
  assignedQuantity: number
  capacity: number
  qualityScore: number
  pricePerUnit: number
  phone: string | null
}

interface ProcurementItem {
  productId: string
  productName: string
  category: string
  unit: string
  totalQuantity: number
  farmers: ProcurementFarmer[]
}

interface ProcurementList {
  date: string
  totalItems: number
  totalFarmers: number
  items: ProcurementItem[]
}

interface ProcurementResponse {
  success: boolean
  procurementList: ProcurementList
  dateRange: {
    start: string
    end: string
    days: number
  }
}

export default function AdminProcurementPage() {
  const { data: session } = useSession()
  const [procurementData, setProcurementData] = useState<ProcurementResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(3)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editedQuantities, setEditedQuantities] = useState<Record<string, Record<string, number>>>({})

  const generateProcurementList = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/admin/procurement/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ days })
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate procurement list")
      }
      
      const data = await response.json()
      setProcurementData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateProcurementList()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  const handleEditQuantity = (productId: string, farmerId: string, newQuantity: number) => {
    setEditedQuantities(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [farmerId]: newQuantity
      }
    }))
  }

  const saveQuantityEdit = (productId: string) => {
    // In a real implementation, this would save to the database
    setEditingItem(null)
    // You could add an API call here to persist the changes
  }

  const cancelQuantityEdit = (productId: string) => {
    setEditingItem(null)
    setEditedQuantities(prev => {
      const newState = { ...prev }
      delete newState[productId]
      return newState
    })
  }

  const getDisplayQuantity = (productId: string, farmerId: string, originalQuantity: number) => {
    return editedQuantities[productId]?.[farmerId] ?? originalQuantity
  }

  if (loading && !procurementData) {
    return (
      <RoleBasedLayout allowedRoles={['ADMIN', 'OPERATIONS']}>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout allowedRoles={['ADMIN', 'OPERATIONS']}>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Procurement Management 📦
          </h1>
          <p className="text-gray-600">
            Generate and manage procurement lists for upcoming orders
          </p>
        </div>

        {/* Controls */}
        <Card className="rounded-xl shadow-sm border-gray-200 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Generate Procurement List</CardTitle>
            <CardDescription>Calculate required quantities for upcoming orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forecast Period (Days)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 3)}
                  className="rounded-lg"
                />
              </div>
              <Button 
                onClick={generateProcurementList}
                disabled={loading}
                className="bg-[#00B207] hover:bg-[#009406] text-white rounded-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate List
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {procurementData && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="rounded-xl shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Date Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-gray-900">
                    {formatDate(procurementData.dateRange.start)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    to {formatDate(procurementData.dateRange.end)}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Total Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {procurementData.procurementList.totalItems}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Unique products</p>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Total Farmers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {procurementData.procurementList.totalFarmers}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Suppliers involved</p>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Forecast Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {procurementData.dateRange.days}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Days ahead</p>
                </CardContent>
              </Card>
            </div>

            {/* Procurement Items */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Procurement Items</h2>
              
              {procurementData.procurementList.items.length === 0 ? (
                <Card className="rounded-xl shadow-sm border-gray-200">
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No procurement items found for the selected period.</p>
                    <p className="text-sm text-gray-500 mt-2">Try increasing the forecast period or check if there are upcoming orders.</p>
                  </CardContent>
                </Card>
              ) : (
                procurementData.procurementList.items.map((item) => (
                  <Card key={item.productId} className="rounded-xl shadow-sm border-gray-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {item.productName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant="secondary" className="mr-2">{item.category}</Badge>
                            Total Required: <span className="font-semibold">{item.totalQuantity} {item.unit}</span>
                          </CardDescription>
                        </div>
                        {editingItem === item.productId ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveQuantityEdit(item.productId)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelQuantityEdit(item.productId)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingItem(item.productId)}
                            className="text-gray-600 hover:bg-gray-50"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Adjust
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Assigned Farmers ({item.farmers.length})
                        </h4>
                        {item.farmers.map((farmer) => (
                          <div 
                            key={farmer.farmerId} 
                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h5 className="font-semibold text-gray-900">{farmer.farmName}</h5>
                                <Badge 
                                  variant="secondary"
                                  className={
                                    farmer.qualityScore >= 90 ? 'bg-green-100 text-green-800' :
                                    farmer.qualityScore >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }
                                >
                                  Quality: {farmer.qualityScore}%
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                <User className="w-3 h-3 inline mr-1" />
                                {farmer.farmerName}
                              </p>
                              {farmer.phone && (
                                <p className="text-sm text-gray-600 mb-2">
                                  <Phone className="w-3 h-3 inline mr-1" />
                                  <a href={`tel:${farmer.phone}`} className="text-[#00B207] hover:underline">
                                    {farmer.phone}
                                  </a>
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                <span>Price: {formatPrice(farmer.pricePerUnit)}/{item.unit}</span>
                                <span>•</span>
                                <span>Capacity: {farmer.capacity} {item.unit}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              {editingItem === item.productId ? (
                                <div className="flex flex-col items-end gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={farmer.capacity}
                                    value={getDisplayQuantity(item.productId, farmer.farmerId, farmer.assignedQuantity)}
                                    onChange={(e) => handleEditQuantity(item.productId, farmer.farmerId, parseFloat(e.target.value) || 0)}
                                    className="w-24 text-right"
                                  />
                                  <span className="text-xs text-gray-500">{item.unit}</span>
                                </div>
                              ) : (
                                <>
                                  <div className="text-2xl font-bold text-gray-900">
                                    {getDisplayQuantity(item.productId, farmer.farmerId, farmer.assignedQuantity)}
                                  </div>
                                  <p className="text-xs text-gray-500">{item.unit} assigned</p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Total: {formatPrice(farmer.pricePerUnit * getDisplayQuantity(item.productId, farmer.farmerId, farmer.assignedQuantity))}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </RoleBasedLayout>
  )
}
