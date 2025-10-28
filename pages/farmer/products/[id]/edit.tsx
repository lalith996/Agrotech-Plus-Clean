import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import { FarmerLayout } from "@/components/farmer/farmer-layout"
import { ProductForm } from "@/components/farmer/product-form"
import { withAuth } from "@/components/auth/with-auth"
import type { ProductFormData } from "@/lib/schemas/product"
import { UserRole } from "@prisma/client"

function EditProduct() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState<ProductFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProduct = useCallback(async () => {
    if (!id || Array.isArray(id)) return
    try {
      const response = await fetch(`/api/farmer/products/${id}`)
      if (!response.ok) throw new Error("Failed to fetch product")
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error("Error fetching product:", error)
      router.push("/farmer/products")
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const handleSubmit = async (data: ProductFormData) => {
    if (!id || Array.isArray(id)) return
    try {
      const response = await fetch(`/api/farmer/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      router.push("/farmer/products")
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <FarmerLayout>
        <div className="container mx-auto py-8 px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-[600px] bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </FarmerLayout>
    )
  }

  if (!product) {
    return null
  }

  return (
    <FarmerLayout>
      <div className="container mx-auto py-8 px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ProductForm
            initialData={product}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </FarmerLayout>
  )
}

export default withAuth(EditProduct, { requiredRoles: [UserRole.FARMER] })