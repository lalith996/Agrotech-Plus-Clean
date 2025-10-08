"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/stores/cart-store"
import { X, Minus, Plus, Star, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  category: string
  description: string
  images: string[]
  basePrice: number
  unit: string
  farmer: {
    farmName: string
    location: string
    user: {
      name: string
    }
  }
}

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem } = useCartStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.basePrice,
      quantity,
      image: product.images[0],
      farmer: {
        name: product.farmer.user.name,
        farmName: product.farmer.farmName,
      },
      unit: product.unit,
    })

    toast.success(`${product.name} added to cart!`, {
      description: `${quantity} ${product.unit} added successfully`,
    })
    
    setQuantity(1)
    onClose()
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative bg-gray-50 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 mx-auto bg-gray-300 rounded-full flex items-center justify-center mb-2">
                      🥬
                    </div>
                    <p className="text-sm">No image</p>
                  </div>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index ? "border-[#00B207]" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="mb-4">
              <Badge variant="secondary" className="mb-2 bg-[#00B207]/10 text-[#00B207] hover:bg-[#00B207]/20">
                {product.category}
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.0)</span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-[#00B207]">
                  {formatPrice(product.basePrice)}
                </span>
                <span className="text-gray-500">/ {product.unit}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {product.description}
            </p>

            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Sold by:</span> {product.farmer.farmName}
              </p>
              <p className="text-sm text-gray-500">{product.farmer.location}</p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-[#00B207] hover:bg-[#00B207]/90 text-white h-12"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              
              <Link href={`/products/${product.id}`} onClick={onClose}>
                <Button variant="outline" className="w-full h-12">
                  View Full Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
