import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { roleAccessControl } from "@/lib/role-access-control"

/**
 * Extended session type with role information
 */
export interface AuthSession {
  user: {
    id: string
    email: string
    name?: string | null
    role: UserRole
  }
}

/**
 * Standard API error responses
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Require authentication for API route
 * Returns session if authenticated, throws 401 if not
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthSession> {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    throw new ApiError(401, "Unauthorized - Authentication required")
  }

  return session as AuthSession
}

/**
 * Require specific role(s) for API route
 * Returns session if authorized, throws 401/403 if not
 */
export async function requireRole(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedRoles: UserRole | UserRole[]
): Promise<AuthSession> {
  const session = await requireAuth(req, res)

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!roles.includes(session.user.role)) {
    throw new ApiError(
      403,
      `Forbidden - Required role: ${roles.join(" or ")}`
    )
  }

  return session
}

/**
 * Verify user owns the resource
 * Checks if the resource belongs to the authenticated user
 */
export async function verifyOwnership(
  session: AuthSession,
  resourceType: "customer" | "farmer" | "order" | "product" | "subscription" | "address",
  resourceId: string
): Promise<boolean> {
  try {
    switch (resourceType) {
      case "customer": {
        const customer = await prisma.customer.findUnique({
          where: { id: resourceId },
          select: { userId: true }
        })
        return customer?.userId === session.user.id
      }

      case "farmer": {
        const farmer = await prisma.farmer.findUnique({
          where: { id: resourceId },
          select: { userId: true }
        })
        return farmer?.userId === session.user.id
      }

      case "order": {
        const order = await prisma.order.findUnique({
          where: { id: resourceId },
          include: { customer: { select: { userId: true } } }
        })
        return order?.customer.userId === session.user.id
      }

      case "product": {
        const product = await prisma.product.findUnique({
          where: { id: resourceId },
          include: { farmer: { select: { userId: true } } }
        })
        return product?.farmer.userId === session.user.id
      }

      case "subscription": {
        const subscription = await prisma.subscription.findUnique({
          where: { id: resourceId },
          include: { customer: { select: { userId: true } } }
        })
        return subscription?.customer.userId === session.user.id
      }

      case "address": {
        const address = await prisma.address.findUnique({
          where: { id: resourceId },
          include: { customer: { select: { userId: true } } }
        })
        return address?.customer.userId === session.user.id
      }

      default:
        return false
    }
  } catch (error) {
    console.error("Ownership verification error:", error)
    return false
  }
}

/**
 * Require resource ownership
 * Throws 403 if user doesn't own the resource
 */
export async function requireOwnership(
  session: AuthSession,
  resourceType: "customer" | "farmer" | "order" | "product" | "subscription" | "address",
  resourceId: string
): Promise<void> {
  const isOwner = await verifyOwnership(session, resourceType, resourceId)

  if (!isOwner) {
    throw new ApiError(403, "Forbidden - You don't have access to this resource")
  }
}

/**
 * Check if user can access API endpoint based on role
 */
export function canAccessApi(role: UserRole, endpoint: string): boolean {
  return roleAccessControl.canAccessApi(role, endpoint)
}

/**
 * Require API endpoint access based on role
 * Throws 403 if role doesn't have access
 */
export async function requireApiAccess(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthSession> {
  const session = await requireAuth(req, res)
  const endpoint = req.url || ""

  if (!canAccessApi(session.user.role, endpoint)) {
    throw new ApiError(403, "Forbidden - Insufficient permissions")
  }

  return session
}

/**
 * Standard error response for 401 Unauthorized
 */
export function unauthorized(res: NextApiResponse, message?: string) {
  return res.status(401).json({
    error: "Unauthorized",
    message: message || "Authentication required"
  })
}

/**
 * Standard error response for 403 Forbidden
 */
export function forbidden(res: NextApiResponse, message?: string) {
  return res.status(403).json({
    error: "Forbidden",
    message: message || "You don't have permission to access this resource"
  })
}

/**
 * Standard error response for 404 Not Found
 */
export function notFound(res: NextApiResponse, message?: string) {
  return res.status(404).json({
    error: "Not Found",
    message: message || "Resource not found"
  })
}

/**
 * Standard error response for 400 Bad Request
 */
export function badRequest(res: NextApiResponse, message?: string) {
  return res.status(400).json({
    error: "Bad Request",
    message: message || "Invalid request"
  })
}

/**
 * Standard error response for 500 Internal Server Error
 */
export function internalError(res: NextApiResponse, message?: string) {
  return res.status(500).json({
    error: "Internal Server Error",
    message: message || "An unexpected error occurred"
  })
}

/**
 * Handle API errors consistently
 * Use in catch blocks to send appropriate error responses
 */
export function handleApiError(error: unknown, res: NextApiResponse) {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.statusCode === 401 ? "Unauthorized" : "Forbidden",
      message: error.message
    })
  }

  // Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; meta?: any }
    
    if (prismaError.code === "P2002") {
      return res.status(409).json({
        error: "Conflict",
        message: "A record with this value already exists"
      })
    }
    
    if (prismaError.code === "P2025") {
      return notFound(res, "Resource not found")
    }
  }

  // Validation errors (Zod)
  if (error && typeof error === "object" && "issues" in error) {
    return badRequest(res, "Validation failed")
  }

  return internalError(res)
}

/**
 * Wrapper for API route handlers with error handling
 * Automatically catches and handles errors
 */
export function withErrorHandling(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res)
    } catch (error) {
      handleApiError(error, res)
    }
  }
}

/**
 * Check if farmer is approved
 * Returns farmer profile if approved, throws 403 if not
 */
export async function requireApprovedFarmer(
  session: AuthSession
): Promise<{ id: string; userId: string; farmName: string; isApproved: boolean }> {
  if (session.user.role !== UserRole.FARMER) {
    throw new ApiError(403, "Forbidden - Farmer role required")
  }

  const farmer = await prisma.farmer.findUnique({
    where: { userId: session.user.id },
    select: { id: true, userId: true, farmName: true, isApproved: true }
  })

  if (!farmer) {
    throw new ApiError(404, "Farmer profile not found")
  }

  if (!farmer.isApproved) {
    throw new ApiError(403, "Forbidden - Farmer account pending approval")
  }

  return farmer
}

/**
 * Get customer profile for authenticated user
 * Returns customer profile, throws 404 if not found
 */
export async function getCustomerProfile(
  session: AuthSession
): Promise<{ id: string; userId: string }> {
  if (session.user.role !== UserRole.CUSTOMER) {
    throw new ApiError(403, "Forbidden - Customer role required")
  }

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
    select: { id: true, userId: true }
  })

  if (!customer) {
    throw new ApiError(404, "Customer profile not found")
  }

  return customer
}

/**
 * Get farmer profile for authenticated user
 * Returns farmer profile, throws 404 if not found
 */
export async function getFarmerProfile(
  session: AuthSession
): Promise<{ id: string; userId: string; farmName: string; isApproved: boolean }> {
  if (session.user.role !== UserRole.FARMER) {
    throw new ApiError(403, "Forbidden - Farmer role required")
  }

  const farmer = await prisma.farmer.findUnique({
    where: { userId: session.user.id },
    select: { id: true, userId: true, farmName: true, isApproved: true }
  })

  if (!farmer) {
    throw new ApiError(404, "Farmer profile not found")
  }

  return farmer
}
