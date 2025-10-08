import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ShoppingBag, Tag } from "lucide-react"

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  farmer?: {
    name: string
    farmName: string
  }
  unit?: string
}

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  discount?: number
  shipping: number
  tax: number
  total: number
  couponCode?: string
}

export function OrderSummary({
  items,
  subtotal,
  discount = 0,
  shipping,
  tax,
  total,
  couponCode,
}: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  return (
    <Card className="rounded-xl shadow-lg border-gray-200 sticky top-4">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-xl">
        <CardTitle className="flex items-center text-gray-900">
          <ShoppingBag className="w-5 h-5 mr-2 text-[#00B207]" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Items List */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              {item.image ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-8 h-8 text-[#00B207]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {item.name}
                </h4>
                {item.farmer && (
                  <p className="text-xs text-gray-500 truncate">
                    by {item.farmer.farmName}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-semibold text-sm text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Pricing Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                Discount {couponCode && `(${couponCode})`}
              </span>
              <span className="font-medium text-green-600">
                -{formatPrice(discount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium text-gray-900">
              {shipping === 0 ? "FREE" : formatPrice(shipping)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (5%)</span>
            <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-[#00B207]">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-center py-2 border-green-200 text-green-700">
              🔒 Secure Checkout
            </Badge>
            <Badge variant="outline" className="w-full justify-center py-2 border-green-200 text-green-700">
              💯 100% Money Back Guarantee
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
