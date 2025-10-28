/**
 * Example usage of API authorization utilities
 * 
 * This file demonstrates how to use the new API auth utilities
 * in your API routes for consistent authentication and authorization.
 */

import { NextApiRequest, NextApiResponse } from "next"
import { UserRole } from "@prisma/client"
import {
  requireAuth,
  requireRole,
  requireOwnership,
  requireApprovedFarmer,
  getCustomerProfile,
  withErrorHandling,
  handleApiError,
  notFound,
  badRequest
} from "@/lib/api-auth"
import { registerSchema, idParamSchema } from "@/lib/validations"
import { prisma } from "@/lib/prisma"

/**
 * Example 1: Simple authentication check
 * Any authenticated user can access this endpoint
 */
export const simpleAuthExample = withErrorHandling(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // Throws 401 if not authenticated
  const session = await requireAuth(req, res)
  
  res.status(200).json({
    message: "You are authenticated",
    userId: session.user.id,
    role: session.user.role
  })
})

/**
 * Example 2: Role-based access control
 * Only ADMIN users can access this endpoint
 */
export const adminOnlyExample = withErrorHandling(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // Throws 401 if not authenticated, 403 if not ADMIN
  const session = await requireRole(req, res, UserRole.ADMIN)
  
  res.status(200).json({
    message: "You are an admin",
    userId: session.user.id
  })
})

/**
 * Example 3: Multiple roles allowed
 * ADMIN or OPERATIONS users can access this endpoint
 */
export const multiRoleExample = withErrorHandling(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // Throws 401 if not authenticated, 403 if not ADMIN or OPERATIONS
  const session = await requireRole(req, res, [UserRole.ADMIN, UserRole.OPERATIONS])
  
  res.status(200).json({
    message: "You are an admin or operations user",
    role: session.user.role
  })
})

/**
 * Example 4: Resource ownership verification
 * User can only access their own orders
 */
export const orderAccessExample = withErrorHandling(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await requireAuth(req, res)
  const { id } = req.query
  
  if (typeof id !== "string") {
    return badRequest(res, "Invalid order ID")
  }
  
  // Throws 403 if user doesn't own this order
  await requireOwnership(session, "order", id)
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true }
  })
  
  if (!order) {
    return notFound(res, "Order not found")
  }
  
  res.status(200).json({ order })
})

/**
 * Example 5: Farmer approval check
 * Only approved farmers can access this endpoint
 */
export const approvedFarmerExample = withErrorHandling(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await requireAuth(req, res)
  
  // Throws 403 if not FARMER role or not approved
  const farmer = await requireApprovedFarmer(session)
  
  res.status(200).json({
    message: "You are an approved farmer",
    farmerId: farmer.id,
    farmName: farmer.farmName
  })
})

/**
 * Example 6: Input validation with Zod
 * Validates request body before processing
 */
export const validationExample = withErrorHandling(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }
  
  // Validate input - throws if invalid
  const validated = registerSchema.parse(req.body)
  
  // Process validated data
  res.status(200).json({
    message: "Validation successful",
    data: validated
  })
})

/**
 * Example 7: Customer-specific endpoint
 * Gets customer profile and their data
 */
export const customerDashboardExample = withErrorHandling(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await requireRole(req, res, UserRole.CUSTOMER)
  
  // Gets customer profile or throws 404
  const customer = await getCustomerProfile(session)
  
  // Fetch customer-specific data
  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    take: 10
  })
  
  res.status(200).json({
    customer,
    orders
  })
})

/**
 * Example 8: Manual error handling (without wrapper)
 * Use when you need more control over error responses
 */
export async function manualErrorHandlingExample(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await requireAuth(req, res)
    
    // Your logic here
    res.status(200).json({ success: true })
    
  } catch (error) {
    // Use the standard error handler
    handleApiError(error, res)
  }
}

/**
 * Example 9: Complete CRUD endpoint with all protections
 * Shows a real-world example with all best practices
 */
export const completeCrudExample = withErrorHandling(async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await requireRole(req, res, UserRole.FARMER)
  const farmer = await requireApprovedFarmer(session)
  
  switch (req.method) {
    case "GET": {
      // List farmer's products
      const products = await prisma.product.findMany({
        where: { farmerId: farmer.id },
        orderBy: { createdAt: "desc" }
      })
      
      res.status(200).json({ products })
      break
    }
    
    case "POST": {
      // Create new product (validation would go here)
      const product = await prisma.product.create({
        data: {
          ...req.body,
          farmerId: farmer.id
        }
      })
      
      res.status(201).json({ product })
      break
    }
    
    case "PUT": {
      // Update product
      const { id } = req.query
      
      if (typeof id !== "string") {
        badRequest(res, "Invalid product ID")
        break
      }
      
      // Verify ownership
      await requireOwnership(session, "product", id)
      
      const product = await prisma.product.update({
        where: { id },
        data: req.body
      })
      
      res.status(200).json({ product })
      break
    }
    
    case "DELETE": {
      // Delete product
      const { id } = req.query
      
      if (typeof id !== "string") {
        badRequest(res, "Invalid product ID")
        break
      }
      
      // Verify ownership
      await requireOwnership(session, "product", id)
      
      await prisma.product.delete({
        where: { id }
      })
      
      res.status(204).end()
      break
    }
    
    default:
      res.status(405).json({ message: "Method not allowed" })
  }
})
