import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RoleBasedLayout } from "@/components/auth/role-based-layout"
import { 
  Package, 
  TrendingUp, 
  TrendingDown,
  Minus,
  IndianRupee,
  Calendar,
  AlertCircle,
  Info,
  AlertTriangle,
  Plus,
  Eye,
  User,
  BarChart3,
  Activity
} from "lucide-react"

interface DashboardData {
  isApproved: boolean
  message?: string
  upcomingDeliveries?: Array<{
    id: string
    deliveryDate: string
    status: string
    notes: string | null
  }>
  demandForecast?: Array<{
    productId: string
    productName: string
    quantity: number
    date: string
    confidence: number
  }>
  qualityScore?: {
    current: number
    trend: 'up' | 'down' | 'stable'
    history: Array<{
      date: string
      score: number
    }>
  }
  revenue?: {
    today: number
    week: number
    month: number
  }
  alerts?: Array<{
    type: 'info' | 'warning' | 'error'
    title: string
    message: string
    timestamp: string
  }>
}

interface ForecastData {
  forecasts: Array<{
    productId: string
    productName: string
    predictions: Array<{
      date: string
      quantity: number
      confidence: number
    }>
  }>
  accuracy: number
  cached?: boolean
  fallback?: boolean
  message?: string
}

interface QCResultsData {
  qualityScore: {
    current: number
    previous: number
    trend: 'up' | 'down' | 'stable'
  }
  trendData: Array<{
    date: string
    score: number
    acceptedQuantity: number
    rejectedQuantity: number
    totalQuantity: number
  }>
  recentResults: Array<{
    id: string
    productName: string
    unit: string
    expectedQuantity: number
    acceptedQuantity: number
    rejectedQuantity: number
    passRate: number
    status: 'pass' | 'warning' | 'fail'
    rejectionReasons: string[]
    timestamp: string
    notes: string | null
  }>
  summary: {
    totalInspections: number
    averagePassRate: number
    totalAccepted: number
    totalRejected: number
  }
}

export default function FarmerDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [qcResults, setQcResults] = useState<QCResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [forecastLoading, setForecastLoading] = useState(true)
  const [qcLoading, setQcLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/farmer/dashboard")
        
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }
        
        const data = await response.json()
        setDashboard(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setForecastLoading(true)
        const response = await fetch("/api/farmer/demand-forecast")
        
        if (!response.ok) {
          // Don't throw error, just log it
          console.error("Failed to fetch forecast data")
          return
        }
        
        const data = await response.json()
        setForecast(data)
      } catch (err) {
        console.error("Forecast fetch error:", err)
      } finally {
        setForecastLoading(false)
      }
    }

    fetchForecast()
  }, [])

  useEffect(() => {
    const fetchQCResults = async () => {
      try {
        setQcLoading(true)
        const response = await fetch("/api/farmer/qc-results?days=30&limit=10")
        
        if (!response.ok) {
          console.error("Failed to fetch QC results")
          return
        }
        
        const data = await response.json()
        setQcResults(data)
      } catch (err) {
        console.error("QC results fetch error:", err)
      } finally {
        setQcLoading(false)
      }
    }

    fetchQCResults()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <RoleBasedLayout allowedRoles={['FARMER']}>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </RoleBasedLayout>
    )
  }

  if (error) {
    return (
      <RoleBasedLayout allowedRoles={['FARMER']}>
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </RoleBasedLayout>
    )
  }

  // Show pending approval message
  if (dashboard && !dashboard.isApproved) {
    return (
      <RoleBasedLayout allowedRoles={['FARMER']}>
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Card className="rounded-xl shadow-lg border-yellow-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Pending Approval</CardTitle>
                  <CardDescription>Your farmer account is under review</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                {dashboard.message || "Your farmer account is pending approval. You will receive an email once approved."}
              </p>
              <p className="text-sm text-gray-600">
                Our team is reviewing your application and will notify you via email once your account is approved. 
                This usually takes 1-2 business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <RoleBasedLayout allowedRoles={['FARMER']}>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Farmer Dashboard 🌾
          </h1>
          <p className="text-gray-600">Manage your farm operations and track performance</p>
        </div>

        {/* Alerts */}
        {dashboard?.alerts && dashboard.alerts.length > 0 && (
          <div className="mb-8 space-y-4">
            {dashboard.alerts.map((alert, index) => (
              <Alert 
                key={index} 
                variant={alert.type === 'error' ? 'destructive' : 'default'}
                className={
                  alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  alert.type === 'info' ? 'border-blue-200 bg-blue-50' : ''
                }
              >
                {getAlertIcon(alert.type)}
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Today's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(dashboard?.revenue?.today || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Your share (60%)</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(dashboard?.revenue?.week || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(dashboard?.revenue?.month || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Current month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/farmer/products/new">
              <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                    <Plus className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Add Product</h3>
                  <p className="text-sm text-gray-600">List new products</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/farmer/orders">
              <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                    <Eye className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">View Orders</h3>
                  <p className="text-sm text-gray-600">Check order status</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/farmer/profile">
              <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                    <User className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Manage Profile</h3>
                  <p className="text-sm text-gray-600">Update farm info</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quality Score */}
          {dashboard?.qualityScore && (
            <Card className="rounded-xl shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  Quality Score
                  {getTrendIcon(dashboard.qualityScore.trend)}
                </CardTitle>
                <CardDescription>Based on recent QC inspections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {dashboard.qualityScore.current.toFixed(1)}%
                  </div>
                  <Badge variant={
                    dashboard.qualityScore.current >= 90 ? 'default' :
                    dashboard.qualityScore.current >= 80 ? 'secondary' :
                    'destructive'
                  }>
                    {dashboard.qualityScore.trend === 'up' ? 'Improving' :
                     dashboard.qualityScore.trend === 'down' ? 'Declining' :
                     'Stable'}
                  </Badge>
                </div>
                {dashboard.qualityScore.history.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">Recent History</p>
                    {dashboard.qualityScore.history.slice(-5).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatDate(entry.date)}</span>
                        <span className="font-medium text-gray-900">{entry.score.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* QC Results Detail */}
          <Card className="rounded-xl shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quality Control Results
              </CardTitle>
              <CardDescription>Recent inspection details (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              {qcLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B207] mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">Loading QC results...</p>
                </div>
              ) : !qcResults || qcResults.recentResults.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No QC results yet</p>
                  <p className="text-sm text-gray-400 mt-1">Results will appear after inspections</p>
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Inspections</p>
                      <p className="text-2xl font-bold text-gray-900">{qcResults.summary.totalInspections}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Average Pass Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{qcResults.summary.averagePassRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Recent Results */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Recent Inspections</p>
                    {qcResults.recentResults.slice(0, 5).map((result) => (
                      <div 
                        key={result.id} 
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{result.productName}</p>
                            <p className="text-xs text-gray-500">{formatDate(result.timestamp)}</p>
                          </div>
                          <Badge 
                            variant={
                              result.status === 'pass' ? 'default' :
                              result.status === 'warning' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {result.passRate.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <span className="text-gray-600">Accepted: </span>
                            <span className="font-medium text-green-600">
                              {result.acceptedQuantity} {result.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rejected: </span>
                            <span className="font-medium text-red-600">
                              {result.rejectedQuantity} {result.unit}
                            </span>
                          </div>
                        </div>

                        {result.rejectionReasons.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-gray-600 mb-1">Rejection Reasons:</p>
                            <div className="flex flex-wrap gap-1">
                              {result.rejectionReasons.map((reason, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.notes && (
                          <p className="text-xs text-gray-600 mt-2 italic">{result.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deliveries */}
          {dashboard?.upcomingDeliveries && (
            <Card className="rounded-xl shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Deliveries</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard.upcomingDeliveries.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No upcoming deliveries</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboard.upcomingDeliveries.map((delivery) => (
                      <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(delivery.deliveryDate)}
                          </p>
                          {delivery.notes && (
                            <p className="text-sm text-gray-600 mt-1">{delivery.notes}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{delivery.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Demand Forecast - ML Powered */}
          <Card className="rounded-xl shadow-sm border-gray-200 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Demand Forecast
                  </CardTitle>
                  <CardDescription>AI-powered predictions for next 7 days</CardDescription>
                </div>
                {forecast && (
                  <div className="flex items-center gap-2">
                    <Badge variant={forecast.fallback ? "secondary" : "default"}>
                      {forecast.fallback ? "Historical Average" : "ML Prediction"}
                    </Badge>
                    {forecast.accuracy > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Activity className="w-4 h-4" />
                        <span>{(forecast.accuracy * 100).toFixed(0)}% accuracy</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {forecastLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B207] mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">Loading forecast data...</p>
                </div>
              ) : !forecast || forecast.forecasts.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-2">No forecast data available</p>
                  <p className="text-sm text-gray-400">
                    Add active products to see demand predictions
                  </p>
                </div>
              ) : (
                <>
                  {forecast.message && (
                    <Alert className="mb-4 border-blue-200 bg-blue-50">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{forecast.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Product</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Quantity</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecast.forecasts.flatMap((product) =>
                          product.predictions.map((prediction, idx) => (
                            <tr key={`${product.productId}-${idx}`} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {product.productName}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {formatDate(prediction.date)}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                                {prediction.quantity}
                              </td>
                              <td className="py-3 px-4 text-sm text-right">
                                <Badge 
                                  variant={
                                    prediction.confidence >= 0.8 ? "default" :
                                    prediction.confidence >= 0.6 ? "secondary" :
                                    "outline"
                                  }
                                  className="text-xs"
                                >
                                  {(prediction.confidence * 100).toFixed(0)}%
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ).slice(0, 21)}
                      </tbody>
                    </table>
                  </div>

                  {/* Trend Visualization Summary */}
                  {forecast.forecasts.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {forecast.forecasts.slice(0, 3).map((product) => {
                          const totalDemand = product.predictions.reduce(
                            (sum, p) => sum + p.quantity, 
                            0
                          )
                          const avgConfidence = product.predictions.reduce(
                            (sum, p) => sum + p.confidence, 
                            0
                          ) / product.predictions.length

                          return (
                            <div 
                              key={product.productId} 
                              className="p-4 bg-gray-50 rounded-lg"
                            >
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                {product.productName}
                              </p>
                              <p className="text-2xl font-bold text-[#00B207] mb-1">
                                {totalDemand}
                              </p>
                              <p className="text-xs text-gray-600">
                                Total 7-day demand • {(avgConfidence * 100).toFixed(0)}% confidence
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedLayout>
  )
}
