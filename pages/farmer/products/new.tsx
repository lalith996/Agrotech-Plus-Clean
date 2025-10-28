import { useRouter } from "next/router"
import { FarmerLayout } from "@/components/farmer/farmer-layout"
import { ProductForm } from "@/components/farmer/product-form"
import { withAuth } from "@/components/auth/with-auth"
import type { ProductFormData } from "@/lib/schemas/product"
import { UserRole } from "@prisma/client"

function NewProduct() {
  const router = useRouter()

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const response = await fetch("/api/farmer/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create product")
      }

      router.push("/farmer/products")
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  return (
    <FarmerLayout>
      <div className="container mx-auto py-8 px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ProductForm onSubmit={handleSubmit} />
        </div>
      </div>
    </FarmerLayout>
  )
}

export default withAuth(NewProduct, { requiredRoles: [UserRole.FARMER] })