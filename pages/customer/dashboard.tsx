import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Heart,
  Leaf,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Truck,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainLayout } from "@/components/layout/main-layout";
import { formatDate, formatCurrency } from "@/lib/utils";
import { withAuth } from "@/components/auth/with-auth";
import { UserRole } from "@prisma/client";

interface DashboardData {
  nextDelivery: {
    date: string;
    timeSlot: string;
    totalAmount: number;
  } | null;
  activeSubscription: {
    id: string;
    name: string;
    weeklyAmount: number;
    deliveryDay: string;
  } | null;
  recentOrders: {
    id: string;
    totalAmount: number;
    status: string;
    itemCount: number;
  }[];
  sustainabilityMetrics: {
    foodMilesReduced: number;
    carbonSaved: number;
    farmersSupported: number;
  };
  wishlist: {
    id: string;
    name: string;
    category: string;
    farmerName: string;
    basePrice: number;
  }[];
  recentActivity: {
    title: string;
    description: string;
    timestamp: string;
  }[];
}

function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData>({
    nextDelivery: null,
    activeSubscription: null,
    recentOrders: [],
    sustainabilityMetrics: {
      foodMilesReduced: 0,
      carbonSaved: 0,
      farmersSupported: 0,
    },
    wishlist: [],
    recentActivity: [],
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("/api/customer/dashboard");
        const data = await response.json();

        if (response.ok) {
          setDashboard(data.dashboard);
        } else {
          console.error("Failed to fetch dashboard data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-2/4 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm p-6 space-y-3"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard!
          </h1>
          <p className="text-gray-600">Here's your shopping overview and upcoming deliveries.</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Delivery</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboard.nextDelivery ? (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboard.nextDelivery.totalAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(dashboard.nextDelivery.date).toLocaleDateString()} - {dashboard.nextDelivery.timeSlot}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">No delivery</div>
                  <p className="text-xs text-muted-foreground">Schedule your next delivery</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscription</CardTitle>
              <Package className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              {dashboard.activeSubscription ? (
                <>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(dashboard.activeSubscription.weeklyAmount)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Weekly on {dashboard.activeSubscription.deliveryDay}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900">-</div>
                  <p className="text-xs text-gray-500 mt-1">No active subscription</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Food Miles Reduced</CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {dashboard.sustainabilityMetrics.foodMilesReduced}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Kilometers saved
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbon Saved</CardTitle>
              <Leaf className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {dashboard.sustainabilityMetrics.carbonSaved}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Kg CO2 reduced
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/products">
              <Card className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-emerald-600">
                <CardContent className="p-6 text-center">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900 mb-1">Shop Products</h3>
                  <p className="text-sm text-gray-600">Browse fresh produce</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/customer/orders">
              <Card className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-emerald-600">
                <CardContent className="p-6 text-center">
                  <Truck className="w-10 h-10 mx-auto mb-3 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900 mb-1">Track Orders</h3>
                  <p className="text-sm text-gray-600">View delivery status</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/customer/profile">
              <Card className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-emerald-600">
                <CardContent className="p-6 text-center">
                  <User className="w-10 h-10 mx-auto mb-3 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900 mb-1">Manage Profile</h3>
                  <p className="text-sm text-gray-600">Update your details</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders Table */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <CardDescription>Your last 5 orders</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No orders yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.itemCount} items</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "PENDING"
                                ? "secondary"
                                : order.status === "PROCESSING"
                                ? "default"
                                : order.status === "SHIPPED"
                                ? "default"
                                : order.status === "DELIVERED"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Wishlist Table */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Wishlist</CardTitle>
              <CardDescription>Products you're interested in</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.wishlist.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.wishlist.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.farmerName}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.basePrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-8">
                {dashboard.recentActivity.map((activity, index) => (
                  <div key={index} className="flex">
                    <div className="relative mr-4">
                      <div className="absolute left-[7px] top-[30px] bottom-0 w-[2px] bg-gray-200" />
                      <div className="w-4 h-4 rounded-full bg-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(new Date(activity.timestamp))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default withAuth(CustomerDashboard, { requiredRoles: [UserRole.CUSTOMER] });