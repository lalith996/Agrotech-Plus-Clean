import React from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/stores/cart-store'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

type Farmer = {
  id: string
  name: string
  email: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  unit: string
  images: string[]
  category: string
  rating: number
  numReviews: number
  isActive: boolean
  farmer: Farmer
}

interface ProductListProps {
  products: Product[]
  isLoading?: boolean
  error?: string
  onOpenQuickView?: (product: Product) => void
}

export function ProductList({ products, isLoading, error, onOpenQuickView }: ProductListProps) {
  const router = useRouter()
  const { addToCart } = useCart()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} data-testid="product-skeleton" className="h-40 bg-muted rounded-md" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!products || products.length === 0) {
    return <div>No products found</div>
  }

  const handleClick = (id: string) => {
    router.push(`/products/${id}`)
  }

  const handleAdd = (product: Product) => {
    addToCart(product, 1)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-md p-4 cursor-pointer" onClick={() => handleClick(product.id)}>
          <div className="font-semibold">{product.name}</div>
          <div>${product.price}</div>
          <div>{`${product.quantity} ${product.unit} available`}</div>
          <div className="flex items-center gap-2">
            <span>{product.rating}</span>
            <span>({product.numReviews})</span>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={(e) => { e.stopPropagation(); handleAdd(product) }}
              aria-label={`Add ${product.name} to cart`}
              disabled={!product.isActive}
              className="rounded-full bg-[#00B207] hover:bg-[#00B207]/90 text-white"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <button onClick={(e) => { e.stopPropagation(); onOpenQuickView?.(product) }} aria-label={`Quick view for ${product.name}`}>
              Quick View
            </button>
          </div>
          {/* Remove duplicate disabled button; main Add to Cart now respects isActive */}
        </div>
      ))}
    </div>
  )
}