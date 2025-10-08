"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { useCartStore } from "@/lib/stores/cart-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Minus, Plus, X, Trash2, ArrowLeft, Tag } from "lucide-react"
import { toast } from "sonner"

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore()
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)

  const SHIPPING_FEE = 50
  const TAX_RATE = 0.05

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
    toast.success("Quantity updated")
  }

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId)
    toast.success(`${productName} removed from cart`)
  }

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart()
      toast.success("Cart cleared")
    }
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code")
      return
    }

    if (couponCode.toUpperCase() === "ORGANIC10") {
      setAppliedCoupon({ code: couponCode, discount: 0.1 })
      toast.success("Coupon applied! 10% discount")
    } else {
      toast.error("Invalid coupon code")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  const subtotal = getTotal()
  const discount = appliedCoupon ? subtotal * appliedCoupon.discount : 0
  const subtotalAfterDiscount = subtotal - discount
  const shipping = items.length > 0 ? SHIPPING_FEE : 0
  const tax = subtotalAfterDiscount * TAX_RATE
  const total = subtotalAfterDiscount + shipping + tax

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {items.length > 0 
              ? `You have ${getItemCount()} ${getItemCount() === 1 ? 'item' : 'items'} in your cart`
              : 'Your cart is empty'
            }
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-16 h-16 text-[#00B207]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-center max-w-md">
              Looks like you haven't added any fresh organic products yet. Start shopping to fill your cart!
            </p>
            <Button 
              asChild
              size="lg"
              className="rounded-full bg-[#00B207] hover:bg-green-700 px-8"
            >
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🥬
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {item.name}
                            </h3>
                            {item.farmer && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">From:</span> {item.farmer.farmName}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.productId, item.name)}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-red-600" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Price */}
                          <div>
                            <p className="text-lg font-bold text-[#00B207]">
                              {formatPrice(item.price)}
                              {item.unit && <span className="text-sm text-gray-500 font-normal ml-1">/{item.unit}</span>}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-3 py-2">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                className="p-1 hover:bg-white rounded-full transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="text-base font-semibold w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                className="p-1 hover:bg-white rounded-full transition-colors"
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right min-w-[100px]">
                              <p className="text-sm text-gray-500">Subtotal</p>
                              <p className="text-lg font-bold text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cart Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 border-2 border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                  {/* Coupon Code */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Have a coupon?
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="pl-10 rounded-full"
                          disabled={!!appliedCoupon}
                        />
                      </div>
                      <Button
                        onClick={handleApplyCoupon}
                        size="sm"
                        variant={appliedCoupon ? "secondary" : "default"}
                        className="rounded-full"
                        disabled={!!appliedCoupon}
                      >
                        {appliedCoupon ? "Applied" : "Apply"}
                      </Button>
                    </div>
                    {appliedCoupon && (
                      <p className="text-xs text-green-600 mt-2 flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        {appliedCoupon.code} - {appliedCoupon.discount * 100}% off applied
                      </p>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal ({getItemCount()} items)</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-{formatPrice(discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span className="font-medium">{formatPrice(shipping)}</span>
                    </div>

                    <div className="flex justify-between text-gray-700">
                      <span>Tax (5%)</span>
                      <span className="font-medium">{formatPrice(tax)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-[#00B207]">
                      {formatPrice(total)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      asChild
                      size="lg"
                      className="w-full rounded-full bg-[#00B207] hover:bg-green-700 text-white"
                    >
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                    
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full border-[#00B207] text-[#00B207] hover:bg-green-50"
                    >
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>100% Organic & Fresh</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Free delivery on orders above ₹500</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Secure checkout</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
