/**
 * User Role Types
 * Type-safe role definitions for use across the application
 * Compatible with Prisma schema UserRole enum
 */

// Define as const object for type safety in Edge runtime
export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  FARMER: 'FARMER',
  ADMIN: 'ADMIN',
  OPERATIONS: 'OPERATIONS',
  DRIVER: 'DRIVER'
} as const

// Type alias for UserRole values
export type UserRole = typeof UserRole[keyof typeof UserRole]

// For backward compatibility with Prisma imports
export type UserRoleType = UserRole
