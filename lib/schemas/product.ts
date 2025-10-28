import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  basePrice: z.number().min(0, "Price must be greater than 0"),
  unit: z.string().min(1, "Please select a unit"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  isActive: z.boolean().default(true),
  farmerId: z.string().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>

export const productCategories = [
  { value: "Vegetables", label: "Vegetables" },
  { value: "Fruits", label: "Fruits" },
  { value: "Dairy", label: "Dairy" },
  { value: "Grains", label: "Grains" },
  { value: "Herbs", label: "Herbs" },
  { value: "Other", label: "Other" },
]

export const productUnits = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "lb", label: "Pound (lb)" },
  { value: "oz", label: "Ounce (oz)" },
  { value: "piece", label: "Piece" },
  { value: "bunch", label: "Bunch" },
  { value: "dozen", label: "Dozen" },
]