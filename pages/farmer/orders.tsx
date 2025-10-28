
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface Order {
  id: string
  status: string
  deliveryDate: string
  customer: {
    user: {
      name: string
    }
  }
  items: {
    id: string
    quantity: number
    price: number
  }[]
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

const FarmerOrdersPage = () => {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session) return
      setIsLoading(true)
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) throw new Error('Failed to load orders')
        const data = await res.json()
        setOrders(data.orders)
      } catch (err) {
        setError('Failed to load orders.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [session])

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
          <h1 className="text-3xl font-bold">My Incoming Orders</h1>
          <Badge variant="outline" className="text-emerald-600">
            {orders.length} Orders
          </Badge>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">Loading orders...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && orders.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">You have no incoming orders.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          Order #{order.id.substring(0, 8)}...
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600">
                        <span className="font-medium">Customer:</span>{' '}
                        {order.customer.user.name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Delivery Date:</span>{' '}
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">My Items Value:</span>{' '}
                        {formatPrice(
                          order.items.reduce(
                            (total, item) => total + item.quantity * item.price,
                            0
                          )
                        )}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Link href={`/farmer/orders/${order.id}`}>
                        <Button variant="outline" className="w-full md:w-auto">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmerOrdersPage
