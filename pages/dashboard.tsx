import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Heart,
  ShoppingBag,
  User,
  RefreshCcw,
  ArrowRight
} from "lucide-react"

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
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
    )
  }

  const userName = session?.user?.name?.split(' ')[0] || 'Customer'

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userName}! 🌱
        </h1>
        <p className="text-gray-600">Here's your dashboard overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-1">All time orders</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-1">Recurring deliveries</p>
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
            <div className="text-3xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-1">Saved products</p>
          </CardContent>
        </Card>
      </div>

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

          <Link href="/profile">
            <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-[#00B207] group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-[#00B207] transition-colors">
                  <User className="w-6 h-6 text-[#00B207] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Manage Profile</h3>
                <p className="text-sm text-gray-600">Update your information</p>
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

      <Card className="rounded-xl shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">Your recent orders and subscriptions will appear here</p>
            <Link href="/orders">
              <Button className="bg-[#00B207] hover:bg-[#00B207]/90 text-white">
                View All Orders
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
