import { z } from "zod"
import { UserRole, OrderStatus, SubscriptionStatus } from "@prisma/client"

// User validation schemas
export const userSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
})

export const customerSchema = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().cuid(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
})

export const farmerSchema = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().cuid(),
  farmName: z.string().min(1, "Farm name is required").max(100),
  location: z.string().min(1, "Location is required").max(200),
  description: z.string().max(1000).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
  isApproved: z.boolean().default(false),
})

// Address validation schema
export const addressSchema = z.object({
  id: z.string().cuid().optional(),
  customerId: z.string().cuid(),
  name: z.string().min(1, "Address name is required").max(50),
  street: z.string().min(1, "Street address is required").max(200),
  city: z.string().min(1, "City is required").max(50),
  state: z.string().min(1, "State is required").max(50),
  zipCode: z.string().regex(/^\d{6}$/, "Invalid ZIP code (6 digits required)"),
  isDefault: z.boolean().default(false),
})

// Product validation schema
export const productSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, "Product name is required").max(100),
  category: z.string().min(1, "Category is required").max(50),
  description: z.string().max(1000).optional(),
  images: z.array(z.string().url()).default([]),
  basePrice: z.number().positive("Price must be positive"),
  unit: z.string().min(1, "Unit is required").max(20),
  isActive: z.boolean().default(true),
  farmerId: z.string().cuid(),
})

// Product update schema - allows partial updates
export const productUpdateSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100).optional(),
  category: z.string().min(1, "Category is required").max(50).optional(),
  description: z.string().max(1000).optional(),
  images: z.array(z.string().url()).optional(),
  basePrice: z.number().positive("Price must be positive").optional(),
  unit: z.string().min(1, "Unit is required").max(20).optional(),
  isActive: z.boolean().optional(),
})

// Subscription validation schemas
export const subscriptionItemSchema = z.object({
  id: z.string().cuid().optional(),
  subscriptionId: z.string().cuid(),
  productId: z.string().cuid(),
  quantity: z.number().positive("Quantity must be positive"),
  frequency: z.enum(["weekly", "biweekly", "monthly"]).default("weekly"),
})

export const subscriptionSchema = z.object({
  id: z.string().cuid().optional(),
  customerId: z.string().cuid(),
  deliveryZone: z.string().min(1, "Delivery zone is required"),
  deliveryDay: z.string().min(1, "Delivery day is required"),
  status: z.nativeEnum(SubscriptionStatus).default(SubscriptionStatus.ACTIVE),
  startDate: z.date(),
  pausedUntil: z.date().optional(),
  items: z.array(subscriptionItemSchema).min(1, "At least one item is required"),
})

// Order validation schemas
export const orderItemSchema = z.object({
  id: z.string().cuid().optional(),
  orderId: z.string().cuid(),
  productId: z.string().cuid(),
  quantity: z.number().positive("Quantity must be positive"),
  price: z.number().positive("Price must be positive"),
})

export const orderSchema = z.object({
  id: z.string().cuid().optional(),
  customerId: z.string().cuid(),
  subscriptionId: z.string().cuid().optional(),
  addressId: z.string().cuid(),
  deliverySlot: z.string().min(1, "Delivery slot is required"),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.PENDING),
  totalAmount: z.number().positive("Total amount must be positive"),
  deliveryDate: z.date(),
  specialNotes: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
})

// QC validation schema
export const qcResultSchema = z.object({
  id: z.string().cuid().optional(),
  farmerDeliveryId: z.string().cuid(),
  productId: z.string().cuid(),
  farmerId: z.string().cuid(),
  expectedQuantity: z.number().positive("Expected quantity must be positive"),
  acceptedQuantity: z.number().min(0, "Accepted quantity cannot be negative"),
  rejectedQuantity: z.number().min(0, "Rejected quantity cannot be negative"),
  rejectionReasons: z.array(z.string()).default([]),
  photos: z.array(z.string().url()).default([]),
  inspectorId: z.string().cuid(),
  notes: z.string().max(1000).optional(),
})

// Authentication schemas
export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER),
  // Additional fields based on role
  farmName: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
})

// Registration schema with email generation (new role-based system)
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  city: z.string().min(1, "City is required"),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // Farmer-specific fields
  farmName: z.string().min(1, "Farm name is required").max(100).optional(),
  location: z.string().min(1, "Location is required").max(200).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
}).refine(
  (data) => {
    // If role is FARMER, farmName and location are required
    if (data.role === UserRole.FARMER) {
      return !!data.farmName && !!data.location
    }
    return true
  },
  {
    message: "Farm name and location are required for farmers",
    path: ["farmName"]
  }
)

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Login schema (alias for signInSchema)
export const loginSchema = signInSchema

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Profile update schemas
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
})

export const updateFarmerProfileSchema = z.object({
  farmName: z.string().min(1, "Farm name is required").max(100),
  location: z.string().min(1, "Location is required").max(200),
  description: z.string().max(1000).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
})

// Common API validation schemas
export const idParamSchema = z.object({
  id: z.string().cuid("Invalid ID format")
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
})

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(200),
  category: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  farmerId: z.string().cuid().optional(),
  ...paginationSchema.shape
})

export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"]
  }
)

// Farmer approval schemas
export const approveFarmerSchema = z.object({
  farmerId: z.string().cuid("Invalid farmer ID")
})

export const rejectFarmerSchema = z.object({
  farmerId: z.string().cuid("Invalid farmer ID"),
  reason: z.string().min(10, "Rejection reason must be at least 10 characters").max(500)
})

// Order status update schema
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().max(500).optional()
})

// Delivery slot schema
export const deliverySlotSchema = z.object({
  date: z.coerce.date(),
  timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Invalid time slot format (HH:MM-HH:MM)")
})

// File upload schema
export const fileUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required").max(255),
  fileType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, "Invalid file type"),
  fileSize: z.number().positive().max(10 * 1024 * 1024, "File size must be less than 10MB")
})

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  orderUpdates: z.boolean().default(true),
  promotions: z.boolean().default(false),
  weeklyDigest: z.boolean().default(true)
})

// Type exports for use in components
export type SignUpInput = z.infer<typeof signUpSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UserInput = z.infer<typeof userSchema>
export type CustomerInput = z.infer<typeof customerSchema>
export type FarmerInput = z.infer<typeof farmerSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ProductInput = z.infer<typeof productSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type SubscriptionInput = z.infer<typeof subscriptionSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type QCResultInput = z.infer<typeof qcResultSchema>
export type IdParamInput = z.infer<typeof idParamSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>
export type ApproveFarmerInput = z.infer<typeof approveFarmerSchema>
export type RejectFarmerInput = z.infer<typeof rejectFarmerSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type DeliverySlotInput = z.infer<typeof deliverySlotSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>