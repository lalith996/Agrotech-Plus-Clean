
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { OrderStatusForm } from '@/components/farmer/order-status-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    farmerId: string
  }
}

interface Order {
  id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  deliveryDate: string
  totalAmount: number
  items: OrderItem[]
  address: {
    name: string
    street: string
    city: string
    postalCode: string
  }
  customer: {
    user: {
      name: string
    }
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

const FarmerOrderDetailPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [farmerId, setFarmerId] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!id || !session) return
    if (Array.isArray(id)) return
    setIsLoading(true)
    try {
      // Fetch farmer profile to get the farmerId
      const farmerRes = await fetch('/api/farmer/profile')
      if (!farmerRes.ok) throw new Error('Failed to load farmer profile')
      const farmerData = await farmerRes.json()
      setFarmerId(farmerData.id)

      // Fetch order details
      const orderRes = await fetch(`/api/orders/${id}`)
      if (!orderRes.ok) throw new Error('Failed to load order details')
      const orderData = await orderRes.json()
      setOrder(orderData.order)
    } catch (err) {
      setError('Failed to load order details.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [id, session])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  if (isLoading) return <p>Loading order details...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!order) return <p>Order not found.</p>

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'preparing':
        return 'bg-purple-100 text-purple-800'
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Customer</h3>
                <p>{order.customer.user.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Delivery Date</h3>
                <p>{new Date(order.deliveryDate).toLocaleDateString()}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold">Delivery Address</h3>
                <p>{`${order.address.name}, ${order.address.street}, ${order.address.city}, ${order.address.postalCode}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg ${
                    item.product.farmerId === farmerId
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.quantity * item.price)}</p>
                      {item.product.farmerId === farmerId && (
                        <Badge className="bg-emerald-100 text-emerald-800">Your Product</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <p className="text-lg font-semibold">
                Total Order Value: {formatPrice(order.totalAmount)}
              </p>
            </div>
          </CardContent>
        </Card>

        <OrderStatusForm
          orderId={order.id}
          currentStatus={order.status}
          onStatusUpdate={fetchOrder}
        />
      </div>
    </div>
  )
}

export default FarmerOrderDetailPage
