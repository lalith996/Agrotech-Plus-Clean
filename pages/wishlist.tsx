"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { useWishlistStore } from "@/lib/stores/wishlist-store"
import { useCartStore } from "@/lib/stores/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, ArrowLeft, Share2, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function WishlistPage() {
  const router = useRouter()
  const { items: wishlistItems, removeItem, clearWishlist } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    removeItem(productId)
    toast.success(`${productName} removed from wishlist`)
  }

  const handleMoveToCart = (item: any) => {
    addToCart({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      farmer: item.farmer,
      unit: item.unit,
    })
    removeItem(item.productId)
    toast.success(`${item.name} moved to cart`)
  }

  const handleShareWishlist = () => {
    const wishlistUrl = window.location.href
    if (navigator.share) {
      navigator.share({
        title: 'My AgroTrack+ Wishlist',
        text: 'Check out my wishlist of fresh organic products!',
        url: wishlistUrl,
      })
        .then(() => toast.success('Wishlist shared successfully'))
        .catch(() => toast.error('Failed to share wishlist'))
    } else {
      navigator.clipboard.writeText(wishlistUrl)
        .then(() => toast.success('Wishlist link copied to clipboard'))
        .catch(() => toast.error('Failed to copy link'))
    }
  }

  const handleClearWishlist = () => {
    if (window.confirm("Are you sure you want to clear your wishlist?")) {
      clearWishlist()
      toast.success("Wishlist cleared")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlistItems.length > 0 
                  ? `${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'} saved for later`
                  : 'No items in your wishlist yet'
                }
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareWishlist}
                  className="rounded-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearWishlist}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-red-200 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 text-center max-w-md">
              Save your favorite organic products here to easily find them later!
            </p>
            <Button 
              asChild
              size="lg"
              className="rounded-full bg-[#00B207] hover:bg-green-700 px-8"
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        🥬
                      </div>
                    )}
                  </div>

                  {/* Remove Button (Heart) */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId, item.name)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>
                </div>

                <CardContent className="p-4">
                  {/* Product Details */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                    {item.name}
                  </h3>
                  
                  {item.farmer && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                      {item.farmer.farmName}
                    </p>
                  )}

                  <p className="text-xl font-bold text-[#00B207] mb-4">
                    {formatPrice(item.price)}
                    {item.unit && <span className="text-sm text-gray-500 font-normal ml-1">/{item.unit}</span>}
                  </p>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleMoveToCart(item)}
                      className="w-full rounded-full bg-[#00B207] hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full border-gray-300 hover:border-[#00B207] hover:bg-green-50"
                      size="sm"
                    >
                      <Link href={`/products/${item.productId}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Quick View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Suggested Products Section */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">You might also like</h2>
              <Button 
                asChild
                variant="ghost"
                size="sm"
                className="text-[#00B207] hover:text-green-700"
              >
                <Link href="/products">View All</Link>
              </Button>
            </div>
            <p className="text-gray-600 text-center py-8">
              Check out more fresh organic products in our catalog
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
