"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/lib/stores/cart-store"
import { Button } from "@/components/ui/button"
import { X, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore()

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId)
    toast.success(`${productName} removed from cart`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-[#00B207]" />
            <h2 className="text-lg font-bold text-gray-900">
              Shopping Cart
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-600 mb-6">
                Add some fresh products to get started!
              </p>
              <Button 
                onClick={onClose}
                asChild
                className="rounded-full bg-[#00B207] hover:bg-green-700"
              >
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-[#00B207] transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🥬
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {item.name}
                    </h4>
                    {item.farmer && (
                      <p className="text-xs text-gray-500 truncate">
                        {item.farmer.farmName}
                      </p>
                    )}
                    <p className="text-sm font-bold text-[#00B207] mt-1">
                      {formatPrice(item.price)}
                      {item.unit && <span className="text-xs text-gray-500 font-normal ml-1">/{item.unit}</span>}
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded-full transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded-full transition-colors"
                        >
                          <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.productId, item.name)}
                        className="p-1 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Subtotal & Actions */}
        {items.length > 0 && (
          <div className="border-t bg-white p-4 space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">Subtotal:</span>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(getTotal())}
              </span>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={onClose}
                asChild
                className="w-full rounded-full bg-[#00B207] hover:bg-green-700 text-white"
              >
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button 
                onClick={onClose}
                asChild
                variant="outline"
                className="w-full rounded-full border-[#00B207] text-[#00B207] hover:bg-green-50"
              >
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
