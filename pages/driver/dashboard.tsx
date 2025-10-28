import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RoleBasedLayout } from "@/components/auth/role-based-layout"
import { RouteMap } from "@/components/driver/route-map"
import { 
  Package, 
  MapPin,
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  Map
} from "lucide-react"

interface DeliveryItem {
  id: string
  orderId: string
  routeId: string
  sequence: number
  status: string
  address: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
    latitude: number | null
    longitude: number | null
  }
  deliverySlot: string
  totalAmount: number
  itemCount: number
  specialNotes: string | null
}

interface ActiveRoute {
  id: string
  zoneName: string
  timeSlot: string
  totalStops: number
  completedStops: number
  estimatedDuration: number | null
  stops: Array<{
    sequence: number
    orderId: string
    address: string
    latitude: number | null
    longitude: number | null
    status: string
    deliverySlot: string
  }>
  optimization: {
    algorithm: string
    originalDistance: number
    optimizedDistance: number
    savings: number
    estimatedTime: number
  } | null
}

interface DashboardData {
  todaysDeliveries: DeliveryItem[]
  activeRoute: ActiveRoute | null
  performance: {
    successRate: number
    avgTimePerDelivery: number
    totalDeliveries: number
    completedDeliveries: number
  }
  earnings: {
    today: number
    week: number
  }
}

export default function DriverDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/driver/dashboard")
        
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'ORDER_IN_TRANSIT':
        return 'bg-blue-100 text-blue-800'
      case 'PICKED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ORDER_IN_TRANSIT':
        return 'In Transit'
      case 'DELIVERED':
        return 'Delivered'
      case 'PICKED':
        return 'Picked Up'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <RoleBasedLayout allowedRoles={['DRIVER']}>
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
      <RoleBasedLayout allowedRoles={['DRIVER']}>
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
    <RoleBasedLayout allowedRoles={['DRIVER']}>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Driver Dashboard 🚚
          </h1>
          <p className="text-gray-600">Manage your deliveries and track performance</p>
        </div>

        {/* Performance & Earnings Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {dashboard?.performance.successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {dashboard?.performance.completedDeliveries} of {dashboard?.performance.totalDeliveries} total
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Avg Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {dashboard?.performance.avgTimePerDelivery || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Minutes per delivery</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(dashboard?.earnings.today || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">10% of delivery value</p>
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
                {formatPrice(dashboard?.earnings.week || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Route */}
        {dashboard?.activeRoute && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Route Details */}
            <div className="lg:col-span-2">
              <Card className="rounded-xl shadow-sm border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-[#00B207]" />
                        Active Route - Optimized Sequence
                      </CardTitle>
                      <CardDescription>
                        {dashboard.activeRoute.zoneName} • {dashboard.activeRoute.timeSlot}
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="bg-[#00B207]">
                      {dashboard.activeRoute.completedStops} / {dashboard.activeRoute.totalStops} Stops
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Route Optimization Info */}
                  {dashboard.activeRoute.optimization && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          Route Optimized
                        </h3>
                        <Badge variant="outline" className="bg-white">
                          {dashboard.activeRoute.optimization.algorithm === 'ml_optimization' ? 'AI Optimized' : 'Smart Route'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Distance</p>
                          <p className="font-semibold text-gray-900">
                            {dashboard.activeRoute.optimization.optimizedDistance.toFixed(1)} km
                          </p>
                          {dashboard.activeRoute.optimization.originalDistance > 0 && (
                            <p className="text-xs text-gray-500">
                              (was {dashboard.activeRoute.optimization.originalDistance.toFixed(1)} km)
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-600">Est. Time</p>
                          <p className="font-semibold text-gray-900">
                            {dashboard.activeRoute.optimization.estimatedTime} min
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Savings</p>
                          <p className="font-semibold text-green-600">
                            {dashboard.activeRoute.optimization.savings > 0 
                              ? `${dashboard.activeRoute.optimization.savings.toFixed(1)}%` 
                              : 'Optimized'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Stops */}
                  <div className="space-y-3">
                    {dashboard.activeRoute.stops.map((stop) => (
                      <div 
                        key={stop.sequence}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          stop.status === 'DELIVERED' ? 'bg-green-50 border-green-200' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                            stop.status === 'DELIVERED' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {stop.sequence}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{stop.address}</p>
                            <p className="text-sm text-gray-600">{stop.deliverySlot}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(stop.status)}>
                          {getStatusLabel(stop.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Duration Info */}
                  {dashboard.activeRoute.estimatedDuration && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Estimated Duration: {dashboard.activeRoute.estimatedDuration} minutes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Route Map */}
            <div className="lg:col-span-1">
              <RouteMap 
                stops={dashboard.activeRoute.stops}
                optimization={dashboard.activeRoute.optimization}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              className="h-auto py-6 bg-[#00B207] hover:bg-[#009406]"
              disabled={!dashboard?.activeRoute}
            >
              <div className="flex items-center gap-3">
                <Map className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">View Route Map</div>
                  <div className="text-xs opacity-90">Navigate to next stop</div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto py-6 border-gray-300"
              disabled={!dashboard?.activeRoute}
            >
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Update Delivery Status</div>
                  <div className="text-xs text-gray-600">Mark as delivered</div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Today's Deliveries */}
        <Card className="rounded-xl shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Today's Deliveries</CardTitle>
            <CardDescription>
              {dashboard?.todaysDeliveries.length || 0} deliveries scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!dashboard?.todaysDeliveries || dashboard.todaysDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg mb-2">No deliveries scheduled for today</p>
                <p className="text-gray-400 text-sm">Check back later for new assignments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.todaysDeliveries.map((delivery) => (
                  <div 
                    key={delivery.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{delivery.sequence}
                        </Badge>
                        <Badge className={getStatusColor(delivery.status)}>
                          {getStatusLabel(delivery.status)}
                        </Badge>
                      </div>
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{delivery.address.name}</p>
                          <p className="text-sm text-gray-600">
                            {delivery.address.street}, {delivery.address.city}, {delivery.address.state} {delivery.address.zipCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {delivery.deliverySlot}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {delivery.itemCount} items
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {formatPrice(delivery.totalAmount)}
                        </span>
                      </div>
                      {delivery.specialNotes && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-900">
                          <strong>Note:</strong> {delivery.specialNotes}
                        </div>
                      )}
                    </div>
                    <Link href={`/driver/deliveries/${delivery.orderId}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}
