import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RoleBasedLayout } from "@/components/auth/role-based-layout"
import { 
  Users, 
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  UserCheck
} from "lucide-react"

interface DashboardData {
  metrics: {
    totalOrders: number
    totalRevenue: number
    activeUsers: number
    activeFarmers: number
  }
  pendingFarmers: Array<{
    id: string
    farmName: string
    location: string
    userName: string
    email: string
    city: string | null
    phone: string | null
    certifications: Array<{
      name: string
      issuingBody: string
      expiryDate: string | null
    }>
    createdAt: string
  }>
  qualityAlerts: Array<{
    id: string
    productName: string
    farmerName: string
    expectedQuantity: number
    acceptedQuantity: number
    rejectedQuantity: number
    rejectionReasons: string[]
    timestamp: string
  }>
  revenueForecast: Array<{
    date: string
    forecast: number
    confidence: number
  }>
  procurementList?: Array<{
    id: string
    productName: string
    totalQuantity: number
    unit: string
    assignedFarmers: number
    status: string
  }>
  activeRoutes?: Array<{
    id: string
    name: string
    driverName: string
    totalStops: number
    completedStops: number
    status: string
    estimatedCompletion: string
  }>
  inventoryStatus?: Array<{
    productName: string
    currentStock: number
    unit: string
    status: 'low' | 'adequate' | 'high'
    reorderPoint: number
  }>
}

interface QCAlertsData {
  alerts: Array<{
    id: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    productName: string
    productCategory: string
    unit: string
    farmerName: string
    farmerEmail: string
    farmerCity: string | null
    farmerId: string
    expectedQuantity: number
    acceptedQuantity: number
    rejectedQuantity: number
    rejectionRate: number
    rejectionReasons: string[]
    timestamp: string
    notes: string | null
    photos: string[]
  }>
  summary: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    totalRejected: number
    averageRejectionRate: number
  }
  topFarmersWithIssues: Array<{
    farmerId: string
    farmerName: string
    farmerEmail: string
    farmerCity: string | null
    alertCount: number
    totalRejected: number
    averageRejectionRate: number
    recentAlerts: Array<{
      productName: string
      rejectionRate: number
      timestamp: string
    }>
  }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [qcAlerts, setQcAlerts] = useState<QCAlertsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [qcLoading, setQcLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/dashboard")
        
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
    const fetchQCAlerts = async () => {
      try {
        setQcLoading(true)
        const response = await fetch("/api/admin/qc/alerts?days=7&severity=all")
        
        if (!response.ok) {
          console.error("Failed to fetch QC alerts")
          return
        }
        
        const data = await response.json()
        setQcAlerts(data)
      } catch (err) {
        console.error("QC alerts fetch error:", err)
      } finally {
        setQcLoading(false)
      }
    }

    fetchQCAlerts()
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

  const isOperations = session?.user?.role === 'OPERATIONS'

  if (loading) {
    return (
      <RoleBasedLayout allowedRoles={['ADMIN', 'OPERATIONS']}>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
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
      <RoleBasedLayout allowedRoles={['ADMIN', 'OPERATIONS']}>
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout allowedRoles={['ADMIN', 'OPERATIONS']}>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isOperations ? 'Operations Dashboard' : 'Admin Dashboard'} 📊
          </h1>
          <p className="text-gray-600">
            {isOperations 
              ? 'Manage daily operations and quality control' 
              : 'Platform overview and management'}
          </p>
        </div>

        {/* Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{dashboard?.metrics.totalOrders || 0}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(dashboard?.metrics.totalRevenue || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Platform GMV</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{dashboard?.metrics.activeUsers || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Active Farmers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{dashboard?.metrics.activeFarmers || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Approved farmers</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Only for Admin */}
        {!isOperations && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/farmers">
                <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                      <UserCheck className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Manage Farmers</h3>
                    <p className="text-sm text-gray-600">Review applications</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/users">
                <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                      <Users className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Manage Users</h3>
                    <p className="text-sm text-gray-600">View all users</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/analytics">
                <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                      <TrendingUp className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">View Analytics</h3>
                    <p className="text-sm text-gray-600">Platform insights</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Farmer Approvals - Only for Admin */}
          {!isOperations && dashboard?.pendingFarmers && dashboard.pendingFarmers.length > 0 && (
            <Card className="rounded-xl shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Pending Farmer Approvals</CardTitle>
                <CardDescription>New farmer applications awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.pendingFarmers.slice(0, 5).map((farmer) => (
                    <div key={farmer.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{farmer.farmName}</h4>
                        <p className="text-sm text-gray-600">{farmer.userName}</p>
                        <p className="text-sm text-gray-500">{farmer.location}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {farmer.certifications.length} certifications
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Applied {formatDate(farmer.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/admin/farmers">
                  <Button variant="outline" className="w-full mt-4 rounded-full">
                    View All Farmers
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quality Alerts - Enhanced */}
          <Card className="rounded-xl shadow-sm border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Quality Alerts
                  </CardTitle>
                  <CardDescription>Recent QC issues requiring attention (last 7 days)</CardDescription>
                </div>
                {qcAlerts && (
                  <Badge variant="destructive" className="text-sm">
                    {qcAlerts.summary.total} alerts
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {qcLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B207] mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">Loading QC alerts...</p>
                </div>
              ) : !qcAlerts || qcAlerts.alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                  <p className="text-gray-500">No quality alerts</p>
                  <p className="text-sm text-gray-400 mt-1">All recent inspections passed</p>
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-3 mb-6 pb-6 border-b">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Critical</p>
                      <p className="text-xl font-bold text-red-600">{qcAlerts.summary.critical}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">High</p>
                      <p className="text-xl font-bold text-orange-600">{qcAlerts.summary.high}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Medium</p>
                      <p className="text-xl font-bold text-yellow-600">{qcAlerts.summary.medium}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Low</p>
                      <p className="text-xl font-bold text-gray-600">{qcAlerts.summary.low}</p>
                    </div>
                  </div>

                  {/* Recent Alerts */}
                  <div className="space-y-3">
                    {qcAlerts.alerts.slice(0, 5).map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 border rounded-lg ${
                          alert.severity === 'critical' ? 'border-red-300 bg-red-50' :
                          alert.severity === 'high' ? 'border-orange-300 bg-orange-50' :
                          alert.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                          'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{alert.productName}</h4>
                              <Badge 
                                variant={
                                  alert.severity === 'critical' ? 'destructive' :
                                  alert.severity === 'high' ? 'destructive' :
                                  'secondary'
                                }
                                className={
                                  alert.severity === 'critical' ? 'bg-red-600' :
                                  alert.severity === 'high' ? 'bg-orange-600' :
                                  alert.severity === 'medium' ? 'bg-yellow-600 text-white' :
                                  ''
                                }
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Farmer: {alert.farmerName}
                              {alert.farmerCity && ` • ${alert.farmerCity}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600">{alert.rejectionRate.toFixed(1)}%</p>
                            <p className="text-xs text-gray-500">rejected</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                          <div>
                            <span className="text-gray-600">Expected: </span>
                            <span className="font-medium">{alert.expectedQuantity} {alert.unit}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Accepted: </span>
                            <span className="font-medium text-green-600">{alert.acceptedQuantity} {alert.unit}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rejected: </span>
                            <span className="font-medium text-red-600">{alert.rejectedQuantity} {alert.unit}</span>
                          </div>
                        </div>

                        {alert.rejectionReasons.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-gray-600 mb-1">Rejection Reasons:</p>
                            <div className="flex flex-wrap gap-1">
                              {alert.rejectionReasons.map((reason, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">{formatDate(alert.timestamp)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Top Farmers with Issues */}
                  {qcAlerts.topFarmersWithIssues.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Farmers Requiring Attention</h4>
                      <div className="space-y-2">
                        {qcAlerts.topFarmersWithIssues.slice(0, 3).map((farmer) => (
                          <div key={farmer.farmerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{farmer.farmerName}</p>
                              <p className="text-xs text-gray-600">
                                {farmer.alertCount} alerts • Avg rejection: {farmer.averageRejectionRate.toFixed(1)}%
                              </p>
                            </div>
                            <Badge variant="destructive">{farmer.totalRejected} rejected</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <Link href="/admin/qc">
                <Button variant="outline" className="w-full mt-4 rounded-full">
                  View All QC Results
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Revenue Forecast - Only for Admin */}
          {!isOperations && dashboard?.revenueForecast && dashboard.revenueForecast.length > 0 && (
            <Card className="rounded-xl shadow-sm border-gray-200 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00B207]" />
                  Revenue Forecast
                </CardTitle>
                <CardDescription>Predicted revenue for next 7 days (AI-powered)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Forecast</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.revenueForecast.map((forecast, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">{formatDate(forecast.date)}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">
                            {formatPrice(forecast.forecast)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">
                            {(forecast.confidence * 100).toFixed(0)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Procurement List - Admin and Operations */}
          {dashboard?.procurementList && dashboard.procurementList.length > 0 && (
            <Card className="rounded-xl shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#00B207]" />
                  Daily Procurement List
                </CardTitle>
                <CardDescription>Products to procure for upcoming orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard.procurementList.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                        <p className="text-sm text-gray-600">
                          {item.totalQuantity} {item.unit} from {item.assignedFarmers} farmers
                        </p>
                      </div>
                      <Badge 
                        variant={item.status === 'confirmed' ? 'default' : 'secondary'}
                        className={item.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Link href="/admin/procurement">
                  <Button variant="outline" className="w-full mt-4 rounded-full">
                    View Full Procurement List
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Active Routes - Operations Only */}
          {isOperations && dashboard?.activeRoutes && dashboard.activeRoutes.length > 0 && (
            <Card className="rounded-xl shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#00B207]" />
                  Active Delivery Routes
                </CardTitle>
                <CardDescription>Routes in progress today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard.activeRoutes.map((route) => (
                    <div key={route.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{route.name}</h4>
                          <p className="text-sm text-gray-600">Driver: {route.driverName}</p>
                        </div>
                        <Badge 
                          variant={route.status === 'IN_PROGRESS' ? 'default' : 'secondary'}
                          className={route.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : ''}
                        >
                          {route.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{route.completedStops}/{route.totalStops} stops</span>
                        <span>•</span>
                        <span>ETA: {new Date(route.estimatedCompletion).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/admin/logistics/routes">
                  <Button variant="outline" className="w-full mt-4 rounded-full">
                    View All Routes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Inventory Status - Operations Only */}
          {isOperations && dashboard?.inventoryStatus && dashboard.inventoryStatus.length > 0 && (
            <Card className="rounded-xl shadow-sm border-gray-200 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#00B207]" />
                  Inventory Status
                </CardTitle>
                <CardDescription>Current stock levels and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Product</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Current Stock</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Reorder Point</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.inventoryStatus.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">{item.productName}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-right">
                            {item.currentStock} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">
                            {item.reorderPoint} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge 
                              variant={item.status === 'low' ? 'destructive' : item.status === 'adequate' ? 'secondary' : 'default'}
                              className={
                                item.status === 'low' ? 'bg-red-100 text-red-800' :
                                item.status === 'adequate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Operations Quick Actions */}
        {isOperations && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/procurement">
                <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                      <Package className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Procurement</h3>
                    <p className="text-sm text-gray-600">Manage procurement lists</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/qc">
                <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                      <CheckCircle className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Quality Control</h3>
                    <p className="text-sm text-gray-600">Review QC results</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/logistics/routes">
                <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                      <Calendar className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Logistics</h3>
                    <p className="text-sm text-gray-600">Manage delivery routes</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  )
}
