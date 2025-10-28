import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RoleBasedLayout } from "@/components/auth/role-based-layout"
import { useWishlistStore } from "@/lib/stores/wishlist-store"
import { 
  Package, 
  Heart,
  ShoppingBag,
  User,
  RefreshCcw,
  ArrowRight,
  Calendar,
  TrendingUp,
  AlertCircle,
  Sparkles
} from "lucide-react"

interface DashboardData {
  activeSubscriptions: number
  recentOrders: Array<{
    id: string
    status: string
    totalAmount: number
    deliveryDate: string
    itemCount: number
    items: Array<{
      id: string
      productName: string
      quantity: number
      price: number
    }>
  }>
  nextDelivery: {
    date: string
    itemCount: number
  } | null
  recommendedProducts: Array<{
    id: string
    name: string
    category: string
    description: string | null
    basePrice: number
    unit: string
    images: string[]
    farmer: {
      name: string
      farmName: string
    }
  }>
}

export default function CustomerDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const { getItemCount } = useWishlistStore()

  // Track recommendation clicks
  const trackRecommendationClick = async (productId: string, position: number) => {
    try {
      await fetch("/api/personalization/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          event: "recommendation_click",
          productId,
          context: "dashboard",
          position
        })
      })
    } catch (error) {
      console.error("Failed to track recommendation click:", error)
    }
  }

  const handleRecommendationClick = (productId: string, position: number) => {
    trackRecommendationClick(productId, position)
    router.push(`/products/${productId}`)
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!session?.user?.id) {
        console.log('[Dashboard] Waiting for session...')
        return
      }
      
      try {
        console.log('[Dashboard] Fetching dashboard data for user:', session.user.email)
        setLoading(true)
        const response = await fetch("/api/customer/dashboard")
        
        console.log('[Dashboard] API response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[Dashboard] API error:', errorText)
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('[Dashboard] Data loaded successfully:', Object.keys(data))
        setDashboard(data)
      } catch (err) {
        console.error('[Dashboard] Error:', err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [session])

  const userName = session?.user?.name?.split(' ')[0] || 'Customer'
  const wishlistCount = getItemCount()

  if (loading) {
    return (
      <RoleBasedLayout allowedRoles={['CUSTOMER']}>
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
      <RoleBasedLayout allowedRoles={['CUSTOMER']}>
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
    <RoleBasedLayout allowedRoles={['CUSTOMER']}>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}! 🌱
          </h1>
          <p className="text-gray-600">Here's your dashboard overview</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{dashboard?.activeSubscriptions || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Recurring deliveries</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{dashboard?.recentOrders.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Last 5 orders</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Wishlist Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{wishlistCount}</div>
              <p className="text-xs text-gray-500 mt-1">Saved products</p>
            </CardContent>
          </Card>
        </div>

        {/* Next Delivery */}
        {dashboard?.nextDelivery && (
          <Card className="rounded-xl shadow-sm border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00B207]" />
                Next Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(dashboard.nextDelivery.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-600 mt-1">{dashboard.nextDelivery.itemCount} items</p>
                </div>
                <Link href="/orders">
                  <Button variant="outline" className="rounded-full">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/products">
              <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                    <ShoppingBag className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Browse Products</h3>
                  <p className="text-sm text-gray-600">Discover fresh produce</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/orders">
              <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                    <Package className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">View Orders</h3>
                  <p className="text-sm text-gray-600">Track your deliveries</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/subscriptions">
              <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                    <RefreshCcw className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Subscriptions</h3>
                  <p className="text-sm text-gray-600">Manage recurring orders</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/wishlist">
              <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                    <Heart className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">My Wishlist</h3>
                  <p className="text-sm text-gray-600">View saved items</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        {dashboard?.recentOrders && dashboard.recentOrders.length > 0 && (
          <Card className="rounded-xl shadow-sm border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Orders</CardTitle>
              <CardDescription>Your last 5 orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={
                          order.status === 'DELIVERED' ? 'default' :
                          order.status === 'CANCELLED' ? 'destructive' :
                          'secondary'
                        }>
                          {order.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.itemCount} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="mt-1">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/orders">
                <Button variant="outline" className="w-full mt-4 rounded-full">
                  View All Orders
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Recommended Products */}
        <Card className="rounded-xl shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00B207]" />
              Recommended for You
            </CardTitle>
            <CardDescription>Personalized picks based on your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboard?.recommendedProducts && dashboard.recommendedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dashboard.recommendedProducts.slice(0, 4).map((product, index) => (
                    <div 
                      key={product.id}
                      onClick={() => handleRecommendationClick(product.id, index)}
                      className="cursor-pointer"
                    >
                      <Card className="rounded-lg hover:shadow-lg transition-all border-gray-200 hover:border-[#00B207]">
                        <div className="relative h-40 w-full">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2 truncate">{product.farmer.farmName}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-[#00B207]">
                              ₹{product.basePrice}/{product.unit}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                <Link href="/products">
                  <Button variant="outline" className="w-full mt-4 rounded-full">
                    Browse All Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No recommendations available yet</p>
                <Link href="/products">
                  <Button variant="outline" className="rounded-full">
                    Browse Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}
